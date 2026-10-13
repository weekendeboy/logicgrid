/**
 * @license
 * SeniorHighCurveWidget Component for Auto Studio Pro
 * Interactive real-time physics curve visualizer for High School Curriculum:
 * - sh-1-1: Real battery V-I characteristic curve (V = E - I*r, negative slope line)
 * - sh-1-2: Maximum power transfer theorem (P vs R impedance matching peak curve)
 *
 * Features:
 * - 60FPS continuous animated rendering of theoretical curve and real-time operating point
 * - Pulsing operating dot that tracks the rheostat slider motion in real time
 * - Historical breadcrumb trail showing previous operating points as slider is dragged
 * - Draggable HUD window (can be repositioned anywhere on screen by dragging header)
 * - Minimizable card design with one-click clear trail action
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Tile, LogicLevelId } from '../types';
import { TrendingDown, Zap, Minimize2, Maximize2, RotateCcw, GripHorizontal } from 'lucide-react';

interface SeniorHighCurveWidgetProps {
  grid: (Tile | null)[][];
  logicLevel: LogicLevelId;
}

interface TrailPoint {
  i: number;
  v: number;
  px: number;
  py: number;
}

export const SeniorHighCurveWidget: React.FC<SeniorHighCurveWidgetProps> = ({
  grid,
  logicLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const trailPointsRef = useRef<TrailPoint[]>([]);

  // Only render for sh-1-1 and sh-1-2
  const isLevel1_1 = logicLevel === 'sh-1-1';
  const isLevel1_2 = logicLevel === 'sh-1-2';

  const clearTrail = useCallback(() => {
    trailPointsRef.current = [];
  }, []);

  // Clear trail when changing level
  useEffect(() => {
    clearTrail();
  }, [logicLevel, clearTrail]);

  // Extract live circuit telemetry from grid
  const getTelemetry = useCallback(() => {
    let currentA = 0;
    let terminalV = 0;
    let powerW = 0;
    let loadR = 5.0;
    let emf = 1.5;
    let internalR = 1.0;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (!t) continue;
        if (t.type === 'power' && (t.subtype === 'power_real' || t.subtype === 'battery_real')) {
          emf = t.value || 1.5;
          internalR = t.internalR !== undefined ? t.internalR : 1.0;
          if (t.measureVal !== undefined) terminalV = t.measureVal;
          if (t.currentA !== undefined) currentA = t.currentA;
        } else if (t.type === 'meter') {
          if (t.subtype === 'v' && t.measureVal !== undefined) {
            terminalV = t.measureVal;
          } else if (t.subtype === 'a' && t.measureVal !== undefined) {
            currentA = t.measureVal;
          }
        } else if (t.subtype === 'var_mid') {
          const totalR = t.value || 10;
          const ratio = t.extension !== undefined ? t.extension : 0.5;
          loadR = Math.max(0.1, totalR * ratio);
        }
      }
    }

    if (currentA > 0.001) {
      powerW = terminalV * currentA;
    }

    return { currentA, terminalV, powerW, loadR, emf, internalR };
  }, [grid]);

  // Keep live telemetry state synced for the formula badges
  const [liveTelemetry, setLiveTelemetry] = useState(() => getTelemetry());
  const prevValsRef = useRef({ terminalV: 0, currentA: 0, loadR: 0, powerW: 0 });

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
    const newX = Math.max(10, Math.min(window.innerWidth - 330, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(65, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 60FPS Continuous Canvas Render Loop
  useEffect(() => {
    if (!isLevel1_1 && !isLevel1_2) return;
    if (isMinimized) return;

    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const telemetry = getTelemetry();
      const { currentA, terminalV, powerW, loadR, emf, internalR } = telemetry;

      // Update badge telemetry if shifted
      if (
        Math.abs(prevValsRef.current.terminalV - terminalV) > 0.005 ||
        Math.abs(prevValsRef.current.currentA - currentA) > 0.005 ||
        Math.abs(prevValsRef.current.loadR - loadR) > 0.05
      ) {
        prevValsRef.current = { terminalV, currentA, loadR, powerW };
        setLiveTelemetry(telemetry);
      }

      const W = canvas.width;
      const H = canvas.height;
      const margin = { left: 46, right: 18, top: 24, bottom: 34 };
      const plotW = W - margin.left - margin.right;
      const plotH = H - margin.top - margin.bottom;

      // 1. Clear background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, W, H);

      if (isLevel1_1) {
        // =========================================================
        // SH 1-1: V-I Curve (V = E - I*r)
        // Range: I in [0, 1.6] A, V in [0, 1.6] V
        // =========================================================
        const maxI = 1.6;
        const maxV = 1.6;

        const toX = (i: number) => margin.left + (Math.max(0, Math.min(maxI, i)) / maxI) * plotW;
        const toY = (v: number) => (H - margin.bottom) - (Math.max(0, Math.min(maxV, v)) / maxV) * plotH;

        // Grid lines (every 0.4A and 0.4V)
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0.4; i <= maxI; i += 0.4) {
          const gx = toX(i);
          ctx.moveTo(gx, margin.top);
          ctx.lineTo(gx, H - margin.bottom);
        }
        for (let v = 0.4; v <= maxV; v += 0.4) {
          const gy = toY(v);
          ctx.moveTo(margin.left, gy);
          ctx.lineTo(W - margin.right, gy);
        }
        ctx.stroke();

        // Main Axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, H - margin.bottom);
        ctx.lineTo(W - margin.right, H - margin.bottom);
        ctx.stroke();

        // Axis Tick Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let v = 0; v <= maxV; v += 0.4) {
          ctx.fillText(v.toFixed(1) + 'V', margin.left - 6, toY(v));
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= maxI; i += 0.4) {
          ctx.fillText(i.toFixed(1) + 'A', toX(i), H - margin.bottom + 6);
        }

        // Axis Titles
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('端電壓 V', margin.left, 6);
        ctx.textAlign = 'right';
        ctx.fillText('電流 I (A)', W - margin.right, H - 18);

        // Theoretical Negative Slope Line: V = E - I*r
        // (0, emf) -> (emf / r, 0)
        const xStart = toX(0);
        const yStart = toY(emf);
        const xEnd = toX(emf / internalR);
        const yEnd = toY(0);

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();

        // Intercept annotations
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`ℰ = ${emf.toFixed(2)}V`, xStart + 4, yStart - 8);

        // Record Trail Point
        const px = toX(currentA);
        const py = toY(terminalV);
        const trail = trailPointsRef.current;
        if (trail.length === 0 || Math.hypot(trail[trail.length - 1].px - px, trail[trail.length - 1].py - py) > 4) {
          trail.push({ i: currentA, v: terminalV, px, py });
          if (trail.length > 50) trail.shift();
        }

        // Draw Historical Trail Dots
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        for (const pt of trail) {
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Live Point (Concentric Pulse Halo)
        const pulse = (Math.sin(performance.now() / 180) + 1) * 3;
        ctx.save();
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.beginPath();
        ctx.arc(px, py, 10 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Coordinate Badge above point
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = px > W - 100 ? 'right' : 'left';
        const tagX = px > W - 100 ? px - 8 : px + 8;
        const tagY = Math.max(margin.top + 10, py - 8);
        ctx.fillText(`(${currentA.toFixed(2)}A, ${terminalV.toFixed(2)}V)`, tagX, tagY);
      } else if (isLevel1_2) {
        // =========================================================
        // SH 1-2: P-R Curve (P = E^2 * R / (R + r)^2)
        // Range: R in [0, 8] Ω, P in [0, 0.65] W
        // =========================================================
        const maxR = 8.0;
        const maxP = 0.65;

        const toX = (r: number) => margin.left + (Math.max(0, Math.min(maxR, r)) / maxR) * plotW;
        const toY = (p: number) => (H - margin.bottom) - (Math.max(0, Math.min(maxP, p)) / maxP) * plotH;

        // Grid
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let r = 2; r <= maxR; r += 2) {
          const gx = toX(r);
          ctx.moveTo(gx, margin.top);
          ctx.lineTo(gx, H - margin.bottom);
        }
        for (let p = 0.15; p <= maxP; p += 0.15) {
          const gy = toY(p);
          ctx.moveTo(margin.left, gy);
          ctx.lineTo(W - margin.right, gy);
        }
        ctx.stroke();

        // Main Axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, H - margin.bottom);
        ctx.lineTo(W - margin.right, H - margin.bottom);
        ctx.stroke();

        // Axis Tick Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let p = 0; p <= maxP; p += 0.15) {
          ctx.fillText(p.toFixed(2) + 'W', margin.left - 6, toY(p));
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let r = 0; r <= maxR; r += 2) {
          ctx.fillText(r.toFixed(0) + 'Ω', toX(r), H - margin.bottom + 6);
        }

        // Axis Titles
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('負載功率 P', margin.left, 6);
        ctx.textAlign = 'right';
        ctx.fillText('負載電阻 R (Ω)', W - margin.right, H - 18);

        // Theoretical Bell-Shaped Curve: P(R) = E^2 * R / (R + r)^2
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const rVal = (s / steps) * maxR;
          const pVal = (emf * emf * rVal) / Math.pow(rVal + internalR, 2);
          const cx = toX(rVal);
          const cy = toY(pVal);
          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.restore();

        // Peak annotation (R = r = 1.0Ω, P_max = E^2 / 4r = 0.5625W)
        const peakX = toX(internalR);
        const peakY = toY((emf * emf) / (4 * internalR));
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(peakX, H - margin.bottom);
        ctx.lineTo(peakX, peakY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`峰值 R=r=1Ω`, peakX, peakY - 8);
        ctx.restore();

        // Live Point (loadR, powerW)
        const liveP = (emf * emf * loadR) / Math.pow(loadR + internalR, 2);
        const px = toX(loadR);
        const py = toY(liveP);

        // Trail
        const trail = trailPointsRef.current;
        if (trail.length === 0 || Math.hypot(trail[trail.length - 1].px - px, trail[trail.length - 1].py - py) > 4) {
          trail.push({ i: loadR, v: liveP, px, py });
          if (trail.length > 50) trail.shift();
        }
        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        for (const pt of trail) {
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Live Point Pulsing
        const pulse = (Math.sin(performance.now() / 180) + 1) * 3;
        ctx.save();
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.beginPath();
        ctx.arc(px, py, 10 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = px > W - 100 ? 'right' : 'left';
        const tagX = px > W - 100 ? px - 8 : px + 8;
        const tagY = Math.max(margin.top + 10, py - 8);
        ctx.fillText(`(R: ${loadR.toFixed(1)}Ω, P: ${liveP.toFixed(2)}W)`, tagX, tagY);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isLevel1_1, isLevel1_2, isMinimized, getTelemetry]);

  if (!isLevel1_1 && !isLevel1_2) return null;

  const { currentA, terminalV, powerW, loadR, internalR } = liveTelemetry;

  return (
    <div
      ref={containerRef}
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : undefined
      }
      className={`fixed ${
        position ? '' : 'top-20 right-6 md:right-80'
      } z-30 pointer-events-auto select-none transition-shadow duration-150`}
    >
      <div className="bg-slate-900/95 border-2 border-indigo-500/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 flex flex-col w-[320px]">
        {/* Draggable Header Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-indigo-500/40 cursor-move"
          title="按住此處可自由拖曳移動視窗"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
            <GripHorizontal className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
            {isLevel1_1 ? (
              <>
                <TrendingDown className="w-4 h-4 text-sky-400" />
                <span>大考必考：電池 V-I 特性曲線</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>阻抗匹配：P-R 最大功率曲線</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearTrail}
              title="清除實驗軌跡點"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? '展開曲線圖' : '收合曲線圖'}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-3 flex flex-col gap-2.5">
            {/* Canvas Graph */}
            <div className="w-full flex justify-center rounded-lg overflow-hidden border border-slate-800 bg-[#090d16] shadow-inner">
              <canvas
                ref={canvasRef}
                width={296}
                height={190}
                className="block"
              />
            </div>

            {/* Real-Time Formula & Stats Badge */}
            {isLevel1_1 ? (
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-sky-300 font-bold border-b border-slate-800 pb-1">
                  <span>方程式：V = ℰ - I·r</span>
                  <span>斜率 m = -{internalR.toFixed(1)}Ω</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    端電壓 V：<span className="text-amber-400 font-bold">{terminalV.toFixed(2)} V</span>
                  </div>
                  <div>
                    放電電流 I：<span className="text-sky-400 font-bold">{currentA.toFixed(2)} A</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  👉 拖曳滑動變阻器改變負載，黃色光點會即時沿著負斜率直線滑動！
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1">
                  <span>公式：P = ℰ²R / (R+r)²</span>
                  <span className="text-rose-400">頂點 R = r = 1.0Ω</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    負載電阻 R：<span className="text-sky-400 font-bold">{loadR.toFixed(1)} Ω</span>
                  </div>
                  <div>
                    輸出功率 P：<span className="text-amber-400 font-bold">{powerW.toFixed(2)} W</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  👉 調節變阻器至 R = 1.0Ω 時，輸出功率達到最高峰 P_max = 0.56W！
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
