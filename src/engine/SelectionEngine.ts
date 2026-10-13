/**
 * @license
 * Auto Studio Pro - Selection, Clipboard, and Group Transformation Engine
 */

import { Tile, ClipboardData, AppMode } from '../types';
import { ComponentRegistry } from '../registry/ComponentRegistry';

export interface SelectionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const SelectionEngine = {
  /**
   * Calculates the selection bounding box, automatically expanding to enclose
   * any multi-tile component groups intersecting the boundary.
   */
  getSelectionBounds(
    selectStart: { x: number; y: number },
    selectEnd: { x: number; y: number },
    grid: (Tile | null)[][],
    gridSize: number
  ): SelectionBounds {
    let minX = Math.min(selectStart.x, selectEnd.x);
    let maxX = Math.max(selectStart.x, selectEnd.x);
    let minY = Math.min(selectStart.y, selectEnd.y);
    let maxY = Math.max(selectStart.y, selectEnd.y);

    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let y = minY; y <= Math.min(maxY, gridSize - 1); y++) {
        for (let x = minX; x <= Math.min(maxX, gridSize - 1); x++) {
          const t = grid[y]?.[x];
          if (t && t.groupId) {
            for (let gy = 0; gy < gridSize; gy++) {
              for (let gx = 0; gx < gridSize; gx++) {
                if (grid[gy]?.[gx]?.groupId === t.groupId) {
                  if (gx < minX) {
                    minX = gx;
                    expanded = true;
                  }
                  if (gx > maxX) {
                    maxX = gx;
                    expanded = true;
                  }
                  if (gy < minY) {
                    minY = gy;
                    expanded = true;
                  }
                  if (gy > maxY) {
                    maxY = gy;
                    expanded = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    return { minX, maxX, minY, maxY };
  },

  /**
   * Checks if clipboard data placed at mousePos will collide with existing tiles
   * or exceed the canvas grid boundary.
   */
  checkInterference(
    clipboard: ClipboardData | null,
    mousePos: { x: number; y: number },
    gridSize: number,
    grid: (Tile | null)[][]
  ): boolean {
    if (!clipboard) return false;
    for (let y = 0; y < clipboard.h; y++) {
      for (let x = 0; x < clipboard.w; x++) {
        const tx = mousePos.x + x;
        const ty = mousePos.y + y;
        if (
          clipboard.data[y][x] &&
          (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || grid[ty]?.[tx])
        ) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Rotates a single tile or all tiles belonging to the same multi-tile component group.
   */
  rotateTileOrGroup(
    px: number,
    py: number,
    grid: (Tile | null)[][],
    gridSize: number,
    currentMode: AppMode,
    onSaveState: () => void,
    onShowAlert: (msg: string) => void,
    setGrid: React.Dispatch<React.SetStateAction<(Tile | null)[][]>>
  ): boolean {
    const t = grid[py]?.[px];
    if (!t) return false;

    const rotCheck = ComponentRegistry.checkCanRotate(t, currentMode);
    if (!rotCheck.canRotate) {
      onShowAlert(rotCheck.errorMsg || '無法旋轉！');
      return false;
    }

    onSaveState();

    if (!t.groupId) {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        if (next[py][px]) {
          next[py][px] = Object.assign(new Tile(), next[py][px], {
            rotation: (next[py][px]!.rotation + 1) % 4,
          });
        }
        return next;
      });
      return true;
    }

    // Multi-tile group rotation
    const groupCells: { x: number; y: number; tile: Tile }[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x] && grid[y][x]!.groupId === t.groupId) {
          groupCells.push({ x, y, tile: grid[y][x]! });
        }
      }
    }

    let canRotate = true;
    const newPositions: { x: number; y: number; tile: Tile }[] = [];
    for (const cell of groupCells) {
      const dx = cell.x - px;
      const dy = cell.y - py;
      const nx = px - dy;
      const ny = py + dx;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
        canRotate = false;
        break;
      }
      const existing = grid[ny][nx];
      if (existing && existing.groupId !== t.groupId) {
        canRotate = false;
        break;
      }
      newPositions.push({ x: nx, y: ny, tile: cell.tile });
    }

    if (canRotate) {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        for (const cell of groupCells) next[cell.y][cell.x] = null;
        for (const pos of newPositions) {
          next[pos.y][pos.x] = Object.assign(new Tile(), pos.tile, {
            rotation: (pos.tile.rotation + 1) % 4,
          });
        }
        return next;
      });
      return true;
    } else {
      onShowAlert('空間不足或有障礙物，無法旋轉群組！');
      return false;
    }
  },

  /**
   * Adjusts the extension ratio (0.0 to 1.0) of a variable resistor or rheostat.
   */
  updateSlidePotentiometer(
    rawX: number,
    rawY: number,
    targetTile: Tile,
    mx: number,
    my: number,
    grid: (Tile | null)[][],
    gridSize: number,
    tileSize: number,
    setGrid: React.Dispatch<React.SetStateAction<(Tile | null)[][]>>
  ): void {
    const tilesInGroup: { x: number; y: number; tile: Tile }[] = [];
    if (targetTile.groupId) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const c = grid[y][x];
          if (c && c.groupId === targetTile.groupId) {
            tilesInGroup.push({ x, y, tile: c });
          }
        }
      }
    } else {
      tilesInGroup.push({ x: mx, y: my, tile: targetTile });
    }

    if (tilesInGroup.length === 0) return;

    const rot = targetTile.rotation || 0;
    const isHoriz = rot % 2 === 0;

    let ratio = 0.5;
    if (isHoriz) {
      const xs = tilesInGroup.map((t) => t.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const trackLeft = minX * tileSize + 20;
      const trackRight = maxX * tileSize + 60;
      const trackWidth = Math.max(1, trackRight - trackLeft);

      if (rot === 0) {
        ratio = (rawX - trackLeft) / trackWidth;
      } else {
        ratio = (trackRight - rawX) / trackWidth;
      }
    } else {
      const ys = tilesInGroup.map((t) => t.y);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const trackTop = minY * tileSize + 20;
      const trackBottom = maxY * tileSize + 60;
      const trackHeight = Math.max(1, trackBottom - trackTop);

      if (rot === 1) {
        ratio = (rawY - trackTop) / trackHeight;
      } else {
        ratio = (trackBottom - rawY) / trackHeight;
      }
    }

    const clampedRatio = Math.max(0, Math.min(1, Math.round(ratio * 100) / 100));

    setGrid((prev) =>
      prev.map((row, ry) =>
        row.map((c, rx) => {
          if (!c) return c;
          if (targetTile.groupId && c.groupId === targetTile.groupId) {
            return Object.assign(new Tile(), c, { extension: clampedRatio });
          }
          if (!targetTile.groupId && rx === mx && ry === my) {
            return Object.assign(new Tile(), c, { extension: clampedRatio });
          }
          return c;
        })
      )
    );
  },

  /**
   * Copies tiles within the selection bounding box into a ClipboardData object.
   */
  copySelection(bounds: SelectionBounds, grid: (Tile | null)[][]): ClipboardData {
    const minX = Math.max(0, bounds.minX);
    const minY = Math.max(0, bounds.minY);
    const maxY = Math.min(grid.length - 1, bounds.maxY);
    const maxX = Math.min((grid[0]?.length || 1) - 1, bounds.maxX);

    const cbData: (Tile | null)[][] = [];
    for (let y = minY; y <= maxY; y++) {
      const row: (Tile | null)[] = [];
      for (let x = minX; x <= maxX; x++) {
        const t = grid[y]?.[x];
        if (t) {
          const cloned = JSON.parse(JSON.stringify(t));
          cloned.isLocked = false;
          row.push(cloned);
        } else {
          row.push(null);
        }
      }
      cbData.push(row);
    }
    return { w: Math.max(1, maxX - minX + 1), h: Math.max(1, maxY - minY + 1), data: cbData };
  },

  /**
   * Clears tiles within the selection bounding box, ensuring multi-tile groups are cleaned up.
   */
  deleteSelection(bounds: SelectionBounds, grid: (Tile | null)[][]): (Tile | null)[][] {
    const { minX, maxX, minY, maxY } = bounds;
    const groupIdsToDelete = new Set<string>();

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const t = grid[y]?.[x];
        if (t && t.groupId) {
          groupIdsToDelete.add(t.groupId);
        }
      }
    }

    return grid.map((row, y) =>
      row.map((t, x) => {
        if (!t) return t;
        if (y >= minY && y <= maxY && x >= minX && x <= maxX) return null;
        if (t.groupId && groupIdsToDelete.has(t.groupId)) return null;
        return t;
      })
    );
  },
};
