/**
 * @license
 * Digital Logic Truth Table Definitions and Circuit Evaluator
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import { Tile } from '../types';
import { buildNetState } from './NetEngine';
import { LogicEngine } from './LogicEngine';

export interface TruthTableVariant {
  reqIn: number;
  reqOut: number;
  inputNames: string[];
  outputNames: string[];
  evaluator: (ins: boolean[]) => boolean[];
}

export interface LevelTruthTableSpec {
  levelId: string;
  title: string;
  category: string;
  reqIn: number;
  reqOut: number;
  inputNames: string[];
  outputNames: string[];
  evaluator: (ins: boolean[]) => boolean[];
  variants?: TruthTableVariant[];
  hint: string;
}

export interface LiveTruthTableRow {
  rowIndex: number;
  inputs: boolean[];
  expected: boolean[];
  actual: boolean[] | null;
  isCurrent: boolean;
  pass: boolean;
}

export interface LiveTruthTableResult {
  spec: LevelTruthTableSpec;
  activeVariantIndex: number;
  inputNames: string[];
  outputNames: string[];
  inputCount: number;
  outputCount: number;
  detectedInputsCount: number;
  detectedOutputsCount: number;
  isInputCountMatch: boolean;
  isOutputCountMatch: boolean;
  rows: LiveTruthTableRow[];
  passedCount: number;
  totalRows: number;
  allPassed: boolean;
  currentActiveRowIndex: number;
  activeInputValues: boolean[];
  diagnosticMessage?: string;
}

export const LOGIC_TRUTH_TABLE_SPECS: Record<string, LevelTruthTableSpec> = {
  '1-1': {
    levelId: '1-1',
    title: '1-1 數位世界 (0 與 1)',
    category: '基礎數位訊號',
    reqIn: 1,
    reqOut: 1,
    inputNames: ['SW'],
    outputNames: ['LED'],
    evaluator: (ins) => [ins[0]],
    hint: '直接將高電位開關 (Power) 以導線連接至 LED，開關閉合 (1) 時燈亮。',
  },
  '1-2': {
    levelId: '1-2',
    title: '1-2 緩衝與反相 (Buffer & NOT)',
    category: '基礎邏輯閘',
    reqIn: 2,
    reqOut: 2,
    inputNames: ['NOT-In', 'BUF-In'],
    outputNames: ['NOT-Out', 'BUF-Out'],
    evaluator: (ins) => [!ins[0], ins[1]],
    variants: [
      {
        reqIn: 1,
        reqOut: 1,
        inputNames: ['NOT-In'],
        outputNames: ['NOT-Out'],
        evaluator: (ins) => [!ins[0]],
      },
    ],
    hint: 'NOT 閘會將 0 變 1、1 變 0；Buffer 閘則保持原訊號。',
  },
  '1-3': {
    levelId: '1-3',
    title: '1-3 及閘 (AND Gate)',
    category: '基礎邏輯閘',
    reqIn: 2,
    reqOut: 1,
    inputNames: ['A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[0] && ins[1]],
    hint: 'AND 及閘：所有輸入皆為 1 時，輸出才為 1。',
  },
  '1-4': {
    levelId: '1-4',
    title: '1-4 或閘 (OR Gate)',
    category: '基礎邏輯閘',
    reqIn: 2,
    reqOut: 1,
    inputNames: ['A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[0] || ins[1]],
    hint: 'OR 或閘：只要有任一輸入為 1，輸出即為 1。',
  },
  '1-5': {
    levelId: '1-5',
    title: '1-5 反及閘與反或閘 (NAND & NOR)',
    category: '基礎邏輯閘',
    reqIn: 4,
    reqOut: 2,
    inputNames: ['A', 'B', 'C', 'D'],
    outputNames: ['NAND-Y', 'NOR-Y'],
    evaluator: (ins) => [!(ins[0] && ins[1]), !(ins[2] || ins[3])],
    variants: [
      {
        reqIn: 2,
        reqOut: 1,
        inputNames: ['A', 'B'],
        outputNames: ['NAND-Y'],
        evaluator: (ins) => [!(ins[0] && ins[1])],
      },
      {
        reqIn: 2,
        reqOut: 1,
        inputNames: ['C', 'D'],
        outputNames: ['NOR-Y'],
        evaluator: (ins) => [!(ins[0] || ins[1])],
      },
    ],
    hint: 'NAND 為 AND 的反相，NOR 為 OR 的反相。關卡提供兩組開關可同時測試。',
  },
  '1-6': {
    levelId: '1-6',
    title: '1-6 互斥或閘 (XOR Gate)',
    category: '基礎邏輯閘',
    reqIn: 2,
    reqOut: 1,
    inputNames: ['A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[0] !== ins[1]],
    hint: 'XOR 互斥或閘：兩輸入狀態不同 (一開一關) 時輸出為 1。常用於雙切樓梯燈。',
  },
  '1-7': {
    levelId: '1-7',
    title: '1-7 NAND/NOR 化身反相器',
    category: '基礎邏輯閘',
    reqIn: 1,
    reqOut: 1,
    inputNames: ['A'],
    outputNames: ['Y'],
    evaluator: (ins) => [!ins[0]],
    hint: '將 NAND 或 NOR 閘的兩個輸入端短路接在一起，即可當作 NOT 反相器使用。',
  },
  '2-1': {
    levelId: '2-1',
    title: '2-1 萬用閘挑戰 (NAND 組 AND)',
    category: '組合邏輯應用',
    reqIn: 2,
    reqOut: 1,
    inputNames: ['A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[0] && ins[1]],
    hint: '先用第一顆 NAND 產生 NOT(A·B)，再將輸出送入第二顆 NAND (接成 NOT) 反轉回 A·B。',
  },
  '2-2': {
    levelId: '2-2',
    title: '2-2 多重輸入 (3-input AND)',
    category: '組合邏輯應用',
    reqIn: 3,
    reqOut: 1,
    inputNames: ['A', 'B', 'C'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[0] && ins[1] && ins[2]],
    hint: '將前兩個輸入送入第一個 AND 閘，其輸出再與第三個輸入送入第二個 AND 閘。',
  },
  '2-3': {
    levelId: '2-3',
    title: '2-3 多工器 (2-to-1 MUX)',
    category: '組合邏輯應用',
    reqIn: 3,
    reqOut: 1,
    inputNames: ['Sel', 'A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [(ins[0] && ins[1]) || (!ins[0] && ins[2])],
    variants: [
      {
        reqIn: 3,
        reqOut: 1,
        inputNames: ['Sel', 'A', 'B'],
        outputNames: ['Y'],
        evaluator: (ins) => [(!ins[0] && ins[1]) || (ins[0] && ins[2])],
      },
    ],
    hint: '使用選擇線 Sel 決定將 A 還是 B 的訊號傳送到輸出 Y。',
  },
  '2-4': {
    levelId: '2-4',
    title: '2-4 解碼器 (2-to-4 Decoder)',
    category: '組合邏輯應用',
    reqIn: 2,
    reqOut: 4,
    inputNames: ['A1', 'A0'],
    outputNames: ['Y0', 'Y1', 'Y2', 'Y3'],
    evaluator: (ins) => [
      !ins[0] && !ins[1],
      !ins[0] && ins[1],
      ins[0] && !ins[1],
      ins[0] && ins[1],
    ],
    hint: '輸入 2 位元二進位碼 (00, 01, 10, 11)，分別點亮對應唯一的 Y0~Y3 LED。',
  },
  '2-5': {
    levelId: '2-5',
    title: '2-5 多數決電路 (Majority Vote)',
    category: '組合邏輯應用',
    reqIn: 3,
    reqOut: 1,
    inputNames: ['A', 'B', 'C'],
    outputNames: ['Y'],
    evaluator: (ins) => [
      (ins[0] && ins[1]) || (ins[1] && ins[2]) || (ins[0] && ins[2]),
    ],
    hint: '三位評審中，只要有 2 位 (含) 以上投贊成票 (1)，輸出即為 1。',
  },
  '3-1': {
    levelId: '3-1',
    title: '3-1 半加器 (Half Adder)',
    category: '電腦運算電路',
    reqIn: 2,
    reqOut: 2,
    inputNames: ['A', 'B'],
    outputNames: ['S (Sum)', 'C (Carry)'],
    evaluator: (ins) => [ins[0] !== ins[1], ins[0] && ins[1]],
    hint: '總和 S = A ⊕ B (使用 XOR 閘)，進位 C = A · B (使用 AND 閘)。',
  },
  '3-2': {
    levelId: '3-2',
    title: '3-2 全加器 (Full Adder)',
    category: '電腦運算電路',
    reqIn: 3,
    reqOut: 2,
    inputNames: ['A', 'B', 'Cin'],
    outputNames: ['S (Sum)', 'Cout (Carry)'],
    evaluator: (ins) => {
      const sum1 = ins[0] !== ins[1];
      const carry1 = ins[0] && ins[1];
      const sum2 = sum1 !== ins[2];
      const carry2 = sum1 && ins[2];
      return [sum2, carry1 || carry2];
    },
    hint: '加入前一位元的進位 Cin。Sum = A ⊕ B ⊕ Cin，Cout = (A·B) + (Cin·(A⊕B))。',
  },
  '3-3': {
    levelId: '3-3',
    title: '3-3 二位元加法機 (2-bit Ripple Adder)',
    category: '電腦運算電路',
    reqIn: 4,
    reqOut: 3,
    inputNames: ['A1', 'A0', 'B1', 'B0'],
    outputNames: ['Cout', 'S1', 'S0'],
    evaluator: (ins) => {
      const a = (ins[0] ? 2 : 0) + (ins[1] ? 1 : 0);
      const b = (ins[2] ? 2 : 0) + (ins[3] ? 1 : 0);
      const sum = a + b;
      return [
        (sum & 4) !== 0, // Cout (bit 2)
        (sum & 2) !== 0, // S1 (bit 1)
        (sum & 1) !== 0, // S0 (bit 0)
      ];
    },
    hint: '串聯兩個全加器：第 0 位的 Cout 接至第 1 位的 Cin，完成 2-bit + 2-bit 加法 (0~3 + 0~3 = 0~6)。',
  },
  '3-4': {
    levelId: '3-4',
    title: '3-4 數值比較器 (Comparator)',
    category: '電腦運算電路',
    reqIn: 2,
    reqOut: 2,
    inputNames: ['A', 'B'],
    outputNames: ['A > B', 'A = B'],
    evaluator: (ins) => [ins[0] && !ins[1], ins[0] === ins[1]],
    hint: '當 A=1 且 B=0 時 A>B 亮起；當 A=B (同為0或同為1) 時 A=B 亮起 (使用 XNOR 或 NOR/AND)。',
  },
  '2-6': {
    levelId: '2-6',
    title: '2-6 德摩根定律實習 (De Morgan)',
    category: '組合邏輯應用',
    reqIn: 2,
    reqOut: 1,
    inputNames: ['A', 'B'],
    outputNames: ['Y'],
    evaluator: (ins) => [!(ins[0] && ins[1])],
    hint: '驗證德摩根定律：!(A·B) 等效於 !A + !B。請使用 NOT 閘反相 A 與 B 後送入 OR 閘，輸出與 NAND 閘完全相同。',
  },
  '2-7': {
    levelId: '2-7',
    title: '2-7 卡諾圖化簡挑戰 (K-Map)',
    category: '組合邏輯應用',
    reqIn: 3,
    reqOut: 1,
    inputNames: ['A', 'B', 'C'],
    outputNames: ['Y'],
    evaluator: (ins) => [ins[2]],
    hint: '布林式 Y = A\'B\'C + A\'BC + AB\'C + ABC 經卡諾圖 4 格相鄰圈選化簡後，結果極度精簡為 Y = C！',
  },
  '3-5': {
    levelId: '3-5',
    title: '3-5 加減法運算器 (Adder/Subtractor)',
    category: '電腦運算電路',
    reqIn: 3,
    reqOut: 2,
    inputNames: ['Mode', 'A', 'B'],
    outputNames: ['S/D (總和/差)', 'C/B (進位/借位)'],
    evaluator: (ins) => {
      const mode = ins[0]; // 0: Add, 1: Sub
      const a = ins[1];
      const b = ins[2];
      if (!mode) {
        // Add: A + B
        const sum = a !== b;
        const carry = a && b;
        return [sum, carry];
      } else {
        // Sub: A - B
        const diff = a !== b;
        const borrow = !a && b;
        return [diff, borrow];
      }
    },
    hint: '利用 XOR 作為受控反相器：B ⊕ Mode。全加器的 Cin 接至 Mode。當 Mode=0 進行加法 A+B；Mode=1 進行二補數減法 A-B！',
  },
};

export function getLogicTruthTableSpec(levelId: string): LevelTruthTableSpec | null {
  return LOGIC_TRUTH_TABLE_SPECS[levelId] || null;
}

/**
 * Generates all permutations of indices 0..n-1.
 * Prioritizes the identity mapping [0, 1, ..., n-1] first.
 */
function getPermutations(n: number): number[][] {
  const result: number[][] = [];
  const permute = (arr: number[], m: number[] = []) => {
    if (arr.length === 0) result.push(m);
    else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  };
  permute(Array.from({ length: n }, (_, i) => i));
  return result;
}

/**
 * Finds all digital inputs (switches/buttons) and outputs (LEDs) on the canvas grid.
 * Sorts them geometrically (left-to-right, top-to-bottom) for natural mapping.
 */
export function findLogicPins(grid: (Tile | null)[][], gridSize: number) {
  const inputs: { x: number; y: number; tile: Tile }[] = [];
  const outputs: { x: number; y: number; tile: Tile }[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const t = grid[y]?.[x];
      if (t && t.type === 'logic') {
        if (t.subtype === 'power' || t.subtype === 'pushbtn') {
          inputs.push({ x, y, tile: t });
        } else if (t.subtype === 'led') {
          outputs.push({ x, y, tile: t });
        }
      }
    }
  }

  // Sort inputs primarily by X, secondarily by Y
  inputs.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 1) return a.x - b.x;
    return a.y - b.y;
  });

  // Sort outputs primarily by X, secondarily by Y
  outputs.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 1) return a.x - b.x;
    return a.y - b.y;
  });

  return { inputs, outputs };
}

/**
 * Simulates the circuit with a given input vector and returns the output vector.
 */
export function simulateLogicState(
  grid: (Tile | null)[][],
  gridSize: number,
  inputs: { x: number; y: number; tile: Tile }[],
  outputs: { x: number; y: number; tile: Tile }[],
  inputStates: boolean[]
): boolean[] {
  // Deep clone grid
  const testGrid = grid.map((row) =>
    row.map((cell) => (cell ? Object.assign(new Tile(), cell) : null))
  );

  // Apply inputs
  for (let i = 0; i < inputs.length; i++) {
    const p = inputs[i];
    if (testGrid[p.y]?.[p.x]) {
      testGrid[p.y][p.x]!.isActive = inputStates[i];
    }
  }

  const { netMap, netCount } = buildNetState(testGrid, gridSize, gridSize, 'logic', {
    opens: [],
    shorts: [],
  });
  const netData = Array(netCount + 1)
    .fill(0)
    .map(() => ({ color: '#4a5568', isHigh: false }));

  LogicEngine.simulate(testGrid, netMap, netData);

  return outputs.map((p) => !!testGrid[p.y]?.[p.x]?.isPowered);
}

/**
 * Evaluates the circuit against the level's truth table specification.
 * Returns a complete real-time evaluation report for both HUD display and pass/fail verification.
 */
export function evaluateLiveTruthTable(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): LiveTruthTableResult | null {
  const spec = getLogicTruthTableSpec(levelId);
  if (!spec) return null;

  const { inputs, outputs } = findLogicPins(grid, gridSize);
  const detectedInputsCount = inputs.length;
  const detectedOutputsCount = outputs.length;

  // Determine which variant fits the current detected pins
  const allVariants: TruthTableVariant[] = [
    {
      reqIn: spec.reqIn,
      reqOut: spec.reqOut,
      inputNames: spec.inputNames,
      outputNames: spec.outputNames,
      evaluator: spec.evaluator,
    },
    ...(spec.variants || []),
  ];

  let selectedVariantIndex = 0;
  for (let v = 0; v < allVariants.length; v++) {
    if (
      allVariants[v].reqIn === detectedInputsCount &&
      allVariants[v].reqOut === detectedOutputsCount
    ) {
      selectedVariantIndex = v;
      break;
    }
  }

  const activeVariant = allVariants[selectedVariantIndex];
  const reqIn = activeVariant.reqIn;
  const reqOut = activeVariant.reqOut;
  const inputNames = activeVariant.inputNames;
  const outputNames = activeVariant.outputNames;
  const evaluator = activeVariant.evaluator;

  const isInputCountMatch = detectedInputsCount === reqIn;
  const isOutputCountMatch = detectedOutputsCount === reqOut;

  // Read current active state from canvas switches
  const activeInputValues: boolean[] = inputs.map((p) => !!p.tile.isActive);

  // If pin count doesn't match, return unverified skeleton table
  if (!isInputCountMatch || !isOutputCountMatch) {
    const numRows = 1 << reqIn;
    const skeletonRows: LiveTruthTableRow[] = [];
    for (let r = 0; r < numRows; r++) {
      const inState: boolean[] = [];
      for (let j = reqIn - 1; j >= 0; j--) {
        inState.push(!!((r >> j) & 1));
      }
      const exp = evaluator(inState);
      skeletonRows.push({
        rowIndex: r,
        inputs: inState,
        expected: exp,
        actual: null,
        isCurrent: false,
        pass: false,
      });
    }

    return {
      spec,
      activeVariantIndex: selectedVariantIndex,
      inputNames,
      outputNames,
      inputCount: reqIn,
      outputCount: reqOut,
      detectedInputsCount,
      detectedOutputsCount,
      isInputCountMatch,
      isOutputCountMatch,
      rows: skeletonRows,
      passedCount: 0,
      totalRows: skeletonRows.length,
      allPassed: false,
      currentActiveRowIndex: -1,
      activeInputValues,
      diagnosticMessage: `需要 ${reqIn} 個開關與 ${reqOut} 個 LED (目前偵測到 ${detectedInputsCount} 個開關、${detectedOutputsCount} 個 LED)`,
    };
  }

  // Find best pin mapping that satisfies the table
  const inputPermutations = getPermutations(reqIn);
  const outputPermutations = getPermutations(reqOut);
  const numRows = 1 << reqIn;

  let bestMatchedCount = -1;
  let bestRows: LiveTruthTableRow[] = [];
  let bestInMap: number[] = inputPermutations[0];
  let bestOutMap: number[] = outputPermutations[0];

  for (const inMap of inputPermutations) {
    for (const outMap of outputPermutations) {
      const testRows: LiveTruthTableRow[] = [];
      let passCount = 0;

      for (let r = 0; r < numRows; r++) {
        // High-order bits first for clean truth table display (00, 01, 10, 11)
        const inState: boolean[] = [];
        for (let j = reqIn - 1; j >= 0; j--) {
          inState.push(!!((r >> j) & 1));
        }

        // Apply input mapping
        const actualInState: boolean[] = [];
        for (let j = 0; j < reqIn; j++) {
          actualInState[inMap[j]] = inState[j];
        }

        const rawOutState = simulateLogicState(grid, gridSize, inputs, outputs, actualInState);

        // Apply output mapping
        const testOutState: boolean[] = [];
        for (let j = 0; j < reqOut; j++) {
          testOutState[outMap[j]] = rawOutState[j];
        }

        const expectedOut = evaluator(inState);
        let rowPass = true;
        for (let j = 0; j < reqOut; j++) {
          if (testOutState[j] !== expectedOut[j]) {
            rowPass = false;
            break;
          }
        }

        if (rowPass) passCount++;

        // Check if this row matches current physical switch positions
        let isCurrent = true;
        for (let j = 0; j < reqIn; j++) {
          if (inState[j] !== activeInputValues[inMap[j]]) {
            isCurrent = false;
            break;
          }
        }

        testRows.push({
          rowIndex: r,
          inputs: inState,
          expected: expectedOut,
          actual: testOutState,
          isCurrent,
          pass: rowPass,
        });
      }

      if (passCount > bestMatchedCount) {
        bestMatchedCount = passCount;
        bestRows = testRows;
        bestInMap = inMap;
        bestOutMap = outMap;
      }

      // If all passed, terminate early
      if (passCount === numRows) {
        break;
      }
    }
    if (bestMatchedCount === numRows) {
      break;
    }
  }

  // Find which row is currently active
  let currentActiveRowIndex = bestRows.findIndex((r) => r.isCurrent);
  if (currentActiveRowIndex === -1 && bestRows.length > 0) {
    currentActiveRowIndex = 0;
  }

  const allPassed = bestMatchedCount === numRows;

  let diagnosticMessage = '';
  if (allPassed) {
    diagnosticMessage = '🎉 真值表全部吻合！電路邏輯完全正確。';
  } else {
    // Find first failed row to construct actionable feedback
    const firstFailed = bestRows.find((r) => !r.pass);
    if (firstFailed) {
      const inStr = firstFailed.inputs.map((b, i) => `${inputNames[i]}=${b ? 1 : 0}`).join(', ');
      const expStr = firstFailed.expected.map((b, i) => `${outputNames[i]}=${b ? 1 : 0}`).join(', ');
      const actStr = firstFailed.actual
        ? firstFailed.actual.map((b, i) => `${outputNames[i]}=${b ? 1 : 0}`).join(', ')
        : '無輸出';
      diagnosticMessage = `未吻合：當 ${inStr} 時，預期 [${expStr}]，但電路輸出 [${actStr}]。`;
    }
  }

  const orderedActiveInputs: boolean[] = [];
  for (let j = 0; j < reqIn; j++) {
    orderedActiveInputs.push(!!activeInputValues[bestInMap[j]]);
  }

  return {
    spec,
    activeVariantIndex: selectedVariantIndex,
    inputNames,
    outputNames,
    inputCount: reqIn,
    outputCount: reqOut,
    detectedInputsCount,
    detectedOutputsCount,
    isInputCountMatch: true,
    isOutputCountMatch: true,
    rows: bestRows,
    passedCount: bestMatchedCount,
    totalRows: numRows,
    allPassed,
    currentActiveRowIndex,
    activeInputValues: orderedActiveInputs,
    diagnosticMessage,
  };
}
