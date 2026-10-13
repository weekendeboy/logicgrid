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

        if (t && t.type === 'gate') {
          if (t.outState) {
            const outNet = netMap[y][x][(1 + t.rotation) % 4];
            if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
          }
          if (t.subtype === 'd_ff' || t.subtype === 't_ff' || t.subtype === 'd_latch') {
            if (!t.outState) {
              const outBarNet = netMap[y][x][(2 + t.rotation) % 4];
              if (outBarNet) netData[outBarNet] = { color: '#ef4444', isHigh: true };
            }
          }
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
            } else if (
              t.subtype === 'd_ff' ||
              t.subtype === 't_ff' ||
              t.subtype === 'jk_ff' ||
              t.subtype === 'd_latch'
            ) {
              const clkNet = netMap[y][x][(0 + t.rotation) % 4];
              const dataNet = netMap[y][x][(3 + t.rotation) % 4];
              const clkHigh = !!(clkNet && netData[clkNet]?.isHigh);
              const dataHigh = !!(dataNet && netData[dataNet]?.isHigh);
              outNet = netMap[y][x][(1 + t.rotation) % 4];
              const outBarNet = netMap[y][x][(2 + t.rotation) % 4];

              if (t.subtype === 'd_latch') {
                isOut = clkHigh ? dataHigh : !!t.outState;
              } else {
                // Edge triggered on rising edge of Pin 0
                const isRising = clkHigh && !t.prevSignal;
                if (isRising) {
                  if (t.subtype === 'd_ff') isOut = dataHigh;
                  else if (t.subtype === 't_ff') isOut = dataHigh ? !t.outState : !!t.outState;
                  else if (t.subtype === 'jk_ff') {
                    const kNet = netMap[y][x][(2 + t.rotation) % 4];
                    const kHigh = !!(kNet && netData[kNet]?.isHigh);
                    if (dataHigh && !kHigh) isOut = true;
                    else if (!dataHigh && kHigh) isOut = false;
                    else if (dataHigh && kHigh) isOut = !t.outState;
                    else isOut = !!t.outState;
                  }
                } else {
                  isOut = !!t.outState;
                }
                t.prevSignal = clkHigh;
              }

              if (isOut !== t.outState) {
                t.outState = isOut;
                changed = true;
              }

              if (isOut && outNet && !netData[outNet].isHigh) {
                netData[outNet] = { color: '#ef4444', isHigh: true };
                changed = true;
              }
              if (!isOut && outBarNet && t.subtype !== 'jk_ff' && !netData[outBarNet].isHigh) {
                netData[outBarNet] = { color: '#ef4444', isHigh: true };
                changed = true;
              }
              continue;
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
        if (t && t.type === 'gate') {
          if (t.outState) {
            const outNet = netMap[y][x][(1 + t.rotation) % 4];
            if (outNet) netData[outNet] = { color: '#ef4444', isHigh: true };
          }
          if (t.subtype === 'd_ff' || t.subtype === 't_ff' || t.subtype === 'd_latch') {
            if (!t.outState) {
              const outBarNet = netMap[y][x][(2 + t.rotation) % 4];
              if (outBarNet) netData[outBarNet] = { color: '#ef4444', isHigh: true };
            }
          }
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
          } else if (t.subtype === 'seg7') {
            const p0 = netMap[y][x][(0 + t.rotation) % 4]; // Top: Bit 2 (4)
            const p1 = netMap[y][x][(1 + t.rotation) % 4]; // Right: Bit 0 (1, LSB)
            const p2 = netMap[y][x][(2 + t.rotation) % 4]; // Bottom: Bit 1 (2)
            const p3 = netMap[y][x][(3 + t.rotation) % 4]; // Left: Bit 3 (8, MSB)

            const b2 = !!(p0 && netData[p0].isHigh);
            const b0 = !!(p1 && netData[p1].isHigh);
            const b1 = !!(p2 && netData[p2].isHigh);
            const b3 = !!(p3 && netData[p3].isHigh);

            t.measureVal = (b3 ? 8 : 0) + (b2 ? 4 : 0) + (b1 ? 2 : 0) + (b0 ? 1 : 0);
            t.isPowered = b0 || b1 || b2 || b3;
          }
        }
      }
    }
  },
};
