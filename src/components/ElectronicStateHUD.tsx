/**
 * @license
 * ElectronicStateHUD Component for Auto Studio Pro
 * Unified floating draggable HUD for Basic Electricity Curriculum:
 * - Junior High Physics (jh-*): Loop state, meters (V, A), loads (bulbs, resistors), one-click circuit verification
 * - Senior High Physics (sh-*): Advanced experiments, galvanometer, diode PN junction, one-click experiment verification
 * - Characteristic Curve Visualizer for sh-1-1 (V-I curve) and sh-1-2 (P-R maximum power curve)
 *
 * Features:
 * - Draggable & Minimizable HUD container
 * - Level Mission & Hint Card with collapsible guidance
 * - One-click instant verification button
 * - Live real-time circuit telemetry (V, A, W, loop status, meter readings, component states)
 * - Interactive 60FPS physics characteristic curve with pulsing operating point & breadcrumb trail
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Tile, LogicLevelId } from '../types';
import { LevelRegistry } from '../levels/LevelRegistry';
import { verifyJuniorElectricityCircuit } from '../engine/juniorElectricityCheck';
import { verifySeniorElectricityCircuit } from '../engine/seniorElectricityCheck';
import {
  Zap,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  GripHorizontal,
  Minimize2,
  Maximize2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Gauge,
  Lightbulb,
  Sliders,
  ToggleLeft,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ElectronicStateHUDProps {
  grid: (Tile | null)[][];
  gridSize: number;
  logicLevel: LogicLevelId;
  onShowAlert?: (msg: string) => void;
  onVerifySuccess?: (msg: string) => void;
}

interface TrailPoint {
  i: number;
  v: number;
  px: number;
  py: number;
}

export const ElectronicStateHUD: React.FC<ElectronicStateHUDProps> = ({
  grid,
  gridSize,
  logicLevel,
  onShowAlert,
  onVerifySuccess,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showHintCard, setShowHintCard] = useState<boolean>(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Identify curriculum mode
  const isJunior = logicLevel.startsWith('jh-');
  const isSenior = logicLevel.startsWith('sh-');
  const isLevel1_1 = logicLevel === 'sh-1-1';
  const isLevel1_2 = logicLevel === 'sh-1-2';
  const hasCurve = isLevel1_1 || isLevel1_2;

  // Active tab: 'telemetry' or 'curve'
  const [activeTab, setActiveTab] = useState<'telemetry' | 'curve'>(hasCurve ? 'curve' : 'telemetry');

  // Sync tab when level changes
  useEffect(() => {
    setActiveTab(hasCurve ? 'curve' : 'telemetry');
    setVerifyResult(null);
  }, [logicLevel, hasCurve]);

  // Trail points for curve
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const clearTrail = useCallback(() => {
    trailPointsRef.current = [];
  }, []);

  useEffect(() => {
    clearTrail();
  }, [logicLevel, clearTrail]);

  // Dragging support
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

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
    const newX = Math.max(10, Math.min(window.innerWidth - 350, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(65, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 30 FPS ticker for live circuit simulation telemetry
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const update = (time: number) => {
      if (time - lastTime > 33) {
        lastTime = time;
        setTicker((t) => (t + 1) % 1000000);
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Level definition & metadata
  const levelDef = useMemo(() => LevelRegistry.getLevel(logicLevel), [logicLevel]);
  const levelMeta = useMemo(() => LevelRegistry.getLevelMetadata(logicLevel), [logicLevel]);

  const levelTitle = levelDef?.title || levelMeta?.title || logicLevel;
  const levelCategory = levelDef?.category || (isJunior ? '國中理化 基本電學' : '高中物理 電學實驗');
  const levelDescription = levelDef?.desc || levelMeta?.desc || '';

  // Extract comprehensive circuit telemetry from current grid
  const telemetry = useMemo(() => {
    void ticker; // Depend on ticker for animated live updates

    let currentA = 0;
    let terminalV = 0;
    let powerW = 0;
    let loadR = 5.0;
    let emf = 1.5;
    let internalR = 1.0;
    let isShort = false;
    let isBlown = false;

    interface MeterItem {
      id: string;
      label: string;
      type: 'v' | 'a' | 'g' | 'osc';
      val: number;
      unit: string;
      strVal: string;
    }

    interface LoadItem {
      id: string;
      label: string;
      type: string;
      val: number;
      currentA: number;
      isPowered: boolean;
      isBlown?: boolean;
    }

    interface SwitchItem {
      id: string;
      label: string;
      isActive: boolean;
    }

    const meters: MeterItem[] = [];
    const loads: LoadItem[] = [];
    const switches: SwitchItem[] = [];

    let batteryCount = 0;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (!t) continue;

        // Power sources
        if (t.type === 'power') {
          batteryCount++;
          if (t.subtype === 'power_real' || t.subtype === 'battery_real') {
            emf = t.value || 1.5;
            internalR = t.internalR !== undefined ? t.internalR : 1.0;
            if (t.measureVal !== undefined) terminalV = t.measureVal;
            if (t.currentA !== undefined) {
              currentA = Math.max(currentA, t.currentA);
              if (t.currentA > 12) isShort = true;
            }
          } else {
            let v = t.value || 12;
            if (t.subtype === 'power_1_5v' || t.subtype === '1_5v') v = 1.5;
            if (t.subtype === 'power_ac' || t.subtype === 'ac') v = t.value || 110;
            emf = Math.max(emf, v);
            if (t.currentA !== undefined) currentA = Math.max(currentA, t.currentA);
            if (terminalV === 0) terminalV = emf;
          }
        }

        // Meters
        if (t.type === 'meter') {
          const mCh = t.labels[4] || `${t.subtype.toUpperCase()}${meters.length + 1}`;
          const val = t.measureVal !== undefined ? t.measureVal : 0;
          if (t.subtype === 'v') {
            terminalV = val;
            meters.push({
              id: `meter-${y}-${x}`,
              label: mCh.includes('伏特') || mCh.includes('V') ? mCh : `伏特計 (${mCh})`,
              type: 'v',
              val,
              unit: 'V',
              strVal: `${val.toFixed(2)} V`,
            });
          } else if (t.subtype === 'a') {
            currentA = Math.max(currentA, val);
            meters.push({
              id: `meter-${y}-${x}`,
              label: mCh.includes('安培') || mCh.includes('A') ? mCh : `安培計 (${mCh})`,
              type: 'a',
              val,
              unit: 'A',
              strVal: val < 0.1 ? `${(val * 1000).toFixed(1)} mA` : `${val.toFixed(2)} A`,
            });
          } else if (t.subtype === 'g') {
            const uA = val * 1e6;
            meters.push({
              id: `meter-${y}-${x}`,
              label: `檢流計 Ⓖ (${mCh})`,
              type: 'g',
              val,
              unit: 'µA',
              strVal: Math.abs(uA) < 1000 ? `${uA.toFixed(1)} µA` : `${(val * 1000).toFixed(2)} mA`,
            });
          }
        }

        // Variable resistor
        if (t.subtype === 'var_mid') {
          const totalR = t.value || 10;
          const ratio = t.extension !== undefined ? t.extension : 0.5;
          loadR = Math.max(0.1, totalR * ratio);
          loads.push({
            id: `var-${y}-${x}`,
            label: `滑動變阻器 (${loadR.toFixed(1)}Ω)`,
            type: 'var',
            val: loadR,
            currentA: t.currentA || 0,
            isPowered: (t.currentA || 0) > 0.005,
          });
        }

        // Bulbs / Loads
        if (t.type === 'load') {
          const isGlow = !!t.isPowered && (t.currentA || 0) > 0.005;
          if (t.isBlown) isBlown = true;
          loads.push({
            id: `load-${y}-${x}`,
            label: t.labels[4] || (t.subtype === 'motor' ? '馬達' : '小燈泡'),
            type: t.subtype || 'load',
            val: t.value || 50,
            currentA: t.currentA || 0,
            isPowered: isGlow,
            isBlown: t.isBlown,
          });
        }

        // Resistors
        if (t.type === 'resistor' && !t.subtype.startsWith('var')) {
          loads.push({
            id: `res-${y}-${x}`,
            label: t.labels[4] || `電阻 (${t.value || 100}Ω)`,
            type: 'resistor',
            val: t.value || 100,
            currentA: t.currentA || 0,
            isPowered: (t.currentA || 0) > 0.005,
          });
        }

        // Diodes / LEDs
        if (t.type === 'diode' || t.type === 'led') {
          loads.push({
            id: `diode-${y}-${x}`,
            label: t.labels[4] || (t.type === 'led' ? '發光二極體 LED' : '二極體 Diode'),
            type: t.type,
            val: 0.7,
            currentA: t.currentA || 0,
            isPowered: (t.currentA || 0) > 0.001,
            isBlown: t.isBlown,
          });
        }

        // Protection / Fuse
        if (t.type === 'protection' && t.subtype === 'fuse') {
          if (t.isBlown) isBlown = true;
          loads.push({
            id: `fuse-${y}-${x}`,
            label: `保險絲 (${t.value || 1}A)`,
            type: 'fuse',
            val: t.value || 1,
            currentA: t.currentA || 0,
            isPowered: !t.isBlown && (t.currentA || 0) > 0.01,
            isBlown: t.isBlown,
          });
        }

        // Switches
        if (t.type === 'switch') {
          switches.push({
            id: `switch-${y}-${x}`,
            label: t.labels[4] || (t.subtype === 'btn' ? '按鈕開關' : '刀閘開關'),
            isActive: !!t.isActive,
          });
        }
      }
    }

    if (currentA > 0.001) {
      powerW = terminalV * currentA;
    }

    // Determine loop status
    let loopStatus: 'closed' | 'open' | 'short' = 'open';
    if (isShort || isBlown) {
      loopStatus = 'short';
    } else if (currentA > 0.002) {
      loopStatus = 'closed';
    } else {
      loopStatus = 'open';
    }

    return {
      currentA,
      terminalV,
      powerW,
      loadR,
      emf,
      internalR,
      isShort,
      isBlown,
      loopStatus,
      batteryCount,
      meters,
      loads,
      switches,
    };
  }, [grid, ticker]);

  // One-click Verification Execution
  const handleVerify = () => {
    let result: { success: boolean; message: string };
    if (isJunior) {
      result = verifyJuniorElectricityCircuit(grid, gridSize, logicLevel);
    } else {
      result = verifySeniorElectricityCircuit(grid, gridSize, logicLevel);
    }

    setVerifyResult(result);
    onShowAlert?.(result.message);
    if (result.success) {
      onVerifySuccess?.(result.message);
    }
  };

  // 60FPS Characteristic Curve Rendering Loop for sh-1-1 and sh-1-2
  useEffect(() => {
    if (!hasCurve || isMinimized || activeTab !== 'curve') return;

    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { currentA, terminalV, loadR, emf, internalR } = telemetry;

      const W = canvas.width;
      const H = canvas.height;
      const margin = { left: 46, right: 18, top: 22, bottom: 32 };
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
        const toY = (v: number) => H - margin.bottom - (Math.max(0, Math.min(maxV, v)) / maxV) * plotH;

        // Grid lines
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

        // Ticks
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
          ctx.fillText(i.toFixed(1) + 'A', toX(i), H - margin.bottom + 5);
        }

        // Axis Titles
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('端電壓 V', margin.left, 6);
        ctx.textAlign = 'right';
        ctx.fillText('電流 I (A)', W - margin.right, H - 16);

        // Theoretical Negative Slope Line: V = E - I*r
        const xStart = toX(0);
        const yStart = toY(emf);
        const xEnd = toX(emf / internalR);
        const yEnd = toY(0);

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();

        // Intercept annotation
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`ℰ = ${emf.toFixed(2)}V`, xStart + 4, yStart - 8);

        // Record Trail Point
        const px = toX(currentA);
        const py = toY(terminalV);
        const trail = trailPointsRef.current;
        if (
          trail.length === 0 ||
          Math.hypot(trail[trail.length - 1].px - px, trail[trail.length - 1].py - py) > 4
        ) {
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

        // Draw Live Point (Pulse Halo)
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

        // Coordinate Badge
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
        const toY = (p: number) => H - margin.bottom - (Math.max(0, Math.min(maxP, p)) / maxP) * plotH;

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

        // Ticks
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
          ctx.fillText(r.toFixed(0) + 'Ω', toX(r), H - margin.bottom + 5);
        }

        // Axis Titles
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('負載功率 P', margin.left, 6);
        ctx.textAlign = 'right';
        ctx.fillText('負載電阻 R (Ω)', W - margin.right, H - 16);

        // Theoretical Bell-Shaped Curve: P(R) = E^2 * R / (R + r)^2
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
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

        // Live Point (loadR, liveP)
        const liveP = (emf * emf * loadR) / Math.pow(loadR + internalR, 2);
        const px = toX(loadR);
        const py = toY(liveP);

        // Trail
        const trail = trailPointsRef.current;
        if (
          trail.length === 0 ||
          Math.hypot(trail[trail.length - 1].px - px, trail[trail.length - 1].py - py) > 4
        ) {
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

        // Coordinate Badge
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
  }, [hasCurve, isLevel1_1, isLevel1_2, isMinimized, activeTab, telemetry]);

  // Only render for junior high or senior high electricity levels
  if (!isJunior && !isSenior) return null;

  return (
    <div
      ref={containerRef}
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      className={`fixed ${
        position ? '' : 'top-20 right-6 md:right-80'
      } z-30 pointer-events-auto select-none transition-shadow duration-150`}
    >
      <div
        className={`border-2 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 flex flex-col w-[335px] max-h-[88vh] ${
          isJunior
            ? 'bg-slate-900/95 border-emerald-500/80 shadow-emerald-950/40'
            : 'bg-slate-900/95 border-indigo-500/80 shadow-indigo-950/40'
        }`}
      >
        {/* Draggable Header Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b cursor-move ${
            isJunior ? 'border-emerald-500/40' : 'border-indigo-500/40'
          }`}
          title="按住此處可自由拖曳移動視窗"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs truncate mr-1">
            <GripHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <Zap className={`w-4 h-4 shrink-0 ${isJunior ? 'text-emerald-400' : 'text-indigo-400'}`} />
            <span className={`truncate ${isJunior ? 'text-emerald-300' : 'text-indigo-300'}`}>
              {levelTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {hasCurve && activeTab === 'curve' && (
              <button
                onClick={clearTrail}
                title="清除實驗軌跡點"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? '展開視窗' : '收合視窗'}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-3 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(88vh-44px)]">
            {/* 1. Level Mission & Hint Card */}
            <div
              className={`p-2.5 rounded-xl border text-xs space-y-2 transition-all duration-200 ${
                isJunior
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                  : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-100'
              }`}
            >
              {/* Category Badge & Expand Toggle */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isJunior
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {levelCategory}
                </span>

                <button
                  onClick={() => setShowHintCard(!showHintCard)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showHintCard ? (
                    <>
                      <span>收合說明</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>查看任務</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Mission Details */}
              {showHintCard && (
                <div className="space-y-2 pt-1 border-t border-slate-800/60">
                  <div className="text-[11px] text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {levelDescription}
                  </div>
                </div>
              )}

              {/* One-Click Verification Button */}
              <div className="pt-1">
                <button
                  onClick={handleVerify}
                  className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer ${
                    isJunior
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isJunior ? '⚡ 驗證電路 (Circuit Check)' : '⚡ 驗證實驗 (Experiment Check)'}</span>
                </button>
              </div>

              {/* Verification Result Feedback */}
              {verifyResult && (
                <div
                  className={`p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
                    verifyResult.success
                      ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-900/60 border border-rose-500/50 text-rose-200'
                  }`}
                >
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-tight">{verifyResult.message}</span>
                </div>
              )}
            </div>

            {/* 2. Tab Navigation (Only for SH-1-1 and SH-1-2) */}
            {hasCurve && (
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('curve')}
                  className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'curve'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>特性曲線</span>
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'telemetry'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>電路監控</span>
                </button>
              </div>
            )}

            {/* 3. Tab: Characteristic Curve Plot (SH-1-1 & SH-1-2) */}
            {hasCurve && activeTab === 'curve' && (
              <div className="flex flex-col gap-2">
                {/* Canvas Graph */}
                <div className="w-full flex justify-center rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-inner">
                  <canvas ref={canvasRef} width={310} height={195} className="block" />
                </div>

                {/* Real-Time Formula & Stats Badge */}
                {isLevel1_1 ? (
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-sky-300 font-bold border-b border-slate-800 pb-1">
                      <span>方程式：V = ℰ - I·r</span>
                      <span>斜率 m = -{telemetry.internalR.toFixed(1)}Ω</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        端電壓 V：
                        <span className="text-amber-400 font-bold">{telemetry.terminalV.toFixed(2)} V</span>
                      </div>
                      <div>
                        放電電流 I：
                        <span className="text-sky-400 font-bold">{telemetry.currentA.toFixed(2)} A</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans leading-tight">
                      👉 拖曳滑動變阻器改變負載，黃色光點會即時沿著負斜率直線滑動！
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1">
                      <span>公式：P = ℰ²R / (R+r)²</span>
                      <span className="text-rose-400">頂點 R = r = 1.0Ω</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        負載電阻 R：
                        <span className="text-sky-400 font-bold">{telemetry.loadR.toFixed(1)} Ω</span>
                      </div>
                      <div>
                        輸出功率 P：
                        <span className="text-amber-400 font-bold">{telemetry.powerW.toFixed(2)} W</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans leading-tight">
                      👉 調節變阻器至 R = 1.0Ω 時，輸出功率達到最高峰 P_max = 0.56W！
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Tab: Telemetry & Live Circuit Data */}
            {(!hasCurve || activeTab === 'telemetry') && (
              <div className="flex flex-col gap-2.5">
                {/* Circuit Overview Header Cards */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {/* Loop State */}
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="text-[10px] text-slate-400 mb-0.5">迴路狀態</div>
                    {telemetry.loopStatus === 'closed' ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        通路 (ON)
                      </span>
                    ) : telemetry.loopStatus === 'short' ? (
                      <span className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        短路/熔斷
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        斷路 (OFF)
                      </span>
                    )}
                  </div>

                  {/* Terminal V */}
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">端電壓 V</div>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {telemetry.terminalV.toFixed(2)} V
                    </div>
                  </div>

                  {/* Current A */}
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">迴路電流 I</div>
                    <div className="text-xs font-mono font-bold text-sky-400">
                      {telemetry.currentA < 0.1
                        ? `${(telemetry.currentA * 1000).toFixed(1)} mA`
                        : `${telemetry.currentA.toFixed(2)} A`}
                    </div>
                  </div>
                </div>

                {/* Meter Readings List */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 border-b border-slate-800/80 pb-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    <span>電錶即時讀數 (Meters)</span>
                  </div>

                  {telemetry.meters.length > 0 ? (
                    <div className="space-y-1.5">
                      {telemetry.meters.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 font-mono"
                        >
                          <span className="text-slate-300 font-sans">{m.label}</span>
                          <span
                            className={`font-bold ${
                              m.type === 'v'
                                ? 'text-amber-400'
                                : m.type === 'a'
                                ? 'text-sky-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {m.strVal}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[11px] text-slate-500">
                      電路中尚未放置電錶（伏特計、安培計或檢流計）
                    </div>
                  )}
                </div>

                {/* Components & Loads Status List */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 border-b border-slate-800/80 pb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>負載與元件狀態 (Components)</span>
                  </div>

                  {telemetry.loads.length > 0 || telemetry.switches.length > 0 ? (
                    <div className="space-y-1.5">
                      {/* Switches */}
                      {telemetry.switches.map((sw) => (
                        <div
                          key={sw.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800"
                        >
                          <span className="text-slate-300 flex items-center gap-1">
                            <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />
                            {sw.label}
                          </span>
                          <span
                            className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                              sw.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sw.isActive ? '導通 (ON)' : '斷開 (OFF)'}
                          </span>
                        </div>
                      ))}

                      {/* Loads & Resistors */}
                      {telemetry.loads.map((load) => (
                        <div
                          key={load.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800"
                        >
                          <span className="text-slate-300 flex items-center gap-1 truncate mr-2">
                            {load.type === 'load' ? (
                              <Lightbulb
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  load.isPowered ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                                }`}
                              />
                            ) : load.type === 'fuse' ? (
                              <ShieldAlert
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  load.isBlown ? 'text-rose-500' : 'text-emerald-400'
                                }`}
                              />
                            ) : (
                              <Sliders className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                            )}
                            <span className="truncate">{load.label}</span>
                          </span>

                          <span className="font-mono text-[11px] font-bold shrink-0">
                            {load.isBlown ? (
                              <span className="text-rose-500">已熔斷 (Blown)</span>
                            ) : load.isPowered ? (
                              <span className="text-amber-400">
                                {load.currentA < 0.1
                                  ? `${(load.currentA * 1000).toFixed(0)}mA`
                                  : `${load.currentA.toFixed(2)}A`}{' '}
                                (發光)
                              </span>
                            ) : (
                              <span className="text-slate-500">未通電</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[11px] text-slate-500">
                      迴路中尚無負載元件
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
