/**
 * @license
 * LogicTruthTableWidget Component for Auto Studio Pro
 * Interactive real-time Digital Logic Truth Table HUD with:
 * - Live row tracking (highlights the exact row matching canvas switch inputs in real time)
 * - Continuous evaluation of user circuit against expected truth table rows
 * - Instant visual pass/fail indicators (✓ / ✗) for each input combination
 * - Draggable and minimizable floating HUD
 * - One-click completion verification button when all rows match
 */

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Tile, LogicLevelId } from '../types';
import {
  TableProperties,
  Minimize2,
  Maximize2,
  GripHorizontal,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import {
  evaluateLiveTruthTable,
  getLogicTruthTableSpec,
  LiveTruthTableResult,
} from '../engine/truthTableDefinitions';
import { LevelRegistry } from '../levels/LevelRegistry';

interface LogicTruthTableWidgetProps {
  grid: (Tile | null)[][];
  gridSize: number;
  logicLevel: LogicLevelId;
  onVerifySuccess: (message: string) => void;
  onShowAlert?: (message: string) => void;
}

export const LogicTruthTableWidget: React.FC<LogicTruthTableWidgetProps> = ({
  grid,
  gridSize,
  logicLevel,
  onVerifySuccess,
  onShowAlert,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Check if current level has a truth table specification
  const spec = useMemo(() => getLogicTruthTableSpec(logicLevel), [logicLevel]);
  const levelMeta = useMemo(() => LevelRegistry.getLevelMetadata(logicLevel), [logicLevel]);
  const [showHintCard, setShowHintCard] = useState<boolean>(true);

  // Compute live truth table result on grid or level change
  const liveResult: LiveTruthTableResult | null = useMemo(() => {
    if (!spec) return null;
    return evaluateLiveTruthTable(grid, gridSize, logicLevel);
  }, [grid, gridSize, logicLevel, spec]);

  // Reset hint when level changes
  useEffect(() => {
    setShowHintCard(true);
  }, [logicLevel]);

  // Dragging handlers for floating HUD
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 380, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(65, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!spec || !liveResult) {
    return null;
  }

  const {
    rows,
    inputNames,
    outputNames,
    passedCount,
    totalRows,
    allPassed,
    isInputCountMatch,
    isOutputCountMatch,
    diagnosticMessage,
  } = liveResult;

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
          right: position ? undefined : '24px',
          bottom: position ? undefined : '90px',
        }}
        className={`z-40 flex items-center gap-2.5 px-4 py-2 rounded-full border-2 backdrop-blur-md shadow-2xl cursor-pointer transition-all select-none ${
          allPassed
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-900/40 hover:bg-emerald-900/90'
            : 'bg-slate-900/90 border-amber-500/60 text-slate-200 shadow-black/50 hover:bg-slate-800/90'
        }`}
        onClick={() => setIsMinimized(false)}
        title="點擊展開即時真值表 HUD"
      >
        <TableProperties className={`w-4 h-4 ${allPassed ? 'text-emerald-400' : 'text-amber-400'}`} />
        <span className="text-xs font-bold font-mono">
          真值表 ({passedCount}/{totalRows} ✓)
        </span>
        {allPassed && <span className="text-xs">🎉</span>}
        <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-white ml-1" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        right: position ? undefined : '24px',
        bottom: position ? undefined : '90px',
      }}
      className={`z-40 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border-2 backdrop-blur-xl shadow-2xl select-none flex flex-col overflow-hidden transition-colors ${
        allPassed
          ? 'bg-slate-950/95 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
          : 'bg-slate-950/95 border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Draggable Header Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`px-3.5 py-2.5 border-b flex items-center justify-between cursor-move transition-colors ${
          allPassed
            ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
            : 'bg-slate-900/90 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <TableProperties className={`w-4 h-4 ${allPassed ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-bold tracking-wide truncate max-w-[170px]" title={spec.title}>
            {spec.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Real-time Pass Status Badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
              allPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                : passedCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {allPassed ? '全數符合 🎉' : `${passedCount}/${totalRows} 符合`}
          </div>

          {/* Hint Toggle Button */}
          <button
            onClick={() => setShowHint((prev) => !prev)}
            className={`p-1 rounded-md transition-colors ${
              showHint
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
            title="查看解題提示"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="最小化"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Level Mission & Hint Card (Integrated from bottom banner) */}
      <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 space-y-2">
        {/* Top row: Title, Chapter Badge, and Hint Collapse Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono font-bold text-xs text-cyan-300 truncate">
              {levelMeta?.title || spec.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60">
              數位邏輯
            </span>
            <button
              onClick={() => setShowHintCard(!showHintCard)}
              className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title={showHintCard ? '收合關卡說明' : '展開關卡說明'}
            >
              {showHintCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Mission Content & Hints */}
        {showHintCard && (
          <div className="space-y-2 pt-0.5">
            {/* Level Goal Description */}
            <div className="text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] font-semibold mb-0.5 flex items-center gap-1">
                <span>📌</span>
                <span>關卡任務與目標</span>
              </div>
              <div>{levelMeta?.desc || spec.description}</div>
            </div>

            {/* Logical Hint */}
            {spec.hint && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold text-amber-300">💡 邏輯指引：</span>
                  <span>{spec.hint}</span>
                </div>
              </div>
            )}

            {/* One-Click Verification Button */}
            <button
              onClick={() => {
                if (allPassed) {
                  onVerifySuccess(`🎉 恭喜通關！真值表驗證全數通過 (${passedCount}/${totalRows})！`);
                } else {
                  onShowAlert?.(
                    diagnosticMessage ||
                      `⚠️ 真值表尚未完全吻合 (目前符合 ${passedCount}/${totalRows} 列)，請檢查電路接線與邏輯閘！`
                  );
                }
              }}
              className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                allPassed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>📊 驗證電路 (真值表 Check)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Truth Table View */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* Warning if pin count does not match */}
        {(!isInputCountMatch || !isOutputCountMatch) && (
          <div className="mb-2.5 px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-700/50 text-[11px] text-rose-300 leading-tight">
            ⚠️ {diagnosticMessage}
          </div>
        )}

        {/* Scrollable Table Container */}
        <div className="max-h-[260px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 shadow-inner">
          <table className="w-full text-center text-xs border-collapse">
            {/* Table Header */}
            <thead className="sticky top-0 bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800 shadow-sm z-10">
              <tr>
                {/* Inputs Columns */}
                {inputNames.map((name, i) => (
                  <th key={`in-${i}`} className="py-2 px-1 text-cyan-400 border-r border-slate-800/80">
                    {name}
                  </th>
                ))}

                {/* Expected Outputs Columns */}
                {outputNames.map((name, i) => (
                  <th key={`exp-${i}`} className="py-2 px-1 text-indigo-300 border-r border-slate-800/80">
                    預期 {name}
                  </th>
                ))}

                {/* Circuit Actual Output Column */}
                <th className="py-2 px-1 text-slate-300 border-r border-slate-800/80">
                  實測
                </th>

                {/* Match Status Column */}
                <th className="py-2 px-1 text-slate-300 w-12">
                  狀態
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rows.map((row, rIdx) => {
                const isCurrent = row.isCurrent;
                const isPass = row.pass;

                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors relative ${
                      isCurrent
                        ? 'bg-amber-500/15 font-bold shadow-[inset_0_0_10px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50'
                        : rIdx % 2 === 0
                        ? 'bg-slate-900/20'
                        : 'bg-transparent'
                    } hover:bg-slate-800/40`}
                  >
                    {/* Input Values */}
                    {row.inputs.map((val, i) => (
                      <td
                        key={`in-val-${i}`}
                        className={`py-1.5 px-1 border-r border-slate-800/50 ${
                          val ? 'text-amber-300 font-bold' : 'text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isCurrent && i === 0 && (
                            <Activity className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                          )}
                          <span>{val ? '1' : '0'}</span>
                        </div>
                      </td>
                    ))}

                    {/* Expected Outputs */}
                    {row.expected.map((val, i) => (
                      <td
                        key={`exp-val-${i}`}
                        className={`py-1.5 px-1 border-r border-slate-800/50 ${
                          val ? 'text-indigo-300 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {val ? '1' : '0'}
                      </td>
                    ))}

                    {/* Actual Outputs from Circuit */}
                    <td className="py-1.5 px-1 border-r border-slate-800/50">
                      {row.actual ? (
                        <span
                          className={
                            isPass
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400 font-bold'
                          }
                        >
                          {row.actual.map((v) => (v ? '1' : '0')).join(',')}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Verification Result */}
                    <td className="py-1.5 px-1">
                      <div className="flex items-center justify-center">
                        {isPass ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500/80" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Active Row Feedback Footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              當前輸入：
              {liveResult.activeInputValues && liveResult.activeInputValues.length > 0
                ? liveResult.activeInputValues.map((v, i) => `${inputNames[i] || `SW${i}`}=${v ? 1 : 0}`).join(' ')
                : '無訊號'}
            </span>
          </div>

          <div className="text-slate-500 text-[10px]">
            {allPassed ? (
              <span className="text-emerald-400 font-bold">100% 達成</span>
            ) : (
              <span>剩餘 {totalRows - passedCount} 列</span>
            )}
          </div>
        </div>

        {/* Action Button: One-click Level Completion when verified */}
        {allPassed && (
          <div className="mt-2.5">
            <button
              onClick={() => {
                onVerifySuccess(`🎉 恭喜通關！真值表驗證全數通過 (${passedCount}/${totalRows})！`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>真值表全數吻合！點擊完成通關</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
