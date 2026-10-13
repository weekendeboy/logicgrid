/**
 * @license
 * LogicTimingDiagramWidget Component for Auto Studio Pro
 * Interactive real-time Digital Logic Analyzer & Timing Diagram HUD for Sequential Logic (Chapters 4 & 5):
 * - Multi-track digital square wave timing diagram (CLK, Data In, Output Q, Q')
 * - Real-time signal tracking synchronized with physical canvas switch & clock interactions
 * - Automated sequential testbench execution runner with step-by-step state verification
 * - Draggable and minimizable floating HUD
 */

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Tile, LogicLevelId } from '../types';
import {
  Activity,
  Minimize2,
  Maximize2,
  GripHorizontal,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Play,
  RotateCcw,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import {
  getSequentialSpec,
  executeSequentialTestbench,
  SequentialExecutionResult,
} from '../engine/sequentialDefinitions';
import { LevelRegistry } from '../levels/LevelRegistry';

interface LogicTimingDiagramWidgetProps {
  grid: (Tile | null)[][];
  gridSize: number;
  logicLevel: LogicLevelId;
  onVerifySuccess: (message: string) => void;
  onShowAlert?: (message: string) => void;
}

export const LogicTimingDiagramWidget: React.FC<LogicTimingDiagramWidgetProps> = ({
  grid,
  gridSize,
  logicLevel,
  onVerifySuccess,
  onShowAlert,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'waveform' | 'testbench'>('waveform');
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Sequential Level Specification and Metadata
  const spec = useMemo(() => getSequentialSpec(logicLevel), [logicLevel]);
  const levelMeta = useMemo(() => LevelRegistry.getLevelMetadata(logicLevel), [logicLevel]);
  const [showHintCard, setShowHintCard] = useState<boolean>(true);

  // Execute sequential testbench
  const testbenchResult: SequentialExecutionResult | null = useMemo(() => {
    if (!spec) return null;
    return executeSequentialTestbench(grid, gridSize, logicLevel);
  }, [grid, gridSize, logicLevel, spec]);

  // Live signal sample history for continuous timing diagram (up to 120 frames)
  const historyRef = useRef<Record<string, number[]>>({});
  const lastSampleTimeRef = useRef<number>(0);

  // Clear waveform history on level change
  useEffect(() => {
    historyRef.current = {};
    setShowHint(false);
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

  // Extract live signal values from canvas grid
  const getLiveSignals = useCallback(() => {
    if (!spec) return {};
    const signals: Record<string, boolean> = {};

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = grid[y]?.[x];
        if (!t) continue;
        if (t.type === 'logic') {
          if (t.subtype === 'power' || t.subtype === 'pushbtn') {
            const label = t.labels[4] || 'IN';
            signals[label] = !!t.isActive;
          } else if (t.subtype === 'clock') {
            signals['CLK'] = !!t.outState;
          } else if (t.subtype === 'led') {
            const label = t.labels[0] || 'LED';
            signals[label] = !!t.isPowered;
          }
        }
      }
    }

    return signals;
  }, [grid, gridSize, spec]);

  // Continuous Waveform Canvas Render Loop
  useEffect(() => {
    if (!spec || isMinimized || activeTab !== 'waveform') return;

    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = performance.now();
      if (now - lastSampleTimeRef.current >= 40) {
        lastSampleTimeRef.current = now;
        const live = getLiveSignals();

        // Channels to display: Inputs first, then Outputs
        const channelNames = [...spec.inputNames, ...spec.outputNames];
        channelNames.forEach((ch) => {
          if (!historyRef.current[ch]) {
            historyRef.current[ch] = Array(80).fill(0);
          }
          const val = live[ch] ? 1 : 0;
          historyRef.current[ch].shift();
          historyRef.current[ch].push(val);
        });
      }

      const W = canvas.width;
      const H = canvas.height;

      // Dark CRT phosphor background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      const channels = [...spec.inputNames, ...spec.outputNames];
      const numChannels = channels.length;
      if (numChannels === 0) return;

      const trackH = (H - 20) / numChannels;

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 70; x < W; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Color palette for channels
      const channelColors: string[] = [
        '#38bdf8', // Sky (CLK / In1)
        '#fbbf24', // Amber (In2)
        '#34d399', // Emerald (Out Q)
        '#f43f5e', // Rose (Out Q')
        '#a78bfa', // Purple
        '#f97316', // Orange
      ];

      // Draw each digital track
      channels.forEach((ch, idx) => {
        const topY = 10 + idx * trackH;
        const botY = topY + trackH - 6;
        const highY = topY + 6;
        const lowY = botY;
        const color = channelColors[idx % channelColors.length];

        // Track divider line
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, botY + 3);
        ctx.lineTo(W, botY + 3);
        ctx.stroke();

        // Channel Label on left gutter
        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, 6, (highY + lowY) / 2);

        // Digital waveform line
        const data = historyRef.current[ch] || Array(80).fill(0);
        const plotStartX = 65;
        const plotW = W - plotStartX - 10;
        const stepX = plotW / (data.length - 1);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let i = 0; i < data.length; i++) {
          const px = plotStartX + i * stepX;
          const py = data[i] === 1 ? highY : lowY;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            const prevPy = data[i - 1] === 1 ? highY : lowY;
            if (prevPy !== py) {
              // Vertical edge
              ctx.lineTo(px, prevPy);
              ctx.lineTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();

        // Current state badge (0 or 1) at the end of the line
        const latestVal = data[data.length - 1];
        ctx.fillStyle = latestVal ? color : '#64748b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(latestVal ? '1' : '0', W - 4, (highY + lowY) / 2);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [spec, isMinimized, activeTab, getLiveSignals]);

  if (!spec || !testbenchResult) return null;

  const { stepResults, passedCount, totalSteps, allPassed, message } = testbenchResult;

  // Minimized View
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
            : 'bg-slate-900/90 border-cyan-500/60 text-slate-200 shadow-black/50 hover:bg-slate-800/90'
        }`}
        onClick={() => setIsMinimized(false)}
        title="點擊展開數位時序分析儀 HUD"
      >
        <Activity className={`w-4 h-4 ${allPassed ? 'text-emerald-400' : 'text-cyan-400'}`} />
        <span className="text-xs font-bold font-mono">
          時序分析儀 ({passedCount}/{totalSteps} ✓)
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
      className={`z-40 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl border-2 backdrop-blur-xl shadow-2xl select-none flex flex-col overflow-hidden transition-colors ${
        allPassed
          ? 'bg-slate-950/95 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
          : 'bg-slate-950/95 border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Draggable Header */}
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
          <Activity className={`w-4 h-4 ${allPassed ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span className="text-xs font-bold tracking-wide truncate max-w-[170px]" title={spec.title}>
            {spec.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
              allPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                : passedCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {allPassed ? '時序通過 🎉' : `${passedCount}/${totalSteps} 符合`}
          </div>

          <button
            onClick={() => setShowHint((prev) => !prev)}
            className={`p-1 rounded-md transition-colors ${
              showHint
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
            title="查看循序邏輯指引"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

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
              循序邏輯
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
                  <span className="font-semibold text-amber-300">💡 設計提示：</span>
                  <span>{spec.hint}</span>
                </div>
              </div>
            )}

            {/* One-Click Verification Button */}
            <button
              onClick={() => {
                if (allPassed) {
                  onVerifySuccess(`🎉 恭喜通關！時序測試全數通過 (${passedCount}/${totalSteps})！`);
                } else {
                  setActiveTab('testbench');
                  onShowAlert?.(
                    message ||
                      `⚠️ 時序尚未完全吻合 (目前通過 ${passedCount}/${totalSteps} 步)，請切換至「步進檢驗表」查看錯誤細節！`
                  );
                }
              }}
              className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                allPassed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>⏱️ 驗證電路 (時序測試 Testbench)</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Switcher: Real-time Waveform vs Testbench Step Table */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('waveform')}
          className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'waveform'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>動態時序波形</span>
        </button>
        <button
          onClick={() => setActiveTab('testbench')}
          className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'testbench'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>時序刺激測試 ({passedCount}/{totalSteps})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* TAB 1: Digital Waveform Canvas */}
        {activeTab === 'waveform' && (
          <div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner mb-2">
              <canvas
                ref={canvasRef}
                width={350}
                height={Math.max(120, (spec.inputNames.length + spec.outputNames.length) * 28 + 20)}
                className="w-full block"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>⚡ 操作開關或時脈，觀察即時方波</span>
              <button
                onClick={() => {
                  historyRef.current = {};
                }}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重設波形</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Step-by-Step Testbench Table */}
        {activeTab === 'testbench' && (
          <div className="max-h-[240px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 text-xs">
            {stepResults.map((st) => (
              <div
                key={st.stepIndex}
                className={`p-2 transition-colors flex items-start gap-2 ${
                  st.pass ? 'hover:bg-slate-800/40' : 'bg-rose-950/20'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {st.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between font-bold text-slate-200 mb-0.5">
                    <span className="truncate">{st.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      第 {st.stepIndex} 步
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1.5 leading-tight">
                    {st.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="text-cyan-300">
                      輸入: {Object.entries(st.inputValues).map(([k, v]) => `${k}=${v ? 1 : 0}`).join(' ')}
                    </span>
                    <span className="text-indigo-300">
                      預期: {Object.entries(st.expectedOutputs).map(([k, v]) => `${k}=${v ? 1 : 0}`).join(' ')}
                    </span>
                    <span className={st.pass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      實測: {Object.entries(st.actualOutputs).map(([k, v]) => `${k}=${v ? 1 : 0}`).join(' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diagnostic Status Message */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <p className="leading-tight truncate" title={message}>
            {message}
          </p>
        </div>

        {/* Action Button: Level Completion when all passed */}
        {allPassed && (
          <div className="mt-2.5">
            <button
              onClick={() => {
                onVerifySuccess(`🎉 恭喜通關！時序測試全數通過 (${passedCount}/${totalSteps})！`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>時序邏輯全數吻合！點擊完成通關</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
