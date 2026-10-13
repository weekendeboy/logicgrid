/**
 * @license
 * RightSidebar Component for Auto Studio Pro
 */

import React, { useRef, useEffect, useState } from 'react';
import { AppMode, ToolType, Tile, LogicLevelId } from '../types';
import {
  Move,
  Satellite,
  Wand2,
  Hand,
  Square,
  Tag,
  RotateCcw,
  Trash2,
  Scissors,
  Copy,
  Eraser,
  Clipboard,
  Zap,
  Bug,
  X,
  Link,
  Info,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  Wrench,
  Activity,
  Play,
  Pause,
  Lock,
  Puzzle,
} from 'lucide-react';
import {
  isPuzzleComponentUnlocked,
  getPuzzleUnlockedTier,
  getPuzzleLevel,
} from '../levels/wiringPuzzleLevels';
import {
  isLogicPuzzleComponentUnlocked,
  getLogicPuzzleUnlockedTier,
  getLogicPuzzleLevel,
} from '../levels/logicPuzzleLevels';

interface RightSidebarProps {
  currentMode: AppMode;
  plcSubTab: 'wiring' | 'ladder';
  setPlcSubTab: (tab: 'wiring' | 'ladder') => void;
  currentTool: ToolType;
  meterChannel: string;
  oscVal: number | null;
  channelOscVals?: Record<string, number>;
  vVal: number;
  aVal: number;
  wVal: number;
  multimeterStatusText: string;
  isFaultMode: boolean;
  hasSelection: boolean;
  isPasting: boolean;
  autowireCount: number;
  placementType: string;
  placementSubtype: string;
  placementRotation: number;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
  onSetTool: (tool: ToolType) => void;
  onSetMeterChannel: (ch: string) => void;
  onSetPlacement: (typeStr: string, el?: HTMLElement | null) => void;
  onRotateTool: (e: React.MouseEvent, typeStr: string) => void;
  onExecuteAutoWire: () => void;
  onClearAutoWire: () => void;
  onUndo: () => void;
  onOpenClearConfirm: () => void;
  onCutSelection: () => void;
  onCopySelection: () => void;
  onDeleteSelection: () => void;
  onToggleFaultMode: () => void;
  onClearFaults: () => void;
  logicLevel?: LogicLevelId;
  onShowAlert?: (msg: string) => void;
}

const CollapsibleSection = ({ title, titleNode, children, titleClass }: any) => {
  const [isOpen, setIsOpen] = React.useState(true);
  return (
    <div>
      <div 
        className={`${titleClass} flex items-center justify-between cursor-pointer select-none hover:opacity-80 transition-opacity`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1">{titleNode || title}</div>
        {isOpen ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronRight size={14} className="text-slate-500"/>}
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};


export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentMode,
  currentTool,
  meterChannel,
  oscVal,
  channelOscVals,
  vVal,
  aVal,
  wVal,
  multimeterStatusText,
  isFaultMode,
  hasSelection,
  isPasting,
  autowireCount,
  placementType,
  placementSubtype,
  placementRotation,
  isPinned,
  onTogglePin,
  onClose,
  plcSubTab,
  setPlcSubTab,
  onSetTool,
  onSetMeterChannel,
  onSetPlacement,
  onRotateTool,
  onExecuteAutoWire,
  onClearAutoWire,
  onUndo,
  onOpenClearConfirm,
  onCutSelection,
  onCopySelection,
  onDeleteSelection,
  onToggleFaultMode,
  onClearFaults,
  logicLevel,
  onShowAlert,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (key: string) => setExpanded(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  // Puzzle Mode Lock System (Wiring & Logic)
  const isWiringPuzzleMode = currentMode === 'wiring' && !!logicLevel && logicLevel.startsWith('wp-');
  const isLogicPuzzleMode = currentMode === 'logic' && !!logicLevel && logicLevel.startsWith('lp-');
  const isPuzzleMode = isWiringPuzzleMode || isLogicPuzzleMode;

  const puzzleTier = isLogicPuzzleMode
    ? getLogicPuzzleUnlockedTier(logicLevel!)
    : isWiringPuzzleMode
    ? getPuzzleUnlockedTier(logicLevel!)
    : 5;

  const puzzleLevelDef = isLogicPuzzleMode
    ? getLogicPuzzleLevel(logicLevel!)
    : isWiringPuzzleMode
    ? getPuzzleLevel(logicLevel!)
    : undefined;

  const getLockStatus = (typeStr: string) => {
    if (isLogicPuzzleMode) {
      const check = isLogicPuzzleComponentUnlocked(typeStr, logicLevel!);
      return { isLocked: !check.unlocked, reason: check.reason, requiredTier: check.requiredTier };
    }
    if (isWiringPuzzleMode) {
      const check = isPuzzleComponentUnlocked(typeStr, logicLevel!);
      return { isLocked: !check.unlocked, reason: check.reason, requiredTier: check.requiredTier };
    }
    return { isLocked: false, reason: '' };
  };

  const handlePlacementClick = (typeStr: string, el?: HTMLElement | null) => {
    const lock = getLockStatus(typeStr);
    if (lock.isLocked) {
      if (onShowAlert) {
        onShowAlert(lock.reason || '🔒 此元件目前處於封印狀態！');
      }
      return;
    }
    onSetPlacement(typeStr, el);
  };

  const handleRotateToolWithLock = (e: React.MouseEvent, typeStr: string) => {
    const lock = getLockStatus(typeStr);
    if (lock.isLocked) {
      e.preventDefault();
      if (onShowAlert) {
        onShowAlert(lock.reason || '🔒 此元件目前處於封印狀態！');
      }
      return;
    }
    onRotateTool(e, typeStr);
  };

  const renderLockBadge = (typeStr: string) => {
    const lock = getLockStatus(typeStr);
    if (!lock.isLocked) return null;
    return (
      <span
        className="ml-auto text-[9px] bg-slate-950/90 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-0.5 shrink-0 shadow"
        title={lock.reason}
      >
        <Lock size={9} />
        <span>封印</span>
      </span>
    );
  };

  const getPlacementBtnClass = (typeStr: string, isSelected: boolean, extra: string = '') => {
    const lock = getLockStatus(typeStr);
    if (lock.isLocked) {
      return `relative p-2 rounded-lg text-xs flex items-center gap-1.5 border border-slate-800/80 bg-slate-900/40 text-slate-500 cursor-not-allowed select-none opacity-40 hover:opacity-60 transition-all ${extra}`;
    }
    return `${
      isSelected ? 'bg-blue-600/30 border-blue-500 text-white shadow' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
    } p-2 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${extra}`;
  };
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);
  const oscBuffersRef = useRef<Record<string, number[]>>({
    '1': Array(134).fill(0),
    '2': Array(134).fill(0),
    '3': Array(134).fill(0),
    '4': Array(134).fill(0),
  });
  const [enabledChannels, setEnabledChannels] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': false,
    '4': false,
  });
  const [isOscHold, setIsOscHold] = useState<boolean>(false);
  const [isOscAuto, setIsOscAuto] = useState<boolean>(true);
  const [manualScale, setManualScale] = useState<number>(5); // V/div

  const CHANNEL_CONFIG: Record<
    string,
    { name: string; stroke: string; glow: string; text: string; bgActive: string; borderActive: string }
  > = {
    '1': {
      name: 'CH1',
      stroke: '#34d399', // Emerald 400 (Phosphor Green)
      glow: 'rgba(16, 185, 129, 0.8)',
      text: '#34d399',
      bgActive: 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-emerald-950',
      borderActive: 'border-emerald-500',
    },
    '2': {
      name: 'CH2',
      stroke: '#fbbf24', // Amber 400 (Electric Gold)
      glow: 'rgba(245, 158, 11, 0.8)',
      text: '#fbbf24',
      bgActive: 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-amber-950',
      borderActive: 'border-amber-500',
    },
    '3': {
      name: 'CH3',
      stroke: '#38bdf8', // Sky 400 (Cyan)
      glow: 'rgba(14, 165, 233, 0.8)',
      text: '#38bdf8',
      bgActive: 'bg-sky-950/90 text-sky-300 border-sky-500 shadow-sky-950',
      borderActive: 'border-sky-500',
    },
    '4': {
      name: 'CH4',
      stroke: '#f472b6', // Pink 400 (Neon Rose)
      glow: 'rgba(236, 72, 153, 0.8)',
      text: '#f472b6',
      bgActive: 'bg-pink-950/90 text-pink-300 border-pink-500 shadow-pink-950',
      borderActive: 'border-pink-500',
    },
  };

  // Auto-enable CH2 if CH2 has live signal
  useEffect(() => {
    if (channelOscVals && channelOscVals['2'] !== undefined && Math.abs(channelOscVals['2']) > 0.01) {
      setEnabledChannels((prev) => {
        if (!prev['2']) return { ...prev, '2': true };
        return prev;
      });
    }
  }, [channelOscVals]);

  const isPlacementSelected = (typeStr: string) => {
    if (currentTool !== 'place') return false;
    const currentSelected = placementSubtype ? `${placementType}_${placementSubtype}` : placementType;
    return currentSelected === typeStr;
  };

  // Render dynamic multi-channel waveforms on oscilloscope canvas
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Buffer incoming values for all channels
    if (!isOscHold) {
      for (const ch of ['1', '2', '3', '4']) {
        const chVal =
          channelOscVals && channelOscVals[ch] !== undefined
            ? channelOscVals[ch]
            : (ch === meterChannel && oscVal !== null ? oscVal : 0);
        const buf = oscBuffersRef.current[ch];
        buf.push(chVal);
        if (buf.length > 134) {
          buf.shift();
        }
      }
    }

    const W = canvas.width;
    const H = canvas.height;

    // 1. CRT Screen background
    ctx.fillStyle = '#02140d';
    ctx.fillRect(0, 0, W, H);

    // 2. Graticule (示波器格線: 8 格橫向, 6 格縱向)
    const xDiv = W / 8;
    const yDiv = H / 6;
    const cx = W / 2;
    const cy = H / 2;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 8; i++) {
      const gx = i * xDiv;
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
    }
    for (let j = 1; j < 6; j++) {
      const gy = j * yDiv;
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
    }
    ctx.stroke();

    // Center axes (中心軸更清晰)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();

    // Minor division tick marks along center axes (每格 5 個副刻度)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    const subX = xDiv / 5;
    for (let x = 0; x <= W; x += subX) {
      ctx.moveTo(x, cy - 2);
      ctx.lineTo(x, cy + 2);
    }
    const subY = yDiv / 5;
    for (let y = 0; y <= H; y += subY) {
      ctx.moveTo(cx - 2, y);
      ctx.lineTo(cx + 2, y);
    }
    ctx.stroke();

    // 3. Telemetry and Unified Scale across all visible channels
    let maxOverallAbs = 0.1;
    for (const ch of ['1', '2', '3', '4']) {
      if (!enabledChannels[ch]) continue;
      const buf = oscBuffersRef.current[ch];
      for (const v of buf) {
        const a = Math.abs(v);
        if (a > maxOverallAbs) maxOverallAbs = a;
      }
    }

    let chosenScale = manualScale;
    if (isOscAuto) {
      const standardScales = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
      for (const s of standardScales) {
        if (s * 2.6 >= maxOverallAbs) {
          chosenScale = s;
          break;
        }
        chosenScale = s;
      }
    }

    // 4. Trace dynamic waveforms for all visible channels with respective colors & phosphor glows
    for (const ch of ['1', '2', '3', '4']) {
      if (!enabledChannels[ch]) continue;
      const cfg = CHANNEL_CONFIG[ch];
      const buf = oscBuffersRef.current[ch];

      ctx.save();
      ctx.shadowBlur = 7;
      ctx.shadowColor = cfg.glow;
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = ch === meterChannel ? 2.5 : 2.0;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < buf.length; i++) {
        const px = i * 2;
        const py = Math.max(2, Math.min(H - 2, cy - (buf[i] / chosenScale) * yDiv));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Zero-crossing frequency on primary active channel
    const primaryCh = enabledChannels[meterChannel]
      ? meterChannel
      : (Object.keys(enabledChannels).find((k) => enabledChannels[k]) || '1');
    const primBuf = oscBuffersRef.current[primaryCh];
    let primVmax = -Infinity, primVmin = Infinity;
    for (const v of primBuf) {
      if (v > primVmax) primVmax = v;
      if (v < primVmin) primVmin = v;
    }
    const primVpp = Math.max(0, primVmax - primVmin);

    const zeroCrossings: number[] = [];
    for (let i = 1; i < primBuf.length; i++) {
      if (primBuf[i - 1] <= 0 && primBuf[i] > 0) {
        zeroCrossings.push(i);
      }
    }
    let freq = 0;
    if (zeroCrossings.length >= 2 && primVpp > 0.05) {
      const avgPeriod = (zeroCrossings[zeroCrossings.length - 1] - zeroCrossings[0]) / (zeroCrossings.length - 1);
      if (avgPeriod > 0) {
        freq = 60 / avgPeriod;
      }
    }

    // 6. On-Screen Display (OSD)
    ctx.font = 'bold 9px monospace';

    // Top-left: Enabled Channels & Vpp with color badges
    let badgeX = 6;
    for (const ch of ['1', '2', '3', '4']) {
      if (!enabledChannels[ch]) continue;
      const cfg = CHANNEL_CONFIG[ch];
      const buf = oscBuffersRef.current[ch];
      let vMax = -Infinity, vMin = Infinity;
      for (const v of buf) {
        if (v > vMax) vMax = v;
        if (v < vMin) vMin = v;
      }
      const vpp = Math.max(0, vMax - vMin);
      ctx.fillStyle = cfg.stroke;
      const txt = `${cfg.name}:${vpp.toFixed(1)}V`;
      ctx.fillText(txt, badgeX, 12);
      badgeX += ctx.measureText(txt).width + 8;
    }

    // Top-right: Scale & Frequency
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'right';
    const freqText = freq >= 0.5 ? `${freq.toFixed(1)}Hz` : (primVpp > 0.1 ? 'AC' : 'DC');
    ctx.fillText(`${chosenScale}V/div | ${freqText}`, W - 6, 12);

    // Bottom-left: Instantaneous voltage readings
    ctx.textAlign = 'left';
    let btmX = 6;
    for (const ch of ['1', '2', '3', '4']) {
      if (!enabledChannels[ch]) continue;
      const cfg = CHANNEL_CONFIG[ch];
      const buf = oscBuffersRef.current[ch];
      const vNow = buf[buf.length - 1] || 0;
      ctx.fillStyle = cfg.stroke;
      const txt = `${cfg.name}=${vNow.toFixed(1)}V`;
      ctx.fillText(txt, btmX, H - 5);
      btmX += ctx.measureText(txt).width + 8;
    }

    // Bottom-right: Trace Mode Badge
    ctx.textAlign = 'right';
    const visibleCount = Object.values(enabledChannels).filter(Boolean).length;
    if (visibleCount > 1) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`DUAL-TRACE (${visibleCount}軌)`, W - 6, H - 5);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`SINGLE (單軌)`, W - 6, H - 5);
    }

    // Hold indicator
    if (isOscHold) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('⏸ HOLD (凍結)', cx, 24);
    }
  }, [oscVal, channelOscVals, isOscHold, isOscAuto, manualScale, meterChannel, enabledChannels]);

  return (
    <aside className="w-[300px] h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto z-10 select-none shrink-0 shadow-lg">
      {/* Sidebar Control Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-1.5 font-bold text-blue-400">
          <Wrench className="w-4 h-4" />
          <span>工具與元件箱</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? "已鎖定操作欄（點擊解除鎖定，動作後自動縮回）" : "未鎖定（點擊鎖定操作欄，動作後不縮回）"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 shadow-sm border ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
                  : 'bg-slate-800/90 text-slate-400 hover:text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
              <span>{isPinned ? '已鎖定' : '鎖定'}</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="收合操作欄"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {/* Oscilloscope Panel (Electronic Mode) */}
      {currentMode === 'electronic' && (
        <div className="p-3 border-b-2 border-emerald-900/50 bg-slate-950/80">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>動態示波器 (Oscilloscope)</span>
            </div>
            <button
              onClick={() => setIsOscHold(!isOscHold)}
              title={isOscHold ? '恢復即時波形掃描' : '凍結當前波形'}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                isOscHold
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
              }`}
            >
              {isOscHold ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5 fill-current" />}
              <span>{isOscHold ? 'RUN' : 'HOLD'}</span>
            </button>
          </div>

          {/* Channels 1-4 with Color Badge & Multi-Select Toggle */}
          <div className="flex gap-1 mb-2 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {['1', '2', '3', '4'].map((ch) => {
              const cfg = CHANNEL_CONFIG[ch];
              const isEnabled = !!enabledChannels[ch];
              const isCurrent = meterChannel === ch;
              return (
                <button
                  key={ch}
                  className={`flex-1 py-1 px-1 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 border ${
                    isEnabled
                      ? `${cfg.bgActive} border shadow`
                      : 'text-slate-500 bg-slate-950/60 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
                  } ${isCurrent ? 'ring-1 ring-white/60' : ''}`}
                  onClick={() => {
                    setEnabledChannels((prev) => {
                      const next = { ...prev, [ch]: !prev[ch] };
                      if (!Object.values(next).some(Boolean)) return prev; // keep at least one active
                      return next;
                    });
                    onSetMeterChannel(ch);
                  }}
                  title={`點擊切換顯示/隱藏 ${cfg.name} (雙軌示波)`}
                >
                  <span
                    className="w-2 h-2 rounded-full transition-all inline-block shrink-0"
                    style={{
                      backgroundColor: cfg.stroke,
                      opacity: isEnabled ? 1 : 0.25,
                      boxShadow: isEnabled ? `0 0 6px ${cfg.stroke}` : 'none',
                    }}
                  />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* CRT Screen Canvas */}
          <div className="relative rounded-lg overflow-hidden border-2 border-emerald-950 bg-slate-950 shadow-[inset_0_0_15px_rgba(16,185,129,0.25)] mb-2">
            <canvas
              ref={oscCanvasRef}
              width={268}
              height={130}
              className="w-full block"
            />
          </div>

          {/* Quick Controls Bar */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOscAuto(!isOscAuto)}
                className={`px-2 py-0.5 rounded font-bold border transition-all ${
                  isOscAuto
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="自動切換最適合的電壓量程"
              >
                {isOscAuto ? 'AUTO 量程' : '手動量程'}
              </button>
              {!isOscAuto && (
                <div className="flex gap-0.5">
                  {[2, 5, 20, 100].map((s) => (
                    <button
                      key={s}
                      onClick={() => setManualScale(s)}
                      className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                        manualScale === s
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {s}V
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                oscBuffersRef.current = {
                  '1': Array(134).fill(0),
                  '2': Array(134).fill(0),
                  '3': Array(134).fill(0),
                  '4': Array(134).fill(0),
                };
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold border border-slate-700 transition-all"
              title="清空螢幕波形緩衝區"
            >
              清除
            </button>
          </div>

          {/* Multimeter Probe Status (Compact & Contextual) */}
          {currentTool === 'multimeter' && (
            <div className="mt-2 p-1.5 bg-amber-950/60 border border-amber-600/50 rounded text-center text-[11px] font-mono text-amber-300">
              ⚡ 探棒：{multimeterStatusText}
            </div>
          )}
        </div>
      )}

      {/* Auto-Wire Wizard */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          自動佈線精靈 (Auto-Wire)
        </div>
        <button
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-bold transition-all shadow ${
            currentTool === 'autowire'
              ? 'bg-emerald-700 text-white border border-emerald-400 shadow-emerald-600/30'
              : 'bg-indigo-950/80 border border-indigo-700 text-indigo-300 hover:bg-indigo-900/80'
          } ${isPuzzleMode ? 'opacity-40 cursor-not-allowed select-none' : ''}`}
          onClick={() => {
            if (isPuzzleMode) {
              onShowAlert?.('🔒 解謎模式考驗玩家手動規劃最佳步數，自動佈線精靈已受封印！');
              return;
            }
            onSetTool('autowire');
          }}
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span>A* 智慧佈線 ({autowireCount} 點)</span>
          {isPuzzleMode && <Lock size={10} className="text-amber-400 ml-1" />}
        </button>

        {currentTool === 'autowire' && (
          <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <p className="text-[11px] text-slate-300 mb-2.5">
              請在棋盤上點擊設定關鍵路徑節點，完成後點擊「執行」。
            </p>
            <div className="flex gap-2">
              <button className={`flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-1.5 rounded-md font-semibold shadow`}
                onClick={onExecuteAutoWire}
              >
                ✅ 執行
              </button>
              <button
                className="flex-1 bg-rose-800 hover:bg-rose-700 text-white text-xs py-1.5 rounded-md font-semibold shadow"
                onClick={onClearAutoWire}
              >
                ❌ 清除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Common Editing Tools */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          共用編輯工具
        </div>

        <div className="flex gap-2 mb-2">
          <button
            className={`flex-1 p-2 rounded-lg flex justify-center items-center transition-all border ${
              currentTool === 'interact'
                ? 'bg-emerald-700 text-white border-emerald-400 shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="互動 / 設定數值"
            onClick={() => onSetTool('interact')}
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            className={`flex-1 p-2 rounded-lg flex justify-center items-center transition-all border ${
              currentTool === 'select'
                ? 'bg-emerald-700 text-white border-emerald-400 shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="框選區域"
            onClick={() => onSetTool('select')}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            className={`flex-1 p-2 rounded-lg flex justify-center items-center transition-all border ${
              currentTool === 'label'
                ? 'bg-emerald-700 text-white border-emerald-400 shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="設定多重接點標註"
            onClick={() => onSetTool('label')}
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            className={`flex-1 p-2 rounded-lg flex justify-center items-center transition-all border ${
              currentTool === 'move'
                ? 'bg-emerald-700 text-white border-emerald-400 shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="移動元件"
            onClick={() => onSetTool('move')}
          >
            <Move className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            className="flex-1 py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1"
            title="復原上一步 (Ctrl+Z)"
            onClick={onUndo}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>復原</span>
          </button>
          <button
            className="flex-1 py-1.5 px-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1"
            title="淨空全圖"
            onClick={onOpenClearConfirm}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>淨空</span>
          </button>
        </div>

        {/* Selection Bar */}
        <div className={`flex gap-2 mb-2 p-2 rounded-lg border transition-all ${
          hasSelection 
            ? 'bg-slate-950 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30' 
            : 'bg-slate-950/40 border-slate-800/80 opacity-60'
        }`}>
          <button
            disabled={!hasSelection}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all ${
              hasSelection
                ? 'bg-indigo-700 hover:bg-indigo-600 text-white shadow active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title={hasSelection ? "剪下選取區 (Ctrl+X)" : "請先使用框選工具選取區域"}
            onClick={onCutSelection}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>剪下</span>
          </button>
          <button
            disabled={!hasSelection}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all ${
              hasSelection
                ? 'bg-blue-700 hover:bg-blue-600 text-white shadow active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title={hasSelection ? "複製選取區 (Ctrl+C)" : "請先使用框選工具選取區域"}
            onClick={onCopySelection}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>複製</span>
          </button>
          <button
            disabled={!hasSelection}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all ${
              hasSelection
                ? 'bg-rose-700 hover:bg-rose-600 text-white shadow active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title={hasSelection ? "刪除選取區 (Delete)" : "請先使用框選工具選取區域"}
            onClick={onDeleteSelection}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>刪除</span>
          </button>
        </div>

        {/* Paste Bar */}
        {isPasting && (
          <div className="mb-2">
            <button
              className="w-full py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow animate-pulse"
              onClick={() => onSetTool('paste')}
            >
              <Clipboard className="w-4 h-4" />
              <span>正在貼上... (按 ESC 取消)</span>
            </button>
          </div>
        )}

        {/* Probe & Fault Tools */}
        <div className="flex gap-2 mt-2">
          <button
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1 transition-all border ${
              currentTool === 'multimeter'
                ? 'bg-amber-600 text-white border-amber-300'
                : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100 border-amber-700'
            }`}
            title="三用電表測量"
            onClick={() => onSetTool('multimeter')}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>測量</span>
          </button>
          <button
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1 transition-all border ${
              isFaultMode
                ? 'bg-rose-700 text-white border-rose-400 ring-2 ring-rose-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            } ${isPuzzleMode ? 'opacity-40 cursor-not-allowed select-none' : ''}`}
            title={isPuzzleMode ? "🔒 解謎模式旨在構建正確迴路，此模式下故障工具已封印" : "啟動/關閉故障模式"}
            onClick={() => {
              if (isPuzzleMode) {
                onShowAlert?.('🔒 解謎模式旨在構建正確電路，此模式下故障工具已封印！');
                return;
              }
              onToggleFaultMode();
            }}
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>設故障</span>
            {isPuzzleMode && <Lock size={9} className="text-amber-400 ml-0.5" />}
          </button>
        </div>

        {/* Fault Toolbar */}
        {isFaultMode && (
          <div className="flex gap-2 mt-2 p-2 bg-rose-950/40 border border-rose-800/80 rounded-lg">
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                currentTool === 'fault-open'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="設置斷路 (X)"
              onClick={() => onSetTool('fault-open')}
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>斷路</span>
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                currentTool === 'fault-short'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="設置短路 (跳線)"
              onClick={() => onSetTool('fault-short')}
            >
              <Link className="w-3.5 h-3.5 text-purple-400" />
              <span>短路</span>
            </button>
            <button
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
              title="清除所有故障"
              onClick={onClearFaults}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          </div>
        )}
      </div>

      {/* Wires & Misc */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('wires')}>
          <div className="flex items-center gap-1">共用導線與註解 (Wires & Misc)</div>
          {expanded['wires'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </div>
        <div className="grid grid-cols-3 gap-2" style={{ display: expanded['wires'] === false ? 'none' : 'grid' }}>
          <button
            className={`${isPlacementSelected('wire_straight') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2.5  rounded-lg flex justify-center items-center transition-all group`}
            title="直線導線 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_straight', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_straight')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot={isPlacementSelected('wire_straight') ? placementRotation : 0}
              style={{ transform: `rotate(${isPlacementSelected('wire_straight') ? placementRotation * 90 : 0}deg)` }}
              viewBox="0 0 24 24"
            >
              <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>

          <button className={`p-2.5 ${isPlacementSelected('wire_turn') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} border rounded-lg flex justify-center items-center transition-all group`}
            title="L型轉角 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_turn', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_turn')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot={isPlacementSelected('wire_turn') ? placementRotation : 0}
              style={{ transform: `rotate(${isPlacementSelected('wire_turn') ? placementRotation * 90 : 0}deg)` }}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2 L12 12 L22 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>

          <button className={`p-2.5 ${isPlacementSelected('wire_t') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} border rounded-lg flex justify-center items-center transition-all group`}
            title="┳型三通 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_t', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_t')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot={isPlacementSelected('wire_t') ? placementRotation : 0}
              style={{ transform: `rotate(${isPlacementSelected('wire_t') ? placementRotation * 90 : 0}deg)` }}
              viewBox="0 0 24 24"
            >
              <path
                d="M2 12 L22 12 M12 12 L12 22"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </button>

          <button className={`p-2.5 ${isPlacementSelected('wire_cross') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} border rounded-lg flex justify-center items-center transition-all group`}
            title="➕ 十字四通 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_cross', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_cross')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot={isPlacementSelected('wire_cross') ? placementRotation : 0}
              style={{ transform: `rotate(${isPlacementSelected('wire_cross') ? placementRotation * 90 : 0}deg)` }}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2 L12 22 M2 12 L22 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </button>

          <button className={`p-2.5 ${isPlacementSelected('wire_bridge') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} border rounded-lg flex justify-center items-center transition-all group`}
            title="🔀 絕緣天橋 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_bridge', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_bridge')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot={isPlacementSelected('wire_bridge') ? placementRotation : 0}
              style={{ transform: `rotate(${isPlacementSelected('wire_bridge') ? placementRotation * 90 : 0}deg)` }}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2 L12 22 M2 12 L7 12 M17 12 L22 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M7 12 A 5 5 0 0 1 17 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>

          <button
            className={`${isPlacementSelected('misc_blank') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2.5  rounded-lg flex justify-center items-center transition-all text-slate-300`}
            title="📝 空白註解單元"
            onClick={() => onSetPlacement('misc_blank')}
          >
            <span className="font-bold text-xs">Note</span>
          </button>
        </div>
      </div>

      {/* Mode Specific Tools */}
      {currentMode === 'electronic' && (
        <div className="p-3.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            電子元件 (Components)
          </div>
          <div className="space-y-1.5 mb-4">
            <button
              className={`${isPlacementSelected('power_12v') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('power_12v')}
            >
              <span className="text-rose-500 font-bold">🔋</span> 12V 直流電源
            </button>
            <button
              className={`${isPlacementSelected('power_ac') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('power_ac')}
            >
              <span className="text-amber-400 font-bold">⚡</span> 12V 交流電源 (AC)
            </button>
            <button
              className={`${isPlacementSelected('power_1_5v') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('power_1_5v')}
            >
              <span className="text-amber-500 font-bold">🔋</span> 1.5V 電池
            </button>
            <button
              className={`${isPlacementSelected('power_real') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('power_real')}
            >
              <span className="text-amber-400 font-bold">🔋</span> 含內阻電池 (EMF與內阻r)
            </button>
            <button
              className={`${isPlacementSelected('resistor_custom') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('resistor_custom')}
            >
              <span className="text-amber-600 font-bold">〰️</span> 固定電阻 (可設定)
            </button>
            <button
              className={`${isPlacementSelected('capacitor') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('capacitor')}
            >
              <span className="text-cyan-400 font-bold">╟╢</span> 電容器 (充放電延遲)
            </button>
            <button
              className={`${isPlacementSelected('inductor_standard') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('inductor_standard')}
            >
              <span className="text-amber-500 font-bold">⌇</span> 電感器 (自感線圈)
            </button>
            <button
              className={`${isPlacementSelected('diode_standard') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('diode_standard')}
            >
              <span className="text-cyan-400 font-bold">▷|</span> 整流二極體 (1N4007)
            </button>
            <button
              className={`${isPlacementSelected('resistor_var') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('resistor_var')}
            >
              <span className="text-amber-500 font-bold">🎛️</span> 滑動變阻器 (3接點)
            </button>
            <button
              className={`${isPlacementSelected('switch_spst') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('switch_spst')}
            >
              <span className="text-slate-300 font-bold">🕹️</span> 單刀開關 (SPST)
            </button>
            <button
              className={`${isPlacementSelected('load_lightbulb') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('load_lightbulb')}
            >
              <span className="text-yellow-500 font-bold">💡</span> 傳統白熾燈泡
            </button>
            <button
              className={`${isPlacementSelected('led_3v') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('led_3v')}
            >
              <span className="text-yellow-400 font-bold">🔴</span> 3V/20mA LED (極性)
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            量測儀表 (Meters)
          </div>
          <div className="space-y-1.5">
            <button
              className={`${isPlacementSelected('meter_g') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('meter_g')}
            >
              <span className="text-emerald-400 font-bold">Ⓖ</span> 靈敏檢流計 (微安培/中央零點)
            </button>
            <button
              className={`${isPlacementSelected('meter_osc') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('meter_osc')}
            >
              <span className="text-emerald-400 font-bold">📈</span> 示波器 (波形監測)
            </button>
            <button
              className={`${isPlacementSelected('meter_v') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('meter_v')}
            >
              <span className="text-emerald-400 font-bold">Ⓥ</span> 電壓表 (3接點)
            </button>
            <button
              className={`${isPlacementSelected('meter_a') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('meter_a')}
            >
              <span className="text-emerald-400 font-bold">Ⓐ</span> 電流表 (3接點)
            </button>
            <button
              className={`${isPlacementSelected('meter_w') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} w-full p-2  rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2`}
              onClick={() => onSetPlacement('meter_w')}
            >
              <span className="text-emerald-400 font-bold">Ⓦ</span> 功率表 (2接點)
            </button>
          </div>
        </div>
      )}

      {(currentMode === 'logic' || currentMode === 'tutorial') && (
        <div className="p-3.5 space-y-4">
          {/* Digital Logic Puzzle Mode Armory Status Banner */}
          {isLogicPuzzleMode && puzzleLevelDef && (
            <div className="p-3 bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/50 rounded-xl shadow-lg space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Puzzle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-200">
                    {puzzleLevelDef.tierName}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-purple-900/90 text-purple-300 px-2 py-0.5 rounded border border-purple-400/40">
                  階段 {puzzleTier} / 5
                </span>
              </div>
              <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-amber-500/30">
                <span className="shrink-0">✨ 本階段開放：</span>
                <span className="text-white truncate">{puzzleLevelDef.unlockedComponent}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock size={11} className="text-amber-400 shrink-0" />
                <span>未到達之新關卡邏輯閘與多餘模組已受封印</span>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>1. 訊號輸入 (Input)</span>
              {isLogicPuzzleMode && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 盤面已內建・封印
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {isLogicPuzzleMode && (
                <div className="p-2 bg-slate-950/70 border border-amber-500/30 rounded-lg text-[11px] text-amber-300/90 flex items-center gap-2 mb-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>解謎關卡輸入開關已固定於盤面，無需額外放置！</span>
                </div>
              )}
              <button
                className={`${getPlacementBtnClass('logic_power', isPlacementSelected('logic_power'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_power', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_power')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#f43f5e" strokeWidth="4" />
                  <circle cx="40" cy="40" r="10" fill="#f43f5e" />
                </svg>
                邏輯開關 (1出)
                {renderLockBadge('logic_power')}
              </button>
              <button
                className={`${getPlacementBtnClass('logic_pushbtn', isPlacementSelected('logic_pushbtn'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_pushbtn', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_pushbtn')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="20" fill="#374151" stroke="#f43f5e" strokeWidth="4" />
                  <circle cx="40" cy="40" r="12" fill="#ef4444" />
                </svg>
                邏輯按鈕 (回彈)
                {renderLockBadge('logic_pushbtn')}
              </button>
              <button
                className={`${getPlacementBtnClass('logic_clock', isPlacementSelected('logic_clock'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_clock', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_clock')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#0ea5e9" strokeWidth="4" />
                  <path d="M 30 50 L 30 30 L 40 30 L 40 50 L 50 50 L 50 30" stroke="#0ea5e9" strokeWidth="4" fill="none" />
                </svg>
                時脈產生器 (Clock)
                {renderLockBadge('logic_clock')}
              </button>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>2. 基礎邏輯閘 (Basic Gates)</span>
              {isLogicPuzzleMode && puzzleTier < 2 && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 第2階段解鎖
                </span>
              )}
              {isLogicPuzzleMode && puzzleTier === 2 && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  ✨ NOT已解鎖
                </span>
              )}
              {isLogicPuzzleMode && puzzleTier >= 3 && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  ✨ 全解鎖
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <button
                className={`${getPlacementBtnClass('gate_and', isPlacementSelected('gate_and'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_and', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_and')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 20 L 40 20 A 20 20 0 0 1 40 60 L 20 60 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                AND 閘
                {renderLockBadge('gate_and')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_or', isPlacementSelected('gate_or'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_or', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_or')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 20 Q 40 20 55 40 Q 40 60 20 60 Q 30 40 20 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                OR 閘
                {renderLockBadge('gate_or')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_not', isPlacementSelected('gate_not'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_not', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_not')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <polygon points="20,20 50,40 20,60" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="55" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NOT 閘
                {renderLockBadge('gate_not')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>3. 組合邏輯閘 (Universal/Derived)</span>
              {isLogicPuzzleMode && puzzleTier < 2 && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 第2階段解鎖
                </span>
              )}
              {isLogicPuzzleMode && puzzleTier >= 2 && puzzleTier < 4 && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 第4階段解鎖
                </span>
              )}
              {isLogicPuzzleMode && puzzleTier >= 4 && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  ✨ 已解鎖
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <button
                className={`${getPlacementBtnClass('gate_nand', isPlacementSelected('gate_nand'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_nand', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_nand')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 L 35 20 A 20 20 0 0 1 35 60 L 15 60 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="62" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NAND 閘
                {renderLockBadge('gate_nand')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_nor', isPlacementSelected('gate_nor'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_nor', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_nor')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 Q 35 20 50 40 Q 35 60 15 60 Q 25 40 15 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="58" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NOR 閘
                {renderLockBadge('gate_nor')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_xor', isPlacementSelected('gate_xor'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_xor', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_xor')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 Q 25 40 15 60" fill="none" stroke="#a855f7" strokeWidth="4" />
                  <path d="M 22 20 Q 42 20 57 40 Q 42 60 22 60 Q 32 40 22 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                XOR 閘
                {renderLockBadge('gate_xor')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_buffer', isPlacementSelected('gate_buffer'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_buffer', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_buffer')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <polygon points="20,20 55,40 20,60" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                Buffer 緩衝器
                {renderLockBadge('gate_buffer')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>4. 訊號輸出/顯示 (Output)</span>
              {isLogicPuzzleMode && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 終點已內建・封印
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {isLogicPuzzleMode && (
                <div className="p-2 bg-slate-950/70 border border-amber-500/30 rounded-lg text-[11px] text-amber-300/90 flex items-center gap-2 mb-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>解謎關卡目標輸出 LED 已固定於盤面，無需額外放置！</span>
                </div>
              )}
              <button
                className={`${getPlacementBtnClass('logic_led', isPlacementSelected('logic_led'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_led', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_led')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="18" fill="#374151" stroke="#fbbf24" strokeWidth="4" />
                </svg>
                邏輯燈泡 (1進)
                {renderLockBadge('logic_led')}
              </button>
              <button
                className={`${getPlacementBtnClass('logic_roman', isPlacementSelected('logic_roman'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_roman', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_roman')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#38bdf8" strokeWidth="4" />
                  <text x="40" y="48" fill="#38bdf8" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">I</text>
                </svg>
                羅馬數字顯示器 (I/V)
                {renderLockBadge('logic_roman')}
              </button>
              <button
                className={`${getPlacementBtnClass('logic_seg7', isPlacementSelected('logic_seg7'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('logic_seg7', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'logic_seg7')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#090d16" stroke="#ef4444" strokeWidth="4" />
                  <text x="40" y="48" fill="#ef4444" fontSize="26" fontFamily="monospace" textAnchor="middle" fontWeight="bold">8</text>
                </svg>
                七段顯示器 (BCD 7-Segment)
                {renderLockBadge('logic_seg7')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>5. 循序邏輯與正反器 (Flip-Flops)</span>
              {isLogicPuzzleMode && puzzleTier < 5 && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock size={9} /> 第5階段解鎖
                </span>
              )}
              {isLogicPuzzleMode && puzzleTier >= 5 && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  ✨ 已解鎖
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <button
                className={`${getPlacementBtnClass('gate_d_ff', isPlacementSelected('gate_d_ff'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_d_ff', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_d_ff')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
                  <text x="40" y="46" fill="#f8fafc" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">D-FF</text>
                </svg>
                D 型正反器 (D-FF)
                {renderLockBadge('gate_d_ff')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_t_ff', isPlacementSelected('gate_t_ff'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_t_ff', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_t_ff')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
                  <text x="40" y="46" fill="#f8fafc" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">T-FF</text>
                </svg>
                T 型正反器 (T-FF)
                {renderLockBadge('gate_t_ff')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_jk_ff', isPlacementSelected('gate_jk_ff'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_jk_ff', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_jk_ff')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
                  <text x="40" y="46" fill="#f8fafc" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">JK-FF</text>
                </svg>
                JK 型正反器 (JK-FF)
                {renderLockBadge('gate_jk_ff')}
              </button>
              <button
                className={`${getPlacementBtnClass('gate_d_latch', isPlacementSelected('gate_d_latch'))} w-full text-left`}
                onClick={(e) => handlePlacementClick('gate_d_latch', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'gate_d_latch')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
                  <text x="40" y="46" fill="#f8fafc" fontSize="12" fontFamily="Arial" textAnchor="middle" fontWeight="bold">LATCH</text>
                </svg>
                D 型閂鎖器 (D-Latch)
                {renderLockBadge('gate_d_latch')}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'wiring' && (
        <div className="p-3.5 space-y-3">
          {/* Puzzle Mode Armory Status Banner */}
          {isPuzzleMode && puzzleLevelDef && (
            <div className="p-3 bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/50 rounded-xl shadow-lg space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Puzzle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-200">
                    {puzzleLevelDef.tierName}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-purple-900/90 text-purple-300 px-2 py-0.5 rounded border border-purple-400/40">
                  階段 {puzzleTier} / 5
                </span>
              </div>
              <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-amber-500/30">
                <span className="shrink-0">✨ 本階段開放：</span>
                <span className="text-white truncate">{puzzleLevelDef.unlockedComponent}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock size={11} className="text-amber-400 shrink-0" />
                <span>未到達之新關卡元件與多餘模組已受封印</span>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-blue-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('power')}>
              <div className="flex items-center gap-1">
                <span>⚡ 電源與保護</span>
                {isPuzzleMode && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> 盤面已內建・封印
                  </span>
                )}
              </div>
              {expanded['power'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="grid grid-cols-2 gap-1.5" style={{ display: expanded['power'] === false ? 'none' : 'grid' }}>
              {isPuzzleMode && (
                <div className="col-span-2 p-2 bg-slate-950/70 border border-amber-500/30 rounded-lg text-[11px] text-amber-300/90 flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>解謎模式：起點 (L) 與零線 (N) 已固定於盤面，此區供電保護元件受封印。</span>
                </div>
              )}
              <button
                className={getPlacementBtnClass('wire_l', isPlacementSelected('wire_l'))}
                onClick={(e) => handlePlacementClick('wire_l', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'wire_l')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#f43f5e" strokeWidth="4" />
                  <text x="40" y="48" fill="#f43f5e" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L</text>
                </svg>
                L相(火線)
                {renderLockBadge('wire_l')}
              </button>
              <button
                className={getPlacementBtnClass('wire_n', isPlacementSelected('wire_n'))}
                onClick={(e) => handlePlacementClick('wire_n', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'wire_n')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                </svg>
                N相(零線)
                {renderLockBadge('wire_n')}
              </button>
              <button
                className={getPlacementBtnClass('wire_plus', isPlacementSelected('wire_plus'))}
                onClick={(e) => handlePlacementClick('wire_plus', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'wire_plus')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#f97316" strokeWidth="4" />
                  <text x="40" y="48" fill="#f97316" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                </svg>
                +24V (正極)
                {renderLockBadge('wire_plus')}
              </button>
              <button
                className={getPlacementBtnClass('wire_minus', isPlacementSelected('wire_minus'))}
                onClick={(e) => handlePlacementClick('wire_minus', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'wire_minus')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#6366f1" strokeWidth="4" />
                  <text x="40" y="48" fill="#6366f1" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                </svg>
                0V (負極)
                {renderLockBadge('wire_minus')}
              </button>
              <button
                className={getPlacementBtnClass('wire_ground', isPlacementSelected('wire_ground'))}
                onClick={(e) => handlePlacementClick('wire_ground', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'wire_ground')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="36" y="16" width="8" height="8" fill="#94a3b8" />
                  <path d="M 40 24 L 40 50 M 20 50 L 60 50 M 30 60 L 50 60 M 36 70 L 44 70" fill="none" stroke="#94a3b8" strokeWidth="4" />
                </svg>
                接地線
                {renderLockBadge('wire_ground')}
              </button>
              <button
                className={getPlacementBtnClass('breaker_mcb', isPlacementSelected('breaker_mcb'))}
                onClick={(e) => handlePlacementClick('breaker_mcb', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'breaker_mcb')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 20 L 40 30 M 40 50 L 40 60 M 30 30 C 45 30 50 50 30 50" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <circle cx="40" cy="20" r="4" fill="#c084fc" />
                  <circle cx="40" cy="60" r="4" fill="#c084fc" />
                </svg>
                斷路器2P
                {renderLockBadge('breaker_mcb')}
              </button>
              <button
                className={getPlacementBtnClass('breaker_3p', isPlacementSelected('breaker_3p'))}
                onClick={(e) => handlePlacementClick('breaker_3p', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'breaker_3p')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 20 L 40 30 M 40 50 L 40 60 M 30 30 C 45 30 50 50 30 50" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <circle cx="40" cy="20" r="4" fill="#c084fc" />
                  <circle cx="40" cy="60" r="4" fill="#c084fc" />
                </svg>
                斷路器3P
                {renderLockBadge('breaker_3p')}
              </button>
              <button
                className={getPlacementBtnClass('protection_ol_2p', isPlacementSelected('protection_ol_2p'))}
                onClick={(e) => handlePlacementClick('protection_ol_2p', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'protection_ol_2p')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 25 20 L 25 30 M 25 50 L 25 60" fill="none" stroke="#f87171" strokeWidth="3" />
                  <path d="M 20 30 L 30 30 L 30 50 L 20 50 Z" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 55 20 L 55 30 M 55 50 L 55 60" fill="none" stroke="#f87171" strokeWidth="3" />
                  <path d="M 50 30 L 60 30 L 60 50 L 50 50 Z" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 15 40 L 65 40" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
                OL 2P
                {renderLockBadge('protection_ol_2p')}
              </button>
              <button
                className={getPlacementBtnClass('protection_ol_3p', isPlacementSelected('protection_ol_3p'))}
                onClick={(e) => handlePlacementClick('protection_ol_3p', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'protection_ol_3p')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 20 L 20 30 M 20 50 L 20 60" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 16 30 L 24 30 L 24 50 L 16 50 Z" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 40 20 L 40 30 M 40 50 L 40 60" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 36 30 L 44 30 L 44 50 L 36 50 Z" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 60 20 L 60 30 M 60 50 L 60 60" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 56 30 L 64 30 L 64 50 L 56 50 Z" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 10 40 L 70 40" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
                OL 3P
                {renderLockBadge('protection_ol_3p')}
              </button>
              <button
                className={getPlacementBtnClass('protection_3e_relay', isPlacementSelected('protection_3e_relay'))}
                onClick={(e) => handlePlacementClick('protection_3e_relay', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'protection_3e_relay')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="15" y="25" width="50" height="30" fill="none" stroke="#f87171" strokeWidth="2" />
                  <text x="40" y="45" fill="#f87171" fontSize="12" fontFamily="Arial" textAnchor="middle" fontWeight="bold">3E</text>
                  <path d="M 25 10 L 25 25 M 40 10 L 40 25 M 55 10 L 55 25" fill="none" stroke="#f87171" strokeWidth="2" />
                  <path d="M 25 55 L 25 70 M 40 55 L 40 70" fill="none" stroke="#f87171" strokeWidth="2" />
                </svg>
                3E Relay
                {renderLockBadge('protection_3e_relay')}
              </button>
              <button
                className={getPlacementBtnClass('protection_converter', isPlacementSelected('protection_converter'))}
                onClick={(e) => handlePlacementClick('protection_converter', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'protection_converter')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="5" y="30" width="70" height="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <text x="35" y="44" fill="#f59e0b" fontSize="8" fontFamily="Arial" textAnchor="middle" fontWeight="bold">CONV</text>
                  <text x="65" y="25" fill="#f59e0b" fontSize="12" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                  <text x="65" y="65" fill="#f59e0b" fontSize="12" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                  <path d="M 15 10 L 15 70 M 35 10 L 35 70 M 55 10 L 55 70" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
                CONVERTER
                {renderLockBadge('protection_converter')}
              </button>
              <button
                className={getPlacementBtnClass('power_3phase', isPlacementSelected('power_3phase'))}
                onClick={(e) => handlePlacementClick('power_3phase', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'power_3phase')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="10" y="25" width="60" height="30" fill="none" stroke="#64748b" strokeWidth="3" />
                  <text x="25" y="45" fill="#ef4444" fontSize="16" fontFamily="Arial" textAnchor="middle" fontWeight="bold">R</text>
                  <text x="40" y="45" fill="#f59e0b" fontSize="16" fontFamily="Arial" textAnchor="middle" fontWeight="bold">S</text>
                  <text x="55" y="45" fill="#3b82f6" fontSize="16" fontFamily="Arial" textAnchor="middle" fontWeight="bold">T</text>
                  <line x1="25" y1="55" x2="25" y2="70" stroke="#ef4444" strokeWidth="3" />
                  <line x1="40" y1="55" x2="40" y2="70" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="55" y1="55" x2="55" y2="70" stroke="#3b82f6" strokeWidth="3" />
                </svg>
                三相電源 (R,S,T)
                {renderLockBadge('power_3phase')}
              </button>
              <button
                className={getPlacementBtnClass('power_psu', isPlacementSelected('power_psu'))}
                onClick={(e) => handlePlacementClick('power_psu', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'power_psu')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 20 60 L 60 20" fill="none" stroke="#64748b" strokeWidth="3" />
                  <text x="30" y="35" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">~</text>
                  <text x="50" y="55" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">=</text>
                  <text x="30" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L</text>
                  <text x="50" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                  <text x="30" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                  <text x="50" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                </svg>
                電源供應器
                {renderLockBadge('power_psu')}
              </button>
              <button
                className={getPlacementBtnClass('protection_fuse', isPlacementSelected('protection_fuse'))}
                onClick={(e) => handlePlacementClick('protection_fuse', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'protection_fuse')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="25" y="30" width="30" height="20" fill="none" stroke="#eab308" strokeWidth="4" />
                  <path d="M 20 40 L 60 40" fill="none" stroke="#eab308" strokeWidth="4" />
                </svg>
                保險絲
                {renderLockBadge('protection_fuse')}
              </button>
              <button
                className={getPlacementBtnClass('terminal_block', isPlacementSelected('terminal_block'))}
                onClick={(e) => handlePlacementClick('terminal_block', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'terminal_block')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="34" r="16" fill="#64748b" />
                  <path d="M 40 50 L 40 70" fill="none" stroke="#64748b" strokeWidth="4" />
                  <text x="40" y="40" fill="#ffffff" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">TB</text>
                </svg>
                端子台 (跳接)
                {renderLockBadge('terminal_block')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('input')}>
              <div className="flex items-center gap-1">
                <span>🔘 輸入開關</span>
                {isPuzzleMode && puzzleTier < 2 && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> 第2階段解鎖
                  </span>
                )}
                {isPuzzleMode && puzzleTier >= 2 && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    ✨ 已解鎖
                  </span>
                )}
              </div>
              {expanded['input'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="grid grid-cols-2 gap-1.5" style={{ display: expanded['input'] === false ? 'none' : 'grid' }}>
              {isPuzzleMode && puzzleTier < 2 && (
                <div className="col-span-2 p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-[11px] text-purple-200 flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>封印中：需到達第 2 階段（按鈕與邏輯接點）才能解除開關封印！</span>
                </div>
              )}
              <button
                className={getPlacementBtnClass('btn_no', isPlacementSelected('btn_no'))}
                onClick={(e) => handlePlacementClick('btn_no', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'btn_no')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 15 30 L 15 50 M 15 30 L 20 30 M 15 40 L 20 40 M 15 50 L 20 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <path d="M 20 40 L 35 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                NO 按鈕
                {renderLockBadge('btn_no')}
              </button>
              <button
                className={getPlacementBtnClass('btn_nc', isPlacementSelected('btn_nc'))}
                onClick={(e) => handlePlacementClick('btn_nc', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'btn_nc')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 25 30 L 25 50 M 25 30 L 30 30 M 25 40 L 30 40 M 25 50 L 30 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <path d="M 30 40 L 40 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                NC 按鈕
                {renderLockBadge('btn_nc')}
              </button>
              <button
                className={getPlacementBtnClass('btn_toggle', isPlacementSelected('btn_toggle'))}
                onClick={(e) => handlePlacementClick('btn_toggle', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'btn_toggle')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 20 25 L 16 25 L 16 55 L 12 55" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <path d="M 20 40 L 35 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                交替開關
                {renderLockBadge('btn_toggle')}
              </button>
              <button
                className={getPlacementBtnClass('switch_sel13', isPlacementSelected('switch_sel13'))}
                onClick={(e) => handlePlacementClick('switch_sel13', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'switch_sel13')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 L 32 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 32 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 15 40 L 32 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M 15 30 L 10 30 L 10 50 L 5 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                選擇開關
                {renderLockBadge('switch_sel13')}
              </button>
              <button
                className={getPlacementBtnClass('switch_4way', isPlacementSelected('switch_4way'))}
                onClick={(e) => handlePlacementClick('switch_4way', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'switch_4way')}
              >
                <svg width="32" height="48" viewBox="0 0 80 120" className="wire-svg shrink-0">
                  {/* Top Left 1 */}
                  <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                  <text x="28" y="24" fill="#10b981" fontSize="16" fontWeight="bold">1</text>
                  <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Top Right 3 */}
                  <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                  <text x="68" y="24" fill="#10b981" fontSize="16" fontWeight="bold">3</text>
                  <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Left 2 */}
                  <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                  <text x="28" y="104" fill="#10b981" fontSize="16" fontWeight="bold">2</text>
                  <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Right 4 */}
                  <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />
                  <text x="68" y="104" fill="#10b981" fontSize="16" fontWeight="bold">4</text>
                  <path d="M 60 110 L 60 100 L 50 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                  {/* Switch Arms */}
                  <path d="M 30 80 L 50 40" fill="none" stroke="#94a3b8" strokeWidth="3" />
                  <path d="M 50 80 L 30 40" fill="none" stroke="#94a3b8" strokeWidth="3" />

                  {/* Button linkage */}
                  <path d="M 40 60 L 15 60" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M 15 50 L 10 50 L 10 70 L 5 70" fill="none" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                四路按鈕
                {renderLockBadge('switch_4way')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-yellow-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('relay')}>
              <div className="flex items-center gap-1">
                <span>🧲 控制與繼電器</span>
                {isPuzzleMode && puzzleTier < 3 && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> 第3階段解鎖
                  </span>
                )}
                {isPuzzleMode && puzzleTier >= 3 && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    ✨ 部分解鎖
                  </span>
                )}
              </div>
              {expanded['relay'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="grid grid-cols-2 gap-1.5" style={{ display: expanded['relay'] === false ? 'none' : 'grid' }}>
              {isPuzzleMode && puzzleTier < 3 && (
                <div className="col-span-2 p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-[11px] text-purple-200 flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>封印中：需到達第 3 階段（電磁接觸器與自保持）才能解除繼電器封印！</span>
                </div>
              )}
              <button
                className={getPlacementBtnClass('relay_no', isPlacementSelected('relay_no'))}
                onClick={(e) => handlePlacementClick('relay_no', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_no')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                萬用 NO
                {renderLockBadge('relay_no')}
              </button>
              <button
                className={getPlacementBtnClass('relay_nc', isPlacementSelected('relay_nc'))}
                onClick={(e) => handlePlacementClick('relay_nc', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_nc')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                萬用 NC
                {renderLockBadge('relay_nc')}
              </button>
              <button
                className={getPlacementBtnClass('relay_ton_no', isPlacementSelected('relay_ton_no'))}
                onClick={(e) => handlePlacementClick('relay_ton_no', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_ton_no')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 45 L 28 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 34 33 L 24 33 M 24 27 A 6 6 0 0 0 24 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TON-ON
                {renderLockBadge('relay_ton_no')}
              </button>
              <button
                className={getPlacementBtnClass('relay_ton_nc', isPlacementSelected('relay_ton_nc'))}
                onClick={(e) => handlePlacementClick('relay_ton_nc', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_ton_nc')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 45 L 52 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 46 33 L 36 33 M 36 27 A 6 6 0 0 0 36 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TON-NC
                {renderLockBadge('relay_ton_nc')}
              </button>
              <button
                className={getPlacementBtnClass('relay_tof_no', isPlacementSelected('relay_tof_no'))}
                onClick={(e) => handlePlacementClick('relay_tof_no', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_tof_no')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 45 L 28 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 34 33 L 24 33 M 24 27 A 6 6 0 0 1 24 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TOF-ON
                {renderLockBadge('relay_tof_no')}
              </button>
              <button
                className={getPlacementBtnClass('relay_tof_nc', isPlacementSelected('relay_tof_nc'))}
                onClick={(e) => handlePlacementClick('relay_tof_nc', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_tof_nc')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 60 L 40 45 L 52 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 46 33 L 36 33 M 36 27 A 6 6 0 0 1 36 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TOF-NC
                {renderLockBadge('relay_tof_nc')}
              </button>
              <button
                className={getPlacementBtnClass('relay_con', isPlacementSelected('relay_con'))}
                onClick={(e) => handlePlacementClick('relay_con', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_con')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 20 L 30 60" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                萬用 CON
                {renderLockBadge('relay_con')}
              </button>
              <button
                className={getPlacementBtnClass('relay_coil', isPlacementSelected('relay_coil'))}
                onClick={(e) => handlePlacementClick('relay_coil', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_coil')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" />
                  <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#f59e0b" strokeWidth="4" />
                </svg>
                繼電器線圈
                {renderLockBadge('relay_coil')}
              </button>
              <button
                className={getPlacementBtnClass('relay_ton_con', isPlacementSelected('relay_ton_con'))}
                onClick={(e) => handlePlacementClick('relay_ton_con', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_ton_con')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 21 L 34 55" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 37 38 L 27 38 M 27 32 A 6 6 0 0 0 27 44" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TON-CON
                {renderLockBadge('relay_ton_con')}
              </button>
              <button
                className={getPlacementBtnClass('relay_flash_coil', isPlacementSelected('relay_flash_coil'))}
                onClick={(e) => handlePlacementClick('relay_flash_coil', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_flash_coil')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="24" y="24" width="32" height="32" rx="4" fill="none" stroke="#fde047" strokeWidth="4" />
                  <path d="M 12 40 L 24 40 M 56 40 L 68 40" fill="none" stroke="#fde047" strokeWidth="4" />
                  <text x="40" y="45" fill="#fde047" fontSize="16" fontWeight="bold" textAnchor="middle">F</text>
                </svg>
                閃爍繼電器
                {renderLockBadge('relay_flash_coil')}
              </button>
              <button
                className={getPlacementBtnClass('relay_tof_con', isPlacementSelected('relay_tof_con'))}
                onClick={(e) => handlePlacementClick('relay_tof_con', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_tof_con')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 40 21 L 34 55" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M 37 38 L 27 38 M 27 32 A 6 6 0 0 1 27 44" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
                TOF-CON
                {renderLockBadge('relay_tof_con')}
              </button>
              <button
                className={getPlacementBtnClass('relay_impulse_coil', isPlacementSelected('relay_impulse_coil'))}
                onClick={(e) => handlePlacementClick('relay_impulse_coil', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_impulse_coil')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#be123c" strokeWidth="4" />
                  <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#be123c" strokeWidth="4" />
                  <text x="40" y="45" fill="#be123c" fontSize="16" fontWeight="bold" textAnchor="middle">P</text>
                </svg>
                脈衝繼電器
                {renderLockBadge('relay_impulse_coil')}
              </button>
              <button
                className={getPlacementBtnClass('relay_counter_coil', isPlacementSelected('relay_counter_coil'))}
                onClick={(e) => handlePlacementClick('relay_counter_coil', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_counter_coil')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#22d3ee" strokeWidth="4" />
                  <path d="M 20 40 L 24 40 M 56 40 L 60 40 M 40 20 L 40 24" fill="none" stroke="#22d3ee" strokeWidth="4" />
                  <text x="40" y="45" fill="#22d3ee" fontSize="16" fontWeight="bold" textAnchor="middle">C</text>
                </svg>
                計數器繼電器
                {renderLockBadge('relay_counter_coil')}
              </button>
              <button
                className={`${getPlacementBtnClass('relay_mc_no_2', isPlacementSelected('relay_mc_no_2'))} col-span-2`}
                onClick={(e) => handlePlacementClick('relay_mc_no_2', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_mc_no_2')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="17" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 20 10 L 20 20 M 20 70 L 20 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 20 60 L 10 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                  <rect x="57" y="57" width="6" height="6" fill="#94a3b8" />
                  <path d="M 60 10 L 60 20 M 60 70 L 60 60" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 60 60 L 50 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  <path d="M 15 40 L 65 40" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                MC用 2路 A接點
                {renderLockBadge('relay_mc_no_2')}
              </button>
              <button
                className={`${getPlacementBtnClass('relay_mc_no_3', isPlacementSelected('relay_mc_no_3'))} col-span-2`}
                onClick={(e) => handlePlacementClick('relay_mc_no_3', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'relay_mc_no_3')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="17" y="17" width="4" height="6" fill="#94a3b8" />
                  <rect x="17" y="57" width="4" height="6" fill="#94a3b8" />
                  <path d="M 19 10 L 19 20 M 19 70 L 19 60" fill="none" stroke="#64748b" strokeWidth="2" />
                  <path d="M 19 60 L 13 20" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  
                  <rect x="38" y="17" width="4" height="6" fill="#94a3b8" />
                  <rect x="38" y="57" width="4" height="6" fill="#94a3b8" />
                  <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="2" />
                  <path d="M 40 60 L 34 20" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  
                  <rect x="59" y="17" width="4" height="6" fill="#94a3b8" />
                  <rect x="59" y="57" width="4" height="6" fill="#94a3b8" />
                  <path d="M 61 10 L 61 20 M 61 70 L 61 60" fill="none" stroke="#64748b" strokeWidth="2" />
                  <path d="M 61 60 L 55 20" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  
                  <path d="M 16 40 L 64 40" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                MC用 3路 A接點
                {renderLockBadge('relay_mc_no_3')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-amber-500 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('output')}>
              <div className="flex items-center gap-1">
                <span>💡 輸出負載</span>
                {isPuzzleMode && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> 終點已內建・封印
                  </span>
                )}
              </div>
              {expanded['output'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="grid grid-cols-2 gap-1.5" style={{ display: expanded['output'] === false ? 'none' : 'grid' }}>
              {isPuzzleMode && (
                <div className="col-span-2 p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-[11px] text-purple-200 flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>解謎關卡起終點已固定負載（指示燈/馬達），此區元件受魔法封印。</span>
                </div>
              )}
              <button
                className={getPlacementBtnClass('motor', isPlacementSelected('motor'))}
                onClick={(e) => handlePlacementClick('motor', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'motor')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#fbbf24" strokeWidth="4" />
                  <text x="40" y="48" fill="#fbbf24" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">M</text>
                </svg>
                馬達(M)
                {renderLockBadge('motor')}
              </button>
              <button
                className={getPlacementBtnClass('motor_3phase', isPlacementSelected('motor_3phase'))}
                onClick={(e) => handlePlacementClick('motor_3phase', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'motor_3phase')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#ef4444" strokeWidth="4" />
                  <text x="40" y="48" fill="#ef4444" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">3~</text>
                </svg>
                三相馬達(3)
                {renderLockBadge('motor_3phase')}
              </button>
              <button
                className={getPlacementBtnClass('platform_main', isPlacementSelected('platform_main'))}
                onClick={(e) => handlePlacementClick('platform_main', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'platform_main')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="15" y="25" width="50" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <circle cx="25" cy="40" r="4" fill="#c084fc" />
                  <circle cx="40" cy="40" r="4" fill="#c084fc" />
                  <circle cx="55" cy="40" r="4" fill="#c084fc" />
                </svg>
                電動滑台(3)
                {renderLockBadge('platform_main')}
              </button>
              <button
                className={getPlacementBtnClass('load_lightbulb', isPlacementSelected('load_lightbulb'))}
                onClick={(e) => handlePlacementClick('load_lightbulb', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'load_lightbulb')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#facc15" strokeWidth="4" />
                  <path d="M 28 28 L 52 52 M 28 52 L 52 28" fill="none" stroke="#facc15" strokeWidth="4" />
                </svg>
                指示燈
                {renderLockBadge('load_lightbulb')}
              </button>
              <button
                className={getPlacementBtnClass('load_buzzer', isPlacementSelected('load_buzzer'))}
                onClick={(e) => handlePlacementClick('load_buzzer', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'load_buzzer')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 25 30 L 40 30 L 40 50 L 25 50 Z M 40 30 L 55 15 L 55 65 L 40 50" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                </svg>
                蜂鳴器
                {renderLockBadge('load_buzzer')}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-cyan-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('other')}>
              <div className="flex items-center gap-1">
                <span>💨 空壓機電元件</span>
                {isPuzzleMode && (
                  <span className="text-[10px] text-cyan-400 font-bold bg-slate-900 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> 未開放氣壓・封印
                  </span>
                )}
              </div>
              {expanded['other'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="grid grid-cols-2 gap-1.5" style={{ display: expanded['other'] === false ? 'none' : 'grid' }}>
              {isPuzzleMode && (
                <div className="col-span-2 p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-200 flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>此工業配線單元未開放氣壓迴路，此區元件受封印。</span>
                </div>
              )}
              <button
                className={getPlacementBtnClass('pneumatic_air_source', isPlacementSelected('pneumatic_air_source'))}
                onClick={(e) => handlePlacementClick('pneumatic_air_source', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_air_source')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 25 L 55 50 L 25 50 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
                  <circle cx="40" cy="38" r="4" fill="#22d3ee" />
                </svg>
                氣壓源
                {renderLockBadge('pneumatic_air_source')}
              </button>
              <button
                className={getPlacementBtnClass('pneumatic_valve_coil', isPlacementSelected('pneumatic_valve_coil'))}
                onClick={(e) => handlePlacementClick('pneumatic_valve_coil', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_valve_coil')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="25" y="25" width="30" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <path d="M 25 55 L 55 25" fill="none" stroke="#c084fc" strokeWidth="4" />
                </svg>
                閥線圈
                {renderLockBadge('pneumatic_valve_coil')}
              </button>
              <button
                className={getPlacementBtnClass('pneumatic_valve_52', isPlacementSelected('pneumatic_valve_52'))}
                onClick={(e) => handlePlacementClick('pneumatic_valve_52', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_valve_52')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <path d="M 25 45 L 35 35 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                </svg>
                5/2閥 單線圈
                {renderLockBadge('pneumatic_valve_52')}
              </button>
              <button
                className={getPlacementBtnClass('pneumatic_valve_52_double', isPlacementSelected('pneumatic_valve_52_double'))}
                onClick={(e) => handlePlacementClick('pneumatic_valve_52_double', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_valve_52_double')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <path d="M 25 35 L 35 45 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                </svg>
                5/2閥 雙線圈
                {renderLockBadge('pneumatic_valve_52_double')}
              </button>
              <button
                className={getPlacementBtnClass('pneumatic_cylinder', isPlacementSelected('pneumatic_cylinder'))}
                onClick={(e) => handlePlacementClick('pneumatic_cylinder', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_cylinder')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                  <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                </svg>
                雙動氣壓缸(3)
                {renderLockBadge('pneumatic_cylinder')}
              </button>
              <button
                className={getPlacementBtnClass('pneumatic_cylinder_single', isPlacementSelected('pneumatic_cylinder_single'))}
                onClick={(e) => handlePlacementClick('pneumatic_cylinder_single', e.currentTarget)}
                onContextMenu={(e) => handleRotateToolWithLock(e, 'pneumatic_cylinder_single')}
              >
                <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                  <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                  <path d="M 23 35 L 26 45 L 29 35 L 32 45" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
                單動氣壓缸(3)
                {renderLockBadge('pneumatic_cylinder_single')}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'plc' && (
        <div className="p-3.5 space-y-3">
          {/* Sub-tab toggle buttons */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-3 shadow-inner">
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                plcSubTab === 'wiring'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              onClick={() => setPlcSubTab('wiring')}
            >
              ⚡ 工業配線
            </button>
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                plcSubTab === 'ladder'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              onClick={() => setPlcSubTab('ladder')}
            >
              🧩 階梯圖
            </button>
          </div>

          {plcSubTab === 'wiring' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                外部硬體與工業配線元件
              </div>

              {/* PLC Controller & Power */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1 flex justify-between items-center cursor-pointer select-none" onClick={() => toggleExpanded('plc_power')}>
                  <span>主機與電源</span>
                  {expanded['plc_power'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ display: expanded['plc_power'] === false ? 'none' : 'grid' }}>
                  <button
                    className={`p-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-lg text-xs text-indigo-200 flex items-center gap-1.5 font-bold shadow col-span-2`}
                    onClick={() => onSetPlacement('plc_unit')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#6366f1" strokeWidth="4" />
                      <text x="40" y="48" fill="#6366f1" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">PLC</text>
                    </svg>
                    NPN PLC 主機 (4x10)
                  </button>
                  <button
                    className={`${isPlacementSelected('wire_l') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('wire_l')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#f43f5e" strokeWidth="4" />
                      <text x="40" y="48" fill="#f43f5e" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L1</text>
                    </svg>
                    L1 (火線)
                  </button>
                  <button
                    className={`${isPlacementSelected('wire_n') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('wire_n')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                      <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L2</text>
                    </svg>
                    L2 (零線)
                  </button>
                  <button
                    className={`${isPlacementSelected('power_dc24') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('power_dc24')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#10b981" strokeWidth="4" />
                      <text x="40" y="48" fill="#10b981" fontSize="18" fontFamily="Arial" textAnchor="middle" fontWeight="bold">24V</text>
                    </svg>
                    24V 電源
                  </button>
                  <button
                    className={`${isPlacementSelected('power_psu') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('power_psu')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="20" width="40" height="40" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 20 60 L 60 20" fill="none" stroke="#64748b" strokeWidth="3" />
                      <text x="30" y="35" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">~</text>
                      <text x="50" y="55" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">=</text>
                      <text x="30" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L</text>
                      <text x="50" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                      <text x="30" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                      <text x="50" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                    </svg>
                    電源供應器
                  </button>
                  <button
                    className={`${isPlacementSelected('breaker') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('breaker')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 40 20 L 40 30 M 40 50 L 40 60 M 30 30 C 45 30 50 50 30 50" fill="none" stroke="#c084fc" strokeWidth="4" />
                      <circle cx="40" cy="20" r="4" fill="#c084fc" />
                      <circle cx="40" cy="60" r="4" fill="#c084fc" />
                    </svg>
                    MCB 開關
                  </button>
                </div>
              </div>

              {/* Switches & Buttons */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1 flex justify-between items-center cursor-pointer select-none" onClick={() => toggleExpanded('plc_input')}>
                  <span>開關與按鈕</span>
                  {expanded['plc_input'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ display: expanded['plc_input'] === false ? 'none' : 'grid' }}>
                  <button
                    className={`${isPlacementSelected('btn_no') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('btn_no')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 15 30 L 15 50 M 15 30 L 20 30 M 15 40 L 20 40 M 15 50 L 20 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 20 40 L 35 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                    按鈕 (NO)
                  </button>
                  <button
                    className={`${isPlacementSelected('btn_nc') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('btn_nc')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 25 30 L 25 50 M 25 30 L 30 30 M 25 40 L 30 40 M 25 50 L 30 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 30 40 L 40 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                    按鈕 (NC)
                  </button>
                  <button
                    className={`${isPlacementSelected('btn_toggle') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('btn_toggle')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 20 25 L 16 25 L 16 55 L 12 55" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 20 40 L 35 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                    交替開關
                  </button>
                  <button
                    className={`${isPlacementSelected('switch_sel13') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2 rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('switch_sel13')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 L 32 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 32 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 15 40 L 32 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M 15 30 L 10 30 L 10 50 L 5 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    選擇開關
                  </button>
                  <button
                    className={`${isPlacementSelected('switch_4way') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2 rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('switch_4way')}
                  >
                    <svg width="32" height="48" viewBox="0 0 80 120" className="wire-svg shrink-0">
                      <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                      <text x="28" y="24" fill="#10b981" fontSize="16" fontWeight="bold">1</text>
                      <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                      <text x="68" y="24" fill="#10b981" fontSize="16" fontWeight="bold">3</text>
                      <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                      <text x="28" y="104" fill="#10b981" fontSize="16" fontWeight="bold">2</text>
                      <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />
                      <text x="68" y="104" fill="#10b981" fontSize="16" fontWeight="bold">4</text>
                      <path d="M 60 110 L 60 100 L 50 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                      <path d="M 30 80 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 50 80 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                      <path d="M 40 60 L 15 60" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M 15 50 L 10 50 L 10 70 L 5 70" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    四路按鈕
                  </button>
                </div>
              </div>

              {/* Relays & Coils */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1 flex justify-between items-center cursor-pointer select-none" onClick={() => toggleExpanded('plc_relay')}>
                  <span>繼電器與控制線圈</span>
                  {expanded['plc_relay'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ display: expanded['plc_relay'] === false ? 'none' : 'grid' }}>
                  <button
                    className={`${isPlacementSelected('relay_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" />
                      <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#f59e0b" strokeWidth="4" />
                    </svg>
                    繼電器線圈
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_counter_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_counter_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#22d3ee" strokeWidth="4" />
                      <path d="M 20 40 L 24 40 M 56 40 L 60 40 M 40 20 L 40 24" fill="none" stroke="#22d3ee" strokeWidth="4" />
                      <text x="40" y="45" fill="#22d3ee" fontSize="16" fontWeight="bold" textAnchor="middle">C</text>
                    </svg>
                    計數器繼電器
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_flash_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_flash_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="24" y="24" width="32" height="32" rx="4" fill="none" stroke="#fde047" strokeWidth="4" />
                      <path d="M 12 40 L 24 40 M 56 40 L 68 40" fill="none" stroke="#fde047" strokeWidth="4" />
                      <text x="40" y="45" fill="#fde047" fontSize="16" fontWeight="bold" textAnchor="middle">F</text>
                    </svg>
                    閃爍繼電器
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_impulse_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_impulse_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#be123c" strokeWidth="4" />
                      <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#be123c" strokeWidth="4" />
                      <text x="40" y="45" fill="#be123c" fontSize="16" fontWeight="bold" textAnchor="middle">P</text>
                    </svg>
                    脈衝繼電器
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_flash_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_flash_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="24" y="24" width="32" height="32" rx="4" fill="none" stroke="#fde047" strokeWidth="4" />
                      <path d="M 12 40 L 24 40 M 56 40 L 68 40" fill="none" stroke="#fde047" strokeWidth="4" />
                      <text x="40" y="45" fill="#fde047" fontSize="16" fontWeight="bold" textAnchor="middle">F</text>
                    </svg>
                    閃爍繼電器
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_impulse_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_impulse_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#be123c" strokeWidth="4" />
                      <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#be123c" strokeWidth="4" />
                      <text x="40" y="45" fill="#be123c" fontSize="16" fontWeight="bold" textAnchor="middle">P</text>
                    </svg>
                    脈衝繼電器
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_valve_coil') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_valve_coil')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="25" y="25" width="30" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                      <path d="M 25 55 L 55 25" fill="none" stroke="#c084fc" strokeWidth="4" />
                    </svg>
                    電磁閥線圈
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_ton_no') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_ton_no')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 45 L 28 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 34 33 L 24 33 M 24 27 A 6 6 0 0 0 24 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TON-NO
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_ton_nc') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_ton_nc')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 45 L 52 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 46 33 L 36 33 M 36 27 A 6 6 0 0 0 36 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TON-NC
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_ton_con') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_ton_con')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 21 L 34 55" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 37 38 L 27 38 M 27 32 A 6 6 0 0 0 27 44" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TON-CON
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_tof_no') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_tof_no')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 45 L 28 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 34 33 L 24 33 M 24 27 A 6 6 0 0 1 24 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TOF-NO
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_tof_nc') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_tof_nc')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 45 L 52 21" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 46 33 L 36 33 M 36 27 A 6 6 0 0 1 36 39" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TOF-NC
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_tof_con') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_tof_con')}>
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 21 L 34 55" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 37 38 L 27 38 M 27 32 A 6 6 0 0 1 27 44" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    TOF-CON
                  </button>
<button
                    className={`${isPlacementSelected('relay_con') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_con')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
  <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
  <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
  <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
  
  {/* Terminal extensions */}
  <path d="M 40 10 L 40 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
  
  {/* Switch arm to NC */}
  <path d="M 40 20 L 30 60" fill="none" stroke="#cbd5e1" strokeWidth="3" />
</svg>
                    萬用 CON
                  </button>
                                    <button
                    className={`${isPlacementSelected('relay_no') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_no')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 30 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    繼電器 NO
                  </button>
                  <button
                    className={`${isPlacementSelected('relay_nc') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('relay_nc')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 40 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    </svg>
                    繼電器 NC
                  </button>
                </div>
              </div>

              {/* Loads & Actuators */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1 flex justify-between items-center cursor-pointer select-none" onClick={() => toggleExpanded('plc_output')}>
                  <span>負載與氣壓</span>
                  {expanded['plc_output'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ display: expanded['plc_output'] === false ? 'none' : 'grid' }}>
                  <button
                    className={`${isPlacementSelected('load_lightbulb') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('load_lightbulb')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#facc15" strokeWidth="4" />
                      <path d="M 28 28 L 52 52 M 28 52 L 52 28" fill="none" stroke="#facc15" strokeWidth="4" />
                    </svg>
                    指示燈
                  </button>
                  <button
                    className={`${isPlacementSelected('load_buzzer') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('load_buzzer')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 25 30 L 40 30 L 40 50 L 25 50 Z M 40 30 L 55 15 L 55 65 L 40 50" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                    </svg>
                    蜂鳴器
                  </button>
                  <button
                    className={`${isPlacementSelected('motor') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('motor')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#fbbf24" strokeWidth="4" />
                      <text x="40" y="48" fill="#fbbf24" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">M</text>
                    </svg>
                    馬達
                  </button>
                  <button
                    className={`${isPlacementSelected('terminal') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('terminal')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="34" r="16" fill="#64748b" />
                      <path d="M 40 50 L 40 70" fill="none" stroke="#64748b" strokeWidth="4" />
                      <text x="40" y="40" fill="#ffffff" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">TB</text>
                    </svg>
                    端子台 (跳接)
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_air_source') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_air_source')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 40 25 L 55 50 L 25 50 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
                      <circle cx="40" cy="38" r="4" fill="#22d3ee" />
                    </svg>
                    氣源
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_valve_52') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_valve_52')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <path d="M 25 45 L 35 35 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                    5/2閥 單線圈
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_valve_52_double') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_valve_52_double')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <path d="M 25 35 L 35 45 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                    5/2閥 雙線圈
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_cylinder') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2 rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_cylinder')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                      <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    </svg>
                    雙動氣壓缸 (3格)
                  </button>
                  <button
                    className={`${isPlacementSelected('pneumatic_cylinder_single') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2 rounded-lg text-xs text-slate-200 flex items-center gap-1.5`}
                    onClick={() => onSetPlacement('pneumatic_cylinder_single')}
                  >
                    <svg width="32" height="32" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                      <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                      <path d="M 23 35 L 26 45 L 29 35 L 32 45" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                    </svg>
                    單動氣壓缸 (3格)
                  </button>
                </div>
              </div>
            </div>
          )}

          {plcSubTab === 'ladder' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-400 mb-1.5 flex items-center justify-between uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleExpanded('plc_ladder')}>
                <div className="flex items-center gap-1">階梯圖邏輯元件 (Ladder Diagram)</div>
                {expanded['plc_ladder'] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </div>
              <div className="grid grid-cols-3 gap-2" style={{ display: expanded['plc_ladder'] === false ? 'none' : 'grid' }}>
                <button
                  className={`${isPlacementSelected('plc_no') ? 'bg-amber-600/40 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-amber-600/50'} p-2.5  text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1`}
                  onClick={() => onSetPlacement('plc_no')}
                >
                  <span className="text-base font-mono text-amber-400">-[ ]-</span>
                  <span>A 接點</span>
                </button>
                <button
                  className={`${isPlacementSelected('plc_nc') ? 'bg-amber-600/40 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-amber-600/50'} p-2.5  text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1`}
                  onClick={() => onSetPlacement('plc_nc')}
                >
                  <span className="text-base font-mono text-amber-400">-[/]-</span>
                  <span>B 接點</span>
                </button>
                <button
                  className={`${isPlacementSelected('plc_out') ? 'bg-amber-600/40 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-amber-600/50'} p-2.5  text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1`}
                  onClick={() => onSetPlacement('plc_out')}
                >
                  <span className="text-base font-mono text-amber-400">-( )-</span>
                  <span>輸出</span>
                </button>
                <button
                  className={`${isPlacementSelected('plc_pls') ? 'bg-amber-600/40 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-amber-600/50'} p-2.5  text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1`}
                  onClick={() => onSetPlacement('plc_pls')}
                >
                  <span className="text-base font-mono text-emerald-400">-[ P ]-</span>
                  <span>上微分</span>
                </button>
                <button
                  className={`${isPlacementSelected('plc_plf') ? 'bg-amber-600/40 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-amber-600/50'} p-2.5  text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1`}
                  onClick={() => onSetPlacement('plc_plf')}
                >
                  <span className="text-base font-mono text-rose-400">-[ N ]-</span>
                  <span>下微分</span>
                </button>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-700/60 rounded-xl shadow-inner space-y-2">
                <div className="text-amber-400 font-bold text-xs flex items-center gap-1">
                  💡 階梯圖編輯規範
                </div>
                <div className="text-amber-200/90 text-[11px] leading-relaxed space-y-1.5">
                  <p>1. <strong>邊界限制：</strong>階梯圖元件只能放置於左側階梯圖區域，工業配線元件放置於右側。</p>
                  <p>2. <strong>方向固定：</strong>階梯圖元件固定為水平方向，無法旋轉。</p>
                  <p>3. <strong>共用導線：</strong>階梯圖可直接使用下方共用導線連接組件。</p>
                  <p>4. <strong>輸出接點：</strong>輸出 (Coil) 只要連接左側導線即可通電。</p>
                  <p>5. <strong>自由標註：</strong>A/B 接點與輸出不設預設數值，點擊標註工具即可自訂 X0~X7 或 Y0~Y7！</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
