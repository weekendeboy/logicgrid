/**
 * @license
 * Digital Logic Verification Engine (Combinational & Sequential)
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import { Tile } from '../types';
import { evaluateLiveTruthTable, getLogicTruthTableSpec } from './truthTableDefinitions';
import {
  executeSequentialTestbench,
  getSequentialSpec,
} from './sequentialDefinitions';

export {
  evaluateLiveTruthTable,
  getLogicTruthTableSpec,
  LOGIC_TRUTH_TABLE_SPECS,
} from './truthTableDefinitions';
export type {
  LevelTruthTableSpec,
  LiveTruthTableResult,
  LiveTruthTableRow,
} from './truthTableDefinitions';

export {
  executeSequentialTestbench,
  getSequentialSpec,
  SEQUENTIAL_SPECS,
} from './sequentialDefinitions';
export type {
  SequentialLevelSpec,
  SequentialStep,
  SequentialStepResult,
  SequentialExecutionResult,
} from './sequentialDefinitions';

export function verifyLogicCircuit(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): { success: boolean; message: string } {
  // 1. Sequential Logic Levels (Chapters 4 & 5)
  if (levelId.startsWith('4-') || levelId.startsWith('5-')) {
    const seqSpec = getSequentialSpec(levelId);
    if (!seqSpec) {
      return { success: false, message: '此關卡暫不支援時序驗證。' };
    }

    const seqResult = executeSequentialTestbench(grid, gridSize, levelId);
    if (!seqResult) {
      return { success: false, message: '無法讀取關卡時序測試規格。' };
    }

    return {
      success: seqResult.allPassed,
      message: seqResult.message,
    };
  }

  // 2. Combinational Logic Levels (Chapters 1, 2, 3)
  const spec = getLogicTruthTableSpec(levelId);
  if (!spec) {
    return { success: false, message: '此關卡暫不支援自動真值表驗證。' };
  }

  const result = evaluateLiveTruthTable(grid, gridSize, levelId);
  if (!result) {
    return { success: false, message: '無法讀取關卡真值表規格。' };
  }

  if (!result.isInputCountMatch || !result.isOutputCountMatch) {
    return {
      success: false,
      message:
        result.diagnosticMessage ||
        `需要 ${result.inputCount} 個開關與 ${result.outputCount} 個 LED。目前有 ${result.detectedInputsCount} 個開關與 ${result.detectedOutputsCount} 個 LED。`,
    };
  }

  if (result.allPassed) {
    return {
      success: true,
      message: `🎉 恭喜通關！真值表驗證全數通過 (${result.passedCount}/${result.totalRows})！`,
    };
  }

  return {
    success: false,
    message:
      result.diagnosticMessage ||
      `電路邏輯未完全吻合 (目前符合 ${result.passedCount}/${result.totalRows} 列)，請檢查接線。`,
  };
}
