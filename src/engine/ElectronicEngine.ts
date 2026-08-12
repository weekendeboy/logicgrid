/**
 * @license
 * MNA Electronic Circuit Simulator Engine
 */

import { Tile, NetData } from '../types';

interface Edge {
  to: number;
  baseG: number;
  isLed: boolean;
  dir: number;
}

export const ElectronicEngine = {
  simulate: function (
    grid: (Tile | null)[][],
    netMap: number[][][],
    netData: NetData[],
    currentMeterChannel: string = '1'
  ): { vVal: number; aVal: number; wVal: number; oscVal: number | null } {
    if (!grid || grid.length === 0 || !grid[0]) return { vVal: 0, aVal: 0, wVal: 0, oscVal: null };
    const G: Edge[][] = Array(netData.length)
      .fill(0)
      .map(() => []);
    const netV: number[] = Array(netData.length).fill(0);
    const isFixed: boolean[] = Array(netData.length).fill(false);
    const I_inject: number[] = Array(netData.length).fill(0);
    let batteryVoltage = 12;
    const vEdges: number[] = [];
    const t_sec = performance.now() / 1000;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'power') {
          const p0 = netMap[y][x][(0 + t.rotation) % 4] || 0;
          const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
          let v = 12;
          if (t.subtype === 'power_1_5v' || t.subtype === '1_5v') v = 1.5;
          else if (t.subtype === 'power_ac' || t.subtype === 'ac') {
            const freq = t.value || 1;
            v = 12 * Math.sin(2 * Math.PI * freq * t_sec);
          }
          batteryVoltage = Math.max(batteryVoltage, Math.abs(v));
          if (p0 > 0) {
            netV[p0] = v;
            isFixed[p0] = true;
            vEdges.push(p0);
          }
          if (p2 > 0) {
            netV[p2] = 0;
            isFixed[p2] = true;
            vEdges.push(p2);
          }
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (
          t &&
          (t.type === 'resistor' ||
            t.type === 'capacitor' ||
            (t.type === 'led' && !t.isBlown) ||
            (t.type === 'meter' && (t.subtype === 'v' || t.subtype === 'a')))
        ) {
          const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
          const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
          if (p1 > 0 && p2 > 0 && p1 !== p2) {
            let r = 100;
            if (t.type === 'resistor') r = t.value || 100;
            if (t.type === 'led') r = 150;
            if (t.type === 'meter') {
              if (t.subtype === 'v') r = 1e6;
              if (t.subtype === 'a') r = 0.01;
            }
            if (t.type === 'capacitor') {
              const C = (t.value || 10000) * 1e-6;
              const dt = 0.016;
              r = dt / C;
              const Ieq = (t.lastVdiff || 0) / r;
              I_inject[p1] += Ieq;
              I_inject[p2] -= Ieq;
            }
            const g = 1 / r;
            const isLed = t.type === 'led';
            G[p1].push({ to: p2, baseG: g, isLed: isLed, dir: 1 });
            G[p2].push({ to: p1, baseG: g, isLed: isLed, dir: -1 });
          }
        }
      }
    }

    for (let iter = 0; iter < 300; iter++) {
      for (let i = 1; i < netData.length; i++) {
        if (isFixed[i]) continue;
        let sumG = 0;
        let sumGV = 0;
        for (const edge of G[i]) {
          let effG = edge.baseG;
          if (edge.isLed) {
            const vAnode = edge.dir === 1 ? netV[i] : netV[edge.to];
            const vCathode = edge.dir === 1 ? netV[edge.to] : netV[i];
            if (vAnode <= vCathode) effG = 1e-6;
          }
          sumG += effG;
          sumGV += effG * netV[edge.to];
        }
        if (sumG > 0) netV[i] = (sumGV + I_inject[i]) / sumG;
      }
    }

    const hasPowerPath = Array(netData.length).fill(false);
    const qPath: number[] = [];
    for (let i = 1; i < netData.length; i++) {
      if ((isFixed[i] && Math.abs(netV[i]) > 0) || (vEdges.length > 0 && i === vEdges[0])) {
        hasPowerPath[i] = true;
        qPath.push(i);
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'capacitor' && Math.abs(t.lastVdiff || 0) > 0.1) {
          const p1 = netMap[y][x][(0 + t.rotation) % 4];
          const p2 = netMap[y][x][(2 + t.rotation) % 4];
          if (p1 > 0 && !hasPowerPath[p1]) {
            hasPowerPath[p1] = true;
            qPath.push(p1);
          }
          if (p2 > 0 && !hasPowerPath[p2]) {
            hasPowerPath[p2] = true;
            qPath.push(p2);
          }
        }
      }
    }

    while (qPath.length > 0) {
      const curr = qPath.shift()!;
      for (const edge of G[curr]) {
        if (!hasPowerPath[edge.to]) {
          hasPowerPath[edge.to] = true;
          qPath.push(edge.to);
        }
      }
    }

    const highThresh = Math.max(1.5, batteryVoltage * 0.8);
    for (let i = 1; i < netData.length; i++) {
      const v = netV[i] || 0;
      const absV = Math.abs(v);
      let col = '#4a5568';
      if (hasPowerPath[i] || isFixed[i] || absV >= 0.1) {
        if (v >= highThresh) col = '#ef4444';
        else if (v <= -highThresh) col = '#a855f7';
        else if (absV >= 0.1) col = '#f59e0b';
        else col = '#3b82f6';
      }
      netData[i] = { color: col, isHigh: absV >= highThresh, v: v };
    }

    let vVal = 0;
    let aVal = 0;
    let wVal = 0;
    let oscVal: number | null = null;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t) {
          if (t.type === 'capacitor') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            t.lastVdiff = v1 - v2;
          } else if (t.type === 'led') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            t.currentA = Math.abs(v1 - v2) / 150;
            if (t.currentA > 0.03) t.isBlown = true;
          } else if (t.type === 'meter') {
            const p0 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const v1 = p0 > 0 ? netV[p0] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const mCh = t.labels[4] || '1';

            if (t.subtype === 'v') {
              t.measureVal = Math.abs(v1 - v2);
              if (mCh === currentMeterChannel) vVal = t.measureVal;
            }
            if (t.subtype === 'a') {
              t.measureVal = Math.abs(v1 - v2) / 0.01;
              if (mCh === currentMeterChannel) aVal = t.measureVal;
            }
            if (t.subtype === 'osc') {
              t.measureVal = v1 - v2;
              if (mCh === currentMeterChannel) oscVal = t.measureVal;
            }
          }
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'meter' && t.subtype === 'w') {
          const mCh = t.labels[4] || '1';
          if (mCh === currentMeterChannel) {
            t.measureVal = vVal * aVal;
            wVal = t.measureVal;
          }
        }
      }
    }

    return { vVal, aVal, wVal, oscVal };
  },
};
