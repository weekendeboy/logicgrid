/**
 * @license
 * Digital Logic Simulation Engine
 */

import { Tile, NetData } from '../types';

export const LogicEngine = {
  simulate: function (
    grid: (Tile | null)[][],
    netMap: number[][][],
    netData: NetData[]
  ) {
    if (!grid || grid.length === 0 || !grid[0]) return;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'logic' && t.subtype === 'led') t.isPowered = false;

        if (t && t.type === 'logic') {
          if ((t.subtype === 'power' || t.subtype === 'pushbtn') && t.isActive) {
            const outNet = netMap[y][x][(1 + t.rotation) % 4];
            if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
          } else if (t.subtype === 'clock') {
            const freq = t.value || 1;
            const period = 1000 / freq;
            const isHigh = Date.now() % period < period / 2;
            t.outState = isHigh;
            if (isHigh) {
              const outNet = netMap[y][x][(1 + t.rotation) % 4];
              if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
            }
          }
        }

        if (t && t.type === 'gate' && t.outState) {
          const outNet = netMap[y][x][(1 + t.rotation) % 4];
          if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
        }
      }
    }

    let changed = true;
    let iters = 0;
    while (changed && iters < 30) {
      changed = false;
      iters++;
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
          const t = grid[y][x];
          if (t && t.type === 'gate') {
            let inA: boolean | undefined;
            let inB: boolean | undefined;
            let outNet: number | undefined;
            let isOut = false;

            if (t.subtype === 'not' || t.subtype === 'buffer') {
              inA = netData[netMap[y][x][(3 + t.rotation) % 4]]?.isHigh;
              outNet = netMap[y][x][(1 + t.rotation) % 4];
              if (t.subtype === 'buffer') isOut = !!inA;
              if (t.subtype === 'not') isOut = !inA;
            } else {
              inA = netData[netMap[y][x][(0 + t.rotation) % 4]]?.isHigh;
              inB = netData[netMap[y][x][(2 + t.rotation) % 4]]?.isHigh;
              outNet = netMap[y][x][(1 + t.rotation) % 4];
              if (t.subtype === 'and') isOut = !!(inA && inB);
              if (t.subtype === 'or') isOut = !!(inA || inB);
              if (t.subtype === 'nand') isOut = !(inA && inB);
              if (t.subtype === 'nor') isOut = !(inA || inB);
              if (t.subtype === 'xor') isOut = !!(inA !== inB);
            }

            if (isOut !== t.outState) {
              t.outState = isOut;
              changed = true;
            }

            if (isOut && outNet && !netData[outNet].isHigh) {
              netData[outNet] = { color: '#ef4444', isHigh: true };
              changed = true;
            }
          }
        }
      }
    }

    for (let i = 1; i < netData.length; i++) {
      netData[i] = { color: '#4a5568', isHigh: false };
    }
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'logic') {
          if ((t.subtype === 'power' || t.subtype === 'pushbtn') && t.isActive) {
            const outNet = netMap[y][x][(1 + t.rotation) % 4];
            if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
          } else if (t.subtype === 'clock' && t.outState) {
            const outNet = netMap[y][x][(1 + t.rotation) % 4];
            if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
          }
        }
        if (t && t.type === 'gate' && t.outState) {
          const outNet = netMap[y][x][(1 + t.rotation) % 4];
          if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'logic') {
          if (t.subtype === 'led') {
            const inNet = netMap[y][x][(3 + t.rotation) % 4];
            t.isPowered = !!(inNet && netData[inNet].isHigh);
          } else if (t.subtype === 'roman') {
            const p0 = netMap[y][x][(0 + t.rotation) % 4];
            const p1 = netMap[y][x][(1 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const p3 = netMap[y][x][(3 + t.rotation) % 4];

            t.pinStateV = !!(p0 && netData[p0].isHigh);
            t.pinStateI_R = !!(p1 && netData[p1].isHigh);
            t.pinStateI_B = !!(p2 && netData[p2].isHigh);
            t.pinStateI_L = !!(p3 && netData[p3].isHigh);
          }
        }
      }
    }
  },
};
