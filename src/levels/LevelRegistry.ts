/**
 * @license
 * Unified Level Registry for Auto Studio Pro
 */

import { Tile, LogicLevelId } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';
import { tutorialLevels } from './tutorialLevels';
import { logicLevels, logicMenuCategories } from './logicLevels';
import { wiringLevels, wiringMenuCategories } from './wiringLevels';
import { wiringPuzzleLevels, wiringPuzzleCategories, PuzzleCategory } from './wiringPuzzleLevels';
import { logicPuzzleLevels, logicPuzzleCategories, LogicPuzzleCategory } from './logicPuzzleLevels';
import { classCLevels } from './classCLevels';
import { juniorHighLevels, juniorHighMenuCategories } from './juniorHighLevels';
import { seniorHighLevels, seniorHighMenuCategories } from './seniorHighLevels';

// Build fast lookup map
const allLevelsMap = new Map<string, LevelDefinition>();

[...tutorialLevels, ...logicLevels, ...logicPuzzleLevels, ...wiringLevels, ...wiringPuzzleLevels, ...classCLevels, ...juniorHighLevels, ...seniorHighLevels].forEach((level) => {
  allLevelsMap.set(level.id, level);
});

export const LevelRegistry = {
  /**
   * Get level definition by ID
   */
  getLevel(id: LogicLevelId): LevelDefinition | undefined {
    return allLevelsMap.get(id);
  },

  /**
   * Get recommended grid size for a given level
   */
  getDefaultGridSize(levelId: LogicLevelId): number {
    if (levelId === 'sandbox') return 60;
    if (levelId === 'class_c_u1_7' || levelId === 'class_c_u1_1' || levelId === 'class_c_u1_2' || levelId.startsWith('class_c_')) return 60;
    if (
      levelId === 'w-1-1' || levelId === 'w-1-2' || levelId === 'w-1-3' || levelId === 'w-1-4' || levelId === 'w-1-5' ||
      levelId === 'w-2-1' || levelId === 'w-2-2' || levelId === 'w-2-3' || levelId === 'w-2-4' || levelId === 'w-2-5' ||
      levelId === 'w-3-1' || levelId === 'w-3-2' || levelId === 'w-3-3' || levelId === 'w-3-4' ||
      levelId === 'w-4-1' || levelId === 'w-4-2' || levelId === 'w-4-3' || levelId === 'w-4-4' ||
      levelId === 'w-5-1' || levelId === 'w-5-2'
    ) return 10;
    if (levelId.startsWith('wp-') || levelId.startsWith('lp-')) return 10;
    if (levelId.startsWith('w-')) return 15;
    if (levelId.startsWith('5-')) return 20;
    if (levelId.startsWith('2-') || levelId.startsWith('3-') || levelId.startsWith('4-')) return 15;
    if (levelId.startsWith('jh-')) {
      if (levelId.startsWith('jh-4-') || levelId.startsWith('jh-5-')) return 12;
      return 10;
    }
    if (levelId.startsWith('sh-')) {
      return 12;
    }

    const def = allLevelsMap.get(levelId);
    return def?.defaultGridSize || 10;
  },

  /**
   * Apply level components onto the provided grid
   */
  applyLevelToGrid(levelId: LogicLevelId, grid: (Tile | null)[][], size: number): boolean {
    const levelDef = allLevelsMap.get(levelId);
    if (levelDef) {
      if (levelDef.setup) {
        levelDef.setup(grid, size);
        return true;
      }
      if (levelDef.initGrid) {
        levelDef.initGrid(grid, size);
        return true;
      }
    }

    // Fallback for undefined w-* levels
    if (levelId.startsWith('w-')) {
      if (grid.length > 5 && grid[0].length > 10) {
        const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
        const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
        grid[5][9] = mcb1; grid[5][10] = mcb2;
        return true;
      }
    }

    return false;
  },

  /**
   * Setup standard PLC ladder rails on the ladder grid
   */
  setupPlcLadderRails(ladderGrid: (Tile | null)[][], size: number): void {
    const lastLadderCol = size - 1;

    // Column 0: H at (0, 0), T-wires facing right below
    const tileH = new Tile('wire', 'h');
    tileH.rotation = 0;
    tileH.isLocked = true;
    ladderGrid[0][0] = tileH;

    for (let y = 1; y < size; y++) {
      const tileT = new Tile('wire', 't');
      tileT.rotation = 3;
      tileT.isLocked = true;
      ladderGrid[y][0] = tileT;
    }

    // Last column: G at (lastLadderCol, 0), T-wires facing left below
    const tileG = new Tile('wire', 'g');
    tileG.rotation = 0;
    tileG.isLocked = true;
    ladderGrid[0][lastLadderCol] = tileG;

    for (let y = 1; y < size; y++) {
      const tileT = new Tile('wire', 't');
      tileT.rotation = 1;
      tileT.isLocked = true;
      ladderGrid[y][lastLadderCol] = tileT;
    }
  },

  /**
   * Setup PLC rails on resize (supports split column for small sizes)
   */
  setupPlcResizeRails(grid: (Tile | null)[][], newSize: number): void {
    const splitCol = newSize <= 10 ? 5 : 10;
    const lastLadderCol = splitCol - 1;

    const tileH = new Tile('wire', 'h');
    tileH.rotation = 0;
    tileH.isLocked = true;
    grid[0][0] = tileH;

    for (let y = 1; y < newSize; y++) {
      const tileT = new Tile('wire', 't');
      tileT.rotation = 3;
      tileT.isLocked = true;
      grid[y][0] = tileT;
    }

    const tileG = new Tile('wire', 'g');
    tileG.rotation = 0;
    tileG.isLocked = true;
    grid[0][lastLadderCol] = tileG;

    for (let y = 1; y < newSize; y++) {
      const tileT = new Tile('wire', 't');
      tileT.rotation = 1;
      tileT.isLocked = true;
      grid[y][lastLadderCol] = tileT;
    }
  },

  /**
   * Retrieve metadata for banners / tutorial info
   */
  getLevelMetadata(levelId: LogicLevelId): { title: string; desc: string } | null {
    const def = allLevelsMap.get(levelId);
    if (!def) return null;
    return { title: def.title, desc: def.desc || def.description || '' };
  },

  /**
   * Menu categories
   */
  getLogicMenuCategories(): LevelMenuCategory[] {
    return logicMenuCategories;
  },

  getWiringMenuCategories(): LevelMenuCategory[] {
    return wiringMenuCategories;
  },

  getWiringPuzzleCategories(): PuzzleCategory[] {
    return wiringPuzzleCategories;
  },

  getLogicPuzzleCategories(): LogicPuzzleCategory[] {
    return logicPuzzleCategories;
  },

  getJuniorHighMenuCategories(): LevelMenuCategory[] {
    return juniorHighMenuCategories;
  },

  getSeniorHighMenuCategories(): LevelMenuCategory[] {
    return seniorHighMenuCategories;
  },
};
