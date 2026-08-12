/**
 * @license
 * A* Pathfinding for Auto-Wire Wizard
 */

import { Tile, Waypoint } from '../types';

export function findAStarPath(
  start: Waypoint,
  end: Waypoint,
  grid: (Tile | null)[][],
  gridW: number,
  gridH: number
): Waypoint[] | null {
  const open: Waypoint[] = [start];
  const cameFrom: Record<string, Waypoint> = {};
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};

  const sK = `${start.x},${start.y}`;
  gScore[sK] = 0;
  fScore[sK] = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);

  while (open.length > 0) {
    open.sort((a, b) => fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]);
    let curr = open.shift()!;
    let cK = `${curr.x},${curr.y}`;

    if (curr.x === end.x && curr.y === end.y) {
      const path: Waypoint[] = [curr];
      while (cameFrom[cK]) {
        curr = cameFrom[cK];
        cK = `${curr.x},${curr.y}`;
        path.unshift(curr);
      }
      return path;
    }

    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    for (let d = 0; d < 4; d++) {
      const nx = curr.x + dirs[d][0];
      const ny = curr.y + dirs[d][1];
      const nK = `${nx},${ny}`;

      if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;

      const isTerm = (nx === start.x && ny === start.y) || (nx === end.x && ny === end.y);
      const tile = grid[ny][nx];
      if (tile && !isTerm && tile.type !== 'wire') continue;

      const cost = tile ? 5 : 1;
      const tg = gScore[cK] + cost;

      if (gScore[nK] === undefined || tg < gScore[nK]) {
        cameFrom[nK] = curr;
        gScore[nK] = tg;
        fScore[nK] = tg + Math.abs(end.x - nx) + Math.abs(end.y - ny);
        if (!open.some((p) => p.x === nx && p.y === ny)) {
          open.push({ x: nx, y: ny });
        }
      }
    }
  }

  return null;
}

function getDir(f: Waypoint, t: Waypoint): number {
  if (t.y < f.y) return 0;
  if (t.x > f.x) return 1;
  if (t.y > f.y) return 2;
  if (t.x < f.x) return 3;
  return 0;
}

export function layWiresOnPath(path: Waypoint[], grid: (Tile | null)[][], createTile: (subtype: string, rot: number) => Tile) {
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dIn = getDir(curr, prev);
    const dOut = getDir(curr, next);
    const pins = [dIn, dOut].sort((a, b) => a - b);
    let subtype = 'straight';
    let rot = 0;

    if (pins[0] === 0 && pins[1] === 2) {
      subtype = 'straight';
      rot = 0;
    } else if (pins[0] === 1 && pins[1] === 3) {
      subtype = 'straight';
      rot = 1;
    } else if (pins[0] === 0 && pins[1] === 1) {
      subtype = 'turn';
      rot = 0;
    } else if (pins[0] === 1 && pins[1] === 2) {
      subtype = 'turn';
      rot = 1;
    } else if (pins[0] === 2 && pins[1] === 3) {
      subtype = 'turn';
      rot = 2;
    } else if (pins[0] === 0 && pins[1] === 3) {
      subtype = 'turn';
      rot = 3;
    }

    const existing = grid[curr.y][curr.x];
    if (existing && existing.type === 'wire') {
      if (existing.subtype === 'straight') {
        subtype = 'bridge';
        rot = existing.rotation;
      } else {
        subtype = 'cross';
        rot = 0;
      }
    }

    grid[curr.y][curr.x] = createTile(subtype, rot);
  }
}
