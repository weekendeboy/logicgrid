/**
 * @license
 * Rendering Types for Auto Studio Pro
 */

import { Tile, AppMode } from '../types';

export const TILE_SIZE = 80;

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  mode: AppMode;
  x: number;
  y: number;
  t: Tile;
  localColors: string[];
  defC: string;
  grid?: (Tile | null)[][];
  line: (x1: number, y1: number, x2: number, y2: number, col?: string) => void;
  drawPin: (d: number, length: number, overrideColor?: string) => void;
}
