/**
 * @license
 * RightSidebar Component for Auto Studio Pro
 */

import React, { useRef, useEffect } from 'react';
import { AppMode, ToolType, Tile } from '../types';
import {
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
} from 'lucide-react';

interface RightSidebarProps {
  currentMode: AppMode;
  currentTool: ToolType;
  meterChannel: string;
  oscVal: number | null;
  vVal: number;
  aVal: number;
  wVal: number;
  multimeterStatusText: string;
  isFaultMode: boolean;
  hasSelection: boolean;
  isPasting: boolean;
  autowireCount: number;
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
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentMode,
  currentTool,
  meterChannel,
  oscVal,
  vVal,
  aVal,
  wVal,
  multimeterStatusText,
  isFaultMode,
  hasSelection,
  isPasting,
  autowireCount,
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
}) => {
  const [plcSubTab, setPlcSubTab] = React.useState<'wiring' | 'ladder'>('ladder');
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);
  const oscBufferRef = useRef<number[]>(Array(130).fill(0));

  // Render dynamic waveform on oscilloscope canvas
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const val = oscVal === null ? 0 : oscVal;
    oscBufferRef.current.push(val);
    if (oscBufferRef.current.length > 130) {
      oscBufferRef.current.shift();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(260, 40);
    ctx.moveTo(130, 0);
    ctx.lineTo(130, 80);
    ctx.stroke();

    // Trace
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const buf = oscBufferRef.current;
    for (let i = 0; i < buf.length; i++) {
      const px = i * 2;
      const py = 40 - (buf[i] / 15) * 35;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [oscVal]);

  return (
    <aside className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto z-10 select-none shrink-0">
      {/* Meters Panel (Electronic Mode) */}
      {currentMode === 'electronic' && (
        <div className="p-3.5 border-b-2 border-emerald-900/50 bg-slate-950/80">
          <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Satellite className="w-4 h-4 text-emerald-400" />
            <span>虛擬儀表 (Real-time)</span>
          </div>

          {/* Channels 1-5 */}
          <div className="flex gap-1 mb-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['1', '2', '3', '4', '5'].map((ch) => (
              <button
                key={ch}
                className={`flex-1 py-1 text-xs rounded font-bold transition-all ${
                  meterChannel === ch
                    ? 'bg-emerald-600 text-white shadow shadow-emerald-600/30'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                onClick={() => onSetMeterChannel(ch)}
              >
                CH {ch}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 mb-2.5 flex items-start gap-1 leading-tight">
            <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
            <span>使用標籤工具修改儀表「中心標籤」為 1~5 即可連動對應頻道。預設為 CH 1。</span>
          </div>

          {/* OSC Waveform */}
          <div className="text-xs text-slate-400 mb-1 flex justify-between items-center">
            <span>OSC 示波器 (動態波形)</span>
            <span className="text-emerald-400 font-mono font-bold">
              {oscVal === null ? '-- V' : `${oscVal.toFixed(2)} V`}
            </span>
          </div>
          <canvas
            ref={oscCanvasRef}
            width={260}
            height={80}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-lg mb-2 shadow-[inset_0_0_12px_rgba(16,185,129,0.15)]"
          />

          {/* Digital Meters */}
          <div className="text-xs text-slate-400 mb-1">V 伏特計 (並聯)</div>
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2 font-mono text-emerald-400 text-xl font-bold text-right shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] mb-2">
            {vVal.toFixed(2)} V
          </div>

          <div className="text-xs text-slate-400 mb-1">A 安培計 (串聯)</div>
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2 font-mono text-emerald-400 text-xl font-bold text-right shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] mb-2">
            {(aVal * 1000).toFixed(2)} mA
          </div>

          <div className="text-xs text-slate-400 mb-1">W 功率表 (V×A 訊號輸入)</div>
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2 font-mono text-emerald-400 text-xl font-bold text-right shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] mb-2">
            {wVal.toFixed(3)} W
          </div>

          <div className="text-xs text-slate-400 mb-1">故障檢修探棒 (萬用表)</div>
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2 font-mono text-amber-400 text-xs font-bold text-center">
            {multimeterStatusText}
          </div>
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
          }`}
          onClick={() => onSetTool('autowire')}
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span>A* 智慧佈線 ({autowireCount} 點)</span>
        </button>

        {currentTool === 'autowire' && (
          <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <p className="text-[11px] text-slate-300 mb-2.5">
              請在棋盤上點擊設定關鍵路徑節點，完成後點擊「執行」。
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-1.5 rounded-md font-semibold shadow"
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
        {hasSelection && (
          <div className="flex gap-2 mb-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <button
              className="flex-1 p-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg flex justify-center items-center shadow"
              title="剪下"
              onClick={onCutSelection}
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              className="flex-1 p-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg flex justify-center items-center shadow"
              title="複製"
              onClick={onCopySelection}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="flex-1 p-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg flex justify-center items-center shadow"
              title="刪除選取區"
              onClick={onDeleteSelection}
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        )}

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
            }`}
            title="啟動/關閉故障模式"
            onClick={onToggleFaultMode}
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>設故障</span>
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
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          共用導線與註解 (Wires & Misc)
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all group"
            title="直線導線 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_straight', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_straight')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot="0"
              style={{ transform: 'rotate(0deg)' }}
              viewBox="0 0 24 24"
            >
              <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>

          <button
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all group"
            title="L型轉角 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_turn', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_turn')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot="0"
              style={{ transform: 'rotate(0deg)' }}
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

          <button
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all group"
            title="┳型三通 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_t', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_t')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot="0"
              style={{ transform: 'rotate(0deg)' }}
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

          <button
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all group"
            title="➕ 十字四通 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_cross', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_cross')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot="0"
              style={{ transform: 'rotate(0deg)' }}
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

          <button
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all group"
            title="🔀 絕緣天橋 (右鍵預先旋轉)"
            onClick={(e) => onSetPlacement('wire_bridge', e.currentTarget)}
            onContextMenu={(e) => onRotateTool(e, 'wire_bridge')}
          >
            <svg
              className="wire-svg text-blue-400 w-6 h-6 transition-transform duration-200"
              data-rot="0"
              style={{ transform: 'rotate(0deg)' }}
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
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex justify-center items-center transition-all text-slate-300"
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
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('power_12v')}
            >
              <span className="text-rose-500 font-bold">🔋</span> 12V 直流電源
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('power_ac')}
            >
              <span className="text-amber-400 font-bold">⚡</span> 12V 交流電源 (AC)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('power_1_5v')}
            >
              <span className="text-amber-500 font-bold">🔋</span> 1.5V 電池
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('resistor_custom')}
            >
              <span className="text-amber-600 font-bold">〰️</span> 固定電阻 (可設定)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('capacitor')}
            >
              <span className="text-cyan-400 font-bold">╟╢</span> 電容器 (充放電延遲)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('led_3v')}
            >
              <span className="text-yellow-400 font-bold">💡</span> 3V/20mA LED (2接點)
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            量測儀表 (Meters)
          </div>
          <div className="space-y-1.5">
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('meter_osc')}
            >
              <span className="text-emerald-400 font-bold">📈</span> 示波器 (波形監測)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('meter_v')}
            >
              <span className="text-emerald-400 font-bold">Ⓥ</span> 電壓表 (3接點)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('meter_a')}
            >
              <span className="text-emerald-400 font-bold">Ⓐ</span> 電流表 (3接點)
            </button>
            <button
              className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
              onClick={() => onSetPlacement('meter_w')}
            >
              <span className="text-emerald-400 font-bold">Ⓦ</span> 功率表 (2接點)
            </button>
          </div>
        </div>
      )}

      {(currentMode === 'logic' || currentMode === 'tutorial') && (
        <div className="p-3.5 space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              1. 訊號輸入 (Input)
            </div>
            <div className="space-y-1.5">
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('logic_power')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#f43f5e" strokeWidth="4" />
                  <circle cx="40" cy="40" r="10" fill="#f43f5e" />
                </svg>
                邏輯開關 (1出)
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('logic_pushbtn')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="20" fill="#374151" stroke="#f43f5e" strokeWidth="4" />
                  <circle cx="40" cy="40" r="12" fill="#ef4444" />
                </svg>
                邏輯按鈕 (回彈)
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('logic_clock')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#0ea5e9" strokeWidth="4" />
                  <path d="M 30 50 L 30 30 L 40 30 L 40 50 L 50 50 L 50 30" stroke="#0ea5e9" strokeWidth="4" fill="none" />
                </svg>
                時脈產生器 (Clock)
              </button>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              2. 基礎邏輯閘 (Basic Gates)
            </div>
            <div className="space-y-1.5">
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_and')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 20 L 40 20 A 20 20 0 0 1 40 60 L 20 60 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                AND 閘
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_or')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 20 Q 40 20 55 40 Q 40 60 20 60 Q 30 40 20 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                OR 閘
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_not')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <polygon points="20,20 50,40 20,60" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="55" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NOT 閘
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              3. 組合邏輯閘 (Universal/Derived)
            </div>
            <div className="space-y-1.5">
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_nand')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 L 35 20 A 20 20 0 0 1 35 60 L 15 60 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="62" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NAND 閘
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_nor')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 Q 35 20 50 40 Q 35 60 15 60 Q 25 40 15 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                  <circle cx="58" cy="40" r="5" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                NOR 閘
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_xor')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 15 20 Q 25 40 15 60" fill="none" stroke="#a855f7" strokeWidth="4" />
                  <path d="M 22 20 Q 42 20 57 40 Q 42 60 22 60 Q 32 40 22 20 Z" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                XOR 閘
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('gate_buffer')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <polygon points="20,20 55,40 20,60" fill="#374151" stroke="#a855f7" strokeWidth="4" />
                </svg>
                Buffer 緩衝器
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              4. 訊號輸出/顯示 (Output)
            </div>
            <div className="space-y-1.5">
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('logic_led')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="18" fill="#374151" stroke="#fbbf24" strokeWidth="4" />
                </svg>
                邏輯燈泡 (1進)
              </button>
              <button
                className="w-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left flex items-center gap-2"
                onClick={() => onSetPlacement('logic_roman')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="20" width="40" height="40" rx="4" fill="#374151" stroke="#38bdf8" strokeWidth="4" />
                  <text x="40" y="48" fill="#38bdf8" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">I</text>
                </svg>
                羅馬數字顯示器 (I/V)
              </button>
            </div>
          </div>
        </div>
      )}

      {currentMode === 'wiring' && (
        <div className="p-3.5 space-y-3">
          <div>
            <div className="text-xs font-bold text-blue-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <span>⚡ 電源與保護</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('wire_l')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#f43f5e" strokeWidth="4" />
                  <text x="40" y="48" fill="#f43f5e" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L</text>
                </svg>
                L相(火線)
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('wire_n')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                </svg>
                N相(零線)
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('breaker_mcb')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 20 L 40 30 M 40 50 L 40 60 M 30 30 C 45 30 50 50 30 50" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <circle cx="40" cy="20" r="4" fill="#c084fc" />
                  <circle cx="40" cy="60" r="4" fill="#c084fc" />
                </svg>
                MCB斷路器
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('protection_fuse')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="25" y="30" width="30" height="20" fill="none" stroke="#eab308" strokeWidth="4" />
                  <path d="M 20 40 L 60 40" fill="none" stroke="#eab308" strokeWidth="4" />
                </svg>
                保險絲
              </button>
              <button
                className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-center gap-1.5"
                onClick={() => onSetPlacement('terminal_block')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="25" width="40" height="30" fill="none" stroke="#94a3b8" strokeWidth="4" />
                  <circle cx="30" cy="40" r="5" fill="#94a3b8" />
                  <circle cx="50" cy="40" r="5" fill="#94a3b8" />
                </svg>
                端子台 (1進1出)
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <span>🔘 輸入開關</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('btn_no')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 25 L 45 25 M 40 15 L 40 25" fill="none" stroke="#34d399" strokeWidth="4" />
                  <circle cx="35" cy="40" r="3" fill="#34d399" />
                  <circle cx="45" cy="40" r="3" fill="#34d399" />
                </svg>
                NO 按鈕
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('btn_nc')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 45 L 45 45 M 40 35 L 40 45" fill="none" stroke="#fb7185" strokeWidth="4" />
                  <circle cx="35" cy="40" r="3" fill="#fb7185" />
                  <circle cx="45" cy="40" r="3" fill="#fb7185" />
                </svg>
                NC 按鈕
              </button>
              <button
                className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-center gap-1.5"
                onClick={() => onSetPlacement('switch_sel13')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 20 L 40 35 M 40 35 L 25 50 M 20 55 L 60 55" fill="none" stroke="#facc15" strokeWidth="4" />
                  <circle cx="40" cy="35" r="4" fill="#facc15" />
                  <circle cx="25" cy="50" r="4" fill="#facc15" />
                  <circle cx="40" cy="50" r="4" fill="#facc15" />
                  <circle cx="55" cy="50" r="4" fill="#facc15" />
                </svg>
                選擇開關 (1進3出)
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-yellow-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <span>🧲 控制與繼電器</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('relay_no')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50" fill="none" stroke="#34d399" strokeWidth="4" />
                </svg>
                萬用 NO
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('relay_nc')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 30 50 L 50 30" fill="none" stroke="#fb7185" strokeWidth="4" />
                </svg>
                萬用 NC
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('relay_ton')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 25 30 L 35 30" fill="none" stroke="#60a5fa" strokeWidth="4" />
                </svg>
                TON 計時
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('relay_tof')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 45 50 L 55 50" fill="none" stroke="#60a5fa" strokeWidth="4" />
                </svg>
                TOF 計時
              </button>
              <button
                className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-center gap-1.5"
                onClick={() => onSetPlacement('relay_coil')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" />
                  <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#f59e0b" strokeWidth="4" />
                </svg>
                繼電器線圈 (K)
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-amber-500 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <span>💡 輸出負載</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('motor')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#fbbf24" strokeWidth="4" />
                  <text x="40" y="48" fill="#fbbf24" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">M</text>
                </svg>
                馬達(M)
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('platform_main')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="15" y="25" width="50" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <circle cx="25" cy="40" r="4" fill="#c084fc" />
                  <circle cx="40" cy="40" r="4" fill="#c084fc" />
                  <circle cx="55" cy="40" r="4" fill="#c084fc" />
                </svg>
                電動滑台(3)
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('load_lightbulb')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="16" fill="none" stroke="#facc15" strokeWidth="4" />
                  <path d="M 28 28 L 52 52 M 28 52 L 52 28" fill="none" stroke="#facc15" strokeWidth="4" />
                </svg>
                指示燈
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('load_buzzer')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 25 30 L 40 30 L 40 50 L 25 50 Z M 40 30 L 55 15 L 55 65 L 40 50" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                </svg>
                蜂鳴器
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-cyan-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <span>💨 空壓機電元件</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('pneumatic_air_source')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <path d="M 40 25 L 55 50 L 25 50 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
                  <circle cx="40" cy="38" r="4" fill="#22d3ee" />
                </svg>
                氣壓源
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('pneumatic_valve_coil')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="25" y="25" width="30" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                  <path d="M 25 55 L 55 25" fill="none" stroke="#c084fc" strokeWidth="4" />
                </svg>
                閥線圈
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('pneumatic_valve_52')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                  <path d="M 25 45 L 35 35 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                </svg>
                5/2 閥
              </button>
              <button
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                onClick={() => onSetPlacement('pneumatic_cylinder')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                  <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                </svg>
                氣壓缸(3)
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
                <div className="text-[11px] font-bold text-slate-400 mb-1">主機與電源</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-lg text-xs text-indigo-200 flex items-center gap-1.5 font-bold shadow col-span-2"
                    onClick={() => onSetPlacement('plc_unit')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#6366f1" strokeWidth="4" />
                      <text x="40" y="48" fill="#6366f1" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">PLC</text>
                    </svg>
                    NPN PLC 主機 (4x10)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('wire_l')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#f43f5e" strokeWidth="4" />
                      <text x="40" y="48" fill="#f43f5e" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L1</text>
                    </svg>
                    L1 (火線)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('wire_n')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                      <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L2</text>
                    </svg>
                    L2 (零線)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('power_dc24')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#10b981" strokeWidth="4" />
                      <text x="40" y="48" fill="#10b981" fontSize="18" fontFamily="Arial" textAnchor="middle" fontWeight="bold">24V</text>
                    </svg>
                    24V 電源
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('breaker')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
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
                <div className="text-[11px] font-bold text-slate-400 mb-1">開關與按鈕</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('btn_no')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 25 L 45 25 M 40 15 L 40 25" fill="none" stroke="#34d399" strokeWidth="4" />
                      <circle cx="35" cy="40" r="3" fill="#34d399" />
                      <circle cx="45" cy="40" r="3" fill="#34d399" />
                    </svg>
                    按鈕 (NO)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('btn_nc')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 45 L 45 45 M 40 35 L 40 45" fill="none" stroke="#fb7185" strokeWidth="4" />
                      <circle cx="35" cy="40" r="3" fill="#fb7185" />
                      <circle cx="45" cy="40" r="3" fill="#fb7185" />
                    </svg>
                    按鈕 (NC)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 col-span-2"
                    onClick={() => onSetPlacement('switch_sel13')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 40 20 L 40 35 M 40 35 L 25 50 M 20 55 L 60 55" fill="none" stroke="#facc15" strokeWidth="4" />
                      <circle cx="40" cy="35" r="4" fill="#facc15" />
                      <circle cx="25" cy="50" r="4" fill="#facc15" />
                      <circle cx="40" cy="50" r="4" fill="#facc15" />
                      <circle cx="55" cy="50" r="4" fill="#facc15" />
                    </svg>
                    選擇開關 (1a1b)
                  </button>
                </div>
              </div>

              {/* Relays & Coils */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1">繼電器與控制線圈</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('relay_coil')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" />
                      <path d="M 20 40 L 24 40 M 56 40 L 60 40" fill="none" stroke="#f59e0b" strokeWidth="4" />
                    </svg>
                    繼電器線圈
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('pneumatic_valve_coil')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="25" y="25" width="30" height="30" fill="none" stroke="#c084fc" strokeWidth="4" />
                      <path d="M 25 55 L 55 25" fill="none" stroke="#c084fc" strokeWidth="4" />
                    </svg>
                    電磁閥線圈
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('relay_ton')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 25 30 L 35 30" fill="none" stroke="#60a5fa" strokeWidth="4" />
                    </svg>
                    通電延時(TON)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('relay_tof')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 45 50 L 55 50" fill="none" stroke="#60a5fa" strokeWidth="4" />
                    </svg>
                    斷電延時(TOF)
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('relay_no')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50" fill="none" stroke="#34d399" strokeWidth="4" />
                    </svg>
                    繼電器 NO
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('relay_nc')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 20 40 L 35 40 M 45 40 L 60 40 M 35 30 L 35 50 M 45 30 L 45 50 M 30 50 L 50 30" fill="none" stroke="#fb7185" strokeWidth="4" />
                    </svg>
                    繼電器 NC
                  </button>
                </div>
              </div>

              {/* Loads & Actuators */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1">負載與氣壓</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('load_lightbulb')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#facc15" strokeWidth="4" />
                      <path d="M 28 28 L 52 52 M 28 52 L 52 28" fill="none" stroke="#facc15" strokeWidth="4" />
                    </svg>
                    指示燈
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('load_buzzer')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 25 30 L 40 30 L 40 50 L 25 50 Z M 40 30 L 55 15 L 55 65 L 40 50" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                    </svg>
                    蜂鳴器
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('motor')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="16" fill="none" stroke="#fbbf24" strokeWidth="4" />
                      <text x="40" y="48" fill="#fbbf24" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">M</text>
                    </svg>
                    馬達
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('terminal')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="25" width="40" height="30" fill="none" stroke="#94a3b8" strokeWidth="4" />
                      <circle cx="30" cy="40" r="5" fill="#94a3b8" />
                      <circle cx="50" cy="40" r="5" fill="#94a3b8" />
                    </svg>
                    端子台
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('pneumatic_air_source')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <path d="M 40 25 L 55 50 L 25 50 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
                      <circle cx="40" cy="38" r="4" fill="#22d3ee" />
                    </svg>
                    氣源
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5"
                    onClick={() => onSetPlacement('pneumatic_valve_52')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <rect x="40" y="30" width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                      <path d="M 25 45 L 35 35 M 45 45 L 45 35 M 55 45 L 55 35" fill="none" stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                    5/2電磁閥
                  </button>
                  <button
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 col-span-2"
                    onClick={() => onSetPlacement('pneumatic_cylinder')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="30" width="30" height="20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                      <path d="M 35 30 L 35 50 M 35 40 L 60 40" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    </svg>
                    雙動氣壓缸 (3格)
                  </button>
                </div>
              </div>
            </div>
          )}

          {plcSubTab === 'ladder' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                階梯圖邏輯元件 (Ladder Diagram)
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  className="p-2.5 bg-slate-800 border border-amber-600/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1"
                  onClick={() => onSetPlacement('plc_no')}
                >
                  <span className="text-base font-mono text-amber-400">-[ ]-</span>
                  <span>A 接點</span>
                </button>
                <button
                  className="p-2.5 bg-slate-800 border border-amber-600/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1"
                  onClick={() => onSetPlacement('plc_nc')}
                >
                  <span className="text-base font-mono text-amber-400">-[/]-</span>
                  <span>B 接點</span>
                </button>
                <button
                  className="p-2.5 bg-slate-800 border border-amber-600/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1"
                  onClick={() => onSetPlacement('plc_out')}
                >
                  <span className="text-base font-mono text-amber-400">-( )-</span>
                  <span>輸出</span>
                </button>
                <button
                  className="p-2.5 bg-slate-800 border border-amber-600/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1"
                  onClick={() => onSetPlacement('plc_pls')}
                >
                  <span className="text-base font-mono text-emerald-400">-[ P ]-</span>
                  <span>上微分</span>
                </button>
                <button
                  className="p-2.5 bg-slate-800 border border-amber-600/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow flex flex-col items-center justify-center gap-1"
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
