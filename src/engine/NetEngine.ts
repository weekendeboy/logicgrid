/**
 * @license
 * Unified NetEngine for Electrical & Pneumatic Connectivity
 */

import { DisjointSet } from './DisjointSet';
import { Tile, AppMode, Faults, NetState } from '../types';

export function getShortedPinGroups(t: Tile | null, mode: AppMode): number[][] {
  if (!t) return [];
  let groups: number[][] = [];
  const act = t.isActive || t.isPhysicallyPushed;

  if (t.type === 'wire') {
    if (t.subtype === 'straight') groups = [[0, 2]];
    else if (t.subtype === 'turn') groups = [[0, 1]];
    else if (t.subtype === 't') groups = [[1, 2, 3]];
    else if (t.subtype === 'cross') groups = [[0, 1, 2, 3]];
    else if (t.subtype === 'bridge') groups = [[0, 2], [1, 3]];
    else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g' || t.subtype === 'plus' || t.subtype === 'minus' || t.subtype === 'ground') groups = [[2]];
  } else {
    if (mode === 'electronic') {
      if (t.type === 'power' || t.type === 'resistor' || t.type === 'led' || t.type === 'capacitor') {
        groups = [[0], [2]];
      } else if (t.type === 'meter') {
        groups = [[0], [1], [2], [3]];
      }
    } else if (mode === 'logic' || mode === 'tutorial') {
      if (t.subtype === 'power' || t.subtype === 'pushbtn' || t.subtype === 'clock') {
        groups = [[1]];
      } else if (t.subtype === 'led') {
        groups = [[3]];
      } else if (t.subtype === 'roman') {
        groups = [[0], [1], [2], [3]];
      } else if (t.type === 'gate') {
        if (t.subtype === 'not' || t.subtype === 'buffer') groups = [[3], [1]];
        else groups = [[0], [1], [2]];
      }
    } else if (mode === 'wiring' || mode === 'plc') {
      const isRelayContact = t.type === 'relay' && (
        t.subtype === 'no' || t.subtype === 'nc' || t.subtype === 'con' ||
        t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_')
      );
      if (t.type === 'btn' || isRelayContact) {
        const isCon = t.subtype === 'con' || t.subtype === 'ton_con' || t.subtype === 'tof_con';
        const isNo = t.subtype === 'no' || t.subtype === 'ton_no' || t.subtype === 'tof_no' || (t.type === 'btn' && t.subtype === 'no');
        const isNc = t.subtype === 'nc' || t.subtype === 'ton_nc' || t.subtype === 'tof_nc' || (t.type === 'btn' && t.subtype === 'nc');

        if (isCon) {
          groups = act ? [[0, 1], [2]] : [[0, 2], [1]];
        } else {
          const closed = (isNo && act) || (isNc && !act);
          groups = closed ? [[0, 2]] : [[0], [2]];
        }
      } else if (t.type === 'breaker') {
        groups = t.isActive ? [[0, 2]] : [[0], [2]];
      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        const st = t.state || 0;
        if (st === 0) groups = [[2, 0]]; // Top
        else groups = [[2, 1]]; // Right
      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        // Inter-tile connections are handled strictly in buildNetState to prevent shorting
        groups = [[3], [1]];
      } else if (t.type === 'protection' && t.subtype === 'fuse') {
        groups = t.isBlown ? [[0], [2]] : [[0, 2]];
      } else if (t.type === 'terminal') {
        groups = [[2]];
      } else if (
        t.subtype === 'coil' ||
        t.type === 'motor' ||
        t.type === 'load' ||
        t.type === 'power'
      ) {
        groups = [[0], [2]];
      } else if (t.type === 'pneumatic') {
        if (t.subtype === 'air_source') groups = [[2]];
        else if (t.subtype === 'valve_coil') groups = [[0], [2]];
        else if (t.subtype === 'valve_52') {
          groups = t.isActive ? [[2, 0]] : [[2, 1]]; // P->A or P->B
        } else if (t.subtype === 'cyl_top') {
          groups = [[3], [1]]; // 3: Air retract, 1: Sensor Ext OUT
        } else if (t.subtype === 'cyl_mid') {
          groups = [];
        } else if (t.subtype === 'cyl_bot') {
          groups = [[3], [1], [2]]; // 3: Air extend, 1: Sensor Ret OUT, 2: Sensor COM
        }
      } else if (t.type === 'platform') {
        if (t.subtype === 'top') groups = [[0], [3]]; // 0: Mech in, 3: Contact out
        else if (t.subtype === 'mid') groups = [[3]];
        else if (t.subtype === 'bot') groups = [[2], [3]]; // 2: COM, 3: Contact out
      } else if (t.type === 'plc') {
        if (t.subtype === 'no' || t.subtype === 'plc_a') {
          groups = t.isActive ? [[3, 1]] : [[3], [1]];
        } else if (t.subtype === 'nc' || t.subtype === 'plc_b') {
          groups = !t.isActive ? [[3, 1]] : [[3], [1]];
        } else if (
          t.subtype === 'pls' ||
          t.subtype === 'plc_p' ||
          t.subtype === 'plf' ||
          t.subtype === 'plc_n'
        ) {
          groups = t.isActive ? [[3, 1]] : [[3], [1]];
        } else if (t.subtype === 'out' || t.subtype === 'plc_out') {
          groups = [[3]]; // Requirement 6: Left pin only
        } else if (t.dx !== undefined) {
          // Hardware PLC unit
          groups = [[0], [1], [2], [3]];
        }
      }
    }
  }

  return groups.map((g) => g.map((p) => (p + t.rotation) % 4));
}

export function buildNetState(
  grid: (Tile | null)[][],
  w: number,
  h: number,
  mode: AppMode,
  faults: Faults
): { netMap: number[][][]; netCount: number } {
  const ds = new DisjointSet();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const groups = getShortedPinGroups(grid[y][x], mode);
      groups.forEach((g) => {
        if (g.length === 0) return;
        const first = `${x},${y},${g[0]}`;
        ds.makeSet(first);
        for (let i = 1; i < g.length; i++) {
          const node = `${x},${y},${g[i]}`;
          ds.makeSet(node);
          ds.union(first, node);
        }
      });
    }
  }

  const openSet = new Set(faults.opens);
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = grid[y][x];
      if (t && t.type === 'switch' && t.subtype === '4way_top') {
        const bot = y + 1 < h ? grid[y + 1][x] : null;
        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;
          if (st === 0) {
            // Cross connection: Top-Left (3) to Bot-Right (1), Top-Right (1) to Bot-Left (3)
            // But user says: 1(Top-Left) to 4(Bot-Right), 2(Bot-Left) to 3(Top-Right)
            ds.union(`${x},${y},3`, `${x},${y+1},1`);
            ds.union(`${x},${y},1`, `${x},${y+1},3`);
          } else {
            // Parallel connection: Top-Left (3) to Bot-Left (3), Top-Right (1) to Bot-Right (1)
            ds.union(`${x},${y},3`, `${x},${y+1},3`);
            ds.union(`${x},${y},1`, `${x},${y+1},1`);
          }
        }
      }

      for (let d = 0; d < 4; d++) {
        const node1 = `${x},${y},${d}`;
        if (!ds.has(node1) || openSet.has(node1)) continue;
        const nx = x + dirs[d][0];
        const ny = y + dirs[d][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const node2 = `${nx},${ny},${(d + 2) % 4}`;
          if (ds.has(node2) && !openSet.has(node2)) {
            ds.union(node1, node2);
          }
        }
      }
    }
  }

  for (const s of faults.shorts) {
    if (ds.has(s[0]) && ds.has(s[1])) {
      ds.union(s[0], s[1]);
    }
  }

  if (mode === 'wiring' || mode === 'plc') {
    const terminalsByLabel: Record<string, string[]> = {};
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = grid[y][x];
        if (t && t.type === 'terminal' && t.subtype === 'block' && t.labels[4]) {
          const lbl = t.labels[4];
          if (!terminalsByLabel[lbl]) terminalsByLabel[lbl] = [];
          const rot = t.rotation || 0;
          terminalsByLabel[lbl].push(`${x},${y},${(2 + rot) % 4}`);
        }
      }
    }
    for (const lbl in terminalsByLabel) {
      const nodes = terminalsByLabel[lbl];
      for (let i = 1; i < nodes.length; i++) {
        if (ds.has(nodes[0]) && ds.has(nodes[i])) {
          ds.union(nodes[0], nodes[i]);
        }
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = grid[y][x];
        if (t && t.type === 'pneumatic' && t.subtype === 'cyl_bot') {
          const rot = t.rotation || 0;
          const topX = x + [0, 2, 0, -2][rot];
          const topY = y + [-2, 0, 2, 0][rot];
          const ext = t.extension || 0;

          const comNode = `${x},${y},${(2 + rot) % 4}`;
          const retSensNode = `${x},${y},${(1 + rot) % 4}`;
          if (topX >= 0 && topX < w && topY >= 0 && topY < h) {
            const extSensNode = `${topX},${topY},${(1 + rot) % 4}`;
            if (ext < 0.1 && ds.has(comNode) && ds.has(retSensNode)) ds.union(comNode, retSensNode);
            if (ext >= 1.9 && ds.has(comNode) && ds.has(extSensNode)) ds.union(comNode, extSensNode);
          }
        }

        if (t && t.type === 'platform' && t.subtype === 'bot') {
          const rot = t.rotation || 0;
          const midX = x + [0, 1, 0, -1][rot];
          const midY = y + [-1, 0, 1, 0][rot];
          const topX = x + [0, 2, 0, -2][rot];
          const topY = y + [-2, 0, 2, 0][rot];
          const ext = t.extension || 0;

          const comNode = `${x},${y},${(2 + rot) % 4}`;
          const pos1Node = `${x},${y},${(3 + rot) % 4}`;

          if (ext < 0.1 && ds.has(comNode) && ds.has(pos1Node)) ds.union(comNode, pos1Node);

          if (midX >= 0 && midX < w && midY >= 0 && midY < h) {
            const pos2Node = `${midX},${midY},${(3 + rot) % 4}`;
            if (ext >= 0.9 && ext <= 1.1 && ds.has(comNode) && ds.has(pos2Node)) ds.union(comNode, pos2Node);
          }

          if (topX >= 0 && topX < w && topY >= 0 && topY < h) {
            const pos3Node = `${topX},${topY},${(3 + rot) % 4}`;
            if (ext > 1.9 && ds.has(comNode) && ds.has(pos3Node)) ds.union(comNode, pos3Node);
          }
        }

        if (t && t.type === 'plc' && t.subtype === 'unit' && t.dx === 0 && t.dy === 0) {
          const com1Node = `${x + 3},${y},1`; // COM1 right pin
          const com2Node = `${x + 3},${y + 5},1`; // COM2 right pin

          if (ds.has(com1Node)) {
            for (let i = 0; i < 4; i++) {
              const yi = y + 1 + i;
              if (yi < h) {
                const pt = grid[yi][x + 3];
                const yNode = `${x + 3},${yi},1`;
                if (pt && pt.isActive && ds.has(yNode)) ds.union(com1Node, yNode);
              }
            }
          }
          if (ds.has(com2Node)) {
            for (let i = 0; i < 4; i++) {
              const yi = y + 6 + i;
              if (yi < h) {
                const pt = grid[yi][x + 3];
                const yNode = `${x + 3},${yi},1`;
                if (pt && pt.isActive && ds.has(yNode)) ds.union(com2Node, yNode);
              }
            }
          }
        }
      }
    }
  }

  const netMap: number[][][] = Array(h)
    .fill(0)
    .map(() =>
      Array(w)
        .fill(0)
        .map(() => [0, 0, 0, 0])
    );
  let netCount = 0;
  const rootToId: Record<string, number> = {};

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const node = `${x},${y},${d}`;
        if (ds.has(node)) {
          const root = ds.find(node);
          if (!rootToId[root]) rootToId[root] = ++netCount;
          netMap[y][x][d] = rootToId[root];
        }
      }
    }
  }

  return { netMap, netCount };
}
