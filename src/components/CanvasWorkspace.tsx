/**
 * @license
 * CanvasWorkspace Component for Auto Studio Pro
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  AppMode,
  ToolType,
  Tile,
  Faults,
  NodePin,
  ClipboardData,
  Waypoint,
  LogicLevelId,
} from '../types';
import { buildNetState } from '../engine/NetEngine';
import { ElectronicEngine } from '../engine/ElectronicEngine';
import { LogicEngine } from '../engine/LogicEngine';
import { verifyLogicCircuit } from '../engine/truthTableCheck';
import { WiringEngine } from '../engine/WiringEngine';

interface CanvasWorkspaceProps {
  currentMode: AppMode;
  currentTool: ToolType;
  gridSize: number;
  zoom: number;
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
  onUpdateMeterValues: (vals: { vVal: number; aVal: number; wVal: number; oscVal: number | null }) => void;
  onSaveState: () => void;
  onSelectionChange: (bounds: { minX: number; maxX: number; minY: number; maxY: number } | null) => void;
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
  onSelectionChange,
  onUndo,
  onSetTool,
  onLoadLogicLevel,
  onRotatePlacement,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse & Interaction State
  const [mousePosRaw, setMousePosRaw] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverNode, setHoverNode] = useState<NodePin | null>(null);
  const [multimeterProbes, setMultimeterProbes] = useState<[NodePin | null, NodePin | null]>([
    null,
    null,
  ]);
  const [shortSelectionNode, setShortSelectionNode] = useState<string | null>(null);
  const [movingTiles, setMovingTiles] = useState<{ dx: number; dy: number; ox: number; oy: number; tile: Tile }[] | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState({ x: 0, y: 0 });
  const [selectEnd, setSelectEnd] = useState({ x: 0, y: 0 });

  // Quick Popup Measurement Result
  const [quickPopup, setQuickPopup] = useState<{
    show: boolean;
    isClosed: boolean;
  }>({ show: false, isClosed: false });

  const [airElecShortFlag, setAirElecShortFlag] = useState(false);
  const [winTriggered, setWinTriggered] = useState(false);

  // Helper for pin positions
  const getPinAbs = useCallback((x: number, y: number, p: number) => {
    let px = x * TILE_SIZE + TILE_SIZE / 2;
    let py = y * TILE_SIZE + TILE_SIZE / 2;
    if (p === 0) py -= TILE_SIZE / 3;
    if (p === 1) px += TILE_SIZE / 3;
    if (p === 2) py += TILE_SIZE / 3;
    if (p === 3) px -= TILE_SIZE / 3;
    return { x: px, y: py };
  }, []);

  // Selection bounds
  const getSelectionBounds = useCallback(() => {
    return {
      minX: Math.min(selectStart.x, selectEnd.x),
      maxX: Math.max(selectStart.x, selectEnd.x),
      minY: Math.min(selectStart.y, selectEnd.y),
      maxY: Math.max(selectStart.y, selectEnd.y),
    };
  }, [selectStart, selectEnd]);

  // Check interference for clipboard paste
  const checkInterference = useCallback(() => {
    if (!clipboard) return false;
    for (let y = 0; y < clipboard.h; y++) {
      for (let x = 0; x < clipboard.w; x++) {
        const tx = mousePos.x + x;
        const ty = mousePos.y + y;
        if (
          clipboard.data[y][x] &&
          (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || grid[ty]?.[tx])
        ) {
          return true;
        }
      }
    }
    return false;
  }, [clipboard, mousePos, gridSize, grid]);

  // Rotate tile or tile group
  const rotateTileGroup = useCallback(
    (px: number, py: number) => {
      const t = grid[py]?.[px];
      if (!t) return;

      if (t.isLocked) {
        onShowAlert('此教學元件已被鎖定，無法旋轉！');
        return;
      }

      if (currentMode === 'plc' && t.type === 'plc' && t.subtype !== 'unit') {
        onShowAlert('⚠️ 階梯圖元件方向固定為水平，無法旋轉！');
        return;
      }

      onSaveState();

      if (!t.groupId) {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[py][px]) {
            next[py][px] = Object.assign(new Tile(), next[py][px], {
              rotation: (next[py][px]!.rotation + 1) % 4,
            });
          }
          return next;
        });
        return;
      }

      // Group rotation
      const groupCells: { x: number; y: number; tile: Tile }[] = [];
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (grid[y][x] && grid[y][x]!.groupId === t.groupId) {
            groupCells.push({ x, y, tile: grid[y][x]! });
          }
        }
      }

      let canRotate = true;
      const newPositions: { x: number; y: number; tile: Tile }[] = [];
      for (const cell of groupCells) {
        const dx = cell.x - px;
        const dy = cell.y - py;
        const nx = px - dy;
        const ny = py + dx;
        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
          canRotate = false;
          break;
        }
        const existing = grid[ny][nx];
        if (existing && existing.groupId !== t.groupId) {
          canRotate = false;
          break;
        }
        newPositions.push({ x: nx, y: ny, tile: cell.tile });
      }

      if (canRotate) {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          for (const cell of groupCells) next[cell.y][cell.x] = null;
          for (const pos of newPositions) {
            next[pos.y][pos.x] = Object.assign(new Tile(), pos.tile, {
              rotation: (pos.tile.rotation + 1) % 4,
            });
          }
          return next;
        });
      } else {
        onShowAlert('空間不足或有障礙物，無法旋轉群組！');
      }
    },
    [grid, gridSize, onSaveState, onShowAlert, setGrid]
  );

  // Quick measurement popup handler
  const triggerQuickPopup = (isClosed: boolean) => {
    setQuickPopup({ show: true, isClosed });
    setTimeout(() => {
      setQuickPopup({ show: false, isClosed: false });
      setMultimeterProbes([null, null]);
    }, 1200);
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;

    const mx = Math.floor(rawX / TILE_SIZE);
    const my = Math.floor(rawY / TILE_SIZE);

    setMousePosRaw({ x: rawX, y: rawY });
    setMousePos({ x: mx, y: my });

    if (isSelecting) {
      setSelectEnd({ x: mx, y: my });
    }

    // Hover node detection
    let foundHover: NodePin | null = null;
    if (mx >= 0 && mx < gridSize && my >= 0 && my < gridSize) {
      let minD = Infinity;
      for (let p = 0; p < 4; p++) {
        const pAbs = getPinAbs(mx, my, p);
        const d = Math.hypot(pAbs.x - rawX, pAbs.y - rawY);
        if (d < 20 && d < minD) {
          minD = d;
          foundHover = { x: mx, y: my, pin: p };
        }
      }
    }
    setHoverNode(foundHover);

    // Drag-holding interactive buttons
    if (currentTool === 'interact' && e.buttons === 1) {
      const t = grid[my]?.[mx];
      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const curr = prev[my][mx];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
              if (c && curr.groupId && c.groupId === curr.groupId) return Object.assign(new Tile(), c, { isActive: true });
              if (
                c && curr.labels && curr.labels[4] &&
                c.labels && c.labels[4] === curr.labels[4] &&
                (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
              ) {
                return Object.assign(new Tile(), c, { isActive: true });
              }
              return c;
            })
          );
        });
      }
    }
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return; // Right click handles rotation
    if (mousePos.x < 0 || mousePos.x >= gridSize || mousePos.y < 0 || mousePos.y >= gridSize) return;

    // Multimeter mode
    if (currentTool === 'multimeter' && hoverNode) {
      if (!multimeterProbes[0] || (multimeterProbes[0] && multimeterProbes[1])) {
        setMultimeterProbes([hoverNode, null]);
      } else {
        const p0 = multimeterProbes[0];
        const p1 = hoverNode;
        setMultimeterProbes([p0, p1]);

        const engineMode = currentMode === 'plc' ? 'wiring' : currentMode;
        const { netMap } = buildNetState(grid, gridSize, gridSize, engineMode, faults);
        const id1 = netMap[p0.y]?.[p0.x]?.[p0.pin] || 0;
        const id2 = netMap[p1.y]?.[p1.x]?.[p1.pin] || 0;
        const isClosed = id1 > 0 && id1 === id2;
        triggerQuickPopup(isClosed);
      }
      return;
    }

    // Fault Open
    if (currentTool === 'fault-open' && hoverNode) {
      onSaveState();
      const nodeStr = `${hoverNode.x},${hoverNode.y},${hoverNode.pin}`;
      setFaults((prev) => {
        const idx = prev.opens.indexOf(nodeStr);
        if (idx >= 0) {
          return { ...prev, opens: prev.opens.filter((_, i) => i !== idx) };
        } else {
          return { ...prev, opens: [...prev.opens, nodeStr] };
        }
      });
      return;
    }

    // Fault Short
    if (currentTool === 'fault-short' && hoverNode) {
      const nodeStr = `${hoverNode.x},${hoverNode.y},${hoverNode.pin}`;
      if (!shortSelectionNode) {
        setShortSelectionNode(nodeStr);
        onShowAlert('請點擊第二個接點以建立短路');
      } else {
        if (shortSelectionNode !== nodeStr) {
          onSaveState();
          setFaults((prev) => ({
            ...prev,
            shorts: [...prev.shorts, [shortSelectionNode, nodeStr]],
          }));
          onShowAlert('已建立短路！');
        }
        setShortSelectionNode(null);
      }
      return;
    }

    // Move Tool
    if (currentTool === 'move') {
      if (movingTiles) {
        let canPlace = true;
        for (const mt of movingTiles) {
          const nx = mousePos.x + mt.dx;
          const ny = mousePos.y + mt.dy;
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            canPlace = false;
            break;
          }
          if (grid[ny][nx] !== null) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          onSaveState();
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            for (const mt of movingTiles) {
              const nx = mousePos.x + mt.dx;
              const ny = mousePos.y + mt.dy;
              next[ny][nx] = mt.tile;
            }
            return next;
          });
          setMovingTiles(null);
        } else {
          onShowAlert('該位置已有元件或超出邊界！');
        }
      } else {
        const ct = grid[mousePos.y][mousePos.x];
        if (ct) {
          const toMove = [];
          if (ct.groupId) {
            for (let y = 0; y < gridSize; y++) {
              for (let x = 0; x < gridSize; x++) {
                if (grid[y][x] && grid[y][x].groupId === ct.groupId) {
                  toMove.push({ x, y, tile: grid[y][x] });
                }
              }
            }
          } else {
            toMove.push({ x: mousePos.x, y: mousePos.y, tile: ct });
          }
          
          const moveData = toMove.map(m => ({
            dx: m.x - mousePos.x,
            dy: m.y - mousePos.y,
            ox: m.x,
            oy: m.y,
            tile: m.tile
          }));
          
          onSaveState();
          setGrid(prev => {
            const next = prev.map(row => [...row]);
            for (const m of toMove) {
              next[m.y][m.x] = null;
            }
            return next;
          });
          setMovingTiles(moveData);
        }
      }
      return;
    }
    const t = grid[mousePos.y][mousePos.x];

    // Interact Mode
    if (currentTool === 'interact') {
      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const curr = prev[mousePos.y][mousePos.x];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
              if (c && curr.groupId && c.groupId === curr.groupId) return Object.assign(new Tile(), c, { isActive: true });
              if (
                c && curr.labels && curr.labels[4] &&
                c.labels && c.labels[4] === curr.labels[4] &&
                (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
              ) {
                return Object.assign(new Tile(), c, { isActive: true });
              }
              return c;
            })
          );
        });
      } else if (t && t.type === 'breaker') {
        const ns = !t.isActive;
        setGrid((prev) =>
          prev.map((row) =>
            row.map((c) => (c && c.groupId === t.groupId ? Object.assign(new Tile(), c, { isActive: ns }) : c))
          )
        );
      } else if (t && t.type === 'switch') {
        if (t.subtype === 'sel13') {
          const st = ((t.state || 0) + 1) % 2;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (next[mousePos.y][mousePos.x]) {
              next[mousePos.y][mousePos.x]!.state = st;
            }
            return next;
          });
        }
      } else if (t && t.type === 'logic' && t.subtype === 'power') {
        const ns = !t.isActive;
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[mousePos.y][mousePos.x]) {
            next[mousePos.y][mousePos.x] = Object.assign(new Tile(), next[mousePos.y][mousePos.x], { isActive: ns });
          }
          return next;
        });
      } else if (t && t.type === 'resistor') {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'power' && (t.subtype === 'ac' || t.subtype === 'power_ac')) {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'logic' && t.subtype === 'clock') {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'capacitor') {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'meter') {
        let unit = t.subtype === 'v' ? 'V' : t.subtype === 'a' ? 'A' : t.subtype === 'osc' ? 'V' : 'W';
        let val = (t.measureVal || 0).toFixed(3);
        if (t.subtype === 'a') {
          val = ((t.measureVal || 0) * 1000).toFixed(2);
          unit = 'mA';
        }
        onShowAlert(`測量數值：${val} ${unit}`);
      } else if (
        t &&
        (t.type === 'relay' ||
          (t.type === 'misc' && t.subtype === 'blank') ||
          t.type === 'terminal' ||
          (t.type === 'pneumatic' && (t.subtype === 'valve_coil' || t.subtype === 'valve_52')))
      ) {
        if (t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_')) onOpenModal(t, 'timer', mousePos);
        else onOpenModal(t, 'label', mousePos);
      } else if (t && t.type === 'load' && t.subtype === 'lightbulb') {
        onOpenModal(t, 'color', mousePos);
      } else if (t && t.type === 'protection' && t.subtype === 'fuse' && t.isBlown) {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[mousePos.y][mousePos.x]) {
            next[mousePos.y][mousePos.x]!.isBlown = false;
          }
          return next;
        });
        onShowAlert('保險絲已更換成功！');
      }
    } else if (currentTool === 'label') {
      if (t) {
        if (t.subtype.startsWith('ton') || t.subtype.startsWith('tof') || t.subtype === 'flash_coil') onOpenModal(t, 'timer', mousePos);
        else onOpenModal(t, 'label', mousePos);
      }
    } else if (currentTool === 'select') {
      setIsSelecting(true);
      setSelectStart({ ...mousePos });
      setSelectEnd({ ...mousePos });
      onSelectionChange(null);
    } else if (currentTool === 'paste') {
      if (!clipboard || checkInterference()) {
        onShowAlert('無法貼上：區域有干涉或超出邊界！');
        return;
      }
      onSaveState();
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        for (let y = 0; y < clipboard.h; y++) {
          for (let x = 0; x < clipboard.w; x++) {
            const tx = mousePos.x + x;
            const ty = mousePos.y + y;
            if (clipboard.data[y][x] && tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize) {
              next[ty][tx] = Object.assign(new Tile(), clipboard.data[y][x]);
            }
          }
        }
        return next;
      });
    } else if (
      currentTool === 'place' ||
      currentTool === 'plc_a' ||
      currentTool === 'plc_b' ||
      currentTool === 'plc_p' ||
      currentTool === 'plc_n' ||
      currentTool === 'plc_pls' ||
      currentTool === 'plc_plf' ||
      currentTool === 'plc_out'
    ) {
      if (grid[mousePos.y][mousePos.x] && grid[mousePos.y][mousePos.x]!.isLocked) {
        onShowAlert('此元件已被鎖定，無法覆蓋！');
        return;
      }

      // PLC Mode Zone Boundary Enforcement
      if (currentMode === 'plc') {
        const splitCol = gridSize <= 10 ? 5 : 10;
        const isLadderElement =
          currentTool === 'plc_a' ||
          currentTool === 'plc_b' ||
          currentTool === 'plc_p' ||
          currentTool === 'plc_n' ||
          currentTool === 'plc_pls' ||
          currentTool === 'plc_plf' ||
          currentTool === 'plc_out' ||
          (placementType === 'plc' && placementSubtype !== 'unit');

        const isWiringElement =
          !isLadderElement &&
          placementType !== 'wire' &&
          currentTool !== 'autowire';

        if (isWiringElement && mousePos.x < splitCol) {
          onShowAlert(`⚠️ 工業配線物件不能放在階梯圖區域內 (x < ${splitCol})！`);
          return;
        }

        if (isLadderElement && mousePos.x >= splitCol) {
          onShowAlert(`⚠️ 階梯圖物件不能放在工業配線區域內 (x ≥ ${splitCol})！`);
          return;
        }
      }

      onSaveState();

      if (
        currentTool === 'plc_a' ||
        currentTool === 'plc_b' ||
        currentTool === 'plc_p' ||
        currentTool === 'plc_n' ||
        currentTool === 'plc_pls' ||
        currentTool === 'plc_plf' ||
        currentTool === 'plc_out'
      ) {
        const st =
          currentTool === 'plc_a'
            ? 'no'
            : currentTool === 'plc_b'
            ? 'nc'
            : currentTool === 'plc_p' || currentTool === 'plc_pls'
            ? 'pls'
            : currentTool === 'plc_n' || currentTool === 'plc_plf'
            ? 'plf'
            : 'out';
        const newT = new Tile('plc', st);
        newT.labels[4] = ''; // Requirement 7: blank default label
        newT.rotation = 0;
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      } else if (
        placementType === 'plc' &&
        (placementSubtype === 'no' ||
          placementSubtype === 'nc' ||
          placementSubtype === 'pls' ||
          placementSubtype === 'plf' ||
          placementSubtype === 'out')
      ) {
        const newT = new Tile('plc', placementSubtype);
        newT.labels[4] = ''; // Requirement 7: blank default label
        newT.rotation = 0;
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      } else if (placementType === 'plc' && placementSubtype === 'unit') {
        if (
          mousePos.x + 3 < gridSize &&
          mousePos.y + 9 < gridSize
        ) {
          let empty = true;
          for (let dy = 0; dy < 10; dy++) {
            for (let dx = 0; dx < 4; dx++) {
              if (grid[mousePos.y + dy][mousePos.x + dx]) {
                empty = false;
                break;
              }
            }
          }
          if (empty) {
            const gid = 'plc_' + Date.now();
            setGrid((prev) => {
              const next = prev.map((row) => [...row]);
              for (let dy = 0; dy < 10; dy++) {
                for (let dx = 0; dx < 4; dx++) {
                  const tile = new Tile('plc', 'unit');
                  tile.groupId = gid;
                  tile.dx = dx;
                  tile.dy = dy;
                  next[mousePos.y + dy][mousePos.x + dx] = tile;
                }
              }
              return next;
            });
          } else {
            onShowAlert('空間不足，PLC 主機需要 4x10 格連續空位！');
          }
        } else {
          onShowAlert('空間不足，超出畫布邊界！');
        }
      } else if (
        placementType === 'relay' &&
        (placementSubtype === 'coil' ||
          placementSubtype === 'no' ||
          placementSubtype === 'nc' ||
          placementSubtype === 'con' ||
          placementSubtype.startsWith('ton_') ||
          placementSubtype.startsWith('tof_') ||
          placementSubtype === 'flash_coil' ||
          placementSubtype === 'impulse_coil')
      ) {
        const isTimerContact = placementSubtype.startsWith('ton_') || placementSubtype.startsWith('tof_');
        const isFlashCoil = placementSubtype === 'flash_coil';
        const isImpulseCoil = placementSubtype === 'impulse_coil';
        let prefix = 'K';
        if (isTimerContact) prefix = 'T';
        if (isFlashCoil) prefix = 'F';
        if (isImpulseCoil) prefix = 'P';
        let maxNum = 0;
        for (const r of grid) {
          for (const c of r) {
            if (
              c &&
              c.type === 'relay' &&
              c.labels[4] &&
              c.labels[4].match(new RegExp(`^${prefix}\\d+$`))
            ) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
        const newT = new Tile(placementType, placementSubtype, (isTimerContact || isFlashCoil) ? 1000 : 0);
        newT.labels[4] = prefix + (maxNum + 1);
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      } else if (placementType === 'terminal' && placementSubtype === 'block') {
        let maxNum = 0;
        for (const r of grid) {
          for (const c of r) {
            if (c && c.type === 'terminal' && c.labels[4] && c.labels[4].match(/^TB\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(2)));
            }
          }
        }
        const newT = new Tile(placementType, placementSubtype);
        newT.labels[4] = 'TB' + (maxNum + 1);
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      } else if (
        placementType === 'pneumatic' &&
        (placementSubtype === 'valve_coil' || placementSubtype === 'valve_52')
      ) {
        let maxNum = 0;
        for (const r of grid) {
          for (const c of r) {
            if (c && c.type === 'pneumatic' && c.labels[4] && c.labels[4].match(/^V\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
        const newT = new Tile(placementType, placementSubtype, 100);
        if (placementSubtype === 'valve_coil') {
          newT.labels[4] = 'V' + (maxNum + 1);
        } else {
          let maxV = 0;
          for (const r of grid) {
            for (const c of r) {
              if (
                c &&
                c.type === 'pneumatic' &&
                c.subtype === 'valve_coil' &&
                c.labels[4] &&
                c.labels[4].match(/^V\d+$/)
              ) {
                maxV = Math.max(maxV, parseInt(c.labels[4].substring(1)));
              }
            }
          }
          newT.labels[4] = 'V' + Math.max(1, maxV);
        }
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      } else if (placementType === 'power' && placementSubtype === 'psu') {
        if (
          mousePos.x + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y][mousePos.x + 1]
        ) {
          const gid = 'psu_' + Date.now();
          const left = new Tile('power', 'psu_left');
          left.groupId = gid;
          const right = new Tile('power', 'psu_right');
          right.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = left;
            next[mousePos.y][mousePos.x + 1] = right;
            return next;
          });
        }
      } else if (placementType === 'switch' && placementSubtype === '4way') {
        if (
          mousePos.y + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y + 1][mousePos.x]
        ) {
          const gid = 'sw4_' + Date.now();
          const top = new Tile('switch', '4way_top');
          top.groupId = gid;
          const bot = new Tile('switch', '4way_bot');
          bot.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = top;
            next[mousePos.y + 1][mousePos.x] = bot;
            return next;
          });
        }
      } else if (placementType === 'breaker' && placementSubtype === 'mcb') {
        if (
          mousePos.x + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y][mousePos.x + 1]
        ) {
          const gid = 'brk_' + Date.now();
          const t1 = new Tile('breaker', 'mcb');
          t1.groupId = gid;
          const t2 = new Tile('breaker', 'mcb');
          t2.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = t1;
            next[mousePos.y][mousePos.x + 1] = t2;
            return next;
          });
        } else {
          onShowAlert('空間不足，斷路器需要橫向連續 2 格空位！');
        }
      } else if (placementType === 'platform' && placementSubtype === 'main') {
        if (
          mousePos.y >= 2 &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y - 1][mousePos.x] &&
          !grid[mousePos.y - 2][mousePos.x]
        ) {
          const gid = 'plat_' + Date.now();
          const bot = new Tile('platform', 'bot');
          bot.groupId = gid;
          bot.extension = 0;
          const mid = new Tile('platform', 'mid');
          mid.groupId = gid;
          const top = new Tile('platform', 'top');
          top.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = bot;
            next[mousePos.y - 1][mousePos.x] = mid;
            next[mousePos.y - 2][mousePos.x] = top;
            return next;
          });
        } else {
          onShowAlert('空間不足，移動平台需要垂直連續 3 格空位！');
        }
      } else if (placementType === 'pneumatic' && placementSubtype === 'cylinder') {
        if (
          mousePos.y >= 2 &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y - 1][mousePos.x] &&
          !grid[mousePos.y - 2][mousePos.x]
        ) {
          const gid = 'cyl_' + Date.now();
          const bot = new Tile('pneumatic', 'cyl_bot');
          bot.groupId = gid;
          bot.extension = 0;
          const mid = new Tile('pneumatic', 'cyl_mid');
          mid.groupId = gid;
          const top = new Tile('pneumatic', 'cyl_top');
          top.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = bot;
            next[mousePos.y - 1][mousePos.x] = mid;
            next[mousePos.y - 2][mousePos.x] = top;
            return next;
          });
        } else {
          onShowAlert('空間不足，氣壓缸需要垂直連續 3 格空位！');
        }
      } else {
        let dVal = 100;
        if (placementType === 'power' && (placementSubtype === 'ac' || placementSubtype === 'power_ac'))
          dVal = 1;
        else if (placementType === 'power') dVal = 12;
        else if (placementType === 'capacitor') dVal = 10000;
        else if (placementType === 'logic' && placementSubtype === 'clock') dVal = 1;

        const newT = new Tile(placementType, placementSubtype, dVal);
        newT.rotation = placementRotation;

        if (placementType === 'btn' && placementSubtype === 'no') {
          newT.labels[1] = '13';
          newT.labels[2] = '14';
        } else if (placementType === 'btn' && placementSubtype === 'nc') {
          newT.labels[1] = '11';
          newT.labels[2] = '12';
        }

        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[mousePos.y][mousePos.x] = newT;
          return next;
        });
      }
    } else if (currentTool === 'autowire') {
      const last = autowireWaypoints[autowireWaypoints.length - 1];
      if (!last || last.x !== mousePos.x || last.y !== mousePos.y) {
        setAutowireWaypoints((prev) => [...prev, { x: mousePos.x, y: mousePos.y }]);
      }
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      const b = getSelectionBounds();
      if (
        b.maxX >= b.minX &&
        b.maxY >= b.minY &&
        (b.maxX > b.minX || b.maxY > b.minY || grid[b.minY]?.[b.minX])
      ) {
        onSelectionChange(b);
      }
    }
    // Release active pushbuttons
    setGrid((prev) =>
      prev.map((row) =>
        row.map((c) =>
          c && (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
            ? Object.assign(new Tile(), c, { isActive: false })
            : c
        )
      )
    );
  };

  // Context Menu Rotation
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentTool === 'place') {
      onRotatePlacement();
    } else {
      rotateTileGroup(mousePos.x, mousePos.y);
    }
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        onUndo();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (currentTool === 'place') {
          onRotatePlacement();
        } else {
          rotateTileGroup(mousePos.x, mousePos.y);
        }
      }
      if (e.key === 'Escape') {
        if (currentTool === 'paste') onSetTool('interact');
        if (currentTool === 'select') onSelectionChange(null);
        if (currentTool === 'move' && movingTiles) {
          setGrid(prev => {
            const next = prev.map(row => [...row]);
            for (const mt of movingTiles) {
              next[mt.oy][mt.ox] = mt.tile;
            }
            return next;
          });
          setMovingTiles(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateTileGroup, mousePos, currentTool, onUndo, onSetTool, onSelectionChange, onRotatePlacement]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const engineMode = currentMode === 'plc' ? 'wiring' : currentMode;
      const w = grid[0]?.length || gridSize;
      const h = grid.length || gridSize;
      const { netMap, netCount } = buildNetState(grid, w, h, engineMode, faults);
      const netData = Array(netCount + 1)
        .fill(0)
        .map(() => ({ color: '#4a5568', isHigh: false }));

      if (engineMode === 'electronic') {
        const meterVals = ElectronicEngine.simulate(grid, netMap, netData, meterChannel);
        onUpdateMeterValues(meterVals);
      } else if (engineMode === 'logic' || engineMode === 'tutorial') {
        LogicEngine.simulate(grid, netMap, netData);
      } else if (engineMode === 'wiring') {
        WiringEngine.simulate(
          grid,
          netMap,
          netData,
          onShowAlert,
          airElecShortFlag,
          setAirElecShortFlag
        );
      }

      // Clear Canvas
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // PLC Mode dual background
      if (currentMode === 'plc') {
        const splitCol = gridSize <= 10 ? 5 : 10;
        const splitX = splitCol * TILE_SIZE;

        // Ladder on left (0 to splitX)
        ctx.fillStyle = 'rgba(30, 27, 75, 0.4)';
        ctx.fillRect(0, 0, splitX, canvas.height);

        // Wiring on right (splitX to width)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(splitX, 0, canvas.width - splitX, canvas.height);

        // Power Rail Line for Ladder (Left edge)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(3, 0); // 3 to make it visible at left edge
        ctx.lineTo(3, canvas.height);
        ctx.stroke();

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('24V/H Power Rail', 10, 20);

        // Ground Rail Line for Ladder (Right edge of ladder area)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(splitX - 3, 0);
        ctx.lineTo(splitX - 3, canvas.height);
        ctx.stroke();

        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('0V/G Ground Rail', splitX - 10, 20);

        // Divider Line
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🧩 PLC 階梯圖編輯區', splitX / 2, 50);
        ctx.fillText('⚡ 外部硬體與工業配線區', splitX + (canvas.width - splitX) / 2, 50);
      }

      // Grid Lines
      const gridStep = gridSize <= 10 ? 5 : 10;
      for (let x = 0; x <= gridSize; x++) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = x % gridStep === 0 ? 2 : 1;
        ctx.setLineDash(x % gridStep === 0 ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, gridSize * TILE_SIZE);
        ctx.stroke();
        if (x % gridStep === 0 && x > 0 && x < gridSize) {
          ctx.fillStyle = '#475569';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(x.toString(), x * TILE_SIZE + 6, 16);
        }
      }
      for (let y = 0; y <= gridSize; y++) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = y % gridStep === 0 ? 2 : 1;
        ctx.setLineDash(y % gridStep === 0 ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(gridSize * TILE_SIZE, y * TILE_SIZE);
        ctx.stroke();
        if (y % gridStep === 0 && y > 0 && y < gridSize) {
          ctx.fillStyle = '#475569';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(y.toString(), 6, y * TILE_SIZE + 16);
        }
      }
      ctx.setLineDash([]);

      // Render Tiles
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const t = grid[y]?.[x];
          if (t) {
            const hideWireColors = currentMode === 'wiring' && subMode === 'debug';
            const localColors = [0, 1, 2, 3].map((d) => {
              const absDir = (d + t.rotation) % 4;
              const nid = netMap[y]?.[x]?.[absDir];
              if (hideWireColors) return '#4a5568';
              return nid > 0 ? netData[nid].color : '#4a5568';
            });
            renderTileInstance(ctx, currentMode, x, y, t, localColors);
          }
        }
      }

      // Render Labels
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const t = grid[y]?.[x];
          if (t && t.labels) {
            const cx = x * TILE_SIZE + TILE_SIZE / 2;
            const cy = y * TILE_SIZE + TILE_SIZE / 2;

            for (let i = 0; i <= 4; i++) {
              const labelText = t.labels[i];
              if (labelText) {
                if (
                  i === 4 &&
                  (t.type === 'plc' ||
                    t.type === 'terminal' ||
                    t.subtype === 'no' ||
                    t.subtype === 'nc' ||
                    t.subtype === 'pls' ||
                    t.subtype === 'plf' ||
                    t.subtype === 'plc_a' ||
                    t.subtype === 'plc_b' ||
                    t.subtype === 'plc_p' ||
                    t.subtype === 'plc_n' ||
                    t.subtype === 'plc_pls' ||
                    t.subtype === 'plc_plf' ||
                    t.subtype === 'out' ||
                    t.subtype === 'con' ||
                    t.subtype === 'coil' ||
                    t.subtype === 'ton' ||
                    t.subtype === 'tof' ||
                    t.subtype.startsWith('ton_') ||
                    t.subtype.startsWith('tof_') ||
                    t.subtype === 'flash_coil' ||
                    t.subtype === 'impulse_coil' ||
                    t.subtype === 'plc_out')
                ) {
                  continue;
                }
                const effPos = i === 4 ? 4 : (i + t.rotation) % 4;

                ctx.save();
                ctx.font = '14px monospace';
                const textW = ctx.measureText(labelText).width;
                const textH = 14;

                let px = cx,
                  py = cy,
                  align: CanvasTextAlign = 'center',
                  base: CanvasTextBaseline = 'middle';
                const offset = 36;

                if (effPos === 0) {
                  px = cx - offset;
                  py = cy - offset;
                  align = 'left';
                  base = 'top';
                } else if (effPos === 1) {
                  px = cx + offset;
                  py = cy - offset;
                  align = 'right';
                  base = 'top';
                } else if (effPos === 2) {
                  px = cx + offset;
                  py = cy + offset;
                  align = 'right';
                  base = 'bottom';
                } else if (effPos === 3) {
                  px = cx - offset;
                  py = cy + offset;
                  align = 'left';
                  base = 'bottom';
                } else if (effPos === 4) {
                  px = cx;
                  py = cy;
                  align = 'center';
                  base = 'middle';
                }

                ctx.textAlign = align;
                ctx.textBaseline = base;

                const bgPadX = 6,
                  bgPadY = 4;
                let bgX = px,
                  bgY = py;

                if (align === 'left') bgX = px - bgPadX;
                else if (align === 'right') bgX = px - textW - bgPadX;
                else if (align === 'center') bgX = px - textW / 2 - bgPadX;

                if (base === 'top') bgY = py - bgPadY;
                else if (base === 'bottom') bgY = py - textH - bgPadY;
                else if (base === 'middle') bgY = py - textH / 2 - bgPadY;

                ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
                ctx.beginPath();
                if (ctx.roundRect)
                  ctx.roundRect(bgX, bgY, textW + bgPadX * 2, textH + bgPadY * 2, 4);
                else ctx.rect(bgX, bgY, textW + bgPadX * 2, textH + bgPadY * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                let textDrawY = py;
                if (base === 'top') textDrawY += 1;
                else if (base === 'bottom') textDrawY -= 1;
                ctx.fillText(labelText, px, textDrawY);

                ctx.restore();
              }
            }
          }
        }
      }

      // Selection box
      if (currentTool === 'select' || isSelecting) {
        const b = getSelectionBounds();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          b.minX * TILE_SIZE,
          b.minY * TILE_SIZE,
          (b.maxX - b.minX + 1) * TILE_SIZE,
          (b.maxY - b.minY + 1) * TILE_SIZE
        );
        ctx.setLineDash([]);
      }

      // Clipboard Preview
      if (currentTool === 'paste' && clipboard) {
        const interference = checkInterference();
        ctx.globalAlpha = 0.5;
        for (let y = 0; y < clipboard.h; y++) {
          for (let x = 0; x < clipboard.w; x++) {
            if (clipboard.data[y][x]) {
              const tx = mousePos.x + x;
              const ty = mousePos.y + y;
              if (interference || tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } else {
                renderTileInstance(ctx, currentMode, tx, ty, clipboard.data[y][x]!, [
                  '#94a3b8',
                  '#94a3b8',
                  '#94a3b8',
                  '#94a3b8',
                ]);
              }
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Placement Ghost Preview
      const isPlaceTool =
        currentTool === 'place' ||
        currentTool === 'plc_a' ||
        currentTool === 'plc_b' ||
        currentTool === 'plc_p' ||
        currentTool === 'plc_n' ||
        currentTool === 'plc_pls' ||
        currentTool === 'plc_plf' ||
        currentTool === 'plc_out';

      if (
        isPlaceTool &&
        mousePos.x >= 0 &&
        mousePos.x < gridSize &&
        mousePos.y >= 0 &&
        mousePos.y < gridSize
      ) {
        let pType = placementType;
        let pSubtype = placementSubtype;
        if (currentTool === 'plc_a') { pType = 'plc'; pSubtype = 'no'; }
        else if (currentTool === 'plc_b') { pType = 'plc'; pSubtype = 'nc'; }
        else if (currentTool === 'plc_p' || currentTool === 'plc_pls') { pType = 'plc'; pSubtype = 'pls'; }
        else if (currentTool === 'plc_n' || currentTool === 'plc_plf') { pType = 'plc'; pSubtype = 'plf'; }
        else if (currentTool === 'plc_out') { pType = 'plc'; pSubtype = 'out'; }

        if (pType && pSubtype) {
          ctx.globalAlpha = 0.5;

          const ghostTiles: { x: number; y: number; tile: Tile }[] = [];
          
          if (pType === 'plc' && pSubtype === 'unit') {
            for (let dy = 0; dy < 10; dy++) {
              for (let dx = 0; dx < 4; dx++) {
                const tile = new Tile('plc', 'unit');
                tile.dx = dx;
                tile.dy = dy;
                ghostTiles.push({ x: mousePos.x + dx, y: mousePos.y + dy, tile });
              }
            }
          } else if (pType === 'power' && pSubtype === 'psu') {
            const left = new Tile('power', 'psu_left');
            const right = new Tile('power', 'psu_right');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: left });
            ghostTiles.push({ x: mousePos.x + 1, y: mousePos.y, tile: right });
          } else if (pType === 'switch' && pSubtype === '4way') {
            const top = new Tile('switch', '4way_top');
            const bot = new Tile('switch', '4way_bot');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: top });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y + 1, tile: bot });
          } else if (pType === 'breaker' && pSubtype === 'mcb') {
            const t1 = new Tile('breaker', 'mcb');
            const t2 = new Tile('breaker', 'mcb');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: t1 });
            ghostTiles.push({ x: mousePos.x + 1, y: mousePos.y, tile: t2 });
          } else if (pType === 'platform' && pSubtype === 'main') {
            const bot = new Tile('platform', 'bot');
            const mid = new Tile('platform', 'mid');
            const top = new Tile('platform', 'top');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: bot });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y - 1, tile: mid });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y - 2, tile: top });
          } else if (pType === 'pneumatic' && pSubtype === 'cylinder') {
            const bot = new Tile('pneumatic', 'cyl_bot');
            const mid = new Tile('pneumatic', 'cyl_mid');
            const top = new Tile('pneumatic', 'cyl_top');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: bot });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y - 1, tile: mid });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y - 2, tile: top });
          } else {
            const ghostTile = new Tile(pType, pSubtype);
            ghostTile.rotation = placementRotation;

            if (pType === 'btn' && pSubtype === 'no') {
              ghostTile.labels[1] = '13';
              ghostTile.labels[2] = '14';
            } else if (pType === 'btn' && pSubtype === 'nc') {
              ghostTile.labels[1] = '11';
              ghostTile.labels[2] = '12';
            }
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: ghostTile });
          }

          // Check boundary interference
          let canPlace = true;

          for (const gt of ghostTiles) {
            if (gt.x < 0 || gt.x >= gridSize || gt.y < 0 || gt.y >= gridSize) {
              canPlace = false;
              break;
            }
            if (grid[gt.y]?.[gt.x]) {
              canPlace = false;
              break;
            }

            if (currentMode === 'plc') {
              const splitCol = gridSize <= 10 ? 5 : 10;
              const isLadderElement = pType === 'plc' && pSubtype !== 'unit';
              const isWiringElement = !isLadderElement && pType !== 'wire';

              if (isWiringElement && gt.x < splitCol) canPlace = false;
              if (isLadderElement && gt.x >= splitCol) canPlace = false;
            }
          }

          if (canPlace) {
             for (const gt of ghostTiles) {
                 renderTileInstance(ctx, currentMode, gt.x, gt.y, gt.tile, [
                    '#94a3b8',
                    '#94a3b8',
                    '#94a3b8',
                    '#94a3b8',
                 ]);
             }
          } else {
             ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
             for (const gt of ghostTiles) {
                 if (gt.x >= 0 && gt.x < gridSize && gt.y >= 0 && gt.y < gridSize) {
                     ctx.fillRect(gt.x * TILE_SIZE, gt.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                 }
             }
          }
          ctx.globalAlpha = 1.0;
        }
      }

      if (currentTool === 'move' && movingTiles) {
        ctx.globalAlpha = 0.5;
        let canPlace = true;
        for (const mt of movingTiles) {
          const nx = mousePos.x + mt.dx;
          const ny = mousePos.y + mt.dy;
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            canPlace = false;
            break;
          }
          if (grid[ny]?.[nx]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
           for (const mt of movingTiles) {
               const nx = mousePos.x + mt.dx;
               const ny = mousePos.y + mt.dy;
               renderTileInstance(ctx, currentMode, nx, ny, mt.tile, [
                  '#94a3b8',
                  '#94a3b8',
                  '#94a3b8',
                  '#94a3b8',
               ]);
           }
        } else {
           ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
           for (const mt of movingTiles) {
               const nx = mousePos.x + mt.dx;
               const ny = mousePos.y + mt.dy;
               if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                   ctx.fillRect(nx * TILE_SIZE, ny * TILE_SIZE, TILE_SIZE, TILE_SIZE);
               }
           }
        }
        ctx.globalAlpha = 1.0;
      }

      // Auto-wire preview
      if (currentTool === 'autowire') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.fillRect(mousePos.x * TILE_SIZE, mousePos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        autowireWaypoints.forEach((p, i) => {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(p.x * TILE_SIZE + 40, p.y * TILE_SIZE + 40, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((i + 1).toString(), p.x * TILE_SIZE + 40, p.y * TILE_SIZE + 45);
        });
      }

      // Fault Overlays
      if (isFaultMode) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        for (const n1 of faults.opens) {
          const [x1, y1, p1] = n1.split(',').map(Number);
          const pos = getPinAbs(x1, y1, p1);
          ctx.beginPath();
          ctx.moveTo(pos.x - 12, pos.y - 12);
          ctx.lineTo(pos.x + 12, pos.y + 12);
          ctx.moveTo(pos.x + 12, pos.y - 12);
          ctx.lineTo(pos.x - 12, pos.y + 12);
          ctx.stroke();
        }
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        for (const s of faults.shorts) {
          const [x1, y1, p1] = s[0].split(',').map(Number);
          const pos1 = getPinAbs(x1, y1, p1);
          const [x2, y2, p2] = s[1].split(',').map(Number);
          const pos2 = getPinAbs(x2, y2, p2);
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        if (shortSelectionNode) {
          const [x1, y1, p1] = shortSelectionNode.split(',').map(Number);
          const pos1 = getPinAbs(x1, y1, p1);
          ctx.strokeStyle = '#a855f7';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(mousePosRaw.x, mousePosRaw.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Multimeter Probes
      const probeColors = ['#ef4444', '#111827'];
      multimeterProbes.forEach((p, i) => {
        if (!p) return;
        const pos = getPinAbs(p.x, p.y, p.pin);
        ctx.strokeStyle = probeColors[i];
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + 15, pos.y + 35);
        ctx.stroke();
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (
        hoverNode &&
        (currentTool === 'fault-open' ||
          currentTool === 'fault-short' ||
          currentTool === 'multimeter')
      ) {
        const pos = getPinAbs(hoverNode.x, hoverNode.y, hoverNode.pin);
        ctx.fillStyle =
          currentTool === 'multimeter'
            ? 'rgba(253, 224, 71, 0.6)'
            : 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Win Condition Check (Logic Levels)
      if (
        currentMode === 'tutorial' &&
        logicLevel &&
        !winTriggered
      ) {
        let win = false;
        if (logicLevel === '0-1') {
          win = !!(grid[5]?.[4] && grid[5][4]!.isPowered);
        } else if (logicLevel === '0-2') {
          win = !!(grid[4]?.[5] && grid[4][5]!.isPowered);
        } else if (logicLevel === '0-3') {
          win = !!(grid[3]?.[4]?.isPowered && grid[5]?.[4]?.isPowered);
        } else if (logicLevel === '0-4') {
          const bridge = grid[4]?.[4];
          const isBridge = bridge && bridge.type === 'wire' && bridge.subtype === 'bridge';
          win = !!(grid[4]?.[6]?.isPowered && grid[6]?.[4]?.isPowered && isBridge);
        }

        if (win) {
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
  ]);

  // Render individual tile component graphics
  const renderTileInstance = (
    ctx: CanvasRenderingContext2D,
    mode: AppMode,
    x: number,
    y: number,
    t: Tile,
    localColors: string[]
  ) => {
    ctx.save();
    ctx.translate(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);

    if (t.isLocked && t.type !== 'wire') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-35, -35, 70, 70, 8);
        ctx.fill();
      } else {
        ctx.fillRect(-35, -35, 70, 70);
      }
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(-28, -28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, -28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-28, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate((t.rotation * Math.PI) / 2);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const c = localColors;
    const defC = '#4a5568';

    const line = (x1: number, y1: number, x2: number, y2: number, col?: string) => {
      ctx.strokeStyle = col || defC;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const drawPin = (d: number, length: number, overrideColor?: string) => {
      const col = overrideColor || c[d] || defC;
      ctx.strokeStyle = col;
      ctx.beginPath();
      if (d === 0) {
        ctx.moveTo(0, -40);
        ctx.lineTo(0, -40 + length);
      }
      if (d === 1) {
        ctx.moveTo(40, 0);
        ctx.lineTo(40 - length, 0);
      }
      if (d === 2) {
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 40 - length);
      }
      if (d === 3) {
        ctx.moveTo(-40, 0);
        ctx.lineTo(-40 + length, 0);
      }
      ctx.stroke();

      ctx.fillStyle = col;
      ctx.beginPath();
      if (d === 0) ctx.arc(0, -40, 4, 0, Math.PI * 2);
      if (d === 1) ctx.arc(40, 0, 4, 0, Math.PI * 2);
      if (d === 2) ctx.arc(0, 40, 4, 0, Math.PI * 2);
      if (d === 3) ctx.arc(-40, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    if (t.type === 'wire') {
      if (t.subtype === 'straight') {
        line(0, -40, 0, 40, c[0] || c[2]);
      } else if (t.subtype === 'turn') {
        line(0, -40, 0, 0, c[0]);
        line(0, 0, 40, 0, c[1]);
      } else if (t.subtype === 't') {
        line(-40, 0, 0, 0, c[3]);
        line(0, 40, 0, 0, c[2]);
        line(40, 0, 0, 0, c[1]);
        ctx.fillStyle = c[2] || defC;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.subtype === 'cross') {
        line(0, -40, 0, 40, c[0]);
        line(-40, 0, 40, 0, c[1]);
        ctx.fillStyle = c[0] || defC;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.subtype === 'bridge') {
        line(0, -40, 0, 40, c[0] || c[2]);
        line(-40, 0, -12, 0, c[3]);
        line(12, 0, 40, 0, c[1]);
        ctx.strokeStyle = c[3] || c[1] || defC;
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI, 0);
        ctx.stroke();
      } else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g' || t.subtype === 'plus' || t.subtype === 'minus' || t.subtype === 'ground') {
        line(0, 0, 0, 40, c[2]);

        if (t.subtype === 'ground') {
          ctx.strokeStyle = c[2] || '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, -10);
          ctx.moveTo(-12, -10); ctx.lineTo(12, -10);
          ctx.moveTo(-8, -16); ctx.lineTo(8, -16);
          ctx.moveTo(-4, -22); ctx.lineTo(4, -22);
          ctx.stroke();
          
          ctx.fillStyle = c[2] || '#94a3b8';
          ctx.fillRect(-3, -25, 6, 6);
        } else {
          const isHigh = t.subtype === 'l' || t.subtype === 'h' || t.subtype === 'plus';
          const isOrange = t.subtype === 'plus';
          const isIndigo = t.subtype === 'minus';
          
          let labelText = t.subtype.toUpperCase();
          if (t.subtype === 'h') labelText = 'H';
          if (t.subtype === 'g') labelText = 'G';
          if (t.subtype === 'plus') labelText = '+';
          if (t.subtype === 'minus') labelText = '-';
          
          let bgColor = isHigh ? '#ef4444' : '#3b82f6';
          if (isOrange) bgColor = '#f97316';
          if (isIndigo) bgColor = '#6366f1';

          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.arc(0, -6, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, 0, -5);
        }
      }
    } else if (t.type === 'misc' && t.subtype === 'blank') {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-36, -36, 72, 72, 8);
      else ctx.rect(-36, -36, 72, 72);
      ctx.stroke();
      ctx.setLineDash([]);

      let hasLabel = false;
      for (let i = 0; i <= 4; i++) {
        if (t.labels[i]) hasLabel = true;
      }
      if (!hasLabel) {
        ctx.fillStyle = '#475569';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Note', 0, 0);
      }
    } else if (t.type === 'power') {
      if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {
        drawPin(0, 10);
        drawPin(2, 10);
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;

        if (t.subtype === 'psu_left') {
          // Left tile: draws the entire unified box
          ctx.beginPath();
          ctx.moveTo(0, -40); ctx.lineTo(0, -20);
          ctx.moveTo(0, 40); ctx.lineTo(0, 20);
          ctx.stroke();
          
          ctx.fillStyle = '#1e293b'; // Solid dark background for the box
          ctx.fillRect(-20, -20, 120, 40);
          ctx.strokeRect(-20, -20, 120, 40);
          
          // Diagonal line in the middle
          ctx.beginPath();
          ctx.moveTo(20, 20);
          ctx.lineTo(60, -20);
          ctx.stroke();
          
          // Labels
          ctx.fillStyle = '#06b6d4'; // Cyan for labels
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.fillText('L', -10, -10);
          ctx.fillText('+', -10, 10);
          
          ctx.fillText('N', 90, -10);
          ctx.fillText('-', 90, 10);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('~', 30, -5);
          ctx.fillText('=', 50, 7);
        } else {
          // Right tile: only draws the pins and connecting wires
          ctx.beginPath();
          ctx.moveTo(0, -40); ctx.lineTo(0, -20);
          ctx.moveTo(0, 40); ctx.lineTo(0, 20);
          ctx.stroke();
        }
      } else if (t.subtype === 'dc24') {
        drawPin(0, 10);
        drawPin(2, 10);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-24, -20, 48, 40);
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+24V', 0, -5);
        ctx.fillStyle = '#6366f1';
        ctx.fillText('0V', 0, 10);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(-15, -28); ctx.lineTo(-9, -28); ctx.moveTo(-12, -31); ctx.lineTo(-12, -25); ctx.stroke();
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(-15, 28); ctx.lineTo(-9, 28); ctx.stroke();
      } else {
        // generic power
        drawPin(0, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('V', 0, 4);
      }
    } else if (mode === 'logic' || mode === 'tutorial') {
      if (t.subtype === 'power' || t.subtype === 'pushbtn') {
        drawPin(1, 20);
        if (t.subtype === 'power') {
          ctx.fillStyle = t.isActive ? '#ef4444' : '#4a5568';
          ctx.fillRect(-20, -20, 32, 40);
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.fillText('I/O', -4, 4);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-20, -20, 32, 40);
          ctx.fillStyle = t.isActive ? '#ef4444' : '#374151';
          ctx.beginPath();
          ctx.arc(-4, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (t.subtype === 'clock') {
        drawPin(1, 20);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-20, -20, 32, 40);
        ctx.strokeStyle = t.outState ? '#10b981' : '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 4);
        ctx.lineTo(-4, 4);
        ctx.lineTo(-4, -6);
        ctx.lineTo(4, -6);
        ctx.lineTo(4, 4);
        ctx.lineTo(12, 4);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((t.value || 1) + 'Hz', -4, 16);
      } else if (t.subtype === 'roman') {
        drawPin(0, 18, c[0]);
        drawPin(1, 18, c[1]);
        drawPin(2, 18, c[2]);
        drawPin(3, 18, c[3]);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-22, -22, 44, 44);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(-22, -22, 44, 44);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V', 0, -17);
        ctx.fillText('I', 17, 0);
        ctx.fillText('I', 0, 17);
        ctx.fillText('I', -17, 0);

        const segments = [
          { char: 'I', on: t.pinStateI_L, x: -13 },
          { char: 'I', on: t.pinStateI_B, x: -5 },
          { char: 'I', on: t.pinStateI_R, x: 3 },
          { char: 'V', on: t.pinStateV, x: 13 },
        ];

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        segments.forEach((s) => {
          if (s.on) {
            ctx.fillStyle = '#3b82f6';
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 10;
            ctx.fillText(s.char, s.x, 0);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#334155';
            ctx.fillText(s.char, s.x, 0);
          }
        });
      } else if (t.subtype === 'led') {
        drawPin(3, 20);
        ctx.fillStyle = c[3] === '#ef4444' ? '#ef4444' : '#1f2937';
        ctx.beginPath();
        ctx.arc(8, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (c[3] === '#ef4444') {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (t.type === 'gate') {
        ctx.fillStyle = '#374151';
        ctx.lineWidth = 4;
        if (t.subtype === 'not' || t.subtype === 'buffer') {
          drawPin(3, 12);
          drawPin(1, 12);
          ctx.strokeStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(-16, -16);
          ctx.lineTo(16, 0);
          ctx.lineTo(-16, 16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          if (t.subtype === 'not') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(20, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        } else if (t.subtype === 'and' || t.subtype === 'nand') {
          drawPin(0, 12);
          drawPin(2, 12);
          drawPin(1, 12);
          ctx.strokeStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(-20, -20);
          ctx.lineTo(0, -20);
          ctx.arc(0, 0, 20, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(-20, 20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          if (t.subtype === 'nand') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(25, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          
          ctx.fillStyle = '#fff';
          ctx.font = '10px Arial';
          ctx.fillText(t.subtype === 'nand' ? 'NAND' : 'AND', -6, 4);
        } else if (t.subtype === 'or' || t.subtype === 'nor' || t.subtype === 'xor') {
          drawPin(0, 12);
          drawPin(2, 12);
          drawPin(1, 12);
          ctx.strokeStyle = '#1e293b';
          
          if (t.subtype === 'xor') {
            ctx.beginPath();
            ctx.moveTo(-24, -20);
            ctx.quadraticCurveTo(-14, 0, -24, 20);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.moveTo(-20, -20);
          ctx.quadraticCurveTo(0, -20, 20, 0);
          ctx.quadraticCurveTo(0, 20, -20, 20);
          ctx.quadraticCurveTo(-10, 0, -20, -20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          if (t.subtype === 'nor') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(25, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          
          ctx.fillStyle = '#fff';
          ctx.font = '10px Arial';
          let label = 'OR';
          if (t.subtype === 'nor') label = 'NOR';
          if (t.subtype === 'xor') label = 'XOR';
          ctx.fillText(label, -4, 4);
        }
      }
    } else if (mode === 'wiring' || mode === 'plc') {
      if (t.type === 'breaker') {
        drawPin(0, 16);
        drawPin(2, 16);
        const isClosed = t.isActive;

        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, -16, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 16, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isClosed ? '#10b981' : '#fff';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(0, 8);
        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.beginPath();
        if (isClosed) {
          ctx.moveTo(0, -8);
          ctx.lineTo(0, 8);
        } else {
          ctx.moveTo(0, 8);
          ctx.lineTo(-12, -4);
        }
        ctx.stroke();
      } else if (t.type === 'protection' && t.subtype === 'fuse') {
        drawPin(0, 16);
        drawPin(2, 16);
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-10, -16, 20, 32, 4);
        else ctx.rect(-10, -16, 20, 32);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        if (t.isBlown) {
          ctx.beginPath();
          ctx.moveTo(0, -16);
          ctx.lineTo(0, -5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, 16);
          ctx.lineTo(0, 5);
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💥', 0, 0);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -16);
          ctx.lineTo(0, 16);
          ctx.stroke();
        }
      } else if (t.type === 'terminal') {
        const col = t.isPowered ? '#ef4444' : '#64748b';
        
        drawPin(2, 26);
        
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.labels[4] || 'TB', 0, 0);
      } else if (
        t.type === 'btn' ||
        (t.type === 'relay' && (
          t.subtype === 'no' || t.subtype === 'nc' || t.subtype === 'con' ||
          t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_')
        ))
      ) {
        const isCon = t.subtype === 'con' || t.subtype === 'ton_con' || t.subtype === 'tof_con';
        const isNo = t.subtype === 'no' || t.subtype === 'ton_no' || t.subtype === 'tof_no' || (t.type === 'btn' && t.subtype === 'no');
        const isNc = t.subtype === 'nc' || t.subtype === 'ton_nc' || t.subtype === 'tof_nc' || (t.type === 'btn' && t.subtype === 'nc');

        const isTon = t.type === 'relay' && t.subtype.startsWith('ton_');
        const isTof = t.type === 'relay' && t.subtype.startsWith('tof_');

        if (isCon) {
          drawPin(0, 16);
          drawPin(1, 16);
          drawPin(2, 16);



          const isActuated = t.isActive || t.isPhysicallyPushed;

          // Terminal squares
          ctx.fillStyle = isActuated ? '#10b981' : '#94a3b8';
          ctx.fillRect(-3, -18, 6, 6);
          ctx.fillRect(12, -3, 6, 6);
          ctx.fillRect(-3, 12, 6, 6);

          // Terminal extensions
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -24);
          ctx.lineTo(0, -15);
          ctx.moveTo(24, 0);
          ctx.lineTo(15, 0);
          ctx.moveTo(0, 24);
          ctx.lineTo(0, 15);
          ctx.stroke();

          // CON switch arm
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -15);
          if (isActuated) {
            // connects to NO (pin 1, right)
            ctx.lineTo(12, 3);
          } else {
            // connects to NC (pin 2, bottom)
            ctx.lineTo(-5, 12);
          }
          ctx.stroke();

          // Draw TON/TOF umbrella for CON
          if (isTon || isTof) {
             ctx.strokeStyle = '#cbd5e1';
             ctx.lineWidth = 3;
             ctx.beginPath();
             
             // Midpoints
             const cx = isActuated ? 6 : -2.5;
             const cy = isActuated ? -6 : -1.5;
             
             ctx.moveTo(cx, cy);
             ctx.lineTo(cx - 10, cy);
             ctx.stroke();
             
             ctx.beginPath();
             if (isTon) {
                ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, false);
             } else if (isTof) {
                ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, true);
             }
             ctx.stroke();
          }

          // Labels
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || 'K1', 0, 36);
          // Label texts for pins
          ctx.font = '9px Arial';
          ctx.fillStyle = '#94a3b8';
          if (t.labels[0]) ctx.fillText(t.labels[0], -14, -28);
          if (t.labels[1]) ctx.fillText(t.labels[1], 28, -12);
          if (t.labels[2]) ctx.fillText(t.labels[2], -14, 28);
          
          ctx.restore();
          return;
        }
        drawPin(0, 16);
        drawPin(2, 16);



        const isClosed = isNo
            ? t.isActive || t.isPhysicallyPushed
            : isNc
            ? !(t.isActive || t.isPhysicallyPushed)
            : false;

        const isActuated = t.isActive || t.isPhysicallyPushed;

        // Terminal dots/squares
        ctx.fillStyle = isActuated ? '#10b981' : '#94a3b8';
        ctx.fillRect(-3, -18, 6, 6);
        ctx.fillRect(-3, 12, 6, 6);

        // Terminal extensions
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(0, -15);
        ctx.moveTo(0, 24);
        ctx.lineTo(0, 15);
        ctx.stroke();

        ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
        ctx.lineWidth = 3;

        if (isNo) {
          // NO contact
          ctx.beginPath();
          if (isTon || isTof) {
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 4);
            ctx.lineTo(isClosed ? 0 : -10, -15);
          } else {
            ctx.moveTo(0, 12);
            ctx.lineTo(isClosed ? 0 : -10, -12);
          }
          ctx.stroke();

          if (t.type === 'btn') {
            const eX = isClosed ? -12 : -22;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            
            // E shape
            ctx.beginPath();
            ctx.moveTo(eX, -6);
            ctx.lineTo(eX, 6);
            ctx.moveTo(eX, -6);
            ctx.lineTo(eX + 4, -6);
            ctx.moveTo(eX, 0);
            ctx.lineTo(eX + 4, 0);
            ctx.moveTo(eX, 6);
            ctx.lineTo(eX + 4, 6);
            ctx.stroke();

            // Dashed line
            ctx.beginPath();
            ctx.setLineDash([3, 2]);
            ctx.moveTo(eX + 4, 0);
            ctx.lineTo(isClosed ? 0 : -5, 0);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        // Draw TON/TOF umbrella / arrow
        if (isTon || isTof) {
          ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          
          let cx = 0;
          let cy = 0;
          
          if (isCon) {
             cx = isActuated ? 6 : -5;
             cy = isActuated ? -6 : 0;
          } else if (isNo) {
             cx = isClosed ? 0 : -5;
             cy = -5.5; // midpoint of the line from (0,4) to (-10,-15)
          } else if (isNc) {
             cx = isClosed ? 0 : 5;
             cy = -5.5;
          }
          
          // Draw stem
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - 10, cy);
          ctx.stroke();
          
          // Draw umbrella
          ctx.beginPath();
          if (isTon) {
             // TON: Bulge on the left (Canvas: from 90deg to 270deg clockwise goes through 180deg)
             ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, false);
          } else if (isTof) {
             // TOF: Bulge on the right (Canvas: from 90deg to 270deg counter-clockwise goes through 0deg)
             ctx.arc(cx - 10, cy, 6, Math.PI * 0.5, Math.PI * 1.5, true);
          }
          ctx.stroke();
        } else if (isNc) {
          // NC contact
          ctx.beginPath();
          if (isTon || isTof) {
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 4);
            ctx.lineTo(isClosed ? 0 : 10, -15);
          } else {
            ctx.moveTo(0, 12);
            ctx.lineTo(isClosed ? 0 : 10, -12);
          }
          ctx.stroke();

          if (t.type === 'btn') {
            const eX = isClosed ? -12 : -2;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            
            // E shape
            ctx.beginPath();
            ctx.moveTo(eX, -6);
            ctx.lineTo(eX, 6);
            ctx.moveTo(eX, -6);
            ctx.lineTo(eX + 4, -6);
            ctx.moveTo(eX, 0);
            ctx.lineTo(eX + 4, 0);
            ctx.moveTo(eX, 6);
            ctx.lineTo(eX + 4, 6);
            ctx.stroke();

            // Dashed line
            ctx.beginPath();
            ctx.setLineDash([3, 2]);
            ctx.moveTo(eX + 4, 0);
            ctx.lineTo(isClosed ? 0 : 5, 0);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.labels[4] || (t.type === 'btn' ? 'BTN' : 'RELAY'), 0, 36);

      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const isActuated = t.isActive || t.isPhysicallyPushed;
        const st = isActuated ? 1 : 0;
        drawPin(1, 10);
        drawPin(3, 10);
        
        if (t.subtype === '4way_top') {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(-10, 0);
          ctx.lineTo(-10, 20);
          ctx.moveTo(30, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(10, 20);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, 17, 6, 6);
          ctx.fillRect(7, 17, 6, 6);
          ctx.fillStyle = '#10b981'; // Emerald 500 for numbers
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('1', -5, 20);
          ctx.fillText('3', 15, 20);

          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          if (st === 0) {
            ctx.moveTo(0, 40);
            ctx.lineTo(10, 20);
            ctx.moveTo(0, 40);
            ctx.lineTo(-10, 20);
          } else {
            ctx.moveTo(-10, 40);
            ctx.lineTo(-10, 20);
            ctx.moveTo(10, 40);
            ctx.lineTo(10, 20);
          }
          ctx.stroke();

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.setLineDash([4, 2]);
          if (st === 0) {
             ctx.moveTo(-25, 40);
             ctx.lineTo(0, 40);
          } else {
             ctx.moveTo(-15, 40);
             ctx.lineTo(-10, 40);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.beginPath();
          if (st === 0) {
             ctx.moveTo(-25, 30);
             ctx.lineTo(-30, 30);
             ctx.lineTo(-30, 50);
             ctx.lineTo(-25, 50);
          } else {
             ctx.moveTo(-15, 30);
             ctx.lineTo(-20, 30);
             ctx.lineTo(-20, 50);
             ctx.lineTo(-15, 50);
          }
          ctx.stroke();
          
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || 'SW', 0, -20);
        } else {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(-10, 0);
          ctx.lineTo(-10, -20);
          ctx.moveTo(30, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(10, -20);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, -23, 6, 6);
          ctx.fillRect(7, -23, 6, 6);
          ctx.fillStyle = '#10b981'; // Emerald 500
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('2', -5, -17);
          ctx.fillText('4', 15, -17);

          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          if (st === 0) {
            ctx.moveTo(-10, -20);
            ctx.lineTo(0, -40);
            ctx.moveTo(10, -20);
            ctx.lineTo(0, -40);
          } else {
            ctx.moveTo(-10, -20);
            ctx.lineTo(-10, -40);
            ctx.moveTo(10, -20);
            ctx.lineTo(10, -40);
          }
          ctx.stroke();
          
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || '4-WAY', 0, 36);
        }
      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        drawPin(0, 10);
        drawPin(1, 10);
        drawPin(2, 10);

        // Terminals matching RightSidebar SVG
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -23, 6, 6); // Top
        ctx.fillRect(17, -3, 6, 6);  // Right
        ctx.fillRect(-3, 17, 6, 6);  // Bottom

        // Wires to terminals
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Top wire
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -20);
        ctx.lineTo(-8, -20);
        // Right wire
        ctx.moveTo(30, 0);
        ctx.lineTo(20, 0);
        // Bottom wire
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 20);
        ctx.stroke();
        
        const st = t.state || 0;

        // Switch Arm
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); // Pivot
        if (st === 0) {
          ctx.lineTo(-8, -20); // Connects to top left
        } else {
          ctx.lineTo(20, 0); // Connects to right
        }
        ctx.stroke();

        // Actuator Dashed Line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        if (st === 0) {
          ctx.moveTo(-25, 0);
          ctx.lineTo(-8, 0);
        } else {
          ctx.moveTo(-15, 10);
          ctx.lineTo(10, 10);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Actuator Handle
        ctx.beginPath();
        if (st === 0) {
          ctx.moveTo(-25, -10);
          ctx.lineTo(-30, -10);
          ctx.lineTo(-30, 10);
          ctx.lineTo(-35, 10);
        } else {
          ctx.moveTo(-15, 0);
          ctx.lineTo(-20, 0);
          ctx.lineTo(-20, 20);
          ctx.lineTo(-25, 20);
        }
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.labels[4] || 'SW', 0, 36);
      } else if (t.subtype === 'coil' || t.subtype === 'ton' || t.subtype === 'tof' || t.subtype === 'flash_coil' || t.subtype === 'impulse_coil') {
        const isTimer = t.subtype === 'ton' || t.subtype === 'tof' || t.subtype === 'flash_coil';

        if (isTimer) {
          drawPin(0, 12);
          drawPin(2, 12);

          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(-22, -26, 44, 52, 6);
          else ctx.rect(-22, -26, 44, 52);
          ctx.fill();
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.stroke();

          let title = 'TON';
          if (t.subtype === 'tof') title = 'TOF';
          if (t.subtype === 'flash_coil') title = 'FLS';
          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.labels[4] || title, 0, t.subtype === 'flash_coil' ? -2 : -14);

          let displayMs = 0;
          let color = '#64748b';

          if (t.subtype === 'ton') {
            if (t.isPoweredAt === null) {
              displayMs = t.value;
              color = '#64748b';
            } else {
              displayMs = Math.min(t.value, Date.now() - t.isPoweredAt);
              if (displayMs < t.value) color = '#fde047';
              else color = '#10b981';
            }
          } else if (t.subtype === 'tof') {
            if (t.isPoweredAt === null) {
              displayMs = t.value;
              color = t.timerOutput ? '#10b981' : '#64748b';
            } else {
              displayMs = Math.min(t.value, Date.now() - t.isPoweredAt);
              if (displayMs < t.value) color = '#fde047';
              else {
                displayMs = t.value;
                color = '#64748b';
              }
            }
          } else if (t.subtype === 'flash_coil') {
            displayMs = t.value;
            color = t.isActive ? '#10b981' : '#64748b';
          }

          const displayStr = (displayMs / 1000).toFixed(1) + 's';
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = color;
          ctx.fillText(displayStr, 0, 15);
        } else {
          drawPin(0, 16);
          drawPin(2, 16);
          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || (t.subtype === 'impulse_coil' ? 'P' : 'K'), 0, 6);
        }
      } else if (t.type === 'load' && t.subtype === 'lightbulb') {
        drawPin(0, 16);
        drawPin(2, 16);
        const col = t.color || '#fde047';
        ctx.fillStyle = t.isPowered ? col : '#374151';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        if (t.isPowered) {
          ctx.shadowColor = col;
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = t.isPowered ? '#fff' : '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(-10, 10);
        ctx.stroke();
      } else if (t.type === 'load' && t.subtype === 'buzzer') {
        drawPin(0, 16);
        drawPin(2, 16);
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 4, 16, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-16, 4, 32, 8);

        if (t.isPowered) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -4, 10, Math.PI * 1.2, Math.PI * 1.8);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, -4, 18, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
          ctx.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
        }
      } else if (t.type === 'motor') {
        drawPin(0, 16);
        drawPin(2, 16);
        drawPin(1, 24, '#cbd5e1');
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        if (t.isPowered && t.motorDir !== 0) {
          t.rotationAngle = (t.rotationAngle || 0) + t.motorDir * 0.25;
        }
        ctx.rotate(t.rotationAngle || 0);
        ctx.fillStyle = t.isPowered ? '#10b981' : '#475569';
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(12, -12, 20, 0);
          ctx.quadraticCurveTo(12, 12, 0, 0);
          ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', 0, 1);
        if (t.isPowered) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (t.type === 'platform') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-30, -40, 60, 80);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(-30, -40, 60, 80);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -40, 24, 80);
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(-6, -40);
        ctx.lineTo(-6, 40);
        ctx.moveTo(6, -40);
        ctx.lineTo(6, 40);
        ctx.stroke();

        const pinCol3 = c[3] !== '#4a5568' ? c[3] : '#10b981';
        drawPin(3, 16, pinCol3);
        ctx.fillStyle = '#059669';
        ctx.fillRect(-36, -10, 6, 20);

        const ext = t.extension || 0;
        let active = false;

        if (t.subtype === 'top') {
          drawPin(0, 20, '#cbd5e1');
          if (ext > 1.9) active = true;
        } else if (t.subtype === 'mid') {
          if (ext >= 0.9 && ext <= 1.1) active = true;
        } else if (t.subtype === 'bot') {
          const pinCol2 = c[2] !== '#4a5568' ? c[2] : '#ef4444';
          drawPin(2, 16, pinCol2);
          if (ext < 0.1) active = true;
        }

        if (active) {
          ctx.fillStyle = pinCol3;
          ctx.beginPath();
          ctx.arc(-33, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          if (pinCol3 !== '#10b981') {
            ctx.shadowColor = pinCol3;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        if (t.subtype === 'bot') {
          ctx.save();
          ctx.translate(0, -ext * 80);
          ctx.fillStyle = '#6366f1';
          if (ctx.roundRect) ctx.roundRect(-24, -20, 48, 40, 6);
          else ctx.fillRect(-24, -20, 48, 40);
          ctx.fill();
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('STAGE', 0, 0);
          ctx.restore();
        }
      } else if (t.type === 'pneumatic') {
        if (t.subtype === 'air_source') {
          drawPin(2, 20, '#06b6d4');
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(-24, -20, 48, 40);
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(-24, -20, 48, 12);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('AIR', 0, 4);
        } else if (t.subtype === 'valve_coil') {
          drawPin(0, 16, '#a855f7');
          drawPin(2, 16, '#a855f7');
          ctx.fillStyle = '#7e22ce';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          if (!t.labels[4]) ctx.fillText('V', 0, 6);
        } else if (t.subtype === 'valve_52') {
          drawPin(2, 16, '#06b6d4');
          drawPin(0, 16, '#06b6d4');
          drawPin(1, 16, '#06b6d4');
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-28, -28, 56, 56);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(-28, -28, 56, 56);

          ctx.fillStyle = '#fff';
          ctx.font = '10px Arial';
          ctx.fillText('P', 0, 24);
          ctx.fillText('A', 0, -18);
          ctx.fillText('B', 20, 4);

          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 3;
          if (t.isActive) {
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.lineTo(0, -12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-4, -8);
            ctx.lineTo(0, -12);
            ctx.lineTo(4, -8);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.lineTo(0, 0);
            ctx.lineTo(12, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(8, -4);
            ctx.lineTo(12, 0);
            ctx.lineTo(8, 4);
            ctx.stroke();
          }
        } else if (t.subtype === 'cyl_mid') {
          ctx.fillStyle = '#334155';
          ctx.fillRect(-30, -40, 60, 80);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(-30, -40, 60, 80);
        } else if (t.subtype === 'cyl_top') {
          drawPin(3, 16, '#06b6d4');
          drawPin(1, 16, '#10b981');

          const ext = t.extension || 0;
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-6, -40 - ext * 80, 12, ext * 80 + 40);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-20, -40 - ext * 80 - 8, 40, 8);

          ctx.fillStyle = '#334155';
          ctx.fillRect(-30, -40, 60, 80);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(-30, -40, 60, 80);

          ctx.fillStyle = '#475569';
          ctx.fillRect(-36, -20, 6, 40);
          ctx.fillStyle = '#059669';
          ctx.fillRect(30, -20, 6, 40);

          if (ext >= 1.9) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(33, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (t.subtype === 'cyl_bot') {
          drawPin(3, 16, '#06b6d4');
          drawPin(1, 16, '#10b981');
          drawPin(2, 16, '#ef4444');

          ctx.fillStyle = '#334155';
          ctx.fillRect(-30, -40, 60, 80);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(-30, -40, 60, 80);

          ctx.fillStyle = '#475569';
          ctx.fillRect(-36, -20, 6, 40);
          ctx.fillStyle = '#059669';
          ctx.fillRect(30, -20, 6, 40);

          const ext = t.extension || 0;
          if (ext <= 0.1) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(33, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (t.type === 'plc') {
        if (
          t.subtype === 'no' ||
          t.subtype === 'plc_a' ||
          t.subtype === 'nc' ||
          t.subtype === 'plc_b' ||
          t.subtype === 'pls' ||
          t.subtype === 'plf' ||
          t.subtype === 'plc_p' ||
          t.subtype === 'plc_n' ||
          t.subtype === 'plc_pls' ||
          t.subtype === 'plc_plf'
        ) {
          const isNC = t.subtype === 'nc' || t.subtype === 'plc_b';
          const isPLS =
            t.subtype === 'pls' ||
            t.subtype === 'plc_p' ||
            t.subtype === 'plc_pls';
          const isPLF =
            t.subtype === 'plf' ||
            t.subtype === 'plc_n' ||
            t.subtype === 'plc_plf';
          const isClosed = isNC ? !t.isActive : t.isActive;

          drawPin(3, 14);
          drawPin(1, 14);

          // Horizontal connecting wires
          ctx.strokeStyle = isClosed ? '#10b981' : '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-10, 0);
          ctx.moveTo(10, 0);
          ctx.lineTo(20, 0);
          ctx.stroke();

          // Vertical contact bars
          ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-10, -14);
          ctx.lineTo(-10, 14);
          ctx.moveTo(10, -14);
          ctx.lineTo(10, 14);
          ctx.stroke();

          if (isNC) {
            // Diagonal slash for NC contact
            ctx.strokeStyle = isClosed ? '#10b981' : '#f87171';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-12, 12);
            ctx.lineTo(12, -12);
            ctx.stroke();
          } else if (isPLS) {
            // "P" symbol for Rising Edge Contact
            ctx.fillStyle = isClosed ? '#34d399' : '#10b981';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', 0, 1);
          } else if (isPLF) {
            // "N" symbol for Falling Edge Contact
            ctx.fillStyle = isClosed ? '#34d399' : '#f43f5e';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('N', 0, 1);
          }

          if (isClosed) {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Label text
          ctx.fillStyle = isClosed ? '#34d399' : '#fbbf24';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const defaultLabel = isNC
            ? '[/]'
            : isPLS
            ? '[P]'
            : isPLF
            ? '[N]'
            : '[ ]';
          ctx.fillText(t.labels[4] || defaultLabel, 0, -16);
        } else if (t.subtype === 'out' || t.subtype === 'plc_out') {
          // Requirement 6: Left pin only
          drawPin(3, 12);

          ctx.strokeStyle = t.isPowered ? '#10b981' : '#cbd5e1';
          ctx.lineWidth = 3;

          // Wire to coil
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-12, 0);
          ctx.stroke();

          // Coil Parenthesis ( )
          ctx.beginPath();
          ctx.arc(-20, 0, 16, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(20, 0, 16, (Math.PI * 2) / 3, (Math.PI * 4) / 3);
          ctx.stroke();

          if (t.isPowered) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Label text
          ctx.fillStyle = t.isPowered ? '#34d399' : '#fbbf24';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(t.labels[4] || '( )', 0, -16);
        } else if (t.dx === 0 && t.dy === 0) {
          ctx.translate(-TILE_SIZE / 2, -TILE_SIZE / 2);
          const W = TILE_SIZE * 4;
          const H = TILE_SIZE * 10;

          ctx.fillStyle = '#1e1b4b';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(0, 0, W, H, 8);
            ctx.fill();
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 4;
            ctx.stroke();
          } else {
            ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, W, H);
          }

          ctx.fillStyle = '#312e81';
          ctx.fillRect(10, 10, W - 20, H - 20);

          ctx.fillStyle = '#a5b4fc';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NPN PLC - 4x10 UNIT', W / 2, 75);

          const drawTerm = (
            cx: number,
            cy: number,
            label: string,
            isRight: boolean,
            isPower: boolean,
            dir: string,
            lineLen: number
          ) => {
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy - 4);
            ctx.lineTo(cx + 4, cy + 4);
            ctx.stroke();

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            if (dir === 'up') ctx.lineTo(cx, cy - lineLen);
            if (dir === 'down') ctx.lineTo(cx, cy + lineLen);
            if (dir === 'left') ctx.lineTo(cx - lineLen, cy);
            if (dir === 'right') ctx.lineTo(cx + lineLen, cy);
            ctx.stroke();

            ctx.fillStyle = isPower ? '#f87171' : '#60a5fa';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = isRight ? 'right' : 'left';
            const txtX = isRight ? cx - 15 : cx + 15;
            ctx.fillText(label, txtX, cy + 5);
          };

          // L & N in the middle 2 cells at top (x = 1.5 and 2.5)
          drawTerm(TILE_SIZE * 1.5, TILE_SIZE * 0.5, 'L (L1)', false, true, 'up', TILE_SIZE * 0.5);
          drawTerm(TILE_SIZE * 2.5, TILE_SIZE * 0.5, 'N (L2)', true, true, 'up', TILE_SIZE * 0.5);

          // +24V & 0V in the middle 2 cells at bottom (x = 1.5 and 2.5)
          drawTerm(
            TILE_SIZE * 1.5,
            TILE_SIZE * 9.5,
            '+24V',
            false,
            true,
            'down',
            TILE_SIZE * 0.5
          );
          drawTerm(TILE_SIZE * 2.5, TILE_SIZE * 9.5, '0V', true, true, 'down', TILE_SIZE * 0.5);

          // Reset button at top-left
          ctx.fillStyle = t.isReset ? '#f87171' : '#b91c1c';
          ctx.beginPath();
          ctx.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.5, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fecaca';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('RST', TILE_SIZE * 0.5, TILE_SIZE * 0.5);

          // X0~X7 moved up 1 grid position (1.5 to 8.5)
          for (let i = 0; i < 8; i++) {
            drawTerm(
              TILE_SIZE * 0.5,
              TILE_SIZE * (1.5 + i),
              'X' + i,
              false,
              false,
              'left',
              TILE_SIZE * 0.5
            );
          }

          // S/S moved to bottom left (x = 0.5, y = 9.5)
          drawTerm(
            TILE_SIZE * 0.5,
            TILE_SIZE * 9.5,
            'S/S',
            false,
            false,
            'left',
            TILE_SIZE * 0.5
          );

          drawTerm(
            TILE_SIZE * 3.5,
            TILE_SIZE * 0.5,
            'COM1',
            true,
            false,
            'right',
            TILE_SIZE * 0.5
          );
          for (let i = 0; i < 4; i++) {
            drawTerm(
              TILE_SIZE * 3.5,
              TILE_SIZE * (1.5 + i),
              'Y' + i,
              true,
              false,
              'right',
              TILE_SIZE * 0.5
            );
          }
          drawTerm(
            TILE_SIZE * 3.5,
            TILE_SIZE * 5.5,
            'COM2',
            true,
            false,
            'right',
            TILE_SIZE * 0.5
          );
          for (let i = 4; i < 8; i++) {
            drawTerm(
              TILE_SIZE * 3.5,
              TILE_SIZE * (2.5 + i),
              'Y' + i,
              true,
              false,
              'right',
              TILE_SIZE * 0.5
            );
          }

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(TILE_SIZE * 1.15, TILE_SIZE * 1.35, TILE_SIZE * 1.7, TILE_SIZE * 7.3);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(TILE_SIZE * 1.15, TILE_SIZE * 1.35, TILE_SIZE * 1.7, TILE_SIZE * 7.3);

          // Power LED (PWR)
          const isPowered = t.isPowered;
          ctx.fillStyle = isPowered ? '#10b981' : '#064e3b';
          ctx.beginPath();
          ctx.arc(TILE_SIZE * 1.4, TILE_SIZE * 1.65, 5, 0, Math.PI * 2);
          ctx.fill();
          if (isPowered) {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = isPowered ? '#34d399' : '#64748b';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('PWR', TILE_SIZE * 1.6, TILE_SIZE * 1.65);

          // Column Headers (IN & OUT)
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('IN', TILE_SIZE * 1.5, TILE_SIZE * 2.05);
          ctx.fillText('OUT', TILE_SIZE * 2.3, TILE_SIZE * 2.05);

          // Indicator Lights for X0..X7 and Y0..Y7
          for (let i = 0; i < 8; i++) {
            const yPos = TILE_SIZE * (2.4 + i * 0.75);

            // IN LED (Xi)
            const xActive = isPowered && (t.inputsActive?.[i] || false);
            ctx.fillStyle = xActive ? '#10b981' : '#064e3b';
            ctx.beginPath();
            ctx.arc(TILE_SIZE * 1.5, yPos, 4, 0, Math.PI * 2);
            ctx.fill();
            if (xActive) {
              ctx.shadowColor = '#10b981';
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
            }

            // OUT LED (Yi)
            const yActive = isPowered && (t.outputsActive?.[i] || false);
            ctx.fillStyle = yActive ? '#ef4444' : '#450a0a';
            ctx.beginPath();
            ctx.arc(TILE_SIZE * 2.3, yPos, 4, 0, Math.PI * 2);
            ctx.fill();
            if (yActive) {
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }

        }
      }
    }
    ctx.restore();
  };

  // Render tutorial details
  let tutorialTitle = '';
  let tutorialDesc = '';
  if ((currentMode === 'tutorial' || currentMode === 'logic' || currentMode === 'wiring') && logicLevel) {
    if (logicLevel === '0-1') {
      tutorialTitle = '0-1 基礎接線 (直線)';
      tutorialDesc =
        '請從右側選擇「直線導線」，放在開關與燈泡中間。接著切換至「👆 互動」按下開關！';
    } else if (logicLevel === '0-2') {
      tutorialTitle = '0-2 轉彎接線';
      tutorialDesc =
        '請使用「L型轉角」，連接開關與燈泡。放上後可按【R鍵】或滑鼠右鍵旋轉。';
    } else if (logicLevel === '0-3') {
      tutorialTitle = '0-3 並聯電路 (T型)';
      tutorialDesc = '請使用「T型三通」，讓一個開關同時點亮兩個燈泡！';
    } else if (logicLevel === '0-4') {
      tutorialTitle = '0-4 交錯獨立 (天橋)';
      tutorialDesc =
        '請使用「絕緣天橋」，讓上下開關控制上下燈，左右開關控制左右燈，不可互相干擾！';
    } else if (logicLevel === '1-1') {
      tutorialTitle = '1-1 數位世界 (0 與 1)';
      tutorialDesc = '請使用「直線導線」將高電位 (Power) 開關連接到 LED，並切換互動模式按下開關。';
    } else if (logicLevel === '1-2') {
      tutorialTitle = '1-2 緩衝與反相 (Buffer & NOT)';
      tutorialDesc = 'NOT 閘會將訊號反轉 (1 變 0，0 變 1)。請將線路接上，觀察開關對燈泡的相反效果。';
    } else if (logicLevel === '1-3') {
      tutorialTitle = '1-3 及閘 (AND Gate)';
      tutorialDesc = 'AND 閘需要所有輸入都是 1 才會輸出 1。請將兩個開關都接上 AND 閘，再接上燈泡。';
    } else if (logicLevel === '1-4') {
      tutorialTitle = '1-4 或閘 (OR Gate)';
      tutorialDesc = 'OR 閘只要有任何一個輸入是 1 就會輸出 1。試著將兩個開關接上 OR 閘，觀察燈泡變化。';
    } else if (logicLevel === '1-5') {
      tutorialTitle = '1-5 反及閘與反或閘 (NAND & NOR)';
      tutorialDesc = 'NAND = NOT(AND)，NOR = NOT(OR)。請分別將兩組開關接上，觀察它們的行為是否和 AND/OR 剛好相反。';
    } else if (logicLevel === '1-6') {
      tutorialTitle = '1-6 互斥或閘 (XOR Gate)';
      tutorialDesc = 'XOR 閘在兩個輸入不同 (一個0, 一個1) 時才會輸出 1。請將開關接上並觀察樓梯燈的邏輯！';
    } else if (logicLevel === '1-7') {
      tutorialTitle = '1-7 NAND/NOR 化身反相器';
      tutorialDesc = '任務：請只放置「1個開關」與「1個 LED」，並將 NAND 或 NOR 閘的兩個輸入端都接在一起，使其功能等同於 NOT 閘。';
    } else if (logicLevel === '2-1') {
      tutorialTitle = '2-1 萬用閘挑戰 (Universal Gates)';
      tutorialDesc = '只使用 NAND 閘，請你組合出一個 AND 閘的功能。';
    } else if (logicLevel === '2-2') {
      tutorialTitle = '2-2 多重輸入';
      tutorialDesc = '利用兩個 2-input AND 閘，拼湊出一個 3-input AND 閘。只有當三個開關都按下時，LED 才會亮。';
    } else if (logicLevel === '2-3') {
      tutorialTitle = '2-3 多工器 (Multiplexer / MUX)';
      tutorialDesc = '實作一個選擇器。用一個開關決定，LED 要顯示 A 訊號還是 B 訊號。';
    } else if (logicLevel === '2-4') {
      tutorialTitle = '2-4 解碼器 (Decoder)';
      tutorialDesc = '將兩條線的訊號 (00, 01, 10, 11) 轉換成四顆獨立的 LED 控制。';
    } else if (logicLevel === '2-5') {
      tutorialTitle = '2-5 多數決電路 (Majority Vote)';
      tutorialDesc = '三個評審按下圈選，只要有兩票（含）以上，就算通過（燈亮）。';
    } else if (logicLevel === '3-1') {
      tutorialTitle = '3-1 半加器 (Half Adder)';
      tutorialDesc = '將兩個輸入 (A, B) 相加，輸出「總和 (Sum)」與「進位 (Carry)」。(提示：使用 XOR 和 AND)。';
    } else if (logicLevel === '3-2') {
      tutorialTitle = '3-2 全加器 (Full Adder)';
      tutorialDesc = '加入前一個位元的進位 (Carry-in)，完成三個位元的相加。';
    } else if (logicLevel === '3-3') {
      tutorialTitle = '3-3 二位元加法機';
      tutorialDesc = '將兩個全加器串聯，達成 2-bit + 2-bit 的加法。';
    } else if (logicLevel === '3-4') {
      tutorialTitle = '3-4 數值比較器 (Comparator)';
      tutorialDesc = '判斷 A 和 B 兩個輸入，實作出「A > B」與「A = B」的亮燈邏輯。';
    } else if (logicLevel === '4-1') {
      tutorialTitle = '4-1 回饋與無窮迴圈 (Feedback Loop)';
      tutorialDesc = '將 NOT 閘的輸出接回輸入，觀察訊號震盪 (Oscillation) 或是利用 Clock 產生脈衝。';
    } else if (logicLevel === '4-2') {
      tutorialTitle = '4-2 SR 閂鎖器 (SR Latch)';
      tutorialDesc = '用兩個 NOR 閘交叉連接，做出一個有「設定(Set)」和「重置(Reset)」功能的記憶單元。';
    } else if (logicLevel === '4-3') {
      tutorialTitle = '4-3 D 型閂鎖器 (D Latch)';
      tutorialDesc = '加入 Enable 腳位，決定什麼時候才把資料存進去。';
    } else if (logicLevel === '4-4') {
      tutorialTitle = '4-4 D 型正反器 (D Flip-Flop)';
      tutorialDesc = 'D Flip-Flop 是邊緣觸發（Edge-triggered）的記憶體單元，請觀察它和 Latch 的差異。';
    } else if (logicLevel === '4-5') {
      tutorialTitle = '4-5 T 型正反器 (T Flip-Flop)';
      tutorialDesc = '實作 Toggle 功能，按一下燈亮，再按一下燈滅（狀態切換）。';
    } else if (logicLevel === '5-1') {
      tutorialTitle = '5-1 移位暫存器 (Shift Register)';
      tutorialDesc = '讓一排 LED 像跑馬燈一樣，隨著 Clock 把亮光往旁邊傳遞。';
    } else if (logicLevel === '5-2') {
      tutorialTitle = '5-2 非同步計數器 (Ripple Counter)';
      tutorialDesc = '利用 T Flip-Flop 串聯，做出可以數 0 到 3 (二進位 00 到 11) 的計數器。';
    } else if (logicLevel === '5-3') {
      tutorialTitle = '5-3 密碼鎖電路 (Digital Lock)';
      tutorialDesc = '必須「依序」按下 A、B 兩個按鈕，最後按下 Enter 才能開鎖；按錯則重置。';
    } else if (logicLevel === '5-4') {
      tutorialTitle = '5-4 自動販賣機邏輯';
      tutorialDesc = '投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。';
    } else if (logicLevel === 'w-1-1') {
      tutorialTitle = 'w-1-1 點亮指示燈';
      tutorialDesc = '任務：將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。';
    } else if (logicLevel === 'w-1-2') {
      tutorialTitle = 'w-1-2 串聯與及邏輯';
      tutorialDesc = '任務：必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。';
    } else if (logicLevel === 'w-1-3') {
      tutorialTitle = 'w-1-3 並聯與或邏輯';
      tutorialDesc = '任務：兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。';
    } else if (logicLevel === 'w-1-4') {
      tutorialTitle = 'w-1-4 常閉接點 (NC) 應用';
      tutorialDesc = '任務：燈泡預設是亮的，按下按鈕 (NC) 後燈滅。';
    } else if (logicLevel === 'w-2-1') {
      tutorialTitle = 'w-2-1 電磁接觸器 (MC) 基礎';
      tutorialDesc = '任務：用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。';
    } else if (logicLevel === 'w-2-2') {
      tutorialTitle = 'w-2-2 自保持電路 (Self-Holding)';
      tutorialDesc = '任務：按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。';
    } else if (logicLevel === 'w-2-3') {
      tutorialTitle = 'w-2-3 啟動與停止電路';
      tutorialDesc = '任務：在自保持電路中串入一個常閉按鈕 (NC) 作為「停止按鈕」，達成完整的 Start-Stop 控制。';
    } else if (logicLevel === 'w-2-4') {
      tutorialTitle = 'w-2-4 兩地控制 (Two-Place Control)';
      tutorialDesc = '任務：在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。';
    } else if (logicLevel === 'w-3-1') {
      tutorialTitle = 'w-3-1 電氣互鎖 (Electrical Interlock)';
      tutorialDesc = '任務：兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。';
    } else if (logicLevel === 'w-3-2') {
      tutorialTitle = 'w-3-2 三相感應馬達正反轉';
      tutorialDesc = '任務：結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。';
    } else if (logicLevel === 'w-3-3') {
      tutorialTitle = 'w-3-3 順序啟動 (Sequential Start)';
      tutorialDesc = '任務：廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。';
    } else if (logicLevel === 'w-4-1') {
      tutorialTitle = 'w-4-1 通電延遲 (ON-Delay)';
      tutorialDesc = '任務：按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。';
    } else if (logicLevel === 'w-4-2') {
      tutorialTitle = 'w-4-2 自動停止 (Auto-Stop)';
      tutorialDesc = '任務：馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。';
    } else if (logicLevel === 'w-4-3') {
      tutorialTitle = 'w-4-3 閃爍與交替控制 (Flasher)';
      tutorialDesc = '任務：利用計時器讓兩顆指示燈 (紅、綠) 交互閃爍。';
    } else if (logicLevel === 'w-4-4') {
      tutorialTitle = 'w-4-4 星角降壓啟動 (Y-Δ Starting)';
      tutorialDesc = '任務：大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。';
    } else if (logicLevel === 'w-5-1') {
      tutorialTitle = 'w-5-1 過載保護 (Thermal Overload)';
      tutorialDesc = '任務：將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。';
    } else if (logicLevel === 'w-5-2') {
      tutorialTitle = 'w-5-2 極限開關應用 (Limit Switch)';
      tutorialDesc = '任務：電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。';
    }
  }

  return (
    <main className="flex-1 relative overflow-auto bg-slate-950 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] select-none ">
      
      {currentMode === 'wiring' && logicLevel === 'wiring-menu' ? (
        <div className="min-w-full min-h-full w-max h-max p-8 flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-10 pb-20 mt-10">
            {[
              {
                title: '第一大類：基礎配線與接點邏輯 (Basic Wiring & Contacts)',
                levels: [
                  { id: 'w-1-1', title: '單元 1-1：點亮指示燈', desc: '將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。' },
                  { id: 'w-1-2', title: '單元 1-2：串聯與及邏輯', desc: '必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。' },
                  { id: 'w-1-3', title: '單元 1-3：並聯與或邏輯', desc: '兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。' },
                  { id: 'w-1-4', title: '單元 1-4：常閉接點 (NC) 應用', desc: '燈泡預設是亮的，按下按鈕 (NC) 後燈滅。' }
                ]
              },
              {
                title: '第二大類：電磁接觸器與記憶電路 (Magnetic Contactor & Self-Holding)',
                levels: [
                  { id: 'w-2-1', title: '單元 2-1：電磁接觸器 (MC) 基礎', desc: '用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。' },
                  { id: 'w-2-2', title: '單元 2-2：自保持電路 (Self-Holding)', desc: '按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。' },
                  { id: 'w-2-3', title: '單元 2-3：啟動與停止電路', desc: '在自保持電路中串入一個常閉按鈕 (NC) 作為「停止按鈕」，達成完整的 Start-Stop 控制。' },
                  { id: 'w-2-4', title: '單元 2-4：兩地控制 (Two-Place Control)', desc: '在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。' }
                ]
              },
              {
                title: '第三大類：互鎖與安全控制 (Interlock & Safety)',
                levels: [
                  { id: 'w-3-1', title: '單元 3-1：電氣互鎖 (Electrical Interlock)', desc: '兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。' },
                  { id: 'w-3-2', title: '單元 3-2：三相感應馬達正反轉', desc: '結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。' },
                  { id: 'w-3-3', title: '單元 3-3：順序啟動 (Sequential Start)', desc: '廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。' }
                ]
              },
              {
                title: '第四大類：時間控制與自動化 (Timers & Automation)',
                levels: [
                  { id: 'w-4-1', title: '單元 4-1：通電延遲 (ON-Delay)', desc: '按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。' },
                  { id: 'w-4-2', title: '單元 4-2：自動停止 (Auto-Stop)', desc: '馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。' },
                  { id: 'w-4-3', title: '單元 4-3：閃爍與交替控制 (Flasher)', desc: '利用計時器讓兩顆指示燈 (紅、綠) 交互閃爍。' },
                  { id: 'w-4-4', title: '單元 4-4：星角降壓啟動 (Y-Δ Starting)', desc: '大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。' }
                ]
              },
              {
                title: '第五大類：保護機制與故障排除 (Protection & Troubleshooting)',
                levels: [
                  { id: 'w-5-1', title: '單元 5-1：過載保護 (Thermal Overload)', desc: '將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。' },
                  { id: 'w-5-2', title: '單元 5-2：極限開關應用 (Limit Switch)', desc: '電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。' }
                ]
              }
            ].map((category, idx) => (
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
      ) : currentMode === 'logic' && logicLevel === 'tutorial-menu' ? (

        <div className="w-full h-full flex flex-col items-center justify-start bg-slate-950 text-slate-100 p-8 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-10 pb-20">
            {[
              {
                title: '第一大類：數位訊號與基礎邏輯閘 (Basic Logic Gates)',
                levels: [
                  { id: '1-1', title: '單元 1-1：數位世界 (0 與 1)', desc: '介紹「高電位 (Power)」與「低電位/斷路」，用開關點亮 LED。' },
                  { id: '1-2', title: '單元 1-2：緩衝與反相 (Buffer & NOT)', desc: '介紹 NOT 閘。任務：開關按下時燈滅，放開時燈亮。' },
                  { id: '1-3', title: '單元 1-3：及閘 (AND Gate)', desc: '任務：必須「同時」按下兩個開關，金庫的門（LED）才會打開。' },
                  { id: '1-4', title: '單元 1-4：或閘 (OR Gate)', desc: '任務：走廊兩端「任何一個」開關按下，走廊燈都會亮。' },
                  { id: '1-5', title: '單元 1-5：反及閘與反或閘 (NAND & NOR)', desc: '結合 NOT 的概念。' },
                  { id: '1-6', title: '單元 1-6：互斥或閘 (XOR Gate)', desc: '任務：樓梯間的雙切開關（兩個開關狀態不同時燈亮，相同時燈滅）。' },
                  { id: '1-7', title: '單元 1-7：NAND/NOR 化身反相器', desc: '任務：將 NAND 或 NOR 閘的兩個輸入接在一起，使其表現出與 NOT 閘相同的功能。' }
                ]
              },
              {
                title: '第二大類：組合邏輯應用 (Combinational Logic)',
                levels: [
                  { id: '2-1', title: '單元 2-1：萬用閘挑戰 (Universal Gates)', desc: '任務：只給你 NAND 閘，請你組合出一個 AND 閘的功能。' },
                  { id: '2-2', title: '單元 2-2：多重輸入', desc: '任務：利用兩個 2-input AND 閘，拼湊出一個 3-input AND 閘。' },
                  { id: '2-3', title: '單元 2-3：多工器 (Multiplexer / MUX)', desc: '任務：實作一個選擇器。用一個開關決定，LED 要顯示 A 訊號還是 B 訊號。' },
                  { id: '2-4', title: '單元 2-4：解碼器 (Decoder)', desc: '任務：將兩條線的訊號 (00, 01, 10, 11) 轉換成四顆獨立的 LED 控制。' },
                  { id: '2-5', title: '單元 2-5：多數決電路 (Majority Vote)', desc: '任務：三個評審按下圈選，只要有兩票（含）以上，就算通過（燈亮）。' }
                ]
              },
              {
                title: '第三大類：電腦計算的基礎 (Arithmetic Circuits)',
                levels: [
                  { id: '3-1', title: '單元 3-1：半加器 (Half Adder)', desc: '任務：將兩個輸入 (A, B) 相加，輸出「總和 (Sum)」與「進位 (Carry)」。(使用 XOR 和 AND)。' },
                  { id: '3-2', title: '單元 3-2：全加器 (Full Adder)', desc: '任務：加入前一個位元的進位 (Carry-in)，完成三個位元的相加。' },
                  { id: '3-3', title: '單元 3-3：二位元加法機', desc: '任務：將兩個全加器串聯，達成 2-bit + 2-bit 的加法。' },
                  { id: '3-4', title: '單元 3-4：數值比較器 (Comparator)', desc: '任務：判斷 A 和 B 兩個輸入，實作出「A > B」與「A = B」的亮燈邏輯。' }
                ]
              },
              {
                title: '第四大類：記憶與循序邏輯 (Sequential Logic)',
                levels: [
                  { id: '4-1', title: '單元 4-1：回饋與無窮迴圈 (Feedback Loop)', desc: '任務：將 NOT 閘的輸出接回輸入，觀察訊號震盪 (Oscillation) 或是利用 Clock 產生脈衝。' },
                  { id: '4-2', title: '單元 4-2：SR 閂鎖器 (SR Latch)', desc: '任務：用兩個 NOR 閘交叉連接，做出一個有「設定(Set)」和「重置(Reset)」功能的記憶單元。' },
                  { id: '4-3', title: '單元 4-3：D 型閂鎖器 (D Latch)', desc: '任務：加入 Enable 腳位，決定什麼時候才把資料存進去。' },
                  { id: '4-4', title: '單元 4-4：D 型正反器 (D Flip-Flop)', desc: '介紹邊緣觸發（Edge-triggered）。' },
                  { id: '4-5', title: '單元 4-5：T 型正反器 (T Flip-Flop)', desc: '任務：實作 Toggle 功能，按一下燈亮，再按一下燈滅（狀態切換）。' }
                ]
              },
              {
                title: '第五大類：高階應用與狀態機 (Advanced Projects)',
                levels: [
                  { id: '5-1', title: '單元 5-1：移位暫存器 (Shift Register)', desc: '任務：讓一排 LED 像跑馬燈一樣，隨著 Clock 把亮光往旁邊傳遞。' },
                  { id: '5-2', title: '單元 5-2：非同步計數器 (Ripple Counter)', desc: '任務：利用 T Flip-Flop 串聯，做出可以數 0 到 3 (二進位 00 到 11) 的計數器。' },
                  { id: '5-3', title: '單元 5-3：密碼鎖電路 (Digital Lock)', desc: '任務：必須「依序」按下 A、B 兩個按鈕，最後按下 Enter 才能開鎖；按錯則重置。' },
                  { id: '5-4', title: '單元 5-4：自動販賣機邏輯', desc: '任務：投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。' }
                ]
              }
            ].map((category, idx) => (
              <div key={idx} className="w-full">
                <h1 className="text-2xl font-bold text-amber-400 mb-6 border-b-2 border-slate-700 pb-2">
                  {category.title}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {category.levels.map(level => (
                    <div 
                      key={level.id}
                      className="group flex flex-col bg-slate-800 border-2 border-slate-700 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      onClick={() => {
                        onLoadLogicLevel(level.id as LogicLevelId);
                      }}
                    >
                      <div className="text-lg font-bold text-slate-200 mb-2 group-hover:text-amber-400">{level.title}</div>
                      <div className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed">{level.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-w-full min-h-full w-max h-max flex items-center justify-center p-8 relative">
          {/* Tutorial Banner */}
          {(currentMode === 'tutorial' || currentMode === 'logic' || currentMode === 'wiring') && logicLevel && logicLevel !== 'sandbox' && logicLevel !== 'wiring-menu' && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border-2 border-yellow-500 text-white px-6 py-3.5 rounded-xl shadow-2xl z-20 text-center min-w-[320px]">
              <h2 className="text-base font-bold text-yellow-400 mb-0.5">{tutorialTitle}</h2>
              <p className="text-xs text-slate-300 mb-3">{tutorialDesc}</p>
              {currentMode === 'logic' && (
                <button
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded shadow-lg transition-colors text-sm"
                  onClick={() => {
                    const result = verifyLogicCircuit(grid, gridSize, logicLevel);
                    onShowAlert(result.message);
                    if (result.success && !winTriggered) {
                      setWinTriggered(true);
                    }
                  }}
                >
                  驗證電路 (Truth Table Check)
                </button>
              )}
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

          <canvas
            ref={canvasRef}
            width={gridSize * TILE_SIZE}
            height={gridSize * TILE_SIZE}
            style={{
              width: `${gridSize * TILE_SIZE * zoom}px`,
              height: `${gridSize * TILE_SIZE * zoom}px`,
              cursor: currentTool === 'interact' ? 'default' : 'crosshair',
            }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            className="block bg-slate-950 transform-origin-top-left"
          />
        </div>
      )}
    </main>
  );
};
