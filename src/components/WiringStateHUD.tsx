/**
 * @license
 * WiringStateHUD Component for Auto Studio Pro
 * Interactive real-time Industrial Wiring & Relay State Monitor HUD with:
 * - Live contactor / relay coil energization tracking (Active ⚡ / Inactive ⚪)
 * - Associated auxiliary NO/NC contacts status overview
 * - Motor operation & rotation direction indicator (FWD ↻ / REV ↺ / STOP)
 * - Load indicator lights & protection devices status (Fuse, Breaker, Overload)
 * - Automated wiring verification testbench with step-by-step diagnostic checklist
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
  Zap,
  Play,
  RotateCcw,
  ShieldAlert,
  Lightbulb,
  Radio,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Award,
  FileText,
  Search,
  Target,
} from 'lucide-react';
import {
  executeWiringVerification,
  getWiringLevelSpec,
  WiringVerificationResult,
} from '../engine/wiringDefinitions';
import {
  getClassCQuestionData,
  ClassCQuestionData,
} from '../levels/classCExamData';
import { LevelRegistry } from '../levels/LevelRegistry';

interface WiringStateHUDProps {
  grid: (Tile | null)[][];
  gridSize: number;
  logicLevel: LogicLevelId;
  onVerifySuccess: (message: string) => void;
  onToggleTileActive?: (x: number, y: number) => void;
}

interface CoilInfo {
  label: string;
  isActive: boolean;
  type: string;
  noCount: number;
  noActiveCount: number;
  ncCount: number;
  ncActiveCount: number;
}

interface MotorInfo {
  id: string;
  isPowered: boolean;
  motorDir: number; // 1: FWD, -1: REV, 0: STOP
  pos: string;
}

interface LoadInfo {
  id: string;
  isPowered: boolean;
  pos: string;
}

interface ButtonInfo {
  id: string;
  subtype: string;
  label: string;
  isPressed: boolean;
  pos: string;
  x: number;
  y: number;
}

interface ProtectionInfo {
  id: string;
  name: string;
  status: 'normal' | 'tripped' | 'blown';
  pos: string;
}

interface TimerInfo {
  id: string;
  label: string;
  type: string;
  value: number;
  isActive: boolean;
  isPowered: boolean;
  remainingMs: number | null;
  pos: string;
}

export const WiringStateHUD: React.FC<WiringStateHUDProps> = ({
  grid,
  gridSize,
  logicLevel,
  onVerifySuccess,
  onToggleTileActive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isClassC = logicLevel.startsWith('class_c_');
  const classCData = useMemo(() => getClassCQuestionData(logicLevel), [logicLevel]);

  type HudTab = 'monitor' | 'testbench' | 'guide' | 'exam' | 'tips';
  const [activeTab, setActiveTab] = useState<HudTab>('monitor');
  const [verificationResult, setVerificationResult] = useState<WiringVerificationResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<{
    passed: boolean;
    message: string;
    explanation: string;
    score: number;
  } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Get current level specification and metadata (if available)
  const spec = useMemo(() => getWiringLevelSpec(logicLevel), [logicLevel]);
  const levelMeta = useMemo(() => LevelRegistry.getLevelMetadata(logicLevel), [logicLevel]);
  const [showHintCard, setShowHintCard] = useState<boolean>(true);

  // Reset verification and tab on level change
  useEffect(() => {
    setVerificationResult(null);
    setSelectedOption(null);
    setExamResult(null);
    setShowHintCard(true);
    if (isClassC) {
      setActiveTab('exam');
    } else if (spec) {
      setActiveTab('monitor');
    }
  }, [logicLevel, spec, isClassC]);

  // Listen for open-class-c-exam event from CanvasWorkspace banner
  useEffect(() => {
    const handler = () => {
      setIsMinimized(false);
      setActiveTab('exam');
    };
    window.addEventListener('open-class-c-exam', handler);
    return () => window.removeEventListener('open-class-c-exam', handler);
  }, []);

  // Live ticker for high-frequency real-time monitor synchronization (~30 FPS)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const loop = (time: number) => {
      if (time - lastTime >= 33) {
        lastTime = time;
        setTick((t) => (t + 1) % 1000000);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Real-time scan of grid devices
  const { coils, timers, motors, loads, buttons, protections, hasAnyDevices } = useMemo(() => {
    const coilMap = new Map<string, CoilInfo>();
    const timersList: TimerInfo[] = [];
    const motorsList: MotorInfo[] = [];
    const loadsList: LoadInfo[] = [];
    const buttonsList: ButtonInfo[] = [];
    const protectionsList: ProtectionInfo[] = [];

    // First pass: detect coils and timers
    for (let y = 0; y < Math.min(grid.length, gridSize); y++) {
      for (let x = 0; x < Math.min(grid[0].length, gridSize); x++) {
        const t = grid[y][x];
        if (!t) continue;

        const isTimer =
          t.type === 'relay' &&
          (t.subtype === 'flash_coil' ||
            (t.subtype === 'coil' && (t.value > 0 || (t.labels?.[4] && t.labels[4].toUpperCase().startsWith('T')))));
        if (isTimer) {
          const val = t.value || (t.subtype === 'flash_coil' ? 1000 : 3000);
          let remaining: number | null = null;
          if (t.isPoweredAt !== null && t.isPoweredAt !== undefined) {
            const elapsed = Date.now() - t.isPoweredAt;
            remaining = Math.max(0, val - elapsed);
          }
          timersList.push({
            id: `timer-${x}-${y}`,
            label: t.labels?.[4] || 'T1',
            type: t.subtype === 'flash_coil' ? 'Flasher' : 'TON',
            value: val,
            isActive: !!t.isActive,
            isPowered: t.isPoweredAt !== null,
            remainingMs: remaining,
            pos: `(${x}, ${y})`,
          });
        }

        if (
          t.type === 'relay' &&
          (t.subtype === 'coil' ||
            t.subtype === 'valve_coil' ||
            t.subtype === 'flash_coil' ||
            t.subtype === 'impulse_coil' ||
            t.subtype === 'counter_coil')
        ) {
          const rawLabel = t.labels?.[4] || 'MC1';
          const label = rawLabel.trim().toUpperCase();
          if (!coilMap.has(label)) {
            coilMap.set(label, {
              label: rawLabel,
              isActive: !!t.isActive,
              type: t.subtype,
              noCount: 0,
              noActiveCount: 0,
              ncCount: 0,
              ncActiveCount: 0,
            });
          } else {
            const entry = coilMap.get(label)!;
            entry.isActive = entry.isActive || !!t.isActive;
          }
        } else if (t.type === 'motor') {
          motorsList.push({
            id: `motor-${x}-${y}`,
            isPowered: !!t.isPowered,
            motorDir: t.motorDir || (t.isPowered ? 1 : 0),
            pos: `(${x}, ${y})`,
          });
        } else if (
          t.type === 'load' &&
          (t.subtype === 'lightbulb' || t.subtype === 'bulb' || t.subtype === 'load_lightbulb')
        ) {
          loadsList.push({
            id: `light-${x}-${y}`,
            isPowered: !!t.isPowered,
            pos: `(${x}, ${y})`,
          });
        } else if (t.type === 'btn' || t.type === 'switch') {
          buttonsList.push({
            id: `${t.type}-${x}-${y}`,
            subtype: t.subtype,
            label: t.labels?.[4] || (t.type === 'btn' ? (t.subtype === 'no' ? 'NO按鈕' : 'NC按鈕') : '開關'),
            isPressed: !!(t.isActive || t.isPhysicallyPushed),
            pos: `(${x}, ${y})`,
            x,
            y,
          });
        } else if (t.type === 'breaker') {
          protectionsList.push({
            id: `breaker-${x}-${y}`,
            name: t.subtype === '3p' ? '3P無熔絲開關' : '2P斷路器 (MCB)',
            status: t.isActive ? 'normal' : 'tripped',
            pos: `(${x}, ${y})`,
          });
        } else if (t.type === 'protection' && t.subtype === 'fuse') {
          protectionsList.push({
            id: `fuse-${x}-${y}`,
            name: '快速保險絲',
            status: t.isBlown ? 'blown' : 'normal',
            pos: `(${x}, ${y})`,
          });
        } else if (t.type === 'protection' && (t.subtype === 'ol_2p' || t.subtype === 'ol_3p')) {
          protectionsList.push({
            id: `ol-${x}-${y}`,
            name: '積熱電驛 (TH-RY)',
            status: t.isActive ? 'tripped' : 'normal',
            pos: `(${x}, ${y})`,
          });
        }
      }
    }

    // Second pass: associate contacts to coils
    for (let y = 0; y < Math.min(grid.length, gridSize); y++) {
      for (let x = 0; x < Math.min(grid[0].length, gridSize); x++) {
        const t = grid[y][x];
        if (!t) continue;

        if (
          t.type === 'relay' &&
          (t.subtype === 'no' ||
            t.subtype === 'nc' ||
            t.subtype === 'con' ||
            t.subtype.startsWith('ton_') ||
            t.subtype.startsWith('tof_') ||
            t.subtype === 'mc_no_2' ||
            t.subtype === 'mc_no_3')
        ) {
          const rawLabel = t.labels?.[4] || 'K1';
          const label = rawLabel.trim().toUpperCase();
          if (coilMap.has(label)) {
            const entry = coilMap.get(label)!;
            const isNo =
              t.subtype === 'no' ||
              t.subtype === 'ton_no' ||
              t.subtype === 'tof_no' ||
              t.subtype === 'mc_no_2' ||
              t.subtype === 'mc_no_3';
            const isNc =
              t.subtype === 'nc' ||
              t.subtype === 'ton_nc' ||
              t.subtype === 'tof_nc';

            if (isNo) {
              entry.noCount++;
              if (t.isActive) entry.noActiveCount++;
            } else if (isNc) {
              entry.ncCount++;
              if (t.isActive) entry.ncActiveCount++;
            }
          }
        }
      }
    }

    const hasAny =
      coilMap.size > 0 ||
      timersList.length > 0 ||
      motorsList.length > 0 ||
      loadsList.length > 0 ||
      buttonsList.length > 0 ||
      protectionsList.length > 0;

    return {
      coils: Array.from(coilMap.values()),
      timers: timersList,
      motors: motorsList,
      loads: loadsList,
      buttons: buttonsList,
      protections: protectionsList,
      hasAnyDevices: hasAny,
    };
  }, [grid, gridSize, tick]);

  // Run testbench verification
  const handleRunVerification = useCallback(() => {
    if (!spec) return;
    const result = executeWiringVerification(grid, gridSize, logicLevel);
    setVerificationResult(result);
    setActiveTab('testbench');
    if (result.allPassed) {
      onVerifySuccess(result.message);
    }
  }, [spec, grid, gridSize, logicLevel, onVerifySuccess]);

  // Dragging handlers
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

  if (!hasAnyDevices && !spec && !isClassC) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : { top: '80px', right: '340px' }
      }
      className={`fixed z-30 transition-shadow duration-200 select-none ${
        isMinimized ? 'w-72' : 'w-96'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Title Bar & Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 cursor-grab active:cursor-grabbing text-xs font-semibold text-slate-200"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-slate-500" />
            <div className="flex items-center gap-1.5 font-bold">
              {isClassC ? (
                <>
                  <Award className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                  <span className="text-purple-300">丙級檢定故障檢修作答 (Class C Exam)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className="text-amber-400">工業配線即時監控 (Wiring HUD)</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {spec && !isClassC && (
              <button
                onClick={handleRunVerification}
                className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-all flex items-center gap-1"
                title="一鍵執行電路測試"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>測試驗證</span>
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title={isMinimized ? '展開視窗' : '最小化視窗'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Level Mission & Hint Card (Integrated from bottom banner) */}
        {!isMinimized && (
          <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 space-y-2">
            {/* Top row: Title, Badge, and Hint Collapse Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Target className={`w-3.5 h-3.5 shrink-0 ${isClassC ? 'text-purple-400' : 'text-amber-400'}`} />
                <span className={`font-mono font-bold text-xs truncate ${isClassC ? 'text-purple-300' : 'text-amber-300'}`}>
                  {isClassC && classCData ? classCData.title : spec?.title || levelMeta?.title || logicLevel}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60">
                  {isClassC ? '丙級檢定' : spec?.category || '工業配線'}
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
                {/* Level Mission / Goal Description */}
                <div className="text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-slate-400 text-[10px] font-semibold mb-0.5 flex items-center gap-1">
                    <span>📌</span>
                    <span>關卡目標與說明</span>
                  </div>
                  <div>
                    {isClassC && classCData
                      ? `故障現象：${classCData.symptom}`
                      : levelMeta?.desc || spec?.description || '將迴路依指引完成配線並進行功能驗證。'}
                  </div>
                </div>

                {/* Practical Wiring Hint */}
                {spec?.guideHint && (
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-semibold text-amber-300">💡 配線要領：</span>
                      <span>{spec.guideHint}</span>
                    </div>
                  </div>
                )}

                {/* Class C Circuit Description */}
                {isClassC && classCData && (
                  <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-2 text-[11px] text-purple-200/90 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-semibold text-purple-300">受測電路：</span>
                      <span>{classCData.circuitName}</span>
                    </div>
                  </div>
                )}

                {/* One-Click Action Button */}
                {isClassC ? (
                  <button
                    onClick={() => {
                      setActiveTab('exam');
                      setIsMinimized(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>開啟故障檢修作答卡 (Diagnose Exam)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRunVerification}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>⚡ 驗證配線電路 (Wiring Check)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        {!isMinimized && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
            {isClassC && classCData ? (
              <>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`flex-1 py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'exam'
                      ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>檢修作答卡</span>
                  {examResult && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        examResult.passed ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('tips')}
                  className={`flex-1 py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'tips'
                      ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>電表量測指引</span>
                </button>

                <button
                  onClick={() => setActiveTab('monitor')}
                  className={`py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'monitor'
                      ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title="盤箱元件即時狀態"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>盤箱狀態</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('monitor')}
                  className={`flex-1 py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'monitor'
                      ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>元件即時狀態</span>
                </button>

                {spec && (
                  <button
                    onClick={() => setActiveTab('testbench')}
                    className={`flex-1 py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      activeTab === 'testbench'
                        ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>自動驗證</span>
                    {verificationResult && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          verificationResult.allPassed ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                    )}
                  </button>
                )}

                {spec && (
                  <button
                    onClick={() => setActiveTab('guide')}
                    className={`py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1 ${
                      activeTab === 'guide'
                        ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                    title="配線指引與重點"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Content Area */}
        {!isMinimized && (
          <div className="p-3 max-h-[360px] overflow-y-auto space-y-3 text-xs">
            {/* TAB 1: Real-time Device Monitor */}
            {activeTab === 'monitor' && (
              <div className="space-y-3">
                {/* Contactor & Relay Coils */}
                {coils.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>接觸器與電驛線圈 (Coils)</span>
                      <span className="text-slate-500 font-normal">{coils.length} 顆線圈</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {coils.map((c) => (
                        <div
                          key={c.label}
                          className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                            c.isActive
                              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                                c.isActive
                                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_#10b981]'
                                  : 'bg-slate-700'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                            </span>
                            <div>
                              <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{c.label}</span>
                                <span className="text-[10px] font-normal text-slate-400">
                                  ({c.type === 'coil' ? 'MC/Relay' : c.type})
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                接點聯動：NO({c.noCount}) {c.noActiveCount > 0 ? '🟢 閉合' : '⚪ 常開'} | NC(
                                {c.ncCount}) {c.ncActiveCount > 0 ? '🔴 斷開' : '⚪ 常閉'}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {c.isActive ? '⚡ 激磁 (ON)' : '⚪ 釋放 (OFF)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timers & Flashers */}
                {timers.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>時間控制與計時器 (Timers)</span>
                      <span className="text-slate-500 font-normal">{timers.length} 具計時器</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {timers.map((tm) => (
                        <div
                          key={tm.id}
                          className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                            tm.isActive || tm.isPowered
                              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tm.type === 'Flasher' ? '⚡' : '⏱️'}</span>
                            <div>
                              <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{tm.label}</span>
                                <span className="text-[10px] font-normal text-slate-400">
                                  ({tm.type} {(tm.value / 1000).toFixed(1)}s)
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {tm.type === 'Flasher'
                                  ? tm.isPowered ? '週期閃爍中...' : '待機中'
                                  : tm.isPowered
                                  ? tm.remainingMs !== null && tm.remainingMs > 0
                                    ? `倒數剩餘 ${(tm.remainingMs / 1000).toFixed(1)} 秒`
                                    : '時限已到 (Time-Up 已切換)'
                                  : '未通電計時'}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              tm.isActive
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {tm.isActive ? 'ACTION' : tm.isPowered ? 'RUN' : 'IDLE'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motors & Output Loads */}
                {(motors.length > 0 || loads.length > 0) && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>動力馬達與輸出負載 (Loads)</span>
                      <span className="text-slate-500 font-normal">
                        {motors.length} 馬達, {loads.length} 燈號
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {motors.map((m, idx) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                            m.isPowered
                              ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{m.isPowered ? '⚙️' : '⚪'}</span>
                            <div>
                              <div className="font-mono font-bold text-slate-100">
                                馬達 M{idx + 1}
                                <span className="text-[10px] font-normal text-slate-400 ml-1.5">{m.pos}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {m.isPowered
                                  ? m.motorDir > 0
                                    ? '↻ 順向運轉 (正轉 FWD)'
                                    : '↺ 逆向運轉 (反轉 REV)'
                                  : '靜止中 (未通電)'}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.isPowered
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {m.isPowered ? (m.motorDir > 0 ? 'FWD' : 'REV') : 'STOP'}
                          </div>
                        </div>
                      ))}

                      {loads.map((l, idx) => (
                        <div
                          key={l.id}
                          className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                            l.isPowered
                              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb
                              className={`w-4 h-4 ${
                                l.isPowered ? 'text-amber-400 fill-amber-400/80 animate-pulse' : 'text-slate-600'
                              }`}
                            />
                            <div>
                              <div className="font-mono font-bold text-slate-100">
                                指示燈 L{idx + 1}
                                <span className="text-[10px] font-normal text-slate-400 ml-1.5">{l.pos}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {l.isPowered ? '電壓正常導通' : '迴路斷開'}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              l.isPowered
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {l.isPowered ? '💡 點亮' : '⚫ 熄滅'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Buttons */}
                {buttons.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>操作按鈕與開關 (Switches)</span>
                      <span className="text-slate-500 font-normal">{buttons.length} 具開關按鈕</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {buttons.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onToggleTileActive?.(b.x, b.y)}
                          className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between text-left transition-all cursor-pointer select-none active:scale-95 ${
                            b.isPressed
                              ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-200'
                          }`}
                          title={`點擊切換 ${b.label} 按壓/保持狀態 (${b.pos})`}
                        >
                          <div className="truncate pr-1">
                            <div className="font-semibold text-slate-200 truncate flex items-center gap-1">
                              <span>{b.label}</span>
                              <span className="text-[9px] font-normal text-slate-500">{b.pos}</span>
                            </div>
                            <div className="text-[9px] text-slate-400">{b.subtype.toUpperCase()} 接點</div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 transition-colors ${
                              b.isPressed
                                ? 'bg-indigo-500 text-white animate-pulse'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {b.isPressed ? '🔴 按壓中' : '⚪ 常態'}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
                      <span>💡 提示：點擊按鈕卡片可保持按壓/釋放狀態，便於同時測試多顆按鈕聯動！</span>
                    </div>
                  </div>
                )}

                {/* Protections */}
                {protections.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>安全與保護裝置 (Protection)</span>
                      <span className="text-slate-500 font-normal">{protections.length} 具裝置</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {protections.map((p) => (
                        <div
                          key={p.id}
                          className="p-1.5 rounded bg-slate-950/50 border border-slate-800 flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert
                              className={`w-3.5 h-3.5 ${
                                p.status === 'normal' ? 'text-emerald-400' : 'text-rose-500 animate-bounce'
                              }`}
                            />
                            <span className="text-slate-300 font-semibold">{p.name}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              p.status === 'normal'
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : 'text-rose-400 bg-rose-950/60 border border-rose-500/40'
                            }`}
                          >
                            {p.status === 'normal' ? '正常投入' : p.status === 'tripped' ? '⚠️ 跳脫' : '💥 燒斷'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Automated Testbench Verification */}
            {activeTab === 'testbench' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <div className="font-bold text-slate-200">測試台自動驗證</div>
                    <div className="text-[10px] text-slate-400">
                      模擬按壓啟動/停止按鈕，檢查自保持與迴路邏輯
                    </div>
                  </div>
                  <button
                    onClick={handleRunVerification}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>開始測試</span>
                  </button>
                </div>

                {verificationResult && (
                  <div className="space-y-2">
                    <div
                      className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                        verificationResult.allPassed
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                          : 'bg-rose-950/50 border-rose-500 text-rose-200'
                      }`}
                    >
                      {verificationResult.allPassed ? (
                        <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold">
                          {verificationResult.allPassed ? '電路驗證成功！' : '電路驗證未通過'}
                        </div>
                        <div className="text-[11px] opacity-90">{verificationResult.message}</div>
                      </div>
                    </div>

                    {/* Step details checklist */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        測試步驟診斷清單：
                      </div>
                      {verificationResult.steps.map((st, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                            st.passed
                              ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-200'
                              : 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {st.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{st.stepName}</div>
                            <div className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{st.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!verificationResult && (
                  <div className="text-center py-6 text-slate-400">
                    <Zap className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                    <p className="text-xs">配線完成後，點擊「開始測試」執行電路邏輯驗證。</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Guide Hints */}
            {activeTab === 'guide' && spec && (
              <div className="space-y-2.5">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>學習任務與配線指引</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">{spec.description}</p>
                </div>

                <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-600/30 text-amber-200">
                  <div className="font-bold text-amber-300 mb-1">💡 技師操作提示：</div>
                  <p className="text-xs leading-relaxed opacity-90">{spec.guideHint}</p>
                </div>
              </div>
            )}

            {/* TAB: Class C Exam Card */}
            {activeTab === 'exam' && classCData && (
              <div className="space-y-3">
                {/* Fault Symptom Card */}
                <div className="bg-rose-950/30 border border-rose-800/60 p-3 rounded-lg text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>現場報修故障現象：</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {classCData.faultSymptom}
                  </p>
                </div>

                {/* Multimeter measurement reminder */}
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧰</span>
                    <span>請使用上方<b>「三用電表」</b>量測接點導通狀態</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="text-cyan-400 hover:underline text-[10px] shrink-0 font-bold"
                  >
                    查看量測指引 →
                  </button>
                </div>

                {/* Diagnosis Multiple-Choice Options */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>依量測結果診斷故障點（單選）：</span>
                  </div>

                  <div className="space-y-1.5">
                    {classCData.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (!examResult?.passed) {
                              setSelectedOption(opt.id);
                            }
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-purple-950/50 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.25)] text-slate-100'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/30'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border text-[10px] font-bold ${
                              isSelected
                                ? 'bg-purple-600 border-purple-400 text-white'
                                : 'border-slate-600 text-slate-400'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <div className="text-xs leading-relaxed">{opt.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit / Score Button */}
                {!examResult?.passed && (
                  <button
                    onClick={() => {
                      if (!selectedOption) {
                        alert('請先點選您所診斷出的故障原因！');
                        return;
                      }
                      const opt = classCData.options.find((o) => o.id === selectedOption);
                      if (!opt) return;

                      if (opt.isCorrect) {
                        setExamResult({
                          passed: true,
                          score: 100,
                          message: '檢定合格！故障診斷完全正確。',
                          explanation: opt.explanation,
                        });
                        onVerifySuccess(`🎉 恭喜通關！【${classCData.title}】故障檢修核分：100分 (合格)！`);
                      } else {
                        setExamResult({
                          passed: false,
                          score: 0,
                          message: '檢定未合格：診斷有誤，請再複查量測數據。',
                          explanation: opt.explanation,
                        });
                      }
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>提交檢修診斷並核分 (Submit Diagnosis)</span>
                  </button>
                )}

                {/* Exam Result & Detailed Technical Explanation */}
                {examResult && (
                  <div
                    className={`p-3 rounded-lg border space-y-2.5 animate-fadeIn ${
                      examResult.passed
                        ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {examResult.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <span>{examResult.message}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-black border ${
                          examResult.passed
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-rose-600 text-white border-rose-400'
                        }`}
                      >
                        成績：{examResult.score} 分
                      </span>
                    </div>

                    <div className="text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800 text-slate-200 leading-relaxed">
                      <div className="font-bold text-amber-400 mb-1">💡 故障原因深度剖析：</div>
                      <div>{examResult.explanation}</div>
                    </div>

                    {examResult.passed ? (
                      <div className="text-xs bg-emerald-950/60 p-2.5 rounded border border-emerald-800/80 text-emerald-100 leading-relaxed">
                        <div className="font-bold text-emerald-300 mb-1">🔧 現場正確修復措施：</div>
                        <div>{classCData.repairMethod}</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setExamResult(null);
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>重新分析並重試</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Class C Multimeter & Troubleshooting Guide */}
            {activeTab === 'tips' && classCData && (
              <div className="space-y-3">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    <span>三用電表量測 SOP 步驟</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>切換上方工具列的<b>「三用電表 (Multimeter)」</b>工具。</li>
                    <li>在盤面上依序點擊想測試的兩個端子或節點。</li>
                    <li>電表即時顯示導通結果：
                      <div className="pl-4 mt-1 space-y-0.5 text-[11px]">
                        <span className="text-emerald-400 font-bold">🟢 導通 (Closed / 0Ω)</span>：迴路正常或接點閉合<br/>
                        <span className="text-rose-400 font-bold">🔴 斷路 (Open / ∞Ω)</span>：斷線、接點不良或開關未閉合
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/60 text-cyan-200 space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs">🔍 本題關鍵測試點指引：</div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {classCData.multimeterTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 text-xs">📋 本題標準正常動作程序：</div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {classCData.normalOperation.map((step, idx) => (
                      <div key={idx} className="text-[11px] leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
