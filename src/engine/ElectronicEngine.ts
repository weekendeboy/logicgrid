/**
 * @license
 * MNA Electronic Circuit Simulator Engine
 */

import { Tile, NetData } from '../types';

interface Edge {
  to: number;
  baseG: number;
  isLed: boolean;
  isDiode?: boolean;
  dir: number;
}

export const ElectronicEngine = {
  simulate: function (
    grid: (Tile | null)[][],
    netMap: number[][][],
    netData: NetData[],
    currentMeterChannel: string = '1'
  ): { vVal: number; aVal: number; wVal: number; oscVal: number | null; channelOscVals?: Record<string, number> } {
    if (!grid || grid.length === 0 || !grid[0]) return { vVal: 0, aVal: 0, wVal: 0, oscVal: null, channelOscVals: {} };
    const G: Edge[][] = Array(netData.length)
      .fill(0)
      .map(() => []);
    const netV: number[] = Array(netData.length).fill(0);
    const isFixed: boolean[] = Array(netData.length).fill(false);
    const I_inject: number[] = Array(netData.length).fill(0);
    let batteryVoltage = 12;
    const vEdges: number[] = [];
    const t_sec = performance.now() / 1000;
    const realBatAnchors: number[] = [];

    interface VSourceEdge {
      to: number;
      vDiff: number;
    }
    const vIslandG: VSourceEdge[][] = Array(netData.length).fill(0).map(() => []);

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'power') {
          const p0 = netMap[y][x][(0 + t.rotation) % 4] || 0;
          const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
          const isReal = t.subtype === 'power_real' || t.subtype === 'battery_real';
          if (isReal) {
            const emf = t.value || 1.5;
            const r = Math.max(0.01, t.internalR !== undefined ? t.internalR : 1.0);
            batteryVoltage = Math.max(batteryVoltage, emf);
            if (p0 > 0 && p2 > 0 && p0 !== p2) {
              const g = 1 / r;
              const iNorton = emf / r;
              I_inject[p0] += iNorton;
              I_inject[p2] -= iNorton;
              G[p0].push({ to: p2, baseG: g, isLed: false, dir: 1 });
              G[p2].push({ to: p0, baseG: g, isLed: false, dir: -1 });
              realBatAnchors.push(p2);
            }
          } else {
            let v = t.value || 12;
            if (t.subtype === 'power_1_5v' || t.subtype === '1_5v') v = 1.5;
            else if (t.subtype === 'power_ac' || t.subtype === 'ac') {
              if (t.value && t.value >= 50) {
                v = t.value;
              } else {
                const freq = t.value || 1;
                v = 12 * Math.sin(2 * Math.PI * freq * t_sec);
              }
            }
            batteryVoltage = Math.max(batteryVoltage, Math.abs(v));

            if (p0 !== p2) {
              vIslandG[p2].push({ to: p0, vDiff: v });
              vIslandG[p0].push({ to: p2, vDiff: -v });
            }
          }
        }
      }
    }

    const visitedV = Array(netData.length).fill(false);
    visitedV[0] = true;
    for (const p2 of realBatAnchors) {
      if (!visitedV[p2] && !isFixed[p2]) {
        netV[p2] = 0;
        isFixed[p2] = true;
        vEdges.push(p2);
        visitedV[p2] = true;
      }
    }
    const q0 = [0];
    while(q0.length > 0) {
      const curr = q0.shift()!;
      for (const edge of vIslandG[curr]) {
        if (!visitedV[edge.to]) {
          netV[edge.to] = (curr === 0 ? 0 : netV[curr]) + edge.vDiff;
          isFixed[edge.to] = true;
          if (edge.to !== 0) vEdges.push(edge.to);
          visitedV[edge.to] = true;
          q0.push(edge.to);
        }
      }
    }

    for (let i = 1; i < netData.length; i++) {
      if (!visitedV[i] && vIslandG[i].length > 0) {
        // Find node with minimum potential in this connected vIsland component to anchor as 0V ground
        let groundNode = i;
        let minPot = 0;
        const qFind = [{ node: i, pot: 0 }];
        const visFind = new Set<number>([i]);
        while (qFind.length > 0) {
          const curr = qFind.shift()!;
          if (curr.pot < minPot) {
            minPot = curr.pot;
            groundNode = curr.node;
          }
          for (const edge of vIslandG[curr.node]) {
            if (!visFind.has(edge.to)) {
              visFind.add(edge.to);
              qFind.push({ node: edge.to, pot: curr.pot + edge.vDiff });
            }
          }
        }

        netV[groundNode] = 0;
        isFixed[groundNode] = true;
        vEdges.push(groundNode);
        visitedV[groundNode] = true;
        const q = [groundNode];
        while (q.length > 0) {
          const curr = q.shift()!;
          for (const edge of vIslandG[curr]) {
            if (!visitedV[edge.to]) {
              netV[edge.to] = netV[curr] + edge.vDiff;
              isFixed[edge.to] = true;
              if (edge.to !== 0) vEdges.push(edge.to);
              visitedV[edge.to] = true;
              q.push(edge.to);
            }
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
            t.type === 'resistor_var' ||
            t.type === 'capacitor' ||
            t.type === 'inductor' ||
            t.type === 'diode' ||
            t.type === 'load' ||
            (t.type === 'led' && !t.isBlown) ||
            (t.type === 'protection' && t.subtype === 'fuse' && !t.isBlown) ||
            (t.type === 'breaker' && t.isActive) ||
            (t.type === 'meter' && (t.subtype === 'v' || t.subtype === 'a' || t.subtype === 'g')))
        ) {
          if (t.type === 'resistor_var' || (t.type === 'resistor' && (t.subtype === 'var' || t.subtype.startsWith('var_')))) {
            if (t.subtype === 'var_left' || t.subtype === 'var_right') {
              // Handled by var_mid for the entire 3-tile group
            } else if (t.subtype === 'var_mid') {
              let leftTile: Tile | null = null;
              let rightTile: Tile | null = null;
              let leftPos = { x: -1, y: -1 };
              let rightPos = { x: -1, y: -1 };

              for (let gy = 0; gy < grid.length; gy++) {
                for (let gx = 0; gx < grid[0].length; gx++) {
                  const c = grid[gy][gx];
                  if (c && c.groupId === t.groupId) {
                    if (c.subtype === 'var_left') {
                      leftTile = c;
                      leftPos = { x: gx, y: gy };
                    } else if (c.subtype === 'var_right') {
                      rightTile = c;
                      rightPos = { x: gx, y: gy };
                    }
                  }
                }
              }

              let pA = 0;
              if (leftTile && leftPos.x >= 0) {
                const lx = leftPos.x;
                const ly = leftPos.y;
                pA = netMap[ly][lx][(3 + leftTile.rotation) % 4] ||
                     netMap[ly][lx][(2 + leftTile.rotation) % 4] ||
                     netMap[ly][lx][(0 + leftTile.rotation) % 4] || 0;
              }

              let pB = 0;
              if (rightTile && rightPos.x >= 0) {
                const rx = rightPos.x;
                const ry = rightPos.y;
                pB = netMap[ry][rx][(1 + rightTile.rotation) % 4] ||
                     netMap[ry][rx][(2 + rightTile.rotation) % 4] ||
                     netMap[ry][rx][(0 + rightTile.rotation) % 4] || 0;
              }

              const pC = netMap[y][x][(0 + t.rotation) % 4] ||
                         netMap[y][x][(2 + t.rotation) % 4] || 0;

              const totalR = Math.max(0.1, t.value || 100);
              const ratio = Math.min(0.999, Math.max(0.001, t.extension !== undefined ? t.extension : 0.5));
              const rAC = Math.max(1e-3, totalR * ratio);
              const rCB = Math.max(1e-3, totalR * (1 - ratio));

              if (pA > 0 && pC > 0 && pA !== pC) {
                const gAC = 1 / rAC;
                G[pA].push({ to: pC, baseG: gAC, isLed: false, dir: 1 });
                G[pC].push({ to: pA, baseG: gAC, isLed: false, dir: -1 });
              }
              if (pB > 0 && pC > 0 && pB !== pC) {
                const gCB = 1 / rCB;
                G[pB].push({ to: pC, baseG: gCB, isLed: false, dir: 1 });
                G[pC].push({ to: pB, baseG: gCB, isLed: false, dir: -1 });
              }
              if (pA > 0 && pB > 0 && pC === 0 && pA !== pB) {
                const gAB = 1 / totalR;
                G[pA].push({ to: pB, baseG: gAB, isLed: false, dir: 1 });
                G[pB].push({ to: pA, baseG: gAB, isLed: false, dir: -1 });
              }
            } else {
              // Legacy single-tile fallback
              const p0 = netMap[y][x][(0 + t.rotation) % 4] || 0; // A
              const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0; // B
              const p1 = netMap[y][x][(1 + t.rotation) % 4] || 0; // Wiper
              const totalR = t.value || 100;
              const ratio = t.extension !== undefined ? t.extension : 0.5;
              const rAC = Math.max(1e-3, totalR * ratio);
              const rCB = Math.max(1e-3, totalR * (1 - ratio));
              
              if (p0 > 0 && p1 > 0 && p0 !== p1) {
                const gAC = 1 / rAC;
                G[p0].push({ to: p1, baseG: gAC, isLed: false, dir: 1 });
                G[p1].push({ to: p0, baseG: gAC, isLed: false, dir: -1 });
              }
              if (p2 > 0 && p1 > 0 && p2 !== p1) {
                const gCB = 1 / rCB;
                G[p2].push({ to: p1, baseG: gCB, isLed: false, dir: 1 });
                G[p1].push({ to: p2, baseG: gCB, isLed: false, dir: -1 });
              }
              if (p0 > 0 && p2 > 0 && p1 === 0 && p0 !== p2) {
                 const gAB = 1 / totalR;
                 G[p0].push({ to: p2, baseG: gAB, isLed: false, dir: 1 });
                 G[p2].push({ to: p0, baseG: gAB, isLed: false, dir: -1 });
              }
            }
          } else {
            const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            if (p1 > 0 && p2 > 0 && p1 !== p2) {
              let r = 100;
              if (t.type === 'resistor') r = t.value || 100;
              if (t.type === 'load') r = t.value || 50; // traditional bulb
              if (t.type === 'led') r = 150;
              if (t.type === 'diode') r = 0.5; // Forward dynamic resistance
              if (t.type === 'meter') {
                if (t.subtype === 'v') r = 1e6;
                if (t.subtype === 'a') r = 0.01;
                if (t.subtype === 'g') r = t.internalR !== undefined ? t.internalR : (t.value !== undefined && t.value > 0 ? t.value : 100); // Galvanometer
              }
              if (t.type === 'protection' && t.subtype === 'fuse') r = 0.05;
              if (t.type === 'breaker') r = 0.005;
              if (t.type === 'capacitor') {
                const C = (t.value || 10000) * 1e-6;
                const dt = 0.016;
                r = dt / C;
                const Ieq = (t.lastVdiff || 0) / r;
                I_inject[p1] += Ieq;
                I_inject[p2] -= Ieq;
              }
              if (t.type === 'inductor') {
                const L = (t.value || 100) * 1e-3; // mH to H
                const dt = 0.016;
                r = Math.max(0.1, L / dt);
                const Ieq = t.currentA || 0;
                I_inject[p1] -= Ieq;
                I_inject[p2] += Ieq;
              }
              const g = 1 / r;
              const isLed = t.type === 'led';
              const isDiode = t.type === 'diode';
              G[p1].push({ to: p2, baseG: g, isLed: isLed, isDiode: isDiode, dir: 1 });
              G[p2].push({ to: p1, baseG: g, isLed: isLed, dir: isDiode ? -1 : -1, isDiode: isDiode });
            }
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Topological Leaf Pruning for Open Circuits & Dead-End Trees
    // ---------------------------------------------------------
    // In DC steady-state, any non-source node with degree <= 1 cannot
    // sustain current (by KCL, sum of currents = 0 -> current on single edge = 0).
    // Iteratively pruning leaves eliminates numerical floating artifacts
    // and correctly sets open branch currents to 0.
    const activeAdj: Map<number, Set<number>> = new Map();
    for (let i = 1; i < netData.length; i++) {
      activeAdj.set(i, new Set());
      for (const edge of G[i]) {
        if (edge.baseG > 1e-9) {
          activeAdj.get(i)!.add(edge.to);
        }
      }
    }

    const isDeadEnd = Array(netData.length).fill(false);
    const deadEndQueue: number[] = [];
    for (let i = 1; i < netData.length; i++) {
      if (!isFixed[i] && (activeAdj.get(i)?.size || 0) <= 1) {
        deadEndQueue.push(i);
      }
    }

    const deadEndParent: number[] = Array(netData.length).fill(0);
    while (deadEndQueue.length > 0) {
      const u = deadEndQueue.shift()!;
      isDeadEnd[u] = true;
      const neighbors = activeAdj.get(u);
      if (neighbors && neighbors.size > 0) {
        const parent = Array.from(neighbors)[0];
        deadEndParent[u] = parent;
        activeAdj.get(parent)?.delete(u);
        if (!isFixed[parent] && (activeAdj.get(parent)?.size || 0) <= 1 && !isDeadEnd[parent]) {
          deadEndQueue.push(parent);
        }
      }
    }

    // =========================================================
    // Direct Exact MNA Solver (Gaussian Elimination with Partial Pivoting)
    // =========================================================
    const N = netData.length;
    // Iterate 1-6 times for nonlinear elements like diodes and LEDs to converge smoothly
    for (let newton = 0; newton < 6; newton++) {
      const A: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
      const b: number[] = Array(N).fill(0);

      for (let i = 1; i < N; i++) {
        if (isFixed[i]) {
          A[i][i] = 1;
          b[i] = netV[i];
        } else if (isDeadEnd[i]) {
          A[i][i] = 1;
          b[i] = deadEndParent[i] > 0 ? netV[deadEndParent[i]] : 0;
        } else {
          let sumG = 0;
          let sumI = I_inject[i];
          for (const edge of G[i]) {
            if (isDeadEnd[edge.to]) continue;
            let effG = edge.baseG;
            if (edge.isLed) {
              const vAnode = edge.dir === 1 ? netV[i] : netV[edge.to];
              const vCathode = edge.dir === 1 ? netV[edge.to] : netV[i];
              if (vAnode <= vCathode) effG = 1e-6;
            }
            if (edge.isDiode) {
              const vAnode = edge.dir === 1 ? netV[i] : netV[edge.to];
              const vCathode = edge.dir === 1 ? netV[edge.to] : netV[i];
              const vF = 0.65;
              if (vAnode - vCathode >= vF) {
                effG = edge.baseG;
                const iNorton = vF * effG;
                if (edge.dir === 1) {
                  sumI += iNorton;
                } else {
                  sumI -= iNorton;
                }
              } else {
                effG = 1e-7;
              }
            }
            sumG += effG;
            const j = edge.to;
            if (j > 0 && j < N) {
              A[i][j] -= effG;
            }
          }
          if (sumG < 1e-12) {
            A[i][i] = 1;
            b[i] = 0;
          } else {
            A[i][i] += sumG;
            b[i] = sumI;
          }
        }
      }

      // Forward elimination with partial pivoting
      for (let k = 1; k < N; k++) {
        let maxVal = Math.abs(A[k][k]);
        let maxRow = k;
        for (let r = k + 1; r < N; r++) {
          if (Math.abs(A[r][k]) > maxVal) {
            maxVal = Math.abs(A[r][k]);
            maxRow = r;
          }
        }

        if (maxVal < 1e-12) {
          A[k][k] = 1;
          continue;
        }

        if (maxRow !== k) {
          const tmpA = A[k];
          A[k] = A[maxRow];
          A[maxRow] = tmpA;
          const tmpB = b[k];
          b[k] = b[maxRow];
          b[maxRow] = tmpB;
        }

        for (let r = k + 1; r < N; r++) {
          if (Math.abs(A[r][k]) > 1e-15) {
            const factor = A[r][k] / A[k][k];
            for (let c = k; c < N; c++) {
              A[r][c] -= factor * A[k][c];
            }
            b[r] -= factor * b[k];
          }
        }
      }

      // Back substitution
      for (let i = N - 1; i >= 1; i--) {
        if (Math.abs(A[i][i]) > 1e-12) {
          let sum = b[i];
          for (let j = i + 1; j < N; j++) {
            sum -= A[i][j] * netV[j];
          }
          netV[i] = sum / A[i][i];
        } else {
          netV[i] = 0;
        }
      }
    }

    // Propagate voltages from active nodes down into dead-end branches
    // (since I = 0, voltage drop along the dead-end branch is 0)
    for (let i = 1; i < netData.length; i++) {
      if (isDeadEnd[i] && deadEndParent[i] > 0) {
        netV[i] = netV[deadEndParent[i]];
      }
    }

    const isEdgeDeadEnd = (p1: number, p2: number) => {
      if (p1 <= 0 || p2 <= 0) return true;
      if (isDeadEnd[p1] || isDeadEnd[p2]) return true;
      return false;
    };

    const hasPowerPath = Array(netData.length).fill(false);
    const qPath: number[] = [];
    for (let i = 1; i < netData.length; i++) {
      if (!isDeadEnd[i] && ((isFixed[i] && Math.abs(netV[i]) > 0) || (vEdges.length > 0 && i === vEdges[0]))) {
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
    const channelOscVals: Record<string, number> = {};

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
          } else if (t.type === 'load') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const dead = isEdgeDeadEnd(p1, p2);
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const r = t.value || 50;
            const vDiff = dead ? 0 : Math.abs(v1 - v2);
            t.currentA = dead ? 0 : vDiff / r;
            t.isPowered = t.currentA > 0.01;
            t.powerW = t.currentA * t.currentA * r;
            t.vDrop = vDiff;
          } else if (t.subtype === 'var_mid') {
            let leftTile: Tile | null = null;
            let leftPos = { x: -1, y: -1 };
            for (let gy = 0; gy < grid.length; gy++) {
              for (let gx = 0; gx < grid[0].length; gx++) {
                const c = grid[gy][gx];
                if (c && c.groupId === t.groupId && c.subtype === 'var_left') {
                  leftTile = c;
                  leftPos = { x: gx, y: gy };
                  break;
                }
              }
              if (leftTile) break;
            }
            let pA = 0;
            if (leftTile && leftPos.x >= 0) {
              const lx = leftPos.x;
              const ly = leftPos.y;
              pA = netMap[ly][lx][(3 + leftTile.rotation) % 4] ||
                   netMap[ly][lx][(2 + leftTile.rotation) % 4] ||
                   netMap[ly][lx][(0 + leftTile.rotation) % 4] || 0;
            }
            const pC = netMap[y][x][(0 + t.rotation) % 4] ||
                       netMap[y][x][(2 + t.rotation) % 4] || 0;
            const totalR = Math.max(0.1, t.value || 100);
            const ratio = Math.min(0.999, Math.max(0.001, t.extension !== undefined ? t.extension : 0.5));
            const rAC = Math.max(1e-3, totalR * ratio);
            const dead = isEdgeDeadEnd(pA, pC);
            const vA = pA > 0 ? netV[pA] || 0 : 0;
            const vC = pC > 0 ? netV[pC] || 0 : 0;
            const vDiff = dead ? 0 : Math.abs(vA - vC);
            t.currentA = dead ? 0 : vDiff / rAC;
            t.vDrop = vDiff;
            t.powerW = t.currentA * t.currentA * rAC;
          } else if (t.type === 'resistor') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const dead = isEdgeDeadEnd(p1, p2);
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const r = t.value || 100;
            const vDiff = dead ? 0 : Math.abs(v1 - v2);
            t.currentA = dead ? 0 : vDiff / r;
            t.vDrop = vDiff;
          } else if (t.type === 'protection' && t.subtype === 'fuse') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const vDiff = Math.abs(v1 - v2);
            t.currentA = vDiff / 0.05;
            t.vDrop = vDiff;
            if (t.currentA > 0.5) {
              t.isBlown = true;
              t.currentA = 0;
            }
          } else if (t.type === 'breaker') {
            if (!t.isActive) {
              t.currentA = 0;
            } else {
              const p1 = netMap[y][x][(0 + t.rotation) % 4];
              const p2 = netMap[y][x][(2 + t.rotation) % 4];
              const v1 = p1 > 0 ? netV[p1] || 0 : 0;
              const v2 = p2 > 0 ? netV[p2] || 0 : 0;
              const vDiff = Math.abs(v1 - v2);
              t.currentA = vDiff / 0.005;
              t.vDrop = vDiff;
              const tripLimit = t.value || 15.0; // default 15A rating for NFB
              if (t.currentA > tripLimit) {
                t.isActive = false; // Tripped!
                t.currentA = 0;
              }
            }
          } else if (t.type === 'diode') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const vDrop = v1 - v2;
            t.vDrop = vDrop;
            const rd = 0.5;
            if (vDrop >= 0.60) {
              t.currentA = Math.max(0, (vDrop - 0.65) / rd);
              if (t.currentA < 0.005 && vDrop >= 0.60) {
                t.currentA = (vDrop - 0.60) * 0.2;
              }
              t.isPowered = t.currentA > 0.001;
              t.powerW = t.currentA * vDrop;
            } else {
              t.currentA = 0;
              t.isPowered = false;
              t.powerW = 0;
            }
          } else if (t.type === 'inductor') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const dead = isEdgeDeadEnd(p1, p2);
            if (dead) {
              t.currentA = 0;
              t.vDrop = 0;
              t.isPowered = false;
              t.powerW = 0;
            } else {
              const v1 = p1 > 0 ? netV[p1] || 0 : 0;
              const v2 = p2 > 0 ? netV[p2] || 0 : 0;
              const vDiff = v1 - v2;
              t.vDrop = vDiff;
              const L = (t.value || 100) * 1e-3;
              const dt = 0.016;
              const r_eq = Math.max(0.1, L / dt);
              t.currentA = (t.currentA || 0) + (vDiff / r_eq);
              t.isPowered = Math.abs(t.currentA) > 0.01;
              t.powerW = Math.abs(vDiff * t.currentA);
            }
          } else if (t.type === 'power' && (t.subtype === 'power_real' || t.subtype === 'battery_real')) {
            const p0 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const dead = isEdgeDeadEnd(p0, p2);
            const v0 = p0 > 0 ? netV[p0] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const emf = t.value || 1.5;
            const r = Math.max(0.01, t.internalR !== undefined ? t.internalR : 1.0);
            const vTerminal = dead ? emf : Math.abs(v0 - v2);
            t.measureVal = vTerminal;
            t.currentA = dead ? 0 : Math.abs(vTerminal - emf) / r;
            t.powerW = vTerminal * t.currentA;
          } else if (t.type === 'led') {
            const p1 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            const v1 = p1 > 0 ? netV[p1] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const vDrop = v1 - v2;
            if (vDrop > 0) {
              t.currentA = vDrop / 150;
              if (t.currentA > 0.03) t.isBlown = true;
            } else {
              t.currentA = 0;
              if (vDrop < -15) t.isBlown = true; // Reverse breakdown threshold
            }
          } else if (t.type === 'meter') {
            const p0 = netMap[y][x][(0 + t.rotation) % 4] || 0;
            const p2 = netMap[y][x][(2 + t.rotation) % 4] || 0;
            const dead = isEdgeDeadEnd(p0, p2);
            const v1 = p0 > 0 ? netV[p0] || 0 : 0;
            const v2 = p2 > 0 ? netV[p2] || 0 : 0;
            const mCh = t.labels[4] || '1';

            const diffV = v1 - v2;

            if (t.subtype === 'v') {
              t.measureVal = Math.abs(diffV);
              channelOscVals[mCh] = diffV;
              if (mCh === currentMeterChannel) {
                vVal = t.measureVal;
                if (oscVal === null) oscVal = diffV;
              }
            }
            if (t.subtype === 'a') {
              t.measureVal = dead ? 0 : Math.abs(diffV) / 0.01;
              if (mCh === currentMeterChannel) aVal = t.measureVal;
            }
            if (t.subtype === 'g') {
              // Galvanometer Ⓖ: signed current (+ entering pin 0, - entering pin 2)
              const rg = t.internalR !== undefined ? t.internalR : (t.value !== undefined && t.value > 0 ? t.value : 100);
              t.measureVal = dead ? 0 : diffV / rg;
              t.currentA = Math.abs(t.measureVal);
              if (mCh === currentMeterChannel) aVal = t.measureVal;
            }
            if (t.subtype === 'osc') {
              t.measureVal = diffV;
              channelOscVals[mCh] = diffV;
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

    return { vVal, aVal, wVal, oscVal, channelOscVals };
  },
};
