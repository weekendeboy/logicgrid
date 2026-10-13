/**
 * @license
 * Level Definition Types for Auto Studio Pro
 */

import { Tile, LogicLevelId } from '../types';

export interface LevelItemInfo {
  id: LogicLevelId;
  title: string;
  desc: string;
}

export interface LevelMenuCategory {
  title: string;
  levels: LevelItemInfo[];
}

export interface LevelDefinition {
  id: LogicLevelId;
  title: string;
  desc?: string;
  description?: string;
  category?: string;
  defaultGridSize?: number;
  setup?: (grid: (Tile | null)[][], size: number) => void;
  initGrid?: (grid: (Tile | null)[][], size?: number) => void;
  jsonGrid?: any;
  targetComponentTypes?: string[];
}
