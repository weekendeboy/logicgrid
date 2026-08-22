/**
 * @license
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  AppMode,
  SubMode,
  LogicLevelId,
  ToolType,
  Tile,
  Faults,
  ModalState,
  ClipboardData,
  Waypoint,
} from './types';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { Modals } from './components/Modals';
import { findAStarPath, layWiresOnPath } from './engine/Pathfinding';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('tutorial');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(60);
  const [zoom, setZoom] = useState<number>(1.0);
  const [subMode, setSubMode] = useState<SubMode>('sandbox');
  const [logicLevel, setLogicLevel] = useState<LogicLevelId>('sandbox');

  const [currentTool, setCurrentTool] = useState<ToolType>('interact');
  const [placementType, setPlacementType] = useState<string>('');
  const [placementSubtype, setPlacementSubtype] = useState<string>('');
  const [placementRotation, setPlacementRotation] = useState<number>(0);

  const [meterChannel, setMeterChannel] = useState<string>('1');
  const [meterValues, setMeterValues] = useState<{
    vVal: number;
    aVal: number;
    wVal: number;
    oscVal: number | null;
  }>({ vVal: 0, aVal: 0, wVal: 0, oscVal: null });

  const [isFaultMode, setIsFaultMode] = useState<boolean>(false);
  const [faults, setFaults] = useState<Faults>({ opens: [], shorts: [] });

  const [grid, setGrid] = useState<(Tile | null)[][]>(() =>
    Array(60)
      .fill(null)
      .map(() => Array(60).fill(null))
  );

  const [autowireWaypoints, setAutowireWaypoints] = useState<Waypoint[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [selectionBounds, setSelectionBounds] = useState<{ minX: number; maxX: number; minY: number; maxY: number } | null>(null);
  const hasSelection = !!selectionBounds;

  // Undo History
  const historyStackRef = useRef<{ grid: (Tile | null)[][]; faults: Faults }[]>([]);

  // Alert Toast
  const [alertToast, setAlertToast] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback((msg: string) => {
    setAlertToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setAlertToast(null);
    }, 3000);
  }, []);

  // Modal States
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'value',
    tile: null,
  });
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Mobile & Desktop Sidebar Toggles & Pin State
  const [isLeftPinned, setIsLeftPinned] = useState<boolean>(() => {
    const saved = localStorage.getItem('autostudio_left_pinned');
    return saved !== null ? saved === 'true' : true;
  });
  const [isRightPinned, setIsRightPinned] = useState<boolean>(() => {
    const saved = localStorage.getItem('autostudio_right_pinned');
    return saved !== null ? saved === 'true' : true;
  });

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const handleToggleLeftPin = useCallback(() => {
    setIsLeftPinned((prev) => {
      const next = !prev;
      localStorage.setItem('autostudio_left_pinned', String(next));
      if (next) {
        setIsLeftSidebarOpen(true);
        showAlert('📌 左側操作欄已鎖定（操作後保持展開）');
      } else {
        showAlert('🔓 左側操作欄已解除鎖定（完成操作後將自動縮回）');
      }
      return next;
    });
  }, [showAlert]);

  const handleToggleRightPin = useCallback(() => {
    setIsRightPinned((prev) => {
      const next = !prev;
      localStorage.setItem('autostudio_right_pinned', String(next));
      if (next) {
        setIsRightSidebarOpen(true);
        showAlert('📌 右側操作欄已鎖定（操作後保持展開）');
      } else {
        showAlert('🔓 右側操作欄已解除鎖定（完成操作後將自動縮回）');
      }
      return next;
    });
  }, [showAlert]);

  // Save State for Undo
  const saveState = useCallback(() => {
    if (historyStackRef.current.length >= 30) {
      historyStackRef.current.shift();
    }
    const gridCopy = grid.map((row) =>
      row.map((tile) => (tile ? Object.assign(new Tile(), JSON.parse(JSON.stringify(tile))) : null))
    );
    const faultsCopy = JSON.parse(JSON.stringify(faults));
    historyStackRef.current.push({ grid: gridCopy, faults: faultsCopy });
  }, [grid, faults]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyStackRef.current.length > 0) {
      const state = historyStackRef.current.pop()!;
      setGrid(
        state.grid.map((row) =>
          row.map((tile) => (tile ? Object.assign(new Tile(), tile) : null))
        )
      );
      setFaults(state.faults);
      showAlert('🔄 已復原上一步驟');
    } else {
      showAlert('⚠️ 沒有可以復原的步驟了');
    }
  }, [showAlert]);

  // Clear Canvas
  const handleClearCanvas = useCallback(
    (forceSandbox: boolean = false, overrideMode?: AppMode, overrideLevel?: LogicLevelId, overrideGridSize?: number) => {
      const mode = overrideMode || currentMode;
      const level = overrideLevel || logicLevel;
      const size = overrideGridSize || gridSize;
      const newGrid = Array(size)
        .fill(null)
        .map(() => Array(size).fill(null));

      if (mode === 'plc') {
        const splitCol = size <= 10 ? 5 : 10;
        const lastLadderCol = splitCol - 1;

        // Column 0: H at (0, 0), T-wires facing right below
        const tileH = new Tile('wire', 'h');
        tileH.rotation = 0;
        tileH.isLocked = true;
        newGrid[0][0] = tileH;

        for (let y = 1; y < size; y++) {
          const tileT = new Tile('wire', 't');
          tileT.rotation = 3;
          tileT.isLocked = true;
          newGrid[y][0] = tileT;
        }

        // Last column of ladder area: G at (lastLadderCol, 0), T-wires facing left below
        const tileG = new Tile('wire', 'g');
        tileG.rotation = 0;
        tileG.isLocked = true;
        newGrid[0][lastLadderCol] = tileG;

        for (let y = 1; y < size; y++) {
          const tileT = new Tile('wire', 't');
          tileT.rotation = 1;
          tileT.isLocked = true;
          newGrid[y][lastLadderCol] = tileT;
        }
      } else if (!forceSandbox && level && level !== 'sandbox') {
        if (level === '0-1') {
          const sw = new Tile('logic', 'power', 100);
          sw.rotation = 1;
          sw.isLocked = true;
          const led = new Tile('logic', 'led', 0);
          led.rotation = 1;
          led.isLocked = true;
          newGrid[3][4] = sw;
          newGrid[5][4] = led;
        } else if (level === '0-2') {
          const sw = new Tile('logic', 'power', 100);
          sw.rotation = 0;
          sw.isLocked = true;
          const led = new Tile('logic', 'led', 0);
          led.rotation = 3;
          led.isLocked = true;
          newGrid[5][4] = sw;
          newGrid[4][5] = led;
        } else if (level === '0-3') {
          const sw = new Tile('logic', 'power', 100);
          sw.rotation = 0;
          sw.isLocked = true;
          const led1 = new Tile('logic', 'led', 0);
          led1.rotation = 3;
          led1.isLocked = true;
          const led2 = new Tile('logic', 'led', 0);
          led2.rotation = 1;
          led2.isLocked = true;
          newGrid[4][3] = sw;
          newGrid[3][4] = led1;
          newGrid[5][4] = led2;
        } else if (level === '0-4') {
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 0;
          sw1.isLocked = true;
          sw1.labels[4] = 'A';
          const led1 = new Tile('logic', 'led', 0);
          led1.rotation = 0;
          led1.isLocked = true;
          led1.labels[4] = 'A';
          newGrid[4][2] = sw1;
          newGrid[4][6] = led1;

          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1;
          sw2.isLocked = true;
          sw2.labels[4] = 'B';
          const led2 = new Tile('logic', 'led', 0);
          led2.rotation = 1;
          led2.isLocked = true;
          led2.labels[4] = 'B';
          newGrid[2][4] = sw2;
          newGrid[6][4] = led2;
        } else if (level === '1-1') {
          // 1-1: Just a power switch and LED
          const sw = new Tile('logic', 'power', 100);
          sw.rotation = 1;
          const led = new Tile('logic', 'led', 0);
          led.rotation = 1;
          newGrid[3][4] = sw;
          newGrid[6][4] = led;
        } else if (level === '1-2') {
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 1;
          const notGate = new Tile('gate', 'not');
          notGate.rotation = 1; 
          const led1 = new Tile('logic', 'led', 0);
          led1.rotation = 1;
          newGrid[2][3] = sw1;
          newGrid[4][3] = notGate;
          newGrid[6][3] = led1;

          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1;
          const bufferGate = new Tile('gate', 'buffer');
          bufferGate.rotation = 1; 
          const led2 = new Tile('logic', 'led', 0);
          led2.rotation = 1;
          newGrid[2][5] = sw2;
          newGrid[4][5] = bufferGate;
          newGrid[6][5] = led2;
        } else if (level === '1-3') {
          // 1-3: Two switches, AND gate, LED
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 1; // output at bottom
          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1; // output at bottom
          const andGate = new Tile('gate', 'and');
          andGate.rotation = 1; // inputs L/R, output Bottom
          const led = new Tile('logic', 'led', 0);
          led.rotation = 1; // input Top
          newGrid[2][3] = sw1;
          newGrid[2][5] = sw2;
          newGrid[4][4] = andGate;
          newGrid[6][4] = led;
        } else if (level === '1-4') {
          // 1-4: Two switches, OR gate, LED
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 1;
          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1;
          const orGate = new Tile('gate', 'or');
          orGate.rotation = 1;
          const led = new Tile('logic', 'led', 0);
          led.rotation = 1;
          newGrid[2][3] = sw1;
          newGrid[2][5] = sw2;
          newGrid[4][4] = orGate;
          newGrid[6][4] = led;
        } else if (level === '1-5') {
          // 1-5: NAND and NOR. We'll give them one set for NAND and one set for NOR side by side.
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 1;
          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1;
          const nandGate = new Tile('gate', 'nand');
          nandGate.rotation = 1;
          const led1 = new Tile('logic', 'led', 0);
          led1.rotation = 1;
          newGrid[2][2] = sw1;
          newGrid[2][4] = sw2;
          newGrid[4][3] = nandGate;
          newGrid[6][3] = led1;

          const sw3 = new Tile('logic', 'power', 100);
          sw3.rotation = 1;
          const sw4 = new Tile('logic', 'power', 100);
          sw4.rotation = 1;
          const norGate = new Tile('gate', 'nor');
          norGate.rotation = 1;
          const led2 = new Tile('logic', 'led', 0);
          led2.rotation = 1;
          newGrid[2][6] = sw3;
          newGrid[2][8] = sw4;
          newGrid[4][7] = norGate;
          newGrid[6][7] = led2;
        } else if (level === '1-6') {
          // 1-6: XOR gate
          const sw1 = new Tile('logic', 'power', 100);
          sw1.rotation = 1;
          const sw2 = new Tile('logic', 'power', 100);
          sw2.rotation = 1;
          const xorGate = new Tile('gate', 'xor');
          xorGate.rotation = 1;
          const led = new Tile('logic', 'led', 0);
          led.rotation = 1;
          newGrid[2][3] = sw1;
          newGrid[2][5] = sw2;
          newGrid[4][4] = xorGate;
          newGrid[6][4] = led;
        } else if (level === '2-1') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1;
          const led = new Tile('logic', 'led', 0); led.rotation = 1;
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[8][5] = led;
        } else if (level === '2-2') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'C';
          const led = new Tile('logic', 'led', 0); led.rotation = 1;
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[2][8] = sw3; newGrid[8][6] = led;
        } else if (level === '2-3') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const swS = new Tile('logic', 'power', 100); swS.rotation = 1; swS.labels[4] = 'Sel';
          const led = new Tile('logic', 'led', 0); led.rotation = 1;
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[2][8] = swS; newGrid[10][6] = led;
        } else if (level === '2-4') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A1';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'A0';
          const led0 = new Tile('logic', 'led', 0); led0.rotation = 1; led0.labels[0] = 'Y0';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Y1';
          const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Y2';
          const led3 = new Tile('logic', 'led', 0); led3.rotation = 1; led3.labels[0] = 'Y3';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; 
          newGrid[10][3] = led0; newGrid[10][5] = led1; newGrid[10][7] = led2; newGrid[10][9] = led3;
        } else if (level === '2-5') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1;
          const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1;
          const led = new Tile('logic', 'led', 0); led.rotation = 1;
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[2][8] = sw3; newGrid[10][6] = led;
        } else if (level === '3-1') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const ledS = new Tile('logic', 'led', 0); ledS.rotation = 1; ledS.labels[0] = 'S';
          const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'C';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][5] = ledS; newGrid[10][7] = ledC;
        } else if (level === '3-2') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'Cin';
          const ledS = new Tile('logic', 'led', 0); ledS.rotation = 1; ledS.labels[0] = 'S';
          const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'Cout';
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[2][8] = sw3; newGrid[10][5] = ledS; newGrid[10][7] = ledC;
        } else if (level === '3-3') {
          const swA1 = new Tile('logic', 'power', 100); swA1.rotation = 1; swA1.labels[4] = 'A1';
          const swA0 = new Tile('logic', 'power', 100); swA0.rotation = 1; swA0.labels[4] = 'A0';
          const swB1 = new Tile('logic', 'power', 100); swB1.rotation = 1; swB1.labels[4] = 'B1';
          const swB0 = new Tile('logic', 'power', 100); swB0.rotation = 1; swB0.labels[4] = 'B0';
          const ledS1 = new Tile('logic', 'led', 0); ledS1.rotation = 1; ledS1.labels[0] = 'S1';
          const ledS0 = new Tile('logic', 'led', 0); ledS0.rotation = 1; ledS0.labels[0] = 'S0';
          const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'Cout';
          newGrid[2][3] = swA1; newGrid[2][5] = swA0; newGrid[2][7] = swB1; newGrid[2][9] = swB0;
          newGrid[10][4] = ledC; newGrid[10][6] = ledS1; newGrid[10][8] = ledS0;
        } else if (level === '3-4') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'A>B';
          const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'A=B';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][5] = led1; newGrid[10][7] = led2;
        } else if (level === '4-1') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1;
          newGrid[2][5] = sw1; newGrid[10][5] = led1;
        } else if (level === '4-2') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'S';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'R';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
          const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Q\'';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][5] = led1; newGrid[10][7] = led2;
        } else if (level === '4-3') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'D';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'En';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][6] = led1;
        } else if (level === '4-4') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'D';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][6] = led1;
        } else if (level === '4-5') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'T';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[10][6] = led1;
        } else if (level === '5-1') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'In';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1;
          const led2 = new Tile('logic', 'led', 0); led2.rotation = 1;
          const led3 = new Tile('logic', 'led', 0); led3.rotation = 1;
          const led4 = new Tile('logic', 'led', 0); led4.rotation = 1;
          newGrid[2][6] = sw1; newGrid[2][8] = sw2; 
          newGrid[12][5] = led1; newGrid[12][7] = led2; newGrid[12][9] = led3; newGrid[12][11] = led4;
        } else if (level === '5-2') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'CLK';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Bit0';
          const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Bit1';
          newGrid[2][5] = sw1; newGrid[12][5] = led1; newGrid[12][7] = led2;
        } else if (level === '5-3') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
          const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'Enter';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Unlock';
          newGrid[2][4] = sw1; newGrid[2][6] = sw2; newGrid[2][8] = sw3; newGrid[12][6] = led1;
        } else if (level === '5-4') {
          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = '1元';
          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = '退幣';
          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = '可購買';
          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[12][6] = led1;
        } else if (level === 'w-1-1') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const noBtn = new Tile('btn', 'no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
          newGrid[1][4] = wireL;
          newGrid[3][4] = noBtn;
          newGrid[5][4] = light;
          newGrid[7][4] = wireN;
        } else if (level === 'w-1-2') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 0; noBtn1.isLocked = true;
          const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 0; noBtn2.isLocked = true;
          const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
          newGrid[0][4] = wireL;
          newGrid[2][4] = noBtn1;
          newGrid[4][4] = noBtn2;
          newGrid[6][4] = light;
          newGrid[8][4] = wireN;
        } else if (level === 'w-1-3') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 0; noBtn1.isLocked = true;
          const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 0; noBtn2.isLocked = true;
          const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
          newGrid[1][4] = wireL;
          newGrid[3][3] = noBtn1;
          newGrid[3][5] = noBtn2;
          newGrid[5][4] = light;
          newGrid[7][4] = wireN;
        } else if (level === 'w-1-4') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const ncBtn = new Tile('btn', 'nc'); ncBtn.rotation = 0; ncBtn.isLocked = true;
          const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
          newGrid[1][4] = wireL;
          newGrid[3][4] = ncBtn;
          newGrid[5][4] = light;
          newGrid[7][4] = wireN;
        } else if (level === 'w-2-1') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
          const noBtn = new Tile('btn', 'no'); noBtn.rotation = 1; noBtn.isLocked = true;
          const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
          const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;
          const relayNo = new Tile('relay', 'no'); relayNo.rotation = 1; relayNo.isLocked = true; relayNo.labels[4] = 'K1';
          const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;
          
          newGrid[3][1] = wireL;
          newGrid[3][3] = noBtn;
          newGrid[3][5] = coil;
          newGrid[3][7] = wireN;
          
          newGrid[5][3] = relayNo;
          newGrid[5][5] = motor;
        } else if (level === 'w-2-2') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
          const noBtn = new Tile('btn', 'no'); noBtn.rotation = 1; noBtn.isLocked = true;
          noBtn.labels[3] = '14'; noBtn.labels[1] = '13'; noBtn.labels[4] = 'BTN';
          const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
          const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;
          
          const relayNo1 = new Tile('relay', 'no'); relayNo1.rotation = 1; relayNo1.isLocked = true; relayNo1.labels[4] = 'K1';
          const relayNo2 = new Tile('relay', 'no'); relayNo2.rotation = 1; relayNo2.isLocked = true; relayNo2.labels[4] = 'K1';
          
          const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

          newGrid[1][1] = wireL;
          newGrid[1][3] = noBtn;
          newGrid[1][5] = coil;
          newGrid[1][7] = wireN;

          newGrid[3][3] = relayNo1;

          newGrid[5][3] = relayNo2;
          newGrid[5][5] = motor;
        } else if (level === 'w-2-3') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
          const ncBtn = new Tile('btn', 'nc'); ncBtn.rotation = 1; ncBtn.isLocked = true;
          ncBtn.labels[3] = '12'; ncBtn.labels[1] = '11';
          const noBtn = new Tile('btn', 'no'); noBtn.rotation = 1; noBtn.isLocked = true;
          noBtn.labels[3] = '14'; noBtn.labels[1] = '13'; noBtn.labels[4] = 'BTN';
          const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
          const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;
          
          const relayNo1 = new Tile('relay', 'no'); relayNo1.rotation = 1; relayNo1.isLocked = true; relayNo1.labels[4] = 'K1';
          const relayNo2 = new Tile('relay', 'no'); relayNo2.rotation = 1; relayNo2.isLocked = true; relayNo2.labels[4] = 'K1';
          
          const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

          newGrid[4][0] = wireL;
          newGrid[4][2] = ncBtn;
          newGrid[4][4] = noBtn;
          newGrid[4][6] = coil;
          newGrid[4][8] = wireN;

          newGrid[6][4] = relayNo1;

          newGrid[8][4] = relayNo2;
          newGrid[8][6] = motor;
        } else if (level === 'w-2-4') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
          const ncBtn1 = new Tile('btn', 'nc'); ncBtn1.rotation = 1; ncBtn1.isLocked = true;
          ncBtn1.labels[3] = '12'; ncBtn1.labels[1] = '11';
          const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 1; noBtn1.isLocked = true;
          noBtn1.labels[3] = '14'; noBtn1.labels[1] = '13'; noBtn1.labels[4] = 'BTN';
          const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
          const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;
          
          const ncBtn2 = new Tile('btn', 'nc'); ncBtn2.rotation = 1; ncBtn2.isLocked = true;
          ncBtn2.labels[3] = '12'; ncBtn2.labels[1] = '11';
          const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 1; noBtn2.isLocked = true;
          noBtn2.labels[3] = '14'; noBtn2.labels[1] = '13'; noBtn2.labels[4] = 'BTN';

          const relayNo1 = new Tile('relay', 'no'); relayNo1.rotation = 1; relayNo1.isLocked = true; relayNo1.labels[4] = 'K1';
          const relayNo2 = new Tile('relay', 'no'); relayNo2.rotation = 1; relayNo2.isLocked = true; relayNo2.labels[4] = 'K1';
          
          const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

          newGrid[1][0] = wireL;
          newGrid[1][2] = ncBtn1;
          newGrid[1][4] = noBtn1;
          newGrid[1][6] = coil;
          newGrid[1][8] = wireN;

          newGrid[3][2] = ncBtn2;
          newGrid[3][4] = noBtn2;

          newGrid[5][4] = relayNo1;

          newGrid[7][4] = relayNo2;
          newGrid[7][6] = motor;
        } else if (level === 'w-3-1') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;
          
          const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
          const relayNcK2 = new Tile('relay', 'nc'); relayNcK2.rotation = 1; relayNcK2.isLocked = true; relayNcK2.labels[4] = 'K2';
          const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.isLocked = true; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
          const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';

          const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.isLocked = true; relayNoK1.labels[4] = 'K1';

          const relayNcK1 = new Tile('relay', 'nc'); relayNcK1.rotation = 1; relayNcK1.isLocked = true; relayNcK1.labels[4] = 'K1';
          const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.isLocked = true; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
          const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.isLocked = true; coilK2.labels[4] = 'K2';

          const relayNoK2 = new Tile('relay', 'no'); relayNoK2.rotation = 1; relayNoK2.isLocked = true; relayNoK2.labels[4] = 'K2';

          newGrid[0][0] = wireL;
          newGrid[0][8] = wireN;

          newGrid[1][1] = btnNc;
          newGrid[1][3] = relayNcK2;
          newGrid[1][5] = btnNo1;
          newGrid[1][7] = coilK1;

          newGrid[3][5] = relayNoK1;

          newGrid[5][3] = relayNcK1;
          newGrid[5][5] = btnNo2;
          newGrid[5][7] = coilK2;

          newGrid[7][5] = relayNoK2;
        } else if (level === 'w-3-2') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

          const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
          const relayNcK2 = new Tile('relay', 'nc'); relayNcK2.rotation = 1; relayNcK2.isLocked = true; relayNcK2.labels[4] = 'K2';
          const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.isLocked = true; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
          const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';

          const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.isLocked = true; relayNoK1.labels[4] = 'K1';

          const relayNcK1 = new Tile('relay', 'nc'); relayNcK1.rotation = 1; relayNcK1.isLocked = true; relayNcK1.labels[4] = 'K1';
          const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.isLocked = true; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
          const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.isLocked = true; coilK2.labels[4] = 'K2';

          const relayNoK2 = new Tile('relay', 'no'); relayNoK2.rotation = 1; relayNoK2.isLocked = true; relayNoK2.labels[4] = 'K2';

          const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.isLocked = true; relayNoK1_2.labels[4] = 'K1';
          const relayNcK1_2 = new Tile('relay', 'nc'); relayNcK1_2.rotation = 1; relayNcK1_2.isLocked = true; relayNcK1_2.labels[4] = 'K1';

          const motor = new Tile('motor', 'motor'); motor.rotation = 0; motor.rotationAngle = 80; motor.isLocked = true;

          const relayNoK2_2 = new Tile('relay', 'no'); relayNoK2_2.rotation = 1; relayNoK2_2.isLocked = true; relayNoK2_2.labels[4] = 'K2';
          const relayNcK2_2 = new Tile('relay', 'nc'); relayNcK2_2.rotation = 1; relayNcK2_2.isLocked = true; relayNcK2_2.labels[4] = 'K2';

          newGrid[0][0] = wireL;
          newGrid[0][8] = wireN;

          newGrid[1][1] = btnNc;
          newGrid[1][3] = relayNcK2;
          newGrid[1][5] = btnNo1;
          newGrid[1][7] = coilK1;

          newGrid[2][5] = relayNoK1;

          newGrid[3][3] = relayNcK1;
          newGrid[3][5] = btnNo2;
          newGrid[3][7] = coilK2;

          newGrid[4][5] = relayNoK2;

          newGrid[6][3] = relayNoK1_2;
          newGrid[6][7] = relayNcK1_2;

          newGrid[7][5] = motor;

          newGrid[8][3] = relayNoK2_2;
          newGrid[8][7] = relayNcK2_2;
        } else if (level === 'w-3-3') {
          const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
          const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

          const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
          const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.isLocked = true; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
          const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';

          const relayNoK1_1 = new Tile('relay', 'no'); relayNoK1_1.rotation = 1; relayNoK1_1.isLocked = true; relayNoK1_1.labels[4] = 'K1';

          const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.isLocked = true; relayNoK1_2.labels[4] = 'K1';
          const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.isLocked = true; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
          const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.isLocked = true; coilK2.labels[4] = 'K2';

          const relayNoK2_1 = new Tile('relay', 'no'); relayNoK2_1.rotation = 1; relayNoK2_1.isLocked = true; relayNoK2_1.labels[4] = 'K2';

          const relayNoK1_3 = new Tile('relay', 'no'); relayNoK1_3.rotation = 1; relayNoK1_3.isLocked = true; relayNoK1_3.labels[4] = 'K1';
          const motor1 = new Tile('motor', 'motor'); motor1.rotation = 1; motor1.isLocked = true;

          const relayNoK2_2 = new Tile('relay', 'no'); relayNoK2_2.rotation = 1; relayNoK2_2.isLocked = true; relayNoK2_2.labels[4] = 'K2';
          const motor2 = new Tile('motor', 'motor'); motor2.rotation = 1; motor2.isLocked = true;

          newGrid[0][0] = wireL;
          newGrid[0][8] = wireN;

          newGrid[1][1] = btnNc;
          newGrid[1][5] = btnNo1;
          newGrid[1][7] = coilK1;

          newGrid[2][5] = relayNoK1_1;

          newGrid[3][3] = relayNoK1_2;
          newGrid[3][5] = btnNo2;
          newGrid[3][7] = coilK2;

          newGrid[4][5] = relayNoK2_1;

          newGrid[6][5] = relayNoK1_3;
          newGrid[6][7] = motor1;

          newGrid[8][5] = relayNoK2_2;
          newGrid[8][7] = motor2;
        } else if (level === 'w-4-1') {
          newGrid[0][0] = new Tile('wire', 'l'); newGrid[0][0].rotation = 0;
          newGrid[0][8] = new Tile('wire', 'n'); newGrid[0][8].rotation = 0;
          
          newGrid[1][0] = new Tile('wire', 't'); newGrid[1][0].rotation = 3;
          newGrid[1][1] = new Tile('btn', 'nc'); newGrid[1][1].rotation = 1; newGrid[1][1].labels[1] = '11'; newGrid[1][1].labels[2] = '12';
          newGrid[1][2] = new Tile('wire', 't'); newGrid[1][2].rotation = 0;
          newGrid[1][3] = new Tile('btn', 'no'); newGrid[1][3].rotation = 1; newGrid[1][3].labels[1] = '13'; newGrid[1][3].labels[2] = '14';
          newGrid[1][4] = new Tile('wire', 't'); newGrid[1][4].rotation = 0;
          newGrid[1][5] = new Tile('wire', 'straight'); newGrid[1][5].rotation = 1;
          newGrid[1][6] = new Tile('wire', 'straight'); newGrid[1][6].rotation = 1;
          newGrid[1][7] = new Tile('relay', 'coil'); newGrid[1][7].rotation = 1; newGrid[1][7].labels[4] = 'T1';
          newGrid[1][8] = new Tile('wire', 't'); newGrid[1][8].rotation = 1;

          newGrid[2][0] = new Tile('wire', 'straight'); newGrid[2][0].rotation = 0;
          newGrid[2][2] = new Tile('wire', 'straight'); newGrid[2][2].rotation = 2;
          newGrid[2][4] = new Tile('wire', 'straight'); newGrid[2][4].rotation = 2;
          newGrid[2][8] = new Tile('wire', 'straight'); newGrid[2][8].rotation = 0;

          newGrid[3][0] = new Tile('wire', 'straight'); newGrid[3][0].rotation = 0;
          newGrid[3][2] = new Tile('wire', 'turn'); newGrid[3][2].rotation = 0;
          newGrid[3][3] = new Tile('relay', 'no'); newGrid[3][3].rotation = 1; newGrid[3][3].labels[4] = 'T1';
          newGrid[3][4] = new Tile('wire', 't'); newGrid[3][4].rotation = 2;
          newGrid[3][5] = new Tile('wire', 'straight'); newGrid[3][5].rotation = 1;
          newGrid[3][6] = new Tile('wire', 'straight'); newGrid[3][6].rotation = 1;
          newGrid[3][7] = new Tile('relay', 'flash_coil'); newGrid[3][7].rotation = 1; newGrid[3][7].value = 1000; newGrid[3][7].labels[4] = 'F1';
          newGrid[3][8] = new Tile('wire', 't'); newGrid[3][8].rotation = 1;

          newGrid[4][0] = new Tile('wire', 'straight'); newGrid[4][0].rotation = 0;
          newGrid[4][8] = new Tile('wire', 'straight'); newGrid[4][8].rotation = 0;

          newGrid[5][0] = new Tile('wire', 't'); newGrid[5][0].rotation = 3;
          newGrid[5][1] = new Tile('relay', 'ton_nc'); newGrid[5][1].rotation = 1; newGrid[5][1].value = 3000; newGrid[5][1].labels[4] = 'T1';
          newGrid[5][2] = new Tile('wire', 'straight'); newGrid[5][2].rotation = 1;
          newGrid[5][3] = new Tile('relay', 'no'); newGrid[5][3].rotation = 1; newGrid[5][3].labels[4] = 'F1';
          newGrid[5][4] = new Tile('wire', 'straight'); newGrid[5][4].rotation = 1;
          newGrid[5][5] = new Tile('wire', 'straight'); newGrid[5][5].rotation = 1;
          newGrid[5][6] = new Tile('wire', 'straight'); newGrid[5][6].rotation = 1;
          newGrid[5][7] = new Tile('load', 'lightbulb'); newGrid[5][7].rotation = 1;
          newGrid[5][8] = new Tile('wire', 't'); newGrid[5][8].rotation = 1;

          newGrid[6][0] = new Tile('wire', 'straight'); newGrid[6][0].rotation = 0;
          newGrid[6][8] = new Tile('wire', 'straight'); newGrid[6][8].rotation = 0;

          newGrid[7][0] = new Tile('wire', 'turn'); newGrid[7][0].rotation = 0;
          newGrid[7][1] = new Tile('relay', 'ton_no'); newGrid[7][1].rotation = 1; newGrid[7][1].value = 3000; newGrid[7][1].labels[4] = 'T1';
          newGrid[7][2] = new Tile('wire', 'straight'); newGrid[7][2].rotation = 1;
          newGrid[7][3] = new Tile('wire', 'straight'); newGrid[7][3].rotation = 1;
          newGrid[7][4] = new Tile('wire', 'straight'); newGrid[7][4].rotation = 1;
          newGrid[7][5] = new Tile('wire', 'straight'); newGrid[7][5].rotation = 1;
          newGrid[7][6] = new Tile('wire', 'straight'); newGrid[7][6].rotation = 1;
          newGrid[7][7] = new Tile('motor', ''); newGrid[7][7].rotation = 1;
          newGrid[7][8] = new Tile('wire', 'turn'); newGrid[7][8].rotation = 3;
        } else if (level === 'w-4-2') {
          newGrid[0][0] = new Tile('wire', 'l'); newGrid[0][0].rotation = 0;
          newGrid[0][8] = new Tile('wire', 'n'); newGrid[0][8].rotation = 0;

          newGrid[1][0] = new Tile('wire', 't'); newGrid[1][0].rotation = 3;
          newGrid[1][1] = new Tile('btn', 'nc'); newGrid[1][1].rotation = 1; newGrid[1][1].labels[1] = '11'; newGrid[1][1].labels[2] = '12';
          newGrid[1][2] = new Tile('wire', 'straight'); newGrid[1][2].rotation = 1;
          newGrid[1][3] = new Tile('relay', 'ton_nc'); newGrid[1][3].rotation = 1; newGrid[1][3].value = 5000; newGrid[1][3].labels[4] = 'T1';
          newGrid[1][4] = new Tile('wire', 't'); newGrid[1][4].rotation = 0;
          newGrid[1][5] = new Tile('btn', 'no'); newGrid[1][5].rotation = 1; newGrid[1][5].labels[1] = '13'; newGrid[1][5].labels[2] = '14';
          newGrid[1][6] = new Tile('wire', 't'); newGrid[1][6].rotation = 0;
          newGrid[1][7] = new Tile('relay', 'coil'); newGrid[1][7].rotation = 1; newGrid[1][7].labels[4] = 'T1';
          newGrid[1][8] = new Tile('wire', 't'); newGrid[1][8].rotation = 1;

          newGrid[2][0] = new Tile('wire', 'straight'); newGrid[2][0].rotation = 0;
          newGrid[2][4] = new Tile('wire', 'straight'); newGrid[2][4].rotation = 2;
          newGrid[2][6] = new Tile('wire', 'straight'); newGrid[2][6].rotation = 2;
          newGrid[2][8] = new Tile('wire', 'straight'); newGrid[2][8].rotation = 0;

          newGrid[3][0] = new Tile('wire', 'straight'); newGrid[3][0].rotation = 0;
          newGrid[3][4] = new Tile('wire', 'turn'); newGrid[3][4].rotation = 0;
          newGrid[3][5] = new Tile('relay', 'no'); newGrid[3][5].rotation = 1; newGrid[3][5].labels[4] = 'T1';
          newGrid[3][6] = new Tile('wire', 'turn'); newGrid[3][6].rotation = 3;
          newGrid[3][8] = new Tile('wire', 'straight'); newGrid[3][8].rotation = 0;

          newGrid[4][0] = new Tile('wire', 'straight'); newGrid[4][0].rotation = 0;
          newGrid[4][8] = new Tile('wire', 'straight'); newGrid[4][8].rotation = 0;

          newGrid[5][0] = new Tile('wire', 'turn'); newGrid[5][0].rotation = 0;
          newGrid[5][1] = new Tile('relay', 'no'); newGrid[5][1].rotation = 1; newGrid[5][1].labels[4] = 'T1';
          newGrid[5][2] = new Tile('wire', 'straight'); newGrid[5][2].rotation = 1;
          newGrid[5][3] = new Tile('wire', 'straight'); newGrid[5][3].rotation = 1;
          newGrid[5][4] = new Tile('wire', 'straight'); newGrid[5][4].rotation = 1;
          newGrid[5][5] = new Tile('wire', 'straight'); newGrid[5][5].rotation = 1;
          newGrid[5][6] = new Tile('wire', 'straight'); newGrid[5][6].rotation = 1;
          newGrid[5][7] = new Tile('motor', ''); newGrid[5][7].rotation = 1;
          newGrid[5][8] = new Tile('wire', 'turn'); newGrid[5][8].rotation = 3;
        } else if (level.startsWith('w-')) {
          // Placeholder for the rest of wiring levels
          const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
          const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
          newGrid[5][9] = mcb1; newGrid[5][10] = mcb2;
        }
      }

      setGrid(newGrid);
      setAutowireWaypoints([]);
      setSelectionBounds(null);
      setFaults({ opens: [], shorts: [] });
    },
    [gridSize, logicLevel, currentMode]
  );

  const handleConfirmClearCanvas = useCallback(() => {
    setIsConfirmClearOpen(false);
    saveState();
    handleClearCanvas();
    showAlert('🧹 畫布已淨空');
  }, [handleClearCanvas, saveState, showAlert]);

  // Switch Mode
  const handleSwitchMode = (mode: AppMode) => {
    setCurrentMode(mode);
    setSubMode('sandbox');
    
    let defaultLevel: LogicLevelId = 'sandbox';
    let newGridSize = 60;
    if (mode === 'tutorial') {
      defaultLevel = '0-1';
      newGridSize = 10;
    }
    
    setLogicLevel(defaultLevel);
    setCurrentTool('interact');
    setGridSize(newGridSize);

    handleClearCanvas(mode !== 'tutorial', mode, defaultLevel, newGridSize);
  };

  // Change Grid Size
  const handleChangeGridSize = (newSize: number) => {
    setGridSize(newSize);
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
    setGrid((prev) => {
      const next = Array(newSize)
        .fill(null)
        .map(() => Array(newSize).fill(null));
      for (let y = 0; y < Math.min(prev.length, newSize); y++) {
        for (let x = 0; x < Math.min(prev[0].length, newSize); x++) {
          next[y][x] = prev[y][x];
        }
      }

      if (currentMode === 'plc') {
        const splitCol = newSize <= 10 ? 5 : 10;
        const lastLadderCol = splitCol - 1;

        const tileH = new Tile('wire', 'h');
        tileH.rotation = 0;
        tileH.isLocked = true;
        next[0][0] = tileH;

        for (let y = 1; y < newSize; y++) {
          const tileT = new Tile('wire', 't');
          tileT.rotation = 3;
          tileT.isLocked = true;
          next[y][0] = tileT;
        }

        const tileG = new Tile('wire', 'g');
        tileG.rotation = 0;
        tileG.isLocked = true;
        next[0][lastLadderCol] = tileG;

        for (let y = 1; y < newSize; y++) {
          const tileT = new Tile('wire', 't');
          tileT.rotation = 1;
          tileT.isLocked = true;
          next[y][lastLadderCol] = tileT;
        }
      }

      return next;
    });
    showAlert(`棋盤已安全調整為 ${newSize} x ${newSize}`);
  };

  // Change Zoom
  const handleChangeZoom = (newZoom: number) => {
    setZoom(newZoom);
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
    showAlert(`畫面已縮放至 ${Math.round(newZoom * 100)}%`);
  };

  // Load Logic Level
  const handleLoadLogicLevel = (levelId: LogicLevelId) => {
    setLogicLevel(levelId);
    if (!isLeftPinned && levelId !== 'tutorial-menu' && levelId !== 'wiring-menu') {
      setIsLeftSidebarOpen(false);
    }
    if (levelId === 'tutorial-menu' || levelId === 'wiring-menu') {
      return; // Do nothing else, just show the menu
    }
    if (levelId === 'sandbox') {
      handleChangeGridSize(60);
      handleClearCanvas(true, undefined, levelId, 60);
    } else {
      let sz = 10;
      if (levelId.startsWith('2-') || levelId.startsWith('3-') || levelId.startsWith('4-')) sz = 15;
      if (levelId.startsWith('5-')) sz = 20;
      if (levelId.startsWith('w-')) sz = 15;
      if (levelId === 'w-1-1' || levelId === 'w-1-2' || levelId === 'w-1-3' || levelId === 'w-1-4' || levelId === 'w-2-1' || levelId === 'w-2-2' || levelId === 'w-2-3' || levelId === 'w-2-4' || levelId === 'w-3-1' || levelId === 'w-3-2' || levelId === 'w-3-3' || levelId === 'w-4-1' || levelId === 'w-4-2') sz = 10;
      setGridSize(sz);
      handleClearCanvas(false, undefined, levelId, sz);
    }
  };

  // Set Tool
  const handleSetTool = (tool: ToolType) => {
    setCurrentTool(tool);
    if (tool !== 'select') setSelectionBounds(null);
    if (tool !== 'autowire') setAutowireWaypoints([]);
    if (!isRightPinned && tool !== 'autowire') {
      setIsRightSidebarOpen(false);
    }
  };

  // Set Placement
  const handleSetPlacement = (typeStr: string, element?: HTMLElement | null) => {
    handleSetTool('place');
    const parts = typeStr.split('_');
    setPlacementType(parts[0]);
    setPlacementSubtype(parts.slice(1).join('_'));

    if (element) {
      const svg = element.querySelector('.wire-svg');
      if (svg) {
        const rot = parseInt(svg.getAttribute('data-rot') || '0');
        setPlacementRotation(rot);
      } else {
        setPlacementRotation(0);
      }
    } else {
      setPlacementRotation(0);
    }

    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  // Rotate Tool Preset
  const handleRotatePlacement = () => {
    setPlacementRotation((r) => (r + 1) % 4);
  };
  
  // Handle sidebar tool click context menu
  const handleRotateTool = (e: React.MouseEvent, typeStr: string) => {
    e.preventDefault();
    if (currentTool === 'place' && `${placementType}_${placementSubtype}` === typeStr) {
      handleRotatePlacement();
    } else {
      handleSetPlacement(typeStr);
      setPlacementRotation(1); // Set to 1 because 0 is default and we are explicitly right-clicking to rotate
    }
  };

  // Execute Auto Wire
  const handleExecuteAutoWire = () => {
    if (autowireWaypoints.length < 2) return;
    let fullPath: Waypoint[] = [];
    for (let i = 0; i < autowireWaypoints.length - 1; i++) {
      const path = findAStarPath(
        autowireWaypoints[i],
        autowireWaypoints[i + 1],
        grid,
        gridSize,
        gridSize
      );
      if (path && path.length > 1) {
        if (fullPath.length > 0) path.shift();
        fullPath = fullPath.concat(path);
      } else {
        showAlert('無法找到安全路線');
        setAutowireWaypoints([]);
        return;
      }
    }
    if (fullPath.length >= 3) {
      saveState();
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        layWiresOnPath(fullPath, next, (subtype, rot) => {
          const t = new Tile('wire', subtype);
          t.rotation = rot;
          return t;
        });
        return next;
      });
    }
    setAutowireWaypoints([]);
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  // Toggle Fault Mode
  const handleToggleFaultMode = () => {
    setIsFaultMode((prev) => {
      const next = !prev;
      if (next) {
        handleSetTool('fault-open');
        showAlert('進入故障檢修模式：請點擊接點設定斷路(X)或短路');
      } else {
        handleSetTool('interact');
        showAlert('退出故障模式：故障已隱藏，請開始互動與測量除錯');
      }
      return next;
    });
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  // Clear Faults
  const handleClearFaults = () => {
    saveState();
    setFaults({ opens: [], shorts: [] });
    showAlert('已清除所有故障與測量記錄');
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  // Selection Actions
  const handleCutSelection = () => {
    // Perform copy then delete
    handleCopySelection(false);
    handleDeleteSelection(true);
    handleSetTool('paste');
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  const handleCopySelection = (changeTool: boolean = true) => {
    if (!selectionBounds) return;
    const { minX, maxX, minY, maxY } = selectionBounds;

    const cbData: (Tile | null)[][] = [];
    for (let y = minY; y <= maxY; y++) {
      const row: (Tile | null)[] = [];
      for (let x = minX; x <= maxX; x++) {
        const t = grid[y]?.[x];
        row.push(t && !t.isLocked ? JSON.parse(JSON.stringify(t)) : null);
      }
      cbData.push(row);
    }
    setClipboard({ w: maxX - minX + 1, h: maxY - minY + 1, data: cbData });
    if (changeTool) handleSetTool('paste');
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  const handleDeleteSelection = (keepSelection: boolean = false) => {
    if (!selectionBounds) return;
    const { minX, maxX, minY, maxY } = selectionBounds;
    saveState();
    setGrid((prev) =>
      prev.map((row, y) =>
        row.map((t, x) => (y >= minY && y <= maxY && x >= minX && x <= maxX && t && !t.isLocked ? null : t))
      )
    );
    if (!keepSelection) setSelectionBounds(null);
    if (!isRightPinned) {
      setIsRightSidebarOpen(false);
    }
  };

  // JSON Export / Import
  const handleExportJSON = () => {
    const data = JSON.stringify({
      mode: currentMode,
      width: gridSize,
      height: gridSize,
      grid: grid,
    });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autostudio_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('專案檔儲存成功！');
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>, isInsert: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed.grid) throw new Error('Invalid format');

        if (!isInsert) {
          if (parsed.mode && parsed.mode !== currentMode) {
            setCurrentMode(parsed.mode);
          }
          const targetSize =
            parsed.width || (parsed.grid && parsed.grid[0] ? parsed.grid[0].length : 60);
          setGridSize(targetSize);

          const newGrid = Array(targetSize)
            .fill(null)
            .map(() => Array(targetSize).fill(null));

          for (let y = 0; y < Math.min(targetSize, parsed.grid.length); y++) {
            for (let x = 0; x < Math.min(targetSize, parsed.grid[y].length); x++) {
              if (parsed.grid[y] && parsed.grid[y][x]) {
                newGrid[y][x] = Object.assign(new Tile(), parsed.grid[y][x]);
              }
            }
          }
          setGrid(newGrid);
          showAlert('檔案讀取成功！');
        } else {
          let minX = gridSize,
            maxX = -1,
            minY = gridSize,
            maxY = -1;
          for (let y = 0; y < Math.min(gridSize, parsed.grid.length); y++) {
            for (let x = 0; x < Math.min(gridSize, parsed.grid[y].length); x++) {
              if (parsed.grid[y] && parsed.grid[y][x]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          if (minX > maxX) {
            showAlert('無效元件！');
            return;
          }

          const cbData: (Tile | null)[][] = [];
          for (let y = minY; y <= maxY; y++) {
            const row: (Tile | null)[] = [];
            for (let x = minX; x <= maxX; x++) {
              row.push(
                parsed.grid[y] && parsed.grid[y][x]
                  ? Object.assign(new Tile(), parsed.grid[y][x])
                  : null
              );
            }
            cbData.push(row);
          }
          setClipboard({ w: maxX - minX + 1, h: maxY - minY + 1, data: cbData });
          handleSetTool('paste');
          showAlert('已載入為浮水印，請點擊畫布以插入！');
        }
      } catch (err) {
        showAlert('檔案解析失敗！');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
  };

  // Export Screenshot
  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `autostudio_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showAlert('高畫質 PNG 輸出成功！');
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
  };

  // Modal Open & Save
  const handleOpenModal = (
    t: Tile,
    mode: 'value' | 'color' | 'timer' | 'label',
    pos: { x: number; y: number }
  ) => {
    setModalState({
      isOpen: true,
      mode,
      tile: t,
      tilePos: pos,
    });
  };

  const handleSaveModalValue = (
    val: number,
    color: string,
    labels: Record<number, string>
  ) => {
    if (modalState.tilePos) {
      const { x, y } = modalState.tilePos;
      saveState();
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const target = next[y][x];
        if (target) {
          target.value = val;
          target.color = color;
          target.labels = { ...labels };
          if (target.subtype === 'counter_coil') {
            target.measureVal = val;
          }
          if (target.groupId) {
            for (let r = 0; r < next.length; r++) {
              for (let c = 0; c < next[r].length; c++) {
                const item = next[r][c];
                if (item && item.groupId === target.groupId) {
                  item.value = val;
                  item.color = color;
                  item.labels = { ...labels };
                }
              }
            }
          }
        }
        return next;
      });
    }
    setModalState({ isOpen: false, mode: 'value', tile: null });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Alert Toast Banner */}
      {alertToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-rose-600/95 text-white px-6 py-2.5 rounded-xl font-bold z-[1000] shadow-2xl backdrop-blur-md border border-rose-400 text-sm animate-bounce">
          {alertToast}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        currentMode={currentMode} 
        onSwitchMode={handleSwitchMode} 
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        isLeftPinned={isLeftPinned}
        isRightPinned={isRightPinned}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Workspace (Left Sidebar, Canvas, Right Sidebar) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Left Sidebar Wrapper */}
        <div
          className={`${
            isLeftPinned
              ? isLeftSidebarOpen
                ? 'relative z-20 flex-shrink-0'
                : 'hidden'
              : `absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
                  isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } shadow-2xl`
          }`}
        >
          {isLeftSidebarOpen && (
            <LeftSidebar
              currentMode={currentMode}
              gridSize={gridSize}
              zoom={zoom}
              subMode={subMode}
              logicLevel={logicLevel}
              isPinned={isLeftPinned}
              onTogglePin={handleToggleLeftPin}
              onClose={() => setIsLeftSidebarOpen(false)}
              onChangeGridSize={handleChangeGridSize}
              onChangeZoom={handleChangeZoom}
              onSetSubMode={setSubMode}
              onLoadLogicLevel={handleLoadLogicLevel}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onExportPNG={handleExportPNG}
            />
          )}
        </div>
        {/* Left Sidebar Backdrop (only when unpinned and open) */}
        {!isLeftPinned && isLeftSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-opacity"
            onClick={() => setIsLeftSidebarOpen(false)}
          />
        )}

        <CanvasWorkspace
          currentMode={currentMode}
          currentTool={currentTool}
          gridSize={gridSize}
          zoom={zoom}
          isDarkMode={isDarkMode}
          grid={grid}
          setGrid={setGrid}
          faults={faults}
          setFaults={setFaults}
          meterChannel={meterChannel}
          isFaultMode={isFaultMode}
          subMode={subMode}
          logicLevel={logicLevel}
          placementType={placementType}
          placementSubtype={placementSubtype}
          placementRotation={placementRotation}
          autowireWaypoints={autowireWaypoints}
          setAutowireWaypoints={setAutowireWaypoints}
          clipboard={clipboard}
          onShowAlert={showAlert}
          onOpenModal={handleOpenModal}
          onUpdateMeterValues={setMeterValues}
          onSaveState={saveState}
          onSelectionChange={setSelectionBounds}
          onUndo={handleUndo}
          onSetTool={handleSetTool}
          onLoadLogicLevel={handleLoadLogicLevel}
          onRotatePlacement={handleRotatePlacement}
        />

        {/* Right Sidebar Wrapper */}
        <div
          className={`${
            isRightPinned
              ? isRightSidebarOpen
                ? 'relative z-20 flex-shrink-0'
                : 'hidden'
              : `absolute inset-y-0 right-0 z-40 transform transition-transform duration-300 ${
                  isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.5)]`
          }`}
        >
          {isRightSidebarOpen && (
            <RightSidebar
              currentMode={currentMode}
              currentTool={currentTool}
              meterChannel={meterChannel}
              oscVal={meterValues.oscVal}
              vVal={meterValues.vVal}
              aVal={meterValues.aVal}
              wVal={meterValues.wVal}
              multimeterStatusText="請點擊接點測量..."
              isFaultMode={isFaultMode}
              hasSelection={hasSelection}
              isPasting={currentTool === 'paste'}
              autowireCount={autowireWaypoints.length}
              placementType={placementType}
              placementSubtype={placementSubtype}
              placementRotation={placementRotation}
              isPinned={isRightPinned}
              onTogglePin={handleToggleRightPin}
              onClose={() => setIsRightSidebarOpen(false)}
              onSetTool={handleSetTool}
              onSetMeterChannel={setMeterChannel}
              onSetPlacement={handleSetPlacement}
              onRotateTool={handleRotateTool}
              onExecuteAutoWire={handleExecuteAutoWire}
              onClearAutoWire={() => setAutowireWaypoints([])}
              onUndo={handleUndo}
              onOpenClearConfirm={() => setIsConfirmClearOpen(true)}
              onCutSelection={handleCutSelection}
              onCopySelection={handleCopySelection}
              onDeleteSelection={handleDeleteSelection}
              onToggleFaultMode={handleToggleFaultMode}
              onClearFaults={handleClearFaults}
            />
          )}
        </div>
        {/* Right Sidebar Backdrop (only when unpinned and open) */}
        {!isRightPinned && isRightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-opacity"
            onClick={() => setIsRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* Property & Confirmation Modals */}
      <Modals
        modalState={modalState}
        onCloseModal={() => setModalState({ isOpen: false, mode: 'value', tile: null })}
        onSaveValue={handleSaveModalValue}
        isConfirmClearOpen={isConfirmClearOpen}
        onCloseClearConfirm={() => setIsConfirmClearOpen(false)}
        onConfirmClearCanvas={handleConfirmClearCanvas}
      />
    </div>
  );
}
