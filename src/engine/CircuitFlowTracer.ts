/**
 * @license
 * Circuit Flow Tracer Engine for Auto Studio Pro
 * Traces closed-circuit conventional current flow directions (positive [+] through loads to negative [-]).
 * Employs a dual-BFS graph solver to guarantee:
 *  1. No photons are generated until a valid closed loop with active load exists.
 *  2. Uniform, non-colliding circulation direction across series and parallel loops.
 *  3. T-junctions only emit and route photons along their 3 physical branches.
 *  4. Insulated bridge (flyover) animates both straight and 3D arch tracks independently.
 *  5. Cross wires route current along valid directional lines without collision.
 */

import { Tile, AppMode } from '../types';

export interface WireFlowSegment {
  x: number;
  y: number;
  // Local pin index where current enters (0: Top, 1: Right, 2: Bottom, 3: Left)
  fromPin: number;
  // Local pin index where current exits
  toPin: number;
  // Is this an arch track on a bridge tile?
  isArch?: boolean;
}

interface PinNode {
  x: number;
  y: number;
  p: number; // World pin (0: N, 1: E, 2: S, 3: W)
}

export const CircuitFlowTracer = {
  /**
   * Traces closed electrical loops and returns all active wire flow segments with entry/exit directions.
   * If there is no closed loop (open circuit), returns an empty array.
   */
  traceFlowSegments(
    grid: (Tile | null)[][],
    gridSize: number,
    currentMode: AppMode
  ): WireFlowSegment[] {
    // 1. Verify existence of active power source and active conducting load
    let hasPowerSource = false;
    let hasActiveLoad = false;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = grid[y]?.[x];
        if (!t) continue;
        if (
          t.type === 'power' &&
          (t.subtype === 'power_1_5v' ||
            t.subtype === '1_5v' ||
            t.subtype === 'power_12v' ||
            t.subtype === '12v' ||
            t.subtype === 'dc24' ||
            t.subtype === 'power_dc' ||
            t.subtype === 'dc' ||
            t.subtype === 'ac' ||
            t.subtype === 'power_ac')
        ) {
          hasPowerSource = true;
        }
        if (t.type === 'load' && (t.isPowered || (t.currentA && t.currentA > 0.005))) {
          hasActiveLoad = true;
        }
        if (t.type === 'meter' && t.subtype === 'a' && t.measureVal && t.measureVal > 0.005) {
          hasActiveLoad = true;
        }
        if (t.type === 'resistor' && t.currentA && t.currentA > 0.005) {
          hasActiveLoad = true;
        }
        if (t.type === 'led' && t.currentA && t.currentA > 0.001) {
          hasActiveLoad = true;
        }
      }
    }

    if (!hasPowerSource || !hasActiveLoad) {
      return [];
    }

    const neighborDelta = [
      { dx: 0, dy: -1, oppPin: 2 }, // 0 (North) -> touches South (2)
      { dx: 1, dy: 0, oppPin: 3 },  // 1 (East)  -> touches West (3)
      { dx: 0, dy: 1, oppPin: 0 },  // 2 (South) -> touches North (0)
      { dx: -1, dy: 0, oppPin: 1 }, // 3 (West)  -> touches East (1)
    ];

    const pinKey = (x: number, y: number, p: number) => `${x},${y},${p}`;

    // Returns the world pins that physically exist on a given tile
    const getPhysicalWorldPins = (t: Tile | null): number[] => {
      if (!t) return [];
      const rot = t.rotation || 0;
      if (t.type === 'wire') {
        if (t.subtype === 'straight') return [(0 + rot) % 4, (2 + rot) % 4];
        if (t.subtype === 'turn') return [(0 + rot) % 4, (1 + rot) % 4];
        if (t.subtype === 't') return [(1 + rot) % 4, (2 + rot) % 4, (3 + rot) % 4];
        if (t.subtype === 'cross' || t.subtype === 'bridge') return [0, 1, 2, 3];
        return [(2 + rot) % 4];
      }
      if (t.type === 'resistor_var' || (t.type === 'resistor' && t.subtype.startsWith('var_'))) {
        if (t.subtype === 'var_left') return [(0 + rot) % 4, (2 + rot) % 4, (3 + rot) % 4];
        if (t.subtype === 'var_right') return [(0 + rot) % 4, (1 + rot) % 4, (2 + rot) % 4];
        return [(0 + rot) % 4, (2 + rot) % 4];
      }
      return [(0 + rot) % 4, (2 + rot) % 4];
    };

    // Returns internal shorted groups of pins within a tile that are conducting
    const getInternalConductingGroups = (t: Tile | null): number[][] => {
      if (!t) return [];
      const rot = t.rotation || 0;
      const act = t.isActive || t.isPhysicallyPushed;

      if (t.type === 'wire') {
        if (t.subtype === 'straight') return [[(0 + rot) % 4, (2 + rot) % 4]];
        if (t.subtype === 'turn') return [[(0 + rot) % 4, (1 + rot) % 4]];
        if (t.subtype === 't') return [[(1 + rot) % 4, (2 + rot) % 4, (3 + rot) % 4]];
        if (t.subtype === 'cross') return [[0, 1, 2, 3]];
        if (t.subtype === 'bridge') {
          return [
            [(0 + rot) % 4, (2 + rot) % 4],
            [(1 + rot) % 4, (3 + rot) % 4],
          ];
        }
        return [];
      }
      if (t.type === 'switch' && (t.subtype === 'spst' || t.subtype === 'toggle')) {
        if (act) return [[(0 + rot) % 4, (2 + rot) % 4]];
        return [];
      }
      if (t.type === 'protection' && t.subtype === 'fuse' && !t.isBlown) {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'breaker' && t.isActive) {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'meter' && t.subtype === 'a') {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'load' && (t.isPowered || (t.currentA && t.currentA > 0.005))) {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'resistor' && (t.currentA && t.currentA > 0.005)) {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'led' && (t.currentA && t.currentA > 0.001)) {
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      if (t.type === 'resistor_var' || (t.type === 'resistor' && t.subtype.startsWith('var_'))) {
        if (t.subtype === 'var_left') return [[(0 + rot) % 4, (2 + rot) % 4, (3 + rot) % 4]];
        if (t.subtype === 'var_right') return [[(0 + rot) % 4, (1 + rot) % 4, (2 + rot) % 4]];
        return [[(0 + rot) % 4, (2 + rot) % 4]];
      }
      // Power sources do NOT internally conduct between (+) and (-) during traversal
      return [];
    };

    // 2. Identify Source (+) and Sink (-) terminals
    const sourcePins: PinNode[] = [];
    const sinkPins: PinNode[] = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = grid[y]?.[x];
        if (t && t.type === 'power') {
          const rot = t.rotation || 0;
          sourcePins.push({ x, y, p: (0 + rot) % 4 }); // Pin 0 is (+)
          sinkPins.push({ x, y, p: (2 + rot) % 4 });   // Pin 2 is (-)
        }
      }
    }

    if (sourcePins.length === 0 || sinkPins.length === 0) {
      return [];
    }

    // BFS solver for graph traversal across internal and external edges
    const runBfs = (startNodes: PinNode[]): Map<string, number> => {
      const distMap = new Map<string, number>();
      const queue: { x: number; y: number; p: number; dist: number }[] = [];

      for (const node of startNodes) {
        const k = pinKey(node.x, node.y, node.p);
        distMap.set(k, 0);
        queue.push({ ...node, dist: 0 });
      }

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const { x, y, p, dist } = curr;

        // A. Internal connections inside the same tile
        const t = grid[y]?.[x];
        if (t) {
          const groups = getInternalConductingGroups(t);
          for (const grp of groups) {
            if (grp.includes(p)) {
              for (const otherP of grp) {
                if (otherP !== p) {
                  const oKey = pinKey(x, y, otherP);
                  if (!distMap.has(oKey) || distMap.get(oKey)! > dist + 1) {
                    distMap.set(oKey, dist + 1);
                    queue.push({ x, y, p: otherP, dist: dist + 1 });
                  }
                }
              }
            }
          }
        }

        // B. External connections across adjacent touching tiles
        const nd = neighborDelta[p];
        const nx = x + nd.dx;
        const ny = y + nd.dy;
        const oppPin = nd.oppPin;

        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          const neighbor = grid[ny]?.[nx];
          if (neighbor) {
            const neighborPhysicalPins = getPhysicalWorldPins(neighbor);
            if (neighborPhysicalPins.includes(oppPin)) {
              const nKey = pinKey(nx, ny, oppPin);
              if (!distMap.has(nKey) || distMap.get(nKey)! > dist + 1) {
                distMap.set(nKey, dist + 1);
                queue.push({ x: nx, y: ny, p: oppPin, dist: dist + 1 });
              }
            }
          }
        }
      }

      return distMap;
    };

    // Run Dual-BFS: from (+) source and from (-) sink
    const distFromSource = runBfs(sourcePins);
    const distToSink = runBfs(sinkPins);

    // Check if at least one sink terminal is reached by the source BFS (closed loop verification)
    const hasClosedLoop = sinkPins.some((sp) => distFromSource.has(pinKey(sp.x, sp.y, sp.p)));
    if (!hasClosedLoop) {
      return [];
    }

    // 3. Extract wire flow segments along active, closed paths
    const segments: WireFlowSegment[] = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = grid[y]?.[x];
        if (!t || t.type !== 'wire') continue;

        const rot = t.rotation || 0;
        const toWorldPin = (localPin: number) => (localPin + rot) % 4;

        const isPinActive = (lp: number) => {
          const wp = toWorldPin(lp);
          const k = pinKey(x, y, wp);
          return distFromSource.has(k) && distToSink.has(k);
        };

        const getDistSource = (lp: number) => distFromSource.get(pinKey(x, y, toWorldPin(lp)));
        const getDistSink = (lp: number) => distToSink.get(pinKey(x, y, toWorldPin(lp)));

        if (t.subtype === 'straight') {
          if (isPinActive(0) && isPinActive(2)) {
            const ds0 = getDistSource(0)!;
            const ds2 = getDistSource(2)!;
            const dt0 = getDistSink(0)!;
            const dt2 = getDistSink(2)!;

            if (ds0 <= ds2 && dt0 >= dt2) {
              segments.push({ x, y, fromPin: 0, toPin: 2 });
            } else if (ds2 <= ds0 && dt2 >= dt0) {
              segments.push({ x, y, fromPin: 2, toPin: 0 });
            }
          }
        } else if (t.subtype === 'turn') {
          if (isPinActive(0) && isPinActive(1)) {
            const ds0 = getDistSource(0)!;
            const ds1 = getDistSource(1)!;
            const dt0 = getDistSink(0)!;
            const dt1 = getDistSink(1)!;

            if (ds0 <= ds1 && dt0 >= dt1) {
              segments.push({ x, y, fromPin: 0, toPin: 1 });
            } else if (ds1 <= ds0 && dt1 >= dt0) {
              segments.push({ x, y, fromPin: 1, toPin: 0 });
            }
          }
        } else if (t.subtype === 't') {
          // T-junction only connects physical local pins 1, 2, 3 (Pin 0 does NOT exist)
          const activePins = [1, 2, 3].filter(isPinActive);
          if (activePins.length >= 2) {
            for (const pA of activePins) {
              for (const pB of activePins) {
                if (pA === pB) continue;
                const dsA = getDistSource(pA)!;
                const dsB = getDistSource(pB)!;
                const dtA = getDistSink(pA)!;
                const dtB = getDistSink(pB)!;

                if (dsA < dsB && dtA > dtB) {
                  segments.push({ x, y, fromPin: pA, toPin: pB });
                }
              }
            }
          }
        } else if (t.subtype === 'bridge') {
          // Track 1: Vertical straight (pins 0 & 2)
          if (isPinActive(0) && isPinActive(2)) {
            const ds0 = getDistSource(0)!;
            const ds2 = getDistSource(2)!;
            const dt0 = getDistSink(0)!;
            const dt2 = getDistSink(2)!;

            if (ds0 <= ds2 && dt0 >= dt2) {
              segments.push({ x, y, fromPin: 0, toPin: 2, isArch: false });
            } else if (ds2 <= ds0 && dt2 >= dt0) {
              segments.push({ x, y, fromPin: 2, toPin: 0, isArch: false });
            }
          }

          // Track 2: Horizontal insulated arch (pins 3 & 1)
          if (isPinActive(3) && isPinActive(1)) {
            const ds3 = getDistSource(3)!;
            const ds1 = getDistSource(1)!;
            const dt3 = getDistSink(3)!;
            const dt1 = getDistSink(1)!;

            if (ds3 <= ds1 && dt3 >= dt1) {
              segments.push({ x, y, fromPin: 3, toPin: 1, isArch: true });
            } else if (ds1 <= ds3 && dt1 >= dt3) {
              segments.push({ x, y, fromPin: 1, toPin: 3, isArch: true });
            }
          }
        } else if (t.subtype === 'cross') {
          // Cross 4-way wire: Vertical line (0 & 2) and Horizontal line (3 & 1)
          if (isPinActive(0) && isPinActive(2)) {
            const ds0 = getDistSource(0)!;
            const ds2 = getDistSource(2)!;
            const dt0 = getDistSink(0)!;
            const dt2 = getDistSink(2)!;

            if (ds0 <= ds2 && dt0 >= dt2) {
              segments.push({ x, y, fromPin: 0, toPin: 2 });
            } else if (ds2 <= ds0 && dt2 >= dt0) {
              segments.push({ x, y, fromPin: 2, toPin: 0 });
            }
          }

          if (isPinActive(3) && isPinActive(1)) {
            const ds3 = getDistSource(3)!;
            const ds1 = getDistSource(1)!;
            const dt3 = getDistSink(3)!;
            const dt1 = getDistSink(1)!;

            if (ds3 <= ds1 && dt3 >= dt1) {
              segments.push({ x, y, fromPin: 3, toPin: 1 });
            } else if (ds1 <= ds3 && dt1 >= dt3) {
              segments.push({ x, y, fromPin: 1, toPin: 3 });
            }
          }
        }
      }
    }

    return segments;
  },
};
