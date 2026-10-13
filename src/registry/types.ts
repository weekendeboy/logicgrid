/**
 * @license
 * Component Registry Types for Auto Studio Pro
 */

import { Tile, AppMode } from '../types';

export interface PlacementContext {
  x: number;
  y: number;
  rotation: number;
  grid?: (Tile | null)[][];
  gridSize?: number;
}

export interface PlacedTileInfo {
  x: number;
  y: number;
  tile: Tile;
}

export interface ValidationResult {
  canPlace: boolean;
  errorMsg?: string;
}

export interface ComponentDefinition {
  type: string;
  subtype: string;
  name?: string;
  isMultiTile?: boolean;
  canRotate?: (mode: AppMode) => { canRotate: boolean; errorMsg?: string };
  validatePlacement?: (
    x: number,
    y: number,
    rotation: number,
    gridSize: number,
    isCellAvailable: (x: number, y: number) => boolean
  ) => ValidationResult;
  createTiles: (context: PlacementContext) => PlacedTileInfo[];
  createGhostTiles?: (context: PlacementContext) => PlacedTileInfo[];
  getShortedPinGroups?: (tile: Tile, mode: AppMode) => number[][];
}
