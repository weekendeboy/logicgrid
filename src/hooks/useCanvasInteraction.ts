/**
 * @license
 * Auto Studio Pro - Canvas Interaction Hook
 * Manages pointer events, dragging, tool dispatching, selection, faults, and multimeter probes.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  AppMode,
  ToolType,
  Tile,
  Faults,
  NodePin,
  ClipboardData,
  Waypoint,
} from '../types';
import { SelectionEngine, SelectionBounds } from '../engine/SelectionEngine';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { buildNetState } from '../engine/NetEngine';

export interface UseCanvasInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gridSize: number;
  tileSize?: number;
  currentMode: AppMode;
  currentTool: ToolType;
  activeGrid: (Tile | null)[][];
  setActiveGrid: React.Dispatch<React.SetStateAction<(Tile | null)[][]>>;
  grid: (Tile | null)[][];
  faults: Faults;
  setFaults: React.Dispatch<React.SetStateAction<Faults>>;
  clipboard: ClipboardData | null;
  placementType: string;
  placementSubtype: string;
  placementRotation: number;
  autowireWaypoints: Waypoint[];
  setAutowireWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  onShowAlert: (msg: string) => void;
  onOpenModal: (t: Tile, mode: 'value' | 'color' | 'timer' | 'label', pos: { x: number; y: number }) => void;
  onSaveState: () => void;
  onSelectionChange: (bounds: SelectionBounds | null) => void;
  onUndo: () => void;
  onSetTool: (tool: ToolType) => void;
  onRotatePlacement: () => void;
}

export function useCanvasInteraction(props: UseCanvasInteractionProps) {
  const {
    canvasRef,
    gridSize,
    tileSize = 80,
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
    onSelectionChange,
    onUndo,
    onSetTool,
    onRotatePlacement,
  } = props;

  // Mouse & Pointer coordinates
  const [mousePosRaw, setMousePosRaw] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverNode, setHoverNode] = useState<NodePin | null>(null);

  // Multimeter Probes
  const [multimeterProbes, setMultimeterProbes] = useState<[NodePin | null, NodePin | null]>([
    null,
    null,
  ]);
  const [quickPopup, setQuickPopup] = useState<{ show: boolean; isClosed: boolean }>({
    show: false,
    isClosed: false,
  });

  // Fault short state
  const [shortSelectionNode, setShortSelectionNode] = useState<string | null>(null);

  // Moving tiles (Move tool)
  const [movingTiles, setMovingTiles] = useState<
    { dx: number; dy: number; ox: number; oy: number; tile: Tile }[] | null
  >(null);

  // Resistor slider drag tracking
  const [dragResistorGroupId, setDragResistorGroupId] = useState<string | null>(null);

  // Selection marquee state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState({ x: 0, y: 0 });
  const [selectEnd, setSelectEnd] = useState({ x: 0, y: 0 });

  // Quick measurement popup handler
  const triggerQuickPopup = useCallback((isClosed: boolean) => {
    setQuickPopup({ show: true, isClosed });
    setTimeout(() => {
      setQuickPopup({ show: false, isClosed: false });
      setMultimeterProbes([null, null]);
    }, 1200);
  }, []);

  // Helper for pin positions
  const getPinAbs = useCallback(
    (x: number, y: number, p: number) => {
      let px = x * tileSize + tileSize / 2;
      let py = y * tileSize + tileSize / 2;
      if (p === 0) py -= tileSize / 3;
      if (p === 1) px += tileSize / 3;
      if (p === 2) py += tileSize / 3;
      if (p === 3) px -= tileSize / 3;
      return { x: px, y: py };
    },
    [tileSize]
  );

  // Selection bounds
  const getSelectionBounds = useCallback(() => {
    return SelectionEngine.getSelectionBounds(selectStart, selectEnd, activeGrid, gridSize);
  }, [selectStart, selectEnd, activeGrid, gridSize]);

  // Check interference for clipboard paste
  const checkInterference = useCallback(() => {
    return SelectionEngine.checkInterference(clipboard, mousePos, gridSize, activeGrid);
  }, [clipboard, mousePos, gridSize, activeGrid]);

  // Rotate tile or tile group
  const rotateTileGroup = useCallback(
    (px: number, py: number) => {
      SelectionEngine.rotateTileOrGroup(
        px,
        py,
        activeGrid,
        gridSize,
        currentMode,
        onSaveState,
        onShowAlert,
        setActiveGrid
      );
    },
    [activeGrid, gridSize, currentMode, onSaveState, onShowAlert, setActiveGrid]
  );

  // Helper to adjust variable resistor slider position
  const updateSlidePotentiometer = useCallback(
    (rawX: number, rawY: number, targetTile: Tile, mx: number, my: number) => {
      SelectionEngine.updateSlidePotentiometer(
        rawX,
        rawY,
        targetTile,
        mx,
        my,
        activeGrid,
        gridSize,
        tileSize,
        setActiveGrid
      );
    },
    [activeGrid, gridSize, tileSize, setActiveGrid]
  );

  // Canvas Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;

    const mx = Math.floor(rawX / tileSize);
    const my = Math.floor(rawY / tileSize);

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

    // Drag-holding interactive buttons & sliding potentiometer
    if (currentTool === 'interact' && e.buttons === 1) {
      if (dragResistorGroupId) {
        let foundTile: Tile | null = null;
        let foundX = 0;
        let foundY = 0;
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const c = activeGrid[y][x];
            if (c && (c.groupId === dragResistorGroupId || `r_${x}_${y}` === dragResistorGroupId)) {
              foundTile = c;
              foundX = x;
              foundY = y;
              break;
            }
          }
          if (foundTile) break;
        }
        if (foundTile) {
          updateSlidePotentiometer(rawX, rawY, foundTile, foundX, foundY);
        }
      } else {
        const t = activeGrid[my]?.[mx];
        if (
          t &&
          (t.type === 'resistor_var' ||
            (t.type === 'resistor' && (t.subtype === 'var' || t.subtype.startsWith('var_'))))
        ) {
          updateSlidePotentiometer(rawX, rawY, t, mx, my);
          setDragResistorGroupId(t.groupId || `r_${mx}_${my}`);
        } else if (
          t &&
          ((t.type === 'btn' && t.subtype !== 'toggle') ||
            (t.type === 'logic' && t.subtype === 'pushbtn') ||
            (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))
        ) {
          setActiveGrid((prev) => {
            const curr = prev[my][mx];
            if (!curr) return prev;
            return prev.map((row) =>
              row.map((c) => {
                if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
                if (c && curr.groupId && c.groupId === curr.groupId)
                  return Object.assign(new Tile(), c, { isActive: true });
                if (
                  c &&
                  curr.labels &&
                  curr.labels[4] &&
                  c.labels &&
                  c.labels[4] === curr.labels[4] &&
                  (c.type === 'btn' ||
                    (c.type === 'logic' && c.subtype === 'pushbtn') ||
                    (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
                ) {
                  return Object.assign(new Tile(), c, { isActive: true });
                }
                return c;
              })
            );
          });
        }
      }
    }
  };

  // Canvas Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    let mPos = mousePos;
    let mPosRaw = mousePosRaw;

    if (e.pointerType === 'touch' || e.pointerType === 'mouse' || e.pointerType === 'pen') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const rawX = (e.clientX - rect.left) * scaleX;
        const rawY = (e.clientY - rect.top) * scaleY;
        const mx = Math.floor(rawX / tileSize);
        const my = Math.floor(rawY / tileSize);

        mPosRaw = { x: rawX, y: rawY };
        mPos = { x: mx, y: my };

        const isPlacementTool =
          currentTool === 'place' ||
          currentTool === 'paste' ||
          currentTool === 'plc_a' ||
          currentTool === 'plc_b' ||
          currentTool === 'plc_p' ||
          currentTool === 'plc_n' ||
          currentTool === 'plc_pls' ||
          currentTool === 'plc_plf' ||
          currentTool === 'plc_out';

        if (isPlacementTool && (mousePos.x !== mx || mousePos.y !== my)) {
          setMousePosRaw({ x: rawX, y: rawY });
          setMousePos({ x: mx, y: my });
          return;
        }

        setMousePosRaw({ x: rawX, y: rawY });
        setMousePos({ x: mx, y: my });
      }
    }

    if (e.button === 2) return; // Right click handled by onContextMenu
    if (mPos.x < 0 || mPos.x >= gridSize || mPos.y < 0 || mPos.y >= gridSize) return;

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
          const nx = mPos.x + mt.dx;
          const ny = mPos.y + mt.dy;
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            canPlace = false;
            break;
          }
          if (activeGrid[ny][nx] !== null) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          onSaveState();
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
            for (const mt of movingTiles) {
              const nx = mPos.x + mt.dx;
              const ny = mPos.y + mt.dy;
              next[ny][nx] = mt.tile;
            }
            return next;
          });
          setMovingTiles(null);
        } else {
          onShowAlert('該位置已有元件或超出邊界！');
        }
      } else {
        const ct = activeGrid[mPos.y][mPos.x];
        if (ct) {
          const toMove = [];
          if (ct.groupId) {
            for (let y = 0; y < gridSize; y++) {
              for (let x = 0; x < gridSize; x++) {
                if (activeGrid[y][x] && activeGrid[y][x]!.groupId === ct.groupId) {
                  toMove.push({ x, y, tile: activeGrid[y][x]! });
                }
              }
            }
          } else {
            toMove.push({ x: mPos.x, y: mPos.y, tile: ct });
          }

          const moveData = toMove.map((m) => ({
            dx: m.x - mPos.x,
            dy: m.y - mPos.y,
            ox: m.x,
            oy: m.y,
            tile: m.tile,
          }));

          onSaveState();
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
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

    const t = activeGrid[mPos.y][mPos.x];

    // Interact Mode
    if (currentTool === 'interact') {
      if (
        t &&
        ((t.type === 'btn' && t.subtype !== 'toggle') ||
          (t.type === 'logic' && t.subtype === 'pushbtn') ||
          (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))
      ) {
        setActiveGrid((prev) => {
          const curr = prev[mPos.y][mPos.x];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
              if (c && curr.groupId && c.groupId === curr.groupId)
                return Object.assign(new Tile(), c, { isActive: true });
              if (
                c &&
                curr.labels &&
                curr.labels[4] &&
                c.labels &&
                c.labels[4] === curr.labels[4] &&
                (c.type === 'btn' ||
                  (c.type === 'logic' && c.subtype === 'pushbtn') ||
                  (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
              ) {
                return Object.assign(new Tile(), c, { isActive: true });
              }
              return c;
            })
          );
        });
      } else if (t && t.type === 'btn' && t.subtype === 'toggle') {
        const ns = !t.isActive;
        setActiveGrid((prev) => {
          const curr = prev[mPos.y][mPos.x];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: ns });
              if (c && curr.groupId && c.groupId === curr.groupId)
                return Object.assign(new Tile(), c, { isActive: ns });
              if (
                c &&
                curr.labels &&
                curr.labels[4] &&
                c.labels &&
                c.labels[4] === curr.labels[4] &&
                c.type === 'btn' &&
                c.subtype === 'toggle'
              ) {
                return Object.assign(new Tile(), c, { isActive: ns });
              }
              return c;
            })
          );
        });
      } else if (t && t.type === 'protection' && (t.subtype === 'ol_2p' || t.subtype === 'ol_3p')) {
        const ns = !t.isActive;
        setActiveGrid((prev) =>
          prev.map((row, ry) =>
            row.map((c, rx) => {
              if (!c) return c;
              if (t.groupId && c.groupId === t.groupId) return Object.assign(new Tile(), c, { isActive: ns });
              if (rx === mPos.x && ry === mPos.y) return Object.assign(new Tile(), c, { isActive: ns });
              return c;
            })
          )
        );
      } else if (t && t.type === 'protection' && t.subtype === 'fuse') {
        if (t.isBlown) {
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (next[mPos.y][mPos.x]) {
              next[mPos.y][mPos.x] = Object.assign(new Tile(), next[mPos.y][mPos.x], { isBlown: false });
            }
            return next;
          });
          onShowAlert('🔧 已更換全新保險絲！');
        }
      } else if (t && t.type === 'breaker') {
        const ns = !t.isActive;
        setActiveGrid((prev) =>
          prev.map((row, ry) =>
            row.map((c, rx) => {
              if (!c) return c;
              if (t.groupId && c.groupId === t.groupId) return Object.assign(new Tile(), c, { isActive: ns });
              if (rx === mPos.x && ry === mPos.y) return Object.assign(new Tile(), c, { isActive: ns });
              return c;
            })
          )
        );
      } else if (t && t.type === 'switch') {
        if (t.subtype === 'sel13') {
          const st = ((t.state || 0) + 1) % 2;
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (next[mPos.y][mPos.x]) {
              next[mPos.y][mPos.x]!.state = st;
            }
            return next;
          });
        } else if (t.subtype === 'spst') {
          const ns = !t.isActive;
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (next[mPos.y][mPos.x]) {
              next[mPos.y][mPos.x] = Object.assign(new Tile(), next[mPos.y][mPos.x], { isActive: ns });
            }
            return next;
          });
        }
      } else if (
        t &&
        (t.type === 'resistor_var' ||
          (t.type === 'resistor' && (t.subtype === 'var' || t.subtype.startsWith('var_'))))
      ) {
        if (e.shiftKey) {
          onOpenModal(t, 'value', mousePos);
        } else {
          const canvas = canvasRef.current;
          let rawX = mPosRaw.x;
          let rawY = mPosRaw.y;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            rawX = (e.clientX - rect.left) * scaleX;
            rawY = (e.clientY - rect.top) * scaleY;
          }
          updateSlidePotentiometer(rawX, rawY, t, mPos.x, mPos.y);
          setDragResistorGroupId(t.groupId || `r_${mPos.x}_${mPos.y}`);
        }
      } else if (t && t.type === 'logic' && t.subtype === 'power') {
        const ns = !t.isActive;
        setActiveGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[mPos.y][mPos.x]) {
            next[mPos.y][mPos.x] = Object.assign(new Tile(), next[mPos.y][mPos.x], { isActive: ns });
          }
          return next;
        });
      } else if (t && t.type === 'resistor') {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'power' && (t.subtype === 'ac' || t.subtype === 'power_ac' || t.subtype === 'power_real' || t.subtype === 'battery_real')) {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'logic' && t.subtype === 'clock') {
        onOpenModal(t, 'value', mousePos);
      } else if (t && (t.type === 'capacitor' || t.type === 'inductor')) {
        onOpenModal(t, 'value', mousePos);
      } else if (t && t.type === 'meter') {
        let unit = t.subtype === 'v' ? 'V' : t.subtype === 'a' ? 'A' : t.subtype === 'g' ? 'µA' : t.subtype === 'osc' ? 'V' : 'W';
        let val = (t.measureVal || 0).toFixed(3);
        if (t.subtype === 'a') {
          val = ((t.measureVal || 0) * 1000).toFixed(2);
          unit = 'mA';
        } else if (t.subtype === 'g') {
          val = ((t.measureVal || 0) * 1e6).toFixed(1);
          unit = 'µA';
        }
        onShowAlert(`測量數值：${val} ${unit}`);
      } else if (
        t &&
        (t.type === 'relay' ||
          (t.type === 'misc' && t.subtype === 'blank') ||
          t.type === 'terminal' ||
          (t.type === 'pneumatic' &&
            (t.subtype === 'valve_coil' ||
              t.subtype === 'valve_52' ||
              t.subtype === 'valve_52_double' ||
              t.subtype === 'valve_52_coil' ||
              t.subtype === 'valve_52_coil_left')))
      ) {
        if (t.subtype.startsWith('ton_') || t.subtype.startsWith('tof_'))
          onOpenModal(t, 'timer', mousePos);
        else onOpenModal(t, 'label', mousePos);
      } else if (t && t.type === 'load' && t.subtype === 'lightbulb') {
        onOpenModal(t, 'color', mousePos);
      } else if (t && t.type === 'protection' && t.subtype === 'fuse' && t.isBlown) {
        setActiveGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[mPos.y][mPos.x]) {
            next[mPos.y][mPos.x]!.isBlown = false;
          }
          return next;
        });
        onShowAlert('保險絲已更換成功！');
      }
    } else if (currentTool === 'label') {
      if (t) {
        if (
          t.subtype.startsWith('ton') ||
          t.subtype.startsWith('tof') ||
          t.subtype === 'flash_coil' ||
          t.subtype === 'counter_coil'
        )
          onOpenModal(t, 'timer', mousePos);
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
      setActiveGrid((prev) => {
        const next = prev.map((row) => [...row]);
        for (let y = 0; y < clipboard.h; y++) {
          for (let x = 0; x < clipboard.w; x++) {
            const tx = mPos.x + x;
            const ty = mPos.y + y;
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
      if (activeGrid[mPos.y][mPos.x] && activeGrid[mPos.y][mPos.x]!.isLocked) {
        onShowAlert('此元件已被鎖定，無法覆蓋！');
        return;
      }

      onSaveState();

      // Multi-tile group removal intercept
      let gidToRemove: string | null = null;
      if (activeGrid[mPos.y][mPos.x] && activeGrid[mPos.y][mPos.x]!.groupId) {
        gidToRemove = activeGrid[mPos.y][mPos.x]!.groupId;
      }

      const isCellAvailable = (x: number, y: number) => {
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
        const tile = activeGrid[y][x];
        return !tile || (gidToRemove && tile.groupId === gidToRemove) || false;
      };

      const originalSetGrid = setActiveGrid;
      const safeSetGrid = (updater: any) => {
        originalSetGrid((prev) => {
          let next = prev.map((r) => [...r]);
          if (gidToRemove) {
            for (let y = 0; y < gridSize; y++) {
              for (let x = 0; x < gridSize; x++) {
                if (next[y][x] && next[y][x]!.groupId === gidToRemove) next[y][x] = null;
              }
            }
          }
          if (typeof updater === 'function') {
            return updater(next);
          }
          return updater;
        });
      };

      let pType = placementType;
      let pSubtype = placementSubtype;
      if (currentTool === 'plc_a') {
        pType = 'plc';
        pSubtype = 'no';
      } else if (currentTool === 'plc_b') {
        pType = 'plc';
        pSubtype = 'nc';
      } else if (currentTool === 'plc_p' || currentTool === 'plc_pls') {
        pType = 'plc';
        pSubtype = 'pls';
      } else if (currentTool === 'plc_n' || currentTool === 'plc_plf') {
        pType = 'plc';
        pSubtype = 'plf';
      } else if (currentTool === 'plc_out') {
        pType = 'plc';
        pSubtype = 'out';
      }

      const validation = ComponentRegistry.validatePlacement(
        pType,
        pSubtype,
        mPos.x,
        mPos.y,
        placementRotation,
        gridSize,
        isCellAvailable
      );

      if (!validation.canPlace) {
        onShowAlert(validation.errorMsg || '無法放置此元件！');
        return;
      }

      const placedTiles = ComponentRegistry.createPlacementTiles(pType, pSubtype, {
        x: mPos.x,
        y: mPos.y,
        rotation: placementRotation,
        grid: activeGrid,
        gridSize,
      });

      safeSetGrid((prev: (Tile | null)[][]) => {
        const next = prev.map((row) => [...row]);
        for (const item of placedTiles) {
          next[item.y][item.x] = item.tile;
        }
        return next;
      });
      return;
    } else if (currentTool === 'autowire') {
      const last = autowireWaypoints[autowireWaypoints.length - 1];
      if (!last || last.x !== mPos.x || last.y !== mPos.y) {
        setAutowireWaypoints((prev) => [...prev, { x: mPos.x, y: mPos.y }]);
      }
    }
  };

  // Canvas Pointer Up
  const handlePointerUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      const b = getSelectionBounds();
      if (
        b.maxX >= b.minX &&
        b.maxY >= b.minY &&
        (b.maxX > b.minX || b.maxY > b.minY || activeGrid[b.minY]?.[b.minX])
      ) {
        onSelectionChange(b);
      }
    }
    setDragResistorGroupId(null);
    // Release active pushbuttons
    setActiveGrid((prev) =>
      prev.map((row) =>
        row.map((c) =>
          c &&
          ((c.type === 'btn' && c.subtype !== 'toggle') ||
            (c.type === 'logic' && c.subtype === 'pushbtn') ||
            (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
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

  // Keyboard shortcuts
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
        onSetTool('interact');
        if (isSelecting) setIsSelecting(false);
        if (currentTool === 'select') onSelectionChange(null);
        if (currentTool === 'move' && movingTiles) {
          setActiveGrid((prev) => {
            const next = prev.map((row) => [...row]);
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
  }, [
    rotateTileGroup,
    mousePos,
    currentTool,
    onUndo,
    onSetTool,
    onSelectionChange,
    onRotatePlacement,
    movingTiles,
    isSelecting,
    setActiveGrid,
  ]);

  return {
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
  };
}
