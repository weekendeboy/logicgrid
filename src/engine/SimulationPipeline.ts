/**
 * @license
 * Auto Studio Pro - Simulation Pipeline Engine
 * Orchestrates NetEngine, ElectronicEngine, LogicEngine, and WiringEngine evaluations.
 */

import { AppMode, Tile, Faults, LogicLevelId } from '../types';
import { buildNetState } from './NetEngine';
import { ElectronicEngine } from './ElectronicEngine';
import { LogicEngine } from './LogicEngine';
import { WiringEngine } from './WiringEngine';

export interface SimulationFrameParams {
  currentMode: AppMode;
  plcSubTab?: 'wiring' | 'ladder';
  isLadder: boolean;
  activeGrid: (Tile | null)[][];
  grid: (Tile | null)[][];
  ladderGrid?: (Tile | null)[][];
  gridSize: number;
  meterChannel: string;
  faults: Faults;
  airElecShortFlag: boolean;
  setAirElecShortFlag: (val: boolean) => void;
  onShowAlert: (msg: string) => void;
  onUpdateMeterValues: (vals: { vVal: number; aVal: number; wVal: number; oscVal: number | null; channelOscVals?: Record<string, number> }) => void;
}

export interface SimulationFrameResult {
  netMap: number[][][];
  netData: { color: string; isHigh: boolean }[];
  evalGrid: (Tile | null)[][];
}

export const SimulationPipeline = {
  /**
   * Executes a single evaluation frame across the electrical/logic/mechanical simulation engines.
   */
  executeFrame(params: SimulationFrameParams): SimulationFrameResult {
    const {
      currentMode,
      isLadder,
      activeGrid,
      grid,
      ladderGrid,
      gridSize,
      meterChannel,
      faults,
      airElecShortFlag,
      setAirElecShortFlag,
      onShowAlert,
      onUpdateMeterValues,
    } = params;

    const engineMode = currentMode === 'plc' ? 'wiring' : currentMode;
    let evalGrid = activeGrid;
    let evalW = activeGrid[0]?.length || gridSize;
    const evalH = activeGrid.length || gridSize;

    if (currentMode === 'plc' && ladderGrid) {
      const lw = ladderGrid[0]?.length || 60;
      const ww = grid[0]?.length || 60;
      const maxH = Math.max(ladderGrid.length, grid.length);

      evalGrid = Array(maxH)
        .fill(null)
        .map((_, y) => {
          const lRow = ladderGrid[y] || Array(lw).fill(null);
          const wRow = grid[y] || Array(ww).fill(null);
          return [...lRow, ...wRow];
        });
      evalW = lw + ww;
    }

    const { netMap: evalNetMap, netCount } = buildNetState(
      evalGrid,
      evalW,
      evalH,
      engineMode,
      faults
    );

    const evalNetData = Array(netCount + 1)
      .fill(0)
      .map(() => ({ color: '#4a5568', isHigh: false }));

    if (engineMode === 'electronic') {
      const meterVals = ElectronicEngine.simulate(
        evalGrid,
        evalNetMap,
        evalNetData,
        meterChannel
      );
      onUpdateMeterValues(meterVals);
    } else if (engineMode === 'logic' || engineMode === 'tutorial') {
      LogicEngine.simulate(evalGrid, evalNetMap, evalNetData);
    } else if (engineMode === 'wiring') {
      WiringEngine.simulate(
        evalGrid,
        evalNetMap,
        evalNetData,
        onShowAlert,
        airElecShortFlag,
        setAirElecShortFlag
      );
    }

    let netMap = evalNetMap;
    let netData = evalNetData;
    if (currentMode === 'plc' && ladderGrid) {
      const lw = ladderGrid[0]?.length || 60;
      if (isLadder) {
        netMap = evalNetMap.map((row) => row.slice(0, lw));
      } else {
        netMap = evalNetMap.map((row) => row.slice(lw));
      }
    }

    return { netMap, netData, evalGrid };
  },

  /**
   * Checks win condition for tutorial levels.
   */
  checkTutorialWin(
    currentMode: AppMode,
    logicLevel: LogicLevelId,
    activeGrid: (Tile | null)[][]
  ): boolean {
    if (currentMode !== 'tutorial' || !logicLevel) return false;

    if (logicLevel === '0-1') {
      return !!(activeGrid[5]?.[4] && activeGrid[5][4]!.isPowered);
    } else if (logicLevel === '0-2') {
      return !!(activeGrid[4]?.[5] && activeGrid[4][5]!.isPowered);
    } else if (logicLevel === '0-3') {
      return !!(activeGrid[3]?.[4]?.isPowered && activeGrid[5]?.[4]?.isPowered);
    } else if (logicLevel === '0-4') {
      const bridge = activeGrid[4]?.[4];
      const isBridge = bridge && bridge.type === 'wire' && bridge.subtype === 'bridge';
      return !!(activeGrid[4]?.[6]?.isPowered && activeGrid[6]?.[4]?.isPowered && isBridge);
    }

    return false;
  },
};
