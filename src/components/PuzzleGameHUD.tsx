/**
 * @license
 * PuzzleGameHUD Component for Auto Studio Pro
 * Floating draggable HUD and Victory Modal for Industrial Wiring Puzzle Quest mode:
 * - Real-time step counter & live star ranking preview
 * - Unlocked functional component banner
 * - One-click test simulation & circuit verification
 * - Level reset & return to map
 * - Victory modal with score calculation & next level jump
 */

import React, { useRef, useState, useEffect } from 'react';
import { Tile, LogicLevelId } from '../types';
import {
  PuzzleLevelDefinition,
  getPuzzleLevel as getWiringPuzzleLevel,
  countPlayerPlacedTiles as countWiringTiles,
  calculatePuzzleStars as calculateWiringStars,
  savePuzzleScore as saveWiringScore,
} from '../levels/wiringPuzzleLevels';
import {
  LogicPuzzleLevelDefinition,
  getLogicPuzzleLevel,
  countPlayerPlacedTiles as countLogicTiles,
  calculateLogicPuzzleStars,
  saveLogicPuzzleScore,
} from '../levels/logicPuzzleLevels';
import {
  Trophy,
  Zap,
  RotateCcw,
  List,
  CheckCircle2,
  XCircle,
  GripHorizontal,
  Minimize2,
  Maximize2,
  ArrowRight,
  Sparkles,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface PuzzleGameHUDProps {
  grid: (Tile | null)[][];
  gridSize: number;
  logicLevel: LogicLevelId;
  onLoadLogicLevel: (level: LogicLevelId) => void;
  onResetLevel: () => void;
  onShowAlert: (msg: string) => void;
}

export const PuzzleGameHUD: React.FC<PuzzleGameHUDProps> = ({
  grid,
  gridSize,
  logicLevel,
  onLoadLogicLevel,
  onResetLevel,
  onShowAlert,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const isLogic = logicLevel.startsWith('lp-');
  const level = isLogic ? getLogicPuzzleLevel(logicLevel) : getWiringPuzzleLevel(logicLevel);
  const countTiles = isLogic ? countLogicTiles : countWiringTiles;
  const menuLevelId: LogicLevelId = isLogic ? 'logic-puzzle-menu' : 'wiring-puzzle-menu';

  // Victory modal state
  const [victoryData, setVictoryData] = useState<{
    stars: number;
    score: number;
    steps: number;
    rankText: string;
    nextLevelId: LogicLevelId | null;
  } | null>(null);

  // Verification result toast inside HUD
  const [verifyResult, setVerifyResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  // Reset verification and victory when level changes
  useEffect(() => {
    setVictoryData(null);
    setVerifyResult(null);
  }, [logicLevel]);

  // Count player-placed tiles
  const placedSteps = level ? countTiles(grid, gridSize) : 0;

  // Star status preview
  let currentStars = 1;
  let starBadgeColor = 'text-amber-400';
  if (level) {
    if (placedSteps <= level.parSteps) {
      currentStars = 3;
      starBadgeColor = 'text-yellow-400';
    } else if (placedSteps <= level.twoStarSteps) {
      currentStars = 2;
      starBadgeColor = 'text-cyan-400';
    } else {
      currentStars = 1;
      starBadgeColor = 'text-slate-400';
    }
  }

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 360, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!level) return null;

  // Determine next level ID
  const prefix = isLogic ? 'lp' : 'wp';
  const tier = level.tier;
  const subIdx = parseInt(level.id.split('-')[2], 10);
  let nextLevelId: LogicLevelId | null = null;
  if (subIdx < 5) {
    nextLevelId = `${prefix}-${tier}-${subIdx + 1}` as LogicLevelId;
  } else if (tier < 5) {
    nextLevelId = `${prefix}-${tier + 1}-1` as LogicLevelId;
  }

  // Run Test Verification
  const handleRunTest = () => {
    const res = level.verify(grid, gridSize);
    setVerifyResult(res);

    if (res.passed) {
      const calc = isLogic
        ? calculateLogicPuzzleStars(level as LogicPuzzleLevelDefinition, placedSteps)
        : calculateWiringStars(level as PuzzleLevelDefinition, placedSteps);

      if (isLogic) {
        saveLogicPuzzleScore(level.id, placedSteps, calc.stars);
      } else {
        saveWiringScore(level.id, placedSteps, calc.stars);
      }

      setVictoryData({
        stars: calc.stars,
        score: calc.score,
        steps: placedSteps,
        rankText: calc.rankText,
        nextLevelId,
      });
      onShowAlert(res.message);
    } else {
      onShowAlert(res.message);
    }
  };

  return (
    <>
      {/* Draggable HUD Container */}
      <div
        ref={containerRef}
        style={{
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
        }}
        className={`fixed z-40 transition-shadow select-none shadow-2xl rounded-2xl border ${
          position ? '' : 'bottom-6 right-6'
        } bg-slate-900/95 backdrop-blur-md border-purple-500/50 shadow-[0_10px_35px_rgba(168,85,247,0.25)] min-w-[320px] max-w-[360px] text-slate-100`}
      >
        {/* Header / Drag Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 rounded-t-2xl border-b border-purple-500/30 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>{level.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title={isMinimized ? '展開面板' : '縮小面板'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isMinimized && (
          <div className="p-3.5 space-y-3 text-xs">
            {/* Mission Description */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
              {level.desc}
            </div>

            {/* Unlocked Component Tag */}
            <div className="flex items-center justify-between bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>本階解鎖元件</span>
              </div>
              <span className="font-bold text-yellow-300 text-[11px] bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30">
                {level.unlockedBadge}
              </span>
            </div>

            {/* Step Counter & Star Goals */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">已放置元件（步數）</span>
                <span className="text-xl font-mono font-black text-white">
                  {placedSteps} <span className="text-xs font-normal text-slate-400">步</span>
                </span>
              </div>

              {/* Star Thresholds Bar */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono text-[10px]">
                <div
                  className={`p-1 rounded-lg border transition-all ${
                    placedSteps <= level.parSteps
                      ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold">⭐⭐⭐</div>
                  <div>≤ {level.parSteps} 步</div>
                </div>

                <div
                  className={`p-1 rounded-lg border transition-all ${
                    placedSteps > level.parSteps && placedSteps <= level.twoStarSteps
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold">⭐⭐</div>
                  <div>≤ {level.twoStarSteps} 步</div>
                </div>

                <div
                  className={`p-1 rounded-lg border transition-all ${
                    placedSteps > level.twoStarSteps
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold">⭐</div>
                  <div>通關</div>
                </div>
              </div>
            </div>

            {/* Verification Status Toast if tested */}
            {verifyResult && (
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-tight flex items-start gap-2 ${
                  verifyResult.passed
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                {verifyResult.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{verifyResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleRunTest}
                className="col-span-2 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 text-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                <span>通電測試</span>
              </button>

              <button
                onClick={onResetLevel}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 text-xs"
                title="清除自己擺放的元件，重設盤面"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            </div>

            {/* Return to Map Button */}
            <button
              onClick={() => onLoadLogicLevel(menuLevelId)}
              className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-purple-300 flex items-center justify-center gap-1 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
              <span>返回解謎關卡地圖</span>
            </button>
          </div>
        )}
      </div>

      {/* Victory Celebration Modal */}
      {victoryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-yellow-500/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.4)] text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Big Trophy */}
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Trophy className="w-10 h-10 fill-slate-950/80" />
            </div>

            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 mb-1">
              挑戰成功！
            </h2>
            <div className="text-xs text-purple-300 font-semibold mb-4">{level.title}</div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 text-4xl mb-4">
              <span className={victoryData.stars >= 1 ? 'animate-bounce delay-100' : 'opacity-30'}>⭐</span>
              <span className={victoryData.stars >= 2 ? 'animate-bounce delay-200' : 'opacity-30'}>⭐</span>
              <span className={victoryData.stars >= 3 ? 'animate-bounce delay-300' : 'opacity-30'}>⭐</span>
            </div>

            {/* Rank Text */}
            <div className="text-sm font-bold text-yellow-300 mb-4 bg-yellow-950/40 border border-yellow-500/30 py-1.5 px-3 rounded-xl inline-block">
              {victoryData.rankText}
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs mb-6">
              <div className="text-left border-r border-slate-800 pr-2">
                <div className="text-slate-400 text-[11px]">使用步數</div>
                <div className="text-lg font-mono font-bold text-white">
                  {victoryData.steps} <span className="text-[10px] text-slate-400 font-normal">步 (三星目標: ≤{level.parSteps})</span>
                </div>
              </div>
              <div className="text-left pl-2">
                <div className="text-slate-400 text-[11px]">獲得得分</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  +{victoryData.score} <span className="text-[10px] text-slate-400 font-normal">分</span>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex flex-col gap-2">
              {victoryData.nextLevelId && (
                <button
                  onClick={() => {
                    onLoadLogicLevel(victoryData.nextLevelId!);
                    setVictoryData(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>前進下一關</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setVictoryData(null);
                    onResetLevel();
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all text-xs"
                >
                  重新挑戰更少步數
                </button>

                <button
                  onClick={() => {
                    setVictoryData(null);
                    onLoadLogicLevel(menuLevelId);
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all text-xs"
                >
                  返回關卡地圖
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
