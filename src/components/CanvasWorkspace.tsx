/**
 * @license
 * Auto Studio Pro - Canvas Workspace Component
 * Coordinates canvas rendering, interactive tools, simulation loop, and responsive HUD overlays.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  AppMode,
  ToolType,
  Tile,
  Faults,
  ClipboardData,
  Waypoint,
  LogicLevelId,
} from '../types';
import { Hand, Move, Square, Scissors, Copy, Trash2, X, Lock, Sparkles } from 'lucide-react';
import { LevelRegistry } from '../levels/LevelRegistry';
import { TileRenderer, CanvasOverlayRenderer } from '../rendering';
import { SimulationPipeline } from '../engine/SimulationPipeline';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { ElectronicStateHUD } from './ElectronicStateHUD';
import { LogicTruthTableWidget } from './LogicTruthTableWidget';
import { LogicTimingDiagramWidget } from './LogicTimingDiagramWidget';
import { WiringStateHUD } from './WiringStateHUD';
import { PuzzleGameHUD } from './PuzzleGameHUD';
import {
  getPuzzleScores,
  isPuzzleLevelUnlocked,
  isPuzzleAllUnlocked,
  setPuzzleAllUnlocked,
} from '../levels/wiringPuzzleLevels';
import {
  getLogicPuzzleScores,
  isLogicPuzzleLevelUnlocked,
  isLogicPuzzleAllUnlocked,
  setLogicPuzzleAllUnlocked,
} from '../levels/logicPuzzleLevels';

interface CanvasWorkspaceProps {
  currentMode: AppMode;
  plcSubTab?: 'wiring' | 'ladder';
  ladderGrid?: (Tile | null)[][];
  setLadderGrid?: React.Dispatch<React.SetStateAction<(Tile | null)[][]>>;
  currentTool: ToolType;
  gridSize: number;
  zoom: number;
  isDarkMode: boolean;
  grid: (Tile | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(Tile | null)[][]>>;
  faults: Faults;
  setFaults: React.Dispatch<React.SetStateAction<Faults>>;
  meterChannel: string;
  isFaultMode: boolean;
  subMode: 'sandbox' | 'debug';
  logicLevel: LogicLevelId;
  placementType: string;
  placementSubtype: string;
  placementRotation: number;
  autowireWaypoints: Waypoint[];
  setAutowireWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  clipboard: ClipboardData | null;
  onShowAlert: (msg: string) => void;
  onOpenModal: (t: Tile, mode: 'value' | 'color' | 'timer' | 'label', pos: { x: number; y: number }) => void;
  onUpdateMeterValues: (vals: { vVal: number; aVal: number; wVal: number; oscVal: number | null; channelOscVals?: Record<string, number> }) => void;
  onSaveState: () => void;
  selectionBounds?: { minX: number; maxX: number; minY: number; maxY: number } | null;
  onSelectionChange: (bounds: { minX: number; maxX: number; minY: number; maxY: number } | null) => void;
  onCutSelection?: () => void;
  onCopySelection?: () => void;
  onDeleteSelection?: () => void;
  onUndo: () => void;
  onSetTool: (tool: ToolType) => void;
  onLoadLogicLevel: (level: LogicLevelId) => void;
  onRotatePlacement: () => void;
}

const TILE_SIZE = 80;

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  currentMode,
  currentTool,
  gridSize,
  zoom,
  isDarkMode,
  grid,
  setGrid,
  faults,
  setFaults,
  meterChannel,
  isFaultMode,
  subMode,
  logicLevel,
  placementType,
  placementSubtype,
  placementRotation,
  autowireWaypoints,
  setAutowireWaypoints,
  clipboard,
  onShowAlert,
  onOpenModal,
  onUpdateMeterValues,
  onSaveState,
  selectionBounds,
  onSelectionChange,
  onCutSelection,
  onCopySelection,
  onDeleteSelection,
  onUndo,
  onSetTool,
  onLoadLogicLevel,
  onRotatePlacement,
  plcSubTab,
  ladderGrid,
  setLadderGrid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isLadder = currentMode === 'plc' && plcSubTab === 'ladder';
  const activeGrid = isLadder && ladderGrid ? ladderGrid : grid;
  const setActiveGrid = isLadder && setLadderGrid ? setLadderGrid : setGrid;

  const [airElecShortFlag, setAirElecShortFlag] = useState(false);
  const [winTriggered, setWinTriggered] = useState(false);

  useEffect(() => {
    setWinTriggered(false);
  }, [logicLevel]);

  // Reset puzzle level back to initial locked start/end/obstacles
  const handleResetPuzzleLevel = React.useCallback(() => {
    setActiveGrid(() => {
      const newGrid: (Tile | null)[][] = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(null));
      LevelRegistry.applyLevelToGrid(logicLevel, newGrid, gridSize);
      return newGrid;
    });
    onShowAlert('🔄 已重置盤面至初始起點與障礙物！');
  }, [gridSize, logicLevel, onShowAlert, setActiveGrid]);

  // Canvas interaction hook
  const {
    mousePosRaw,
    mousePos,
    hoverNode,
    multimeterProbes,
    quickPopup,
    shortSelectionNode,
    movingTiles,
    isSelecting,
    getPinAbs,
    getSelectionBounds,
    checkInterference,
    rotateTileGroup,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    handleContextMenu,
    toggleTileActive,
  } = useCanvasInteraction({
    canvasRef,
    gridSize,
    tileSize: TILE_SIZE,
    currentMode,
    currentTool,
    activeGrid,
    setActiveGrid,
    grid,
    faults,
    setFaults,
    clipboard,
    placementType,
    placementSubtype,
    placementRotation,
    autowireWaypoints,
    setAutowireWaypoints,
    onShowAlert,
    onOpenModal,
    onSaveState,
    selectionBounds,
    onSelectionChange,
    onUndo,
    onSetTool,
    onRotatePlacement,
  });

  // Main Render & Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Run simulation frame
      const { netMap, netData } = SimulationPipeline.executeFrame({
        currentMode,
        plcSubTab,
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
      });

      // 2. Clear canvas background
      ctx.fillStyle = isDarkMode ? '#020617' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. PLC Ladder Rails
      if (isLadder) {
        CanvasOverlayRenderer.drawPlcLadderRails(ctx, canvas.height, gridSize, TILE_SIZE);
      }

      // 4. Grid Lines
      CanvasOverlayRenderer.drawGridLines(ctx, gridSize, isDarkMode, TILE_SIZE);

      // 5. Render Tiles
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const t = activeGrid[y]?.[x];
          if (t) {
            const hideWireColors = currentMode === 'wiring' && subMode === 'debug';
            const localColors = [0, 1, 2, 3].map((d) => {
              const absDir = (d + t.rotation) % 4;
              const nid = netMap[y]?.[x]?.[absDir];
              if (hideWireColors) return '#4a5568';
              return nid > 0 ? netData[nid].color : '#4a5568';
            });
            TileRenderer.render(ctx, currentMode, x, y, t, localColors, activeGrid);
          }
        }
      }

      // 5.5 Animated Current Flow Particles along energized wires
      CanvasOverlayRenderer.drawCurrentFlowParticles(
        ctx,
        activeGrid,
        gridSize,
        netMap,
        netData,
        TILE_SIZE,
        currentMode
      );

      // 6. Component Labels
      CanvasOverlayRenderer.drawComponentLabels(ctx, activeGrid, gridSize, TILE_SIZE);

      // 7. Selection marquee
      if (isSelecting) {
        CanvasOverlayRenderer.drawSelectionBox(ctx, getSelectionBounds(), TILE_SIZE);
      } else if (selectionBounds) {
        CanvasOverlayRenderer.drawSelectionBox(ctx, selectionBounds, TILE_SIZE);
      }

      // 8. Clipboard Preview
      if (currentTool === 'paste' && clipboard) {
        CanvasOverlayRenderer.drawClipboardPreview(
          ctx,
          clipboard,
          mousePos,
          gridSize,
          currentMode,
          activeGrid,
          checkInterference(),
          TILE_SIZE
        );
      }

      // 9. Placement Ghost Preview
      CanvasOverlayRenderer.drawPlacementGhost(
        ctx,
        currentTool,
        placementType,
        placementSubtype,
        placementRotation,
        mousePos,
        gridSize,
        activeGrid,
        currentMode,
        TILE_SIZE
      );

      // 10. Move Ghost Preview
      if (currentTool === 'move' && movingTiles) {
        CanvasOverlayRenderer.drawMoveGhost(
          ctx,
          movingTiles,
          mousePos,
          gridSize,
          currentMode,
          activeGrid,
          TILE_SIZE
        );
      }

      // 11. Auto-wire preview
      if (currentTool === 'autowire') {
        CanvasOverlayRenderer.drawAutowirePreview(ctx, autowireWaypoints, mousePos, TILE_SIZE);
      }

      // 12. Fault Overlays
      CanvasOverlayRenderer.drawFaultOverlays(
        ctx,
        faults,
        isFaultMode,
        shortSelectionNode,
        mousePosRaw,
        getPinAbs
      );

      // 13. Multimeter Probes
      CanvasOverlayRenderer.drawMultimeterProbes(
        ctx,
        multimeterProbes,
        hoverNode,
        currentTool,
        getPinAbs
      );

      // 14. Win Condition Check (Logic Levels)
      if (currentMode === 'tutorial' && logicLevel && !winTriggered) {
        if (SimulationPipeline.checkTutorialWin(currentMode, logicLevel, activeGrid)) {
          setWinTriggered(true);
          setTimeout(() => {
            onShowAlert('🎉 恭喜通關！你已經掌握了這個接線技巧，請從左側選單進入下一關。');
          }, 300);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [
    grid,
    ladderGrid,
    plcSubTab,
    isLadder,
    activeGrid,
    gridSize,
    currentMode,
    currentTool,
    faults,
    meterChannel,
    subMode,
    logicLevel,
    isFaultMode,
    isSelecting,
    hoverNode,
    multimeterProbes,
    shortSelectionNode,
    clipboard,
    autowireWaypoints,
    mousePos,
    mousePosRaw,
    airElecShortFlag,
    winTriggered,
    getPinAbs,
    getSelectionBounds,
    checkInterference,
    onShowAlert,
    onUpdateMeterValues,
    placementType,
    placementSubtype,
    placementRotation,
    isDarkMode,
    movingTiles,
  ]);

  // Render tutorial details
  let tutorialTitle = '';
  let tutorialDesc = '';
  if (
    (currentMode === 'tutorial' ||
      currentMode === 'logic' ||
      currentMode === 'wiring' ||
      currentMode === 'electronic') &&
    logicLevel
  ) {
    const meta = LevelRegistry.getLevelMetadata(logicLevel);
    if (meta) {
      tutorialTitle = meta.title;
      tutorialDesc = meta.desc;
    }
  }

  return (
    <main className="flex-1 relative overflow-auto bg-slate-950 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] select-none min-w-0 min-h-0">
      {currentMode === 'electronic' && logicLevel === 'jh-menu' ? (
        <div className="w-full h-full flex flex-col items-center justify-start bg-slate-950 text-slate-100 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-8 pb-20">
            <div className="text-center border-b border-slate-800 pb-5">
              <h1 className="text-3xl font-extrabold text-amber-400 mb-2">
                國中理化 基本電學實驗教室
              </h1>
              <p className="text-sm text-slate-400">
                教育部 108 課綱國三理化電學篇：涵蓋電路三要素、歐姆定律、電壓電流、串並聯分析與家庭用電安全
              </p>
            </div>
            {LevelRegistry.getJuniorHighMenuCategories().map((category, idx) => (
              <div key={idx} className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-amber-400 mb-4 border-b border-slate-700/80 pb-2">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.levels.map((level) => (
                    <div
                      key={level.id}
                      className="group flex flex-col bg-slate-800/90 border border-slate-700 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      onClick={() => {
                        onLoadLogicLevel(level.id as LogicLevelId);
                      }}
                    >
                      <div className="text-lg font-bold text-slate-200 mb-1.5 group-hover:text-amber-400">
                        {level.title}
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">
                        {level.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentMode === 'electronic' && logicLevel === 'sh-menu' ? (
        <div className="w-full h-full flex flex-col items-center justify-start bg-slate-950 text-slate-100 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-8 pb-20">
            <div className="text-center border-b border-slate-800 pb-5">
              <h1 className="text-3xl font-extrabold text-indigo-400 mb-2">
                高中物理 進階電學實驗室
              </h1>
              <p className="text-sm text-slate-400">
                教育部 108 課綱高中選修物理電學篇：涵蓋真實電源 (ℰ, r, V)、最大功率阻抗匹配、電錶改裝、二極體單向導電、電感 RL 暫態與 RLC 諧振
              </p>
            </div>
            {LevelRegistry.getSeniorHighMenuCategories().map((category, idx) => (
              <div key={idx} className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-indigo-400 mb-4 border-b border-slate-700/80 pb-2">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.levels.map((level) => (
                    <div
                      key={level.id}
                      className="group flex flex-col bg-slate-800/90 border border-slate-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                      onClick={() => {
                        onLoadLogicLevel(level.id as LogicLevelId);
                      }}
                    >
                      <div className="text-lg font-bold text-slate-200 mb-1.5 group-hover:text-indigo-400">
                        {level.title}
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">
                        {level.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentMode === 'wiring' && logicLevel === 'wiring-menu' ? (
        <div className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-6 pb-20">
            {LevelRegistry.getWiringMenuCategories().map((category, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-amber-400 border-b border-slate-700 pb-3 mb-4">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.levels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => onLoadLogicLevel(level.id as LogicLevelId)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-md group"
                    >
                      <h3 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300 mb-2">
                        {level.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {level.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentMode === 'wiring' && logicLevel === 'wiring-puzzle-menu' ? (
        <div className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-6 pb-20">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                  <span>Industrial Wiring Puzzle Quest</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300">
                  棋盤闖關解謎大挑戰
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  固定起點與終點，避開障礙物並安全導通！每五關解鎖一個新功能元件，使用步數越少、星級與分數越高！
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !isPuzzleAllUnlocked();
                    setPuzzleAllUnlocked(next);
                    onShowAlert(next ? '🔓 已啟用關卡全開快速測試模式！' : '🔒 已恢復循序闖關解鎖模式！');
                    setGrid((prev) => [...prev]);
                  }}
                  className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
                  title="切換解鎖所有關卡供快速調試或預覽"
                >
                  <Lock size={12} className={isPuzzleAllUnlocked() ? "text-emerald-400" : "text-amber-400"} />
                  <span>{isPuzzleAllUnlocked() ? '恢復循序解鎖' : '解鎖全關卡 (測試)'}</span>
                </button>
                <button
                  onClick={() => onLoadLogicLevel('wiring-menu')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  返回教學關卡
                </button>
              </div>
            </div>

            {/* 5 Tiers Categories */}
            {LevelRegistry.getWiringPuzzleCategories().map((cat) => {
              const scores = getPuzzleScores();
              return (
                <div key={cat.tier} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                        <span>{cat.title}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-xl text-xs font-bold text-purple-300">
                      <span>💡 解鎖元件：</span>
                      <span className="text-yellow-300">{cat.unlockedComponent}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {cat.levels.map((lvl) => {
                      const record = scores[lvl.id];
                      const isUnlocked = isPuzzleLevelUnlocked(lvl.id);
                      return (
                        <div
                          key={lvl.id}
                          onClick={() => {
                            if (!isUnlocked) {
                              onShowAlert('🔒 此關卡尚未解鎖！需先通關前置關卡才能開啟挑戰。');
                              return;
                            }
                            onLoadLogicLevel(lvl.id as LogicLevelId);
                          }}
                          className={`${
                            isUnlocked
                              ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-purple-400 cursor-pointer hover:scale-[1.03] active:scale-95 shadow-md'
                              : 'bg-slate-900/60 border-slate-800/80 opacity-45 cursor-not-allowed select-none'
                          } border rounded-xl p-3 transition-all flex flex-col justify-between group`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span className="bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                                {lvl.id.toUpperCase()}
                              </span>
                              <span>
                                {!isUnlocked ? (
                                  <span className="flex items-center gap-0.5 text-slate-500 font-bold">
                                    <Lock size={10} /> 未到達
                                  </span>
                                ) : record ? (
                                  '⭐'.repeat(record.stars)
                                ) : (
                                  <span className="text-yellow-400 font-bold">🌟 新開放</span>
                                )}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                              {lvl.title.replace(/^關卡 \d+-\d+：/, '')}
                            </h3>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                              {lvl.desc.replace(/^任務：/, '')}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-yellow-400 font-bold">
                              ⭐⭐⭐ ≤{lvl.parSteps}步
                            </span>
                            {record && (
                              <span className="text-emerald-400 font-bold">
                                最佳: {record.steps}步
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : currentMode === 'logic' && logicLevel === 'logic-puzzle-menu' ? (
        <div className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-6 pb-20">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                  <span>Digital Logic Puzzle Quest</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300">
                  數位邏輯棋盤解謎大挑戰
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  固定起點輸入開關與目標輸出 LED，依序解鎖 NOT、AND/OR、NAND/NOR/XOR、正反器！使用的步數越少、星級與分數越高！
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !isLogicPuzzleAllUnlocked();
                    setLogicPuzzleAllUnlocked(next);
                    onShowAlert(next ? '🔓 已啟用數位邏輯關卡全開快速測試模式！' : '🔒 已恢復循序闖關解鎖模式！');
                    setGrid((prev) => [...prev]);
                  }}
                  className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
                  title="切換解鎖所有關卡供快速調試或預覽"
                >
                  <Lock size={12} className={isLogicPuzzleAllUnlocked() ? "text-emerald-400" : "text-amber-400"} />
                  <span>{isLogicPuzzleAllUnlocked() ? '恢復循序解鎖' : '解鎖全關卡 (測試)'}</span>
                </button>
                <button
                  onClick={() => onLoadLogicLevel('tutorial-menu')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  返回教學關卡
                </button>
              </div>
            </div>

            {/* 5 Tiers Categories */}
            {LevelRegistry.getLogicPuzzleCategories().map((cat) => {
              const scores = getLogicPuzzleScores();
              return (
                <div key={cat.tier} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                        <span>{cat.title}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-xl text-xs font-bold text-purple-300">
                      <span>💡 解鎖元件：</span>
                      <span className="text-yellow-300">{cat.unlockedComponent}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {cat.levels.map((lvl) => {
                      const record = scores[lvl.id];
                      const isUnlocked = isLogicPuzzleLevelUnlocked(lvl.id);
                      return (
                        <div
                          key={lvl.id}
                          onClick={() => {
                            if (!isUnlocked) {
                              onShowAlert('🔒 此關卡尚未解鎖！需先通關前置關卡才能開啟挑戰。');
                              return;
                            }
                            onLoadLogicLevel(lvl.id as LogicLevelId);
                          }}
                          className={`${
                            isUnlocked
                              ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-purple-400 cursor-pointer hover:scale-[1.03] active:scale-95 shadow-md'
                              : 'bg-slate-900/60 border-slate-800/80 opacity-45 cursor-not-allowed select-none'
                          } border rounded-xl p-3 transition-all flex flex-col justify-between group`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span className="bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                                {lvl.id.toUpperCase()}
                              </span>
                              <span>
                                {!isUnlocked ? (
                                  <span className="flex items-center gap-0.5 text-slate-500 font-bold">
                                    <Lock size={10} /> 未到達
                                  </span>
                                ) : record ? (
                                  '⭐'.repeat(record.stars)
                                ) : (
                                  <span className="text-yellow-400 font-bold">🌟 新開放</span>
                                )}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                              {lvl.title.replace(/^關卡 \d+-\d+：/, '')}
                            </h3>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                              {lvl.desc.replace(/^任務：/, '')}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-yellow-400 font-bold">
                              ⭐⭐⭐ ≤{lvl.parSteps}步
                            </span>
                            {record && (
                              <span className="text-emerald-400 font-bold">
                                最佳: {record.steps}步
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : currentMode === 'logic' && logicLevel === 'tutorial-menu' ? (
        <div className="w-full h-full flex flex-col items-center justify-start bg-slate-950 text-slate-100 p-8 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-10 pb-20">
            {LevelRegistry.getLogicMenuCategories().map((category, idx) => (
              <div key={idx} className="w-full">
                <h1 className="text-2xl font-bold text-amber-400 mb-6 border-b-2 border-slate-700 pb-2">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {category.levels.map((level) => (
                    <div
                      key={level.id}
                      className="group flex flex-col bg-slate-800 border-2 border-slate-700 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      onClick={() => {
                        onLoadLogicLevel(level.id as LogicLevelId);
                      }}
                    >
                      <div className="text-lg font-bold text-slate-200 mb-2 group-hover:text-amber-400">
                        {level.title}
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">
                        {level.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-w-full min-h-full w-max h-max flex items-center justify-center p-8 relative">
          {/* Tutorial Banner (Only for 0-1 ~ 0-4 basic introductory tutorials) */}
          {currentMode === 'tutorial' &&
            logicLevel &&
            logicLevel !== 'sandbox' &&
            logicLevel !== 'wiring-menu' &&
            logicLevel !== 'wiring-puzzle-menu' &&
            !logicLevel.startsWith('wp-') &&
            logicLevel !== 'logic-puzzle-menu' &&
            !logicLevel.startsWith('lp-') &&
            logicLevel !== 'tutorial-menu' &&
            logicLevel !== 'jh-menu' &&
            logicLevel !== 'sh-menu' && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border-2 border-yellow-500 text-white px-6 py-3.5 rounded-xl shadow-2xl z-20 text-center min-w-[320px]">
                <h2 className="text-base font-bold text-yellow-400 mb-0.5">{tutorialTitle}</h2>
                <p className="text-xs text-slate-300 mb-1">{tutorialDesc}</p>
              </div>
            )}

          {/* Basic Electricity Real-Time State & Verification HUD Widget */}
          {currentMode === 'electronic' && (
            <ElectronicStateHUD
              grid={activeGrid}
              gridSize={gridSize}
              logicLevel={logicLevel}
              onShowAlert={onShowAlert}
              onVerifySuccess={(msg) => {
                onShowAlert(msg);
                if (!winTriggered) {
                  setWinTriggered(true);
                }
              }}
            />
          )}

          {/* Digital Logic Real-Time Truth Table HUD Widget */}
          {currentMode === 'logic' && !logicLevel.startsWith('lp-') && (
            <LogicTruthTableWidget
              grid={activeGrid}
              gridSize={gridSize}
              logicLevel={logicLevel}
              onShowAlert={onShowAlert}
              onVerifySuccess={(msg) => {
                onShowAlert(msg);
                if (!winTriggered) {
                  setWinTriggered(true);
                }
              }}
            />
          )}

          {/* Digital Logic Real-Time Timing Diagram / Logic Analyzer HUD Widget */}
          {currentMode === 'logic' && !logicLevel.startsWith('lp-') && (
            <LogicTimingDiagramWidget
              grid={activeGrid}
              gridSize={gridSize}
              logicLevel={logicLevel}
              onShowAlert={onShowAlert}
              onVerifySuccess={(msg) => {
                onShowAlert(msg);
                if (!winTriggered) {
                  setWinTriggered(true);
                }
              }}
            />
          )}

          {/* Industrial Wiring Real-Time State & Verification HUD Widget */}
          {currentMode === 'wiring' && !logicLevel.startsWith('wp-') && (
            <WiringStateHUD
              grid={activeGrid}
              gridSize={gridSize}
              logicLevel={logicLevel}
              onToggleTileActive={toggleTileActive}
              onVerifySuccess={(msg) => {
                onShowAlert(msg);
                if (!winTriggered) {
                  setWinTriggered(true);
                }
              }}
            />
          )}

          {/* Industrial Wiring & Digital Logic Puzzle Game HUD Widget */}
          {((currentMode === 'wiring' && logicLevel.startsWith('wp-')) ||
            (currentMode === 'logic' && logicLevel.startsWith('lp-'))) && (
            <PuzzleGameHUD
              grid={activeGrid}
              gridSize={gridSize}
              logicLevel={logicLevel}
              onLoadLogicLevel={onLoadLogicLevel}
              onResetLevel={handleResetPuzzleLevel}
              onShowAlert={onShowAlert}
            />
          )}

          {/* Floating Selection Action HUD Bar */}
          {selectionBounds && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-indigo-500 shadow-[0_10px_30px_rgba(99,102,241,0.4)] select-none">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mr-1 border-r border-slate-700 pr-3">
                <Square size={16} className="text-pink-400 fill-pink-500/20" />
                <span>
                  已框選 ({selectionBounds.maxX - selectionBounds.minX + 1}×{selectionBounds.maxY - selectionBounds.minY + 1})
                </span>
              </div>
              {onCutSelection && (
                <button
                  onClick={onCutSelection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
                  title="剪下選取區 (Ctrl+X)"
                >
                  <Scissors size={14} />
                  <span>剪下</span>
                </button>
              )}
              {onCopySelection && (
                <button
                  onClick={onCopySelection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
                  title="複製選取區 (Ctrl+C)"
                >
                  <Copy size={14} />
                  <span>複製</span>
                </button>
              )}
              {onDeleteSelection && (
                <button
                  onClick={onDeleteSelection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
                  title="刪除選取區 (Delete)"
                >
                  <Trash2 size={14} />
                  <span>刪除</span>
                </button>
              )}
              <button
                onClick={() => onSelectionChange(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors ml-1"
                title="取消選取 (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Quick Probe Result Popup */}
          {quickPopup.show && (
            <div
              className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 px-10 py-6 rounded-2xl font-bold z-[100] text-center border-4 backdrop-blur-md transition-all duration-200 pointer-events-none shadow-2xl ${
                quickPopup.isClosed
                  ? 'border-emerald-500 text-emerald-400 shadow-emerald-500/30'
                  : 'border-rose-500 text-rose-500 shadow-rose-500/30'
              }`}
            >
              <div className="text-5xl mb-2">{quickPopup.isClosed ? '🟢' : '🔴'}</div>
              <div className="text-3xl">
                {quickPopup.isClosed ? '通路 (0.00 Ω)' : '斷路 (O.L)'}
              </div>
            </div>
          )}

          {/* Mobile Tool Switcher */}
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 xl:hidden z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md p-2 rounded-full border border-slate-700 shadow-2xl">
            <button
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                currentTool === 'interact'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              onClick={() => onSetTool('interact')}
              title="互動 (Interact)"
            >
              <Hand size={24} />
            </button>
            <button
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                currentTool === 'move'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              onClick={() => onSetTool('move')}
              title="平移 (Move)"
            >
              <Move size={24} />
            </button>
            <button
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                currentTool === 'select'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              onClick={() => onSetTool('select')}
              title="框選 (Select)"
            >
              <Square size={24} />
            </button>
          </div>

          {/* Mobile/Tablet Floating Rotate Button */}
          <button
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 xl:hidden z-50 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.6)] border-2 border-blue-400 active:scale-95 transition-transform backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              if (currentTool === 'place') {
                onRotatePlacement();
              } else {
                rotateTileGroup(mousePos.x, mousePos.y);
              }
            }}
            title="旋轉元件 (Rotate)"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <canvas
            ref={canvasRef}
            width={gridSize * TILE_SIZE}
            height={gridSize * TILE_SIZE}
            style={{
              width: `${gridSize * TILE_SIZE * zoom}px`,
              height: `${gridSize * TILE_SIZE * zoom}px`,
              cursor: currentTool === 'interact' ? 'default' : 'crosshair',
              touchAction: 'none',
            }}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onContextMenu={handleContextMenu}
            className="block bg-slate-950 transform-origin-top-left"
          />
        </div>
      )}
    </main>
  );
};
