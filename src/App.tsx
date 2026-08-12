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
  const [hasSelection, setHasSelection] = useState<boolean>(false);

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
          const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
          const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
          const ind = new Tile('output', 'indicator'); ind.rotation = 0; ind.isLocked = true;
          newGrid[5][9] = mcb1; newGrid[5][10] = mcb2; newGrid[8][9] = ind;
        } else if (level === 'w-1-2') {
          const noBtn = new Tile('switch', 'push_no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const ncBtn = new Tile('switch', 'push_nc'); ncBtn.rotation = 0; ncBtn.isLocked = true;
          const ind1 = new Tile('output', 'indicator'); ind1.rotation = 0; ind1.isLocked = true; ind1.labels[4] = 'L1';
          const ind2 = new Tile('output', 'indicator'); ind2.rotation = 0; ind2.isLocked = true; ind2.labels[4] = 'L2';
          newGrid[4][8] = noBtn; newGrid[7][8] = ind1;
          newGrid[4][12] = ncBtn; newGrid[7][12] = ind2;
        } else if (level === 'w-1-3') {
          const noBtn = new Tile('switch', 'push_no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const mc = new Tile('mc', 'main'); mc.rotation = 0; mc.isLocked = true;
          const motor = new Tile('output', 'motor'); motor.rotation = 0; motor.isLocked = true;
          newGrid[4][6] = noBtn; newGrid[4][10] = mc; newGrid[8][10] = motor;
        } else if (level.startsWith('w-')) {
          // Placeholder for the rest of wiring levels
          const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
          const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
          newGrid[5][9] = mcb1; newGrid[5][10] = mcb2;
        }
      }

      setGrid(newGrid);
      setAutowireWaypoints([]);
      setHasSelection(false);
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
    showAlert(`畫面已縮放至 ${Math.round(newZoom * 100)}%`);
  };

  // Load Logic Level
  const handleLoadLogicLevel = (levelId: LogicLevelId) => {
    setLogicLevel(levelId);
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
      setGridSize(sz);
      handleClearCanvas(false, undefined, levelId, sz);
    }
  };

  // Set Tool
  const handleSetTool = (tool: ToolType) => {
    setCurrentTool(tool);
    if (tool !== 'select') setHasSelection(false);
    if (tool !== 'autowire') setAutowireWaypoints([]);
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
  };

  // Rotate Tool Preset
  const handleRotateTool = (e: React.MouseEvent, typeStr: string) => {
    e.preventDefault();
    const svg = e.currentTarget.querySelector('.wire-svg');
    if (svg) {
      const currentRot = parseInt(svg.getAttribute('data-rot') || '0');
      const newRot = (currentRot + 1) % 4;
      svg.setAttribute('data-rot', newRot.toString());
      (svg as HTMLElement).style.transform = `rotate(${newRot * 90}deg)`;
      handleSetPlacement(typeStr, e.currentTarget as HTMLElement);
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
  };

  // Clear Faults
  const handleClearFaults = () => {
    saveState();
    setFaults({ opens: [], shorts: [] });
    showAlert('已清除所有故障與測量記錄');
  };

  // Selection Actions
  const handleCutSelection = () => {
    // Perform copy then delete
    handleCopySelection(false);
    handleDeleteSelection(true);
    handleSetTool('paste');
  };

  const handleCopySelection = (changeTool: boolean = true) => {
    let minX = gridSize,
      maxX = -1,
      minY = gridSize,
      maxY = -1;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x]) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (minX > maxX) return;

    const cbData: (Tile | null)[][] = [];
    for (let y = minY; y <= maxY; y++) {
      const row: (Tile | null)[] = [];
      for (let x = minX; x <= maxX; x++) {
        const t = grid[y][x];
        row.push(t && !t.isLocked ? JSON.parse(JSON.stringify(t)) : null);
      }
      cbData.push(row);
    }
    setClipboard({ w: maxX - minX + 1, h: maxY - minY + 1, data: cbData });
    if (changeTool) handleSetTool('paste');
  };

  const handleDeleteSelection = (keepSelection: boolean = false) => {
    saveState();
    setGrid((prev) =>
      prev.map((row) =>
        row.map((t) => (t && !t.isLocked ? null : t))
      )
    );
    if (!keepSelection) setHasSelection(false);
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
        }
        return next;
      });
    }
    setModalState({ isOpen: false, mode: 'value', tile: null });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Alert Toast Banner */}
      {alertToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-rose-600/95 text-white px-6 py-2.5 rounded-xl font-bold z-[1000] shadow-2xl backdrop-blur-md border border-rose-400 text-sm animate-bounce">
          {alertToast}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar currentMode={currentMode} onSwitchMode={handleSwitchMode} />

      {/* Main Workspace (Left Sidebar, Canvas, Right Sidebar) */}
      <div className="flex flex-1 h-[calc(100vh-60px)] overflow-hidden">
        <LeftSidebar
          currentMode={currentMode}
          gridSize={gridSize}
          zoom={zoom}
          subMode={subMode}
          logicLevel={logicLevel}
          onChangeGridSize={handleChangeGridSize}
          onChangeZoom={handleChangeZoom}
          onSetSubMode={setSubMode}
          onLoadLogicLevel={handleLoadLogicLevel}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onExportPNG={handleExportPNG}
        />

        <CanvasWorkspace
          currentMode={currentMode}
          currentTool={currentTool}
          gridSize={gridSize}
          zoom={zoom}
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
          onSelectionChange={setHasSelection}
          onUndo={handleUndo}
          onSetTool={handleSetTool}
          onLoadLogicLevel={handleLoadLogicLevel}
        />

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
