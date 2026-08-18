/**
 * @license
 * Industrial Wiring & Pneumatics & Mechanical Physics Simulator Engine
 */

import { Tile, NetData } from '../types';

export const WiringEngine = {
  simulate: function (
    grid: (Tile | null)[][],
    netMap: number[][][],
    netData: NetData[],
    onShowAlert?: (msg: string) => void,
    airElecShortFlag: boolean = false,
    setAirElecShortFlag?: (val: boolean) => void
  ) {
    if (!grid || grid.length === 0 || !grid[0]) return;
    const lNets = new Set<number>();
    const nNets = new Set<number>();
    const plus24VNets = new Set<number>();
    const zeroVNets = new Set<number>();
    const airNets = new Set<number>();

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x]) grid[y][x]!.isPhysicallyPushed = false;
      }
    }

    // Physical cylinder pushing adjacent buttons
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'pneumatic' && t.subtype === 'cyl_bot') {
          const ext = t.extension || 0;
          if (ext > 0.1) {
            const rot = t.rotation;
            const fDx = [0, 1, 0, -1][rot];
            const fDy = [-1, 0, 1, 0][rot];

            const topX = x + [0, 2, 0, -2][rot];
            const topY = y + [-2, 0, 2, 0][rot];

            const push1X = topX + fDx;
            const push1Y = topY + fDy;
            const push2X = topX + fDx * 2;
            const push2Y = topY + fDy * 2;

            if (
              ext >= 0.5 &&
              push1Y >= 0 &&
              push1Y < grid.length &&
              push1X >= 0 &&
              push1X < grid[0].length
            ) {
              const pt = grid[push1Y][push1X];
              if (pt && (pt.type === 'btn' || pt.type === 'switch')) pt.isPhysicallyPushed = true;
            }
            if (
              ext >= 1.5 &&
              push2Y >= 0 &&
              push2Y < grid.length &&
              push2X >= 0 &&
              push2X < grid[0].length
            ) {
              const pt = grid[push2Y][push2X];
              if (pt && (pt.type === 'btn' || pt.type === 'switch')) pt.isPhysicallyPushed = true;
            }
          }
        }
      }
    }

    const physicallyPushedLabels = new Set<string>();
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (
          t &&
          t.type === 'btn' &&
          (t.isPhysicallyPushed || t.isActive) &&
          t.labels &&
          t.labels[4]
        ) {
          physicallyPushedLabels.add(t.labels[4]);
        }
      }
    }
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (
          t &&
          t.type === 'btn' &&
          t.labels &&
          t.labels[4] &&
          physicallyPushedLabels.has(t.labels[4])
        ) {
          t.isPhysicallyPushed = true;
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'wire') {
          if (t.subtype === 'l' || t.subtype === 'h') lNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'n' || t.subtype === 'g') nNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'plus') plus24VNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'minus' || t.subtype === 'ground') zeroVNets.add(netMap[y][x][(2 + t.rotation) % 4]);
        }
        if (t && t.type === 'power' && t.subtype === 'dc24') {
          plus24VNets.add(netMap[y][x][(0 + t.rotation) % 4]); // top
          zeroVNets.add(netMap[y][x][(2 + t.rotation) % 4]); // bottom
        }
        if (t && t.type === 'power' && t.subtype === 'psu_left') {
          const rightTile = x + 1 < grid[0].length ? grid[y][x + 1] : null;
          if (rightTile && rightTile.type === 'power' && rightTile.subtype === 'psu_right' && rightTile.groupId === t.groupId) {
            const lNet = netMap[y][x][(0 + t.rotation) % 4];
            const nNet = netMap[y][x + 1][(0 + rightTile.rotation) % 4];
            const isPowered = lNet > 0 && nNet > 0 && lNet !== nNet && lNets.has(lNet) && nNets.has(nNet);
            t.isPowered = isPowered;
            rightTile.isPowered = isPowered;
            if (isPowered) {
              const p24Net = netMap[y][x][(2 + t.rotation) % 4];
              const z0Net = netMap[y][x + 1][(2 + rightTile.rotation) % 4];
              if (p24Net > 0) plus24VNets.add(p24Net);
              if (z0Net > 0) zeroVNets.add(z0Net);
            }
          }
        }
        if (t && t.type === 'pneumatic' && t.subtype === 'air_source') {
          airNets.add(netMap[y][x][(2 + t.rotation) % 4]);
        }
        if (t && t.type === 'plc' && t.subtype === 'unit' && t.dx === 0 && t.dy === 0) {
          // L terminal is at (x + 1, y), top pin (0)
          // N terminal is at (x + 2, y), top pin (0)
          const lNet = netMap[y][x + 1][0];
          const nNet = netMap[y][x + 2][0];

          const isPowered =
            lNet > 0 &&
            nNet > 0 &&
            lNet !== nNet &&
            lNets.has(lNet) &&
            nNets.has(nNet);

          t.isPowered = isPowered;

          if (isPowered) {
            // +24V terminal is at (x + 1, y + 9), bottom pin (2)
            // 0V terminal is at (x + 2, y + 9), bottom pin (2)
            const p24Net = netMap[y + 9][x + 1][2];
            const z0Net = netMap[y + 9][x + 2][2];

            if (p24Net > 0) plus24VNets.add(p24Net);
            if (z0Net > 0) zeroVNets.add(z0Net);
          }
        }
      }
    }

    let isAirElecMixed = false;
    for (let i = 1; i < netData.length; i++) {
      if (airNets.has(i) && (lNets.has(i) || nNets.has(i) || plus24VNets.has(i) || zeroVNets.has(i))) {
        isAirElecMixed = true;
        if (!airElecShortFlag) {
          onShowAlert?.('⚠️ 危險：氣電混接！請分離氣管與電線！');
          setAirElecShortFlag?.(true);
        }
      }
    }
    if (!isAirElecMixed && setAirElecShortFlag) setAirElecShortFlag(false);

    for (let i = 1; i < netData.length; i++) {
      if (isAirElecMixed && airNets.has(i) && (lNets.has(i) || nNets.has(i) || plus24VNets.has(i) || zeroVNets.has(i))) {
        netData[i] = { color: '#d946ef', isHigh: false };
      } else if (airNets.has(i)) {
        netData[i] = { color: '#06b6d4', isHigh: true };
      } else if (lNets.has(i) && nNets.has(i)) {
        netData[i] = { color: '#ef4444', isHigh: false };
      } else if (plus24VNets.has(i) && zeroVNets.has(i)) {
        netData[i] = { color: '#f59e0b', isHigh: false };
      } else if (lNets.has(i)) {
        netData[i] = { color: '#ef4444', isHigh: true };
      } else if (nNets.has(i)) {
        netData[i] = { color: '#3b82f6', isHigh: true };
      } else if (plus24VNets.has(i)) {
        netData[i] = { color: '#f97316', isHigh: true };
      } else if (zeroVNets.has(i)) {
        netData[i] = { color: '#6366f1', isHigh: true };
      }
    }

    const shortedNets = new Set([
      ...[...lNets].filter((x) => nNets.has(x)),
      ...[...plus24VNets].filter((x) => zeroVNets.has(x))
    ]);
    if (shortedNets.size > 0 || isAirElecMixed) {
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
          const t = grid[y][x];
          if (t && t.type === 'protection' && t.subtype === 'fuse' && !t.isBlown) {
            const p0 = netMap[y][x][(0 + t.rotation) % 4];
            const p2 = netMap[y][x][(2 + t.rotation) % 4];
            if (shortedNets.has(p0) || shortedNets.has(p2) || isAirElecMixed) {
              t.isBlown = true;
            }
          }
        }
      }
    }

    const activeContacts = new Set<string>();
    const activeValves = new Set<string>();

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];

        if (t && (t.type === 'relay' || (t.type === 'pneumatic' && t.subtype === 'valve_coil'))) {
          const p1 = netMap[y][x][(0 + t.rotation) % 4];
          const p2 = netMap[y][x][(2 + t.rotation) % 4];
          const isPowered =
            (
              (lNets.has(p1) && nNets.has(p2)) || (lNets.has(p2) && nNets.has(p1)) ||
              (plus24VNets.has(p1) && zeroVNets.has(p2)) || (plus24VNets.has(p2) && zeroVNets.has(p1))
            ) &&
            !shortedNets.has(p1) &&
            !shortedNets.has(p2) &&
            !isAirElecMixed;

          if (t.subtype === 'coil' || t.subtype === 'valve_coil' || t.subtype === 'flash_coil' || t.subtype === 'impulse_coil') {
            if (isPowered) {
              if (t.subtype === 'flash_coil') {
                if (t.isPoweredAt === null) t.isPoweredAt = Date.now();
                const flashInterval = t.value || 1000;
                if (Math.floor((Date.now() - t.isPoweredAt) / flashInterval) % 2 === 0) {
                  if (t.labels[4]) activeContacts.add(t.labels[4]);
                  t.isActive = true;
                } else {
                  t.isActive = false;
                }
              } else if (t.subtype === 'impulse_coil') {
                if (!t.prevSignal) {
                  t.outState = !t.outState;
                }
                if (t.outState && t.labels[4]) activeContacts.add(t.labels[4]);
                t.isActive = t.outState;
              } else {
                if (t.labels[4]) activeContacts.add(t.labels[4]);
                if (t.subtype === 'valve_coil' && t.labels[4]) activeValves.add(t.labels[4]);
                t.isActive = true;
              }
            } else {
              t.isPoweredAt = null;
              t.isActive = false;
              if (t.subtype === 'impulse_coil') {
                if (t.outState && t.labels[4]) activeContacts.add(t.labels[4]);
                t.isActive = t.outState;
              }
            }
            t.prevSignal = isPowered;
          }
        }

        if (t && t.type === 'pneumatic' && t.subtype === 'valve_52') {
          if (t.labels[4]) {
            t.isActive = activeValves.has(t.labels[4]);
          }
        }

        if (t && (t.type === 'load' || t.type === 'motor')) {
          const p0 = netMap[y][x][(0 + t.rotation) % 4];
          const p2 = netMap[y][x][(2 + t.rotation) % 4];
          const hasL = lNets.has(p0) || lNets.has(p2) || plus24VNets.has(p0) || plus24VNets.has(p2);
          const hasN = nNets.has(p0) || nNets.has(p2) || zeroVNets.has(p0) || zeroVNets.has(p2);

          if (hasL && hasN && !shortedNets.has(p0) && !shortedNets.has(p2) && !isAirElecMixed) {
            t.isPowered = true;
            if (t.type === 'motor') {
              if ((lNets.has(p0) && nNets.has(p2)) || (plus24VNets.has(p0) && zeroVNets.has(p2))) t.motorDir = 1;
              else t.motorDir = -1;
            }
          } else {
            t.isPowered = false;
            if (t.type === 'motor') t.motorDir = 0;
          }
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'pneumatic' && t.subtype === 'cyl_bot') {
          const rot = t.rotation;
          const topX = x + [0, 2, 0, -2][rot];
          const topY = y + [-2, 0, 2, 0][rot];

          const pExt = netMap[y][x][(3 + rot) % 4];
          const hasExtAir = airNets.has(pExt) && !isAirElecMixed;

          let hasRetAir = false;
          if (
            topX >= 0 &&
            topX < grid[0].length &&
            topY >= 0 &&
            topY < grid.length &&
            grid[topY][topX]
          ) {
            const pRet = netMap[topY][topX][(3 + rot) % 4];
            hasRetAir = airNets.has(pRet) && !isAirElecMixed;
          }

          if (hasExtAir && !hasRetAir) t.extension = Math.min(2.0, (t.extension || 0) + 0.1);
          else if (hasRetAir && !hasExtAir) t.extension = Math.max(0.0, (t.extension || 0) - 0.1);

          for (let cy = 0; cy < grid.length; cy++) {
            for (let cx = 0; cx < grid[0].length; cx++) {
              if (grid[cy][cx] && grid[cy][cx]!.groupId === t.groupId) {
                grid[cy][cx]!.extension = t.extension;
              }
            }
          }
        }
      }
    }

    const dirsW = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'platform' && t.subtype === 'bot') {
          const rot = t.rotation || 0;
          const topX = x + [0, 2, 0, -2][rot];
          const topY = y + [-2, 0, 2, 0][rot];

          const mechInDir = (0 + rot) % 4;
          const adjX = topX + dirsW[mechInDir][0];
          const adjY = topY + dirsW[mechInDir][1];

          let isDriven = false;
          let speed = 0;

          if (adjX >= 0 && adjX < grid[0].length && adjY >= 0 && adjY < grid.length) {
            const adjT = grid[adjY][adjX];
            if (adjT && adjT.type === 'motor' && adjT.isPowered) {
              const motorMechOut = (1 + adjT.rotation) % 4;
              if (motorMechOut === (mechInDir + 2) % 4) {
                isDriven = true;
                speed = adjT.motorDir * 0.05;
              }
            }
          }

          if (isDriven) {
            t.extension = Math.max(0.0, Math.min(2.0, (t.extension || 0) + speed));
            for (let cy = 0; cy < grid.length; cy++) {
              for (let cx = 0; cx < grid[0].length; cx++) {
                if (grid[cy][cx] && grid[cy][cx]!.groupId === t.groupId) {
                  grid[cy][cx]!.extension = t.extension;
                }
              }
            }
          }
        }
      }
    }

    // PLC Ladder Diagram Power Rail & Coil Evaluation
    const splitCol = grid[0].length <= 10 ? 5 : 10;
    for (let y = 0; y < grid.length; y++) {
      if (grid[y] && grid[y][0]) {
        const railNet = netMap[y][0][3]; // left pin at col 0
        if (railNet > 0) {
          lNets.add(railNet);
        }
      }
    }

    // Evaluate PLC Hardware Unit Inputs
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'plc' && t.subtype === 'unit' && t.dx === 0 && t.dy === 0) {
          if (!t.inputsActive) t.inputsActive = Array(8).fill(false);
          for (let i = 0; i < 8; i++) t.inputsActive[i] = false;

          if (t.isPowered) {
            // S/S terminal is at (x, y + 9), left pin (3)
            const ssNet = netMap[y + 9][x][3];
            const isSSPlus24V = ssNet > 0 && (plus24VNets.has(ssNet) || lNets.has(ssNet));
            const isSSZeroV = ssNet > 0 && (zeroVNets.has(ssNet) || nNets.has(ssNet));

            // X0 to X7 are at (x, y + 1) to (x, y + 8), left pin (3)
            for (let i = 0; i < 8; i++) {
              const ix = x;
              const iy = y + 1 + i;
              if (iy < grid.length) {
                const xNet = netMap[iy][ix][3];
                let isInputTriggered = false;

                if (isSSPlus24V) {
                  // S/S connected to +24V -> Input X triggers when connected to 0V
                  if (xNet > 0 && (zeroVNets.has(xNet) || nNets.has(xNet))) {
                    isInputTriggered = true;
                  }
                } else if (isSSZeroV) {
                  // S/S connected to 0V -> Input X triggers when connected to +24V
                  if (xNet > 0 && (plus24VNets.has(xNet) || lNets.has(xNet))) {
                    isInputTriggered = true;
                  }
                }

                if (isInputTriggered) {
                  activeContacts.add('X' + i);
                  activeContacts.add('x' + i);
                  t.inputsActive[i] = true;
                }
              }
            }
          }
        }
      }
    }

    // Evaluate PLC output coils
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'plc' && (t.subtype === 'out' || t.subtype === 'plc_out')) {
          const p3 = netMap[y][x][(3 + t.rotation) % 4];
          if (lNets.has(p3) && !shortedNets.has(p3)) {
            t.isPowered = true;
            if (t.labels && t.labels[4]) {
              const raw = t.labels[4];
              activeContacts.add(raw);
              activeContacts.add(raw.trim().toUpperCase());
            }
          } else {
            t.isPowered = false;
          }
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        const isRelayContact = t && t.type === 'relay' && (
          t.subtype === 'no' || t.subtype === 'nc' || t.subtype === 'con' ||
          t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_')
        );
        if (isRelayContact) {
          if (t.labels && t.labels[4]) {
            const raw = t.labels[4];
            const norm = raw.trim().toUpperCase();
            const isPowered = activeContacts.has(raw) || activeContacts.has(norm);
            
            if (t.subtype.startsWith('ton_')) {
              if (isPowered) {
                if (t.isPoweredAt === null) t.isPoweredAt = Date.now();
                if (Date.now() - t.isPoweredAt >= t.value) t.isActive = true;
              } else {
                t.isPoweredAt = null;
                t.isActive = false;
              }
            } else if (t.subtype.startsWith('tof_')) {
              if (isPowered) {
                t.isPoweredAt = null;
                t.isActive = true;
              } else {
                if (t.isActive) {
                  if (t.isPoweredAt === null) t.isPoweredAt = Date.now();
                  if (Date.now() - t.isPoweredAt >= t.value) {
                    t.isActive = false;
                    t.isPoweredAt = null;
                  }
                }
              }
            } else {
              t.isActive = isPowered;
            }
          }
        }
        if (
          t &&
          (t.type === 'plc' ||
            t.subtype === 'plc_a' ||
            t.subtype === 'plc_b' ||
            t.subtype === 'plc_p' ||
            t.subtype === 'plc_n' ||
            t.subtype === 'no' ||
            t.subtype === 'nc' ||
            t.subtype === 'pls' ||
            t.subtype === 'plf')
        ) {
          if (
            t.subtype === 'no' ||
            t.subtype === 'nc' ||
            t.subtype === 'plc_a' ||
            t.subtype === 'plc_b'
          ) {
            if (t.labels && t.labels[4]) {
              const raw = t.labels[4];
              const norm = raw.trim().toUpperCase();
              t.isActive =
                physicallyPushedLabels.has(raw) ||
                physicallyPushedLabels.has(norm) ||
                activeContacts.has(raw) ||
                activeContacts.has(norm);
            }
          } else if (t.subtype === 'pls' || t.subtype === 'plc_p') {
            if (t.labels && t.labels[4]) {
              const raw = t.labels[4];
              const norm = raw.trim().toUpperCase();
              const currSignal =
                physicallyPushedLabels.has(raw) ||
                physicallyPushedLabels.has(norm) ||
                activeContacts.has(raw) ||
                activeContacts.has(norm);

              if (t.prevSignal === undefined) {
                t.prevSignal = currSignal;
                t.isActive = false;
              } else {
                t.isActive = currSignal && !t.prevSignal;
                t.prevSignal = currSignal;
              }
            } else {
              t.isActive = false;
            }
          } else if (t.subtype === 'plf' || t.subtype === 'plc_n') {
            if (t.labels && t.labels[4]) {
              const raw = t.labels[4];
              const norm = raw.trim().toUpperCase();
              const currSignal =
                physicallyPushedLabels.has(raw) ||
                physicallyPushedLabels.has(norm) ||
                activeContacts.has(raw) ||
                activeContacts.has(norm);

              if (t.prevSignal === undefined) {
                t.prevSignal = currSignal;
                t.isActive = false;
              } else {
                t.isActive = !currSignal && t.prevSignal;
                t.prevSignal = currSignal;
              }
            } else {
              t.isActive = false;
            }
          }
        }
        if (t && t.type === 'plc' && t.subtype === 'unit' && t.dx === 3) {
          // Output tile (Y0..Y7)
          if (t.dy! >= 1 && t.dy! <= 4) {
            t.isActive = activeContacts.has('Y' + (t.dy! - 1));
          } else if (t.dy! >= 6 && t.dy! <= 9) {
            t.isActive = activeContacts.has('Y' + (t.dy! - 2));
          }
        }
        if (t && t.type === 'plc' && t.subtype === 'unit' && t.dx === 0 && t.dy === 0) {
          if (!t.outputsActive) t.outputsActive = Array(8).fill(false);
          for (let i = 0; i < 8; i++) {
            t.outputsActive[i] = t.isPowered && activeContacts.has('Y' + i);
          }
        }
      }
    }
  },
};
