/**
 * @license
 * Industrial Wiring Verification Module Exports
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import { Tile, LogicLevelId } from '../types';
import {
  executeWiringVerification,
  getWiringLevelSpec,
  WIRING_LEVEL_SPECS,
  WiringVerificationResult,
  WiringStepResult,
  WiringLevelSpec,
} from './wiringDefinitions';

export {
  executeWiringVerification,
  getWiringLevelSpec,
  WIRING_LEVEL_SPECS,
};
export type {
  WiringVerificationResult,
  WiringStepResult,
  WiringLevelSpec,
};

/**
 * Verify industrial wiring circuit against level requirements
 */
export function verifyWiringCircuit(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: LogicLevelId
): { success: boolean; message: string; steps?: WiringStepResult[] } {
  const result = executeWiringVerification(grid, gridSize, levelId);
  return {
    success: result.allPassed,
    message: result.message,
    steps: result.steps,
  };
}
