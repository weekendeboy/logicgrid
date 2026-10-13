/**
 * @license
 * Sequential Logic Testbench Definitions and Verification Engine
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import { Tile } from '../types';
import { buildNetState } from './NetEngine';
import { LogicEngine } from './LogicEngine';

export interface SequentialStep {
  name: string;
  description: string;
  inputs: Record<string, boolean>;
  expectedOutputs: Record<string, boolean>;
}

export interface SequentialLevelSpec {
  levelId: string;
  title: string;
  category: string;
  inputNames: string[];
  outputNames: string[];
  steps: SequentialStep[];
  hint: string;
}

export interface SequentialStepResult {
  stepIndex: number;
  name: string;
  description: string;
  inputValues: Record<string, boolean>;
  expectedOutputs: Record<string, boolean>;
  actualOutputs: Record<string, boolean>;
  pass: boolean;
}

export interface SequentialExecutionResult {
  spec: SequentialLevelSpec;
  inputNames: string[];
  outputNames: string[];
  stepResults: SequentialStepResult[];
  passedCount: number;
  totalSteps: number;
  allPassed: boolean;
  message: string;
}

export const SEQUENTIAL_SPECS: Record<string, SequentialLevelSpec> = {
  '4-1': {
    levelId: '4-1',
    title: '4-1 回饋與無窮迴圈 (Feedback Loop)',
    category: '循序邏輯基礎',
    inputNames: ['SW'],
    outputNames: ['LED'],
    hint: '將 NOT 閘的輸出線接回其輸入端產生環形振盪，或使用時脈 (Clock) 元件點亮 LED。',
    steps: [
      {
        name: '振盪/脈衝檢驗 1',
        description: '觀察輸出訊號在時脈或回饋下是否具備高電位活躍性',
        inputs: { SW: true },
        expectedOutputs: { LED: true },
      },
      {
        name: '振盪/脈衝檢驗 2',
        description: '檢驗反相或週期性切換狀態',
        inputs: { SW: false },
        expectedOutputs: { LED: false },
      },
    ],
  },
  '4-2': {
    levelId: '4-2',
    title: '4-2 SR 閂鎖器 (SR Latch)',
    category: '記憶與循序邏輯',
    inputNames: ['S', 'R'],
    outputNames: ['Q', "Q'"],
    hint: '以兩個 NOR 閘交叉回授連接 (NOR1 輸出接 NOR2 輸入，NOR2 輸出接 NOR1 輸入)。S=1 設定 Q=1，R=1 重置 Q=0，S=0 R=0 保持原狀態。',
    steps: [
      {
        name: '重置 (Reset)',
        description: '輸入 S=0, R=1，強制將記憶狀態重置為 0',
        inputs: { S: false, R: true },
        expectedOutputs: { Q: false, "Q'": true },
      },
      {
        name: '保持 0 (Hold Low)',
        description: '輸入 S=0, R=0，電路應保持先前的 0 狀態',
        inputs: { S: false, R: false },
        expectedOutputs: { Q: false, "Q'": true },
      },
      {
        name: '設定 (Set)',
        description: '輸入 S=1, R=0，將記憶狀態設定為 1',
        inputs: { S: true, R: false },
        expectedOutputs: { Q: true, "Q'": false },
      },
      {
        name: '保持 1 (Hold High)',
        description: '輸入 S=0, R=0，電路應保持先前的 1 狀態',
        inputs: { S: false, R: false },
        expectedOutputs: { Q: true, "Q'": false },
      },
      {
        name: '二次重置 (Reset Again)',
        description: '輸入 S=0, R=1，再度重置為 0',
        inputs: { S: false, R: true },
        expectedOutputs: { Q: false, "Q'": true },
      },
    ],
  },
  '4-3': {
    levelId: '4-3',
    title: '4-3 D 型閂鎖器 (D Latch)',
    category: '記憶與循序邏輯',
    inputNames: ['D', 'En'],
    outputNames: ['Q'],
    hint: '加入 Enable 控製線。當 En=1 時電路透明，Q 隨 D 變化；當 En=0 時鎖存，D 隨意改變 Q 都不動。可手搓或使用側邊欄 D-Latch IC。',
    steps: [
      {
        name: '透明寫入 1 (Write 1)',
        description: 'En=1, D=1，輸出應即刻跟隨為 1',
        inputs: { D: true, En: true },
        expectedOutputs: { Q: true },
      },
      {
        name: '關閉鎖存 (Latch 1)',
        description: 'En=0, D=1，鎖存器鎖住 1',
        inputs: { D: true, En: false },
        expectedOutputs: { Q: true },
      },
      {
        name: '資料變更保持 (Hold 1)',
        description: 'En=0, D=0，D 變為 0 但 En=0，Q 必須依然保持 1',
        inputs: { D: false, En: false },
        expectedOutputs: { Q: true },
      },
      {
        name: '透明寫入 0 (Write 0)',
        description: 'En=1, D=0，開啟 Enable，Q 即刻轉為 0',
        inputs: { D: false, En: true },
        expectedOutputs: { Q: false },
      },
      {
        name: '關閉鎖存 (Latch 0)',
        description: 'En=0, D=0，鎖存器鎖住 0',
        inputs: { D: false, En: false },
        expectedOutputs: { Q: false },
      },
      {
        name: '資料變更保持 (Hold 0)',
        description: 'En=0, D=1，D 變為 1 但 En=0，Q 必須依然保持 0',
        inputs: { D: true, En: false },
        expectedOutputs: { Q: false },
      },
    ],
  },
  '4-4': {
    levelId: '4-4',
    title: '4-4 D 型正反器 (D Flip-Flop)',
    category: '記憶與循序邏輯',
    inputNames: ['D', 'CLK'],
    outputNames: ['Q'],
    hint: 'D 正反器為正邊緣觸發 (Rising-Edge Triggered)。只有在 CLK 從 0 變 1 的瞬間才會取樣 D，CLK 保持在 1 時改變 D 不會影響 Q。可使用側邊欄 D-FF IC。',
    steps: [
      {
        name: '時脈低電位 (Clock Low)',
        description: 'D=1, CLK=0，此時尚未發生正邊緣',
        inputs: { D: true, CLK: false },
        expectedOutputs: { Q: false },
      },
      {
        name: '正邊緣觸發 1 (Rising Edge 1)',
        description: 'D=1, CLK 從 0 變 1，正反器取樣 D=1，Q 變為 1',
        inputs: { D: true, CLK: true },
        expectedOutputs: { Q: true },
      },
      {
        name: '時脈高電位抗擾 (Edge Immunity)',
        description: 'CLK 保持 1，改變 D=0，非邊緣瞬間 Q 必須依然保持 1',
        inputs: { D: false, CLK: true },
        expectedOutputs: { Q: true },
      },
      {
        name: '時脈復位 (Clock Return 0)',
        description: 'CLK 變為 0，Q 保持 1',
        inputs: { D: false, CLK: false },
        expectedOutputs: { Q: true },
      },
      {
        name: '正邊緣觸發 0 (Rising Edge 0)',
        description: 'D=0, CLK 從 0 變 1，正反器取樣 D=0，Q 變為 0',
        inputs: { D: false, CLK: true },
        expectedOutputs: { Q: false },
      },
      {
        name: '時脈高電位抗擾 0 (Edge Immunity 0)',
        description: 'CLK 保持 1，改變 D=1，Q 必須依然保持 0',
        inputs: { D: true, CLK: true },
        expectedOutputs: { Q: false },
      },
    ],
  },
  '4-5': {
    levelId: '4-5',
    title: '4-5 T 型正反器 (T Flip-Flop)',
    category: '記憶與循序邏輯',
    inputNames: ['T', 'CLK'],
    outputNames: ['Q'],
    hint: '當 T=1 時，每個 CLK 上升緣都會讓 Q 狀態反相 (0變1，1變0)；T=0 時保持。可使用側邊欄 T-FF IC。',
    steps: [
      {
        name: '準備觸發 (Ready)',
        description: 'T=1, CLK=0',
        inputs: { T: true, CLK: false },
        expectedOutputs: { Q: false },
      },
      {
        name: '第一次翻轉 (Toggle to 1)',
        description: 'T=1, CLK 上升緣 0->1，Q 翻轉為 1',
        inputs: { T: true, CLK: true },
        expectedOutputs: { Q: true },
      },
      {
        name: '時脈落下 (Clock Low)',
        description: 'T=1, CLK=0，Q 保持 1',
        inputs: { T: true, CLK: false },
        expectedOutputs: { Q: true },
      },
      {
        name: '第二次翻轉 (Toggle to 0)',
        description: 'T=1, CLK 上升緣 0->1，Q 翻轉回 0',
        inputs: { T: true, CLK: true },
        expectedOutputs: { Q: false },
      },
      {
        name: '抑制翻轉設定 (T=0 Disable)',
        description: '設 T=0, CLK=0',
        inputs: { T: false, CLK: false },
        expectedOutputs: { Q: false },
      },
      {
        name: '不翻轉檢驗 (No Toggle)',
        description: 'T=0, CLK 上升緣 0->1，因 T=0，Q 依然保持為 0',
        inputs: { T: false, CLK: true },
        expectedOutputs: { Q: false },
      },
    ],
  },
  '5-1': {
    levelId: '5-1',
    title: '5-1 移位暫存器 (Shift Register)',
    category: '高階循序邏輯專題',
    inputNames: ['In', 'CLK'],
    outputNames: ['LED1', 'LED2', 'LED3', 'LED4'],
    hint: '將 4 個 D-FF 串聯 (前一級 Q 接下一級 D)，共用同一條 CLK 線。可實現串列輸入、並列輸出 (SIPO) 跑馬燈。',
    steps: [
      {
        name: '移入位元 1 (Shift In 1)',
        description: 'In=1, 產生一個 CLK 脈衝，資料 1 進入第一級',
        inputs: { In: true, CLK: true },
        expectedOutputs: { LED1: true, LED2: false, LED3: false, LED4: false },
      },
      {
        name: '移位第 2 級 (Shift to Bit 2)',
        description: 'In=0, 產生一個 CLK 脈衝，第一級的 1 傳遞至第二級',
        inputs: { In: false, CLK: true },
        expectedOutputs: { LED1: false, LED2: true, LED3: false, LED4: false },
      },
      {
        name: '移入第二個 1 (Shift to Bit 3 & In 1)',
        description: 'In=1, 產生一個 CLK 脈衝，位元往前推移',
        inputs: { In: true, CLK: true },
        expectedOutputs: { LED1: true, LED2: false, LED3: true, LED4: false },
      },
      {
        name: '移位至第 4 級 (Shift to Bit 4)',
        description: 'In=1, 產生一個 CLK 脈衝，最早的 1 到達第四級 LED4',
        inputs: { In: true, CLK: true },
        expectedOutputs: { LED1: true, LED2: true, LED3: false, LED4: true },
      },
    ],
  },
  '5-2': {
    levelId: '5-2',
    title: '5-2 非同步計數器 (Ripple Counter)',
    category: '高階循序邏輯專題',
    inputNames: ['CLK'],
    outputNames: ['Bit0', 'Bit1'],
    hint: '使用兩個 T-FF (T設為高電位 1)，第一級 CLK 接開關，第二級 CLK 接第一級的 Q (或 Q\')。實現 00->01->10->11 計數。',
    steps: [
      {
        name: '時脈第 1 脈衝 (Count 1)',
        description: 'CLK 觸發第 1 次，計數器計為 1 (Bit0=1, Bit1=0)',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: true, Bit1: false },
      },
      {
        name: '時脈第 2 脈衝 (Count 2)',
        description: 'CLK 觸發第 2 次，計數器計為 2 (Bit0=0, Bit1=1)',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: false, Bit1: true },
      },
      {
        name: '時脈第 3 脈衝 (Count 3)',
        description: 'CLK 觸發第 3 次，計數器計為 3 (Bit0=1, Bit1=1)',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: true, Bit1: true },
      },
      {
        name: '溢位歸零 (Wrap to 0)',
        description: 'CLK 觸發第 4 次，計數器歸零 (Bit0=0, Bit1=0)',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: false, Bit1: false },
      },
    ],
  },
  '5-3': {
    levelId: '5-3',
    title: '5-3 密碼鎖電路 (Digital Lock)',
    category: '高階循序邏輯專題',
    inputNames: ['A', 'B', 'Enter'],
    outputNames: ['Unlock'],
    hint: '狀態機：必須依序按下 A 鍵進入狀態1，再按下 B 鍵進入狀態2，最後按下 Enter 才能觸發開鎖；次序錯誤則重置。',
    steps: [
      {
        name: '輸入按鈕 A (First Key)',
        description: '按下 A 按鈕',
        inputs: { A: true, B: false, Enter: false },
        expectedOutputs: { Unlock: false },
      },
      {
        name: '放開按鈕 A (Release A)',
        description: '狀態機記錄已按過 A',
        inputs: { A: false, B: false, Enter: false },
        expectedOutputs: { Unlock: false },
      },
      {
        name: '輸入按鈕 B (Second Key)',
        description: '按下 B 按鈕',
        inputs: { A: false, B: true, Enter: false },
        expectedOutputs: { Unlock: false },
      },
      {
        name: '放開按鈕 B (Release B)',
        description: '狀態機記錄已按過 B',
        inputs: { A: false, B: false, Enter: false },
        expectedOutputs: { Unlock: false },
      },
      {
        name: '確認開鎖 (Press Enter)',
        description: '按下 Enter，完成密碼驗證開鎖！',
        inputs: { A: false, B: false, Enter: true },
        expectedOutputs: { Unlock: true },
      },
    ],
  },
  '5-4': {
    levelId: '5-4',
    title: '5-4 自動販賣機邏輯 (Vending Machine)',
    category: '高階循序邏輯專題',
    inputNames: ['1元', '退幣'],
    outputNames: ['可購買'],
    hint: '投幣狀態機：投第 1 枚 1 元累積至狀態1；投第 2 枚 1 元累積至狀態2並點亮「可購買」；按退幣則強制歸零重置。',
    steps: [
      {
        name: '投入第 1 枚 1 元 (Insert 1)',
        description: '金額累積 1 元，未達 2 元門檻',
        inputs: { '1元': true, 退幣: false },
        expectedOutputs: { 可購買: false },
      },
      {
        name: '硬幣落下 (Coin Passed)',
        description: '按鈕復位，金額維持 1 元',
        inputs: { '1元': false, 退幣: false },
        expectedOutputs: { 可購買: false },
      },
      {
        name: '投入第 2 枚 1 元 (Insert 2)',
        description: '金額累積 2 元，亮起「可購買」燈泡！',
        inputs: { '1元': true, 退幣: false },
        expectedOutputs: { 可購買: true },
      },
      {
        name: '退幣歸零 (Refund)',
        description: '按下退幣按鍵，販賣機清除累積金額並歸零',
        inputs: { '1元': false, 退幣: true },
        expectedOutputs: { 可購買: false },
      },
    ],
  },
  '5-5': {
    levelId: '5-5',
    title: '5-5 七段顯示器計數專題 (7-Segment)',
    category: '高階循序邏輯專題',
    inputNames: ['CLK'],
    outputNames: ['Bit0', 'Bit1'],
    hint: '利用 T-FF 串聯做出計數器，並將 Bit0 接至七段顯示器的 Pin 1 (權重1)、Bit1 接至 Pin 2 (權重2)。每次按下 CLK，觀察數字 0->1->2->3 依序跳動！',
    steps: [
      {
        name: '第 1 脈衝 (顯示 1)',
        description: 'CLK 觸發第 1 次，計數為 1，七段顯示器點亮「1」',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: true, Bit1: false },
      },
      {
        name: '第 2 脈衝 (顯示 2)',
        description: 'CLK 觸發第 2 次，計數為 2，七段顯示器點亮「2」',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: false, Bit1: true },
      },
      {
        name: '第 3 脈衝 (顯示 3)',
        description: 'CLK 觸發第 3 次，計數為 3，七段顯示器點亮「3」',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: true, Bit1: true },
      },
      {
        name: '第 4 脈衝 (歸零顯示 0)',
        description: 'CLK 觸發第 4 次，計數溢位歸零，七段顯示器回到「0」',
        inputs: { CLK: true },
        expectedOutputs: { Bit0: false, Bit1: false },
      },
    ],
  },
};

export function getSequentialSpec(levelId: string): SequentialLevelSpec | null {
  return SEQUENTIAL_SPECS[levelId] || null;
}

/**
 * Finds all digital inputs (switches/buttons) and outputs (LEDs) on the canvas grid.
 * Matches them to spec names by label if present, otherwise by coordinate.
 */
function mapSequentialPins(
  grid: (Tile | null)[][],
  gridSize: number,
  inputNames: string[],
  outputNames: string[]
) {
  const rawInputs: { x: number; y: number; tile: Tile }[] = [];
  const rawOutputs: { x: number; y: number; tile: Tile }[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const t = grid[y]?.[x];
      if (t && t.type === 'logic') {
        if (t.subtype === 'power' || t.subtype === 'pushbtn') {
          rawInputs.push({ x, y, tile: t });
        } else if (t.subtype === 'led' || t.subtype === 'seg7') {
          rawOutputs.push({ x, y, tile: t });
        }
      }
    }
  }

  // Sort raw inputs/outputs by X
  rawInputs.sort((a, b) => a.x - b.x);
  rawOutputs.sort((a, b) => a.x - b.x);

  // Map input names
  const inputPinMap: Record<string, { x: number; y: number; tile: Tile }> = {};
  inputNames.forEach((name, idx) => {
    // Try matching label
    const byLabel = rawInputs.find(
      (p) => p.tile.labels[4]?.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (byLabel) {
      inputPinMap[name] = byLabel;
    } else if (rawInputs[idx]) {
      inputPinMap[name] = rawInputs[idx];
    }
  });

  // Map output names
  const outputPinMap: Record<string, { x: number; y: number; tile: Tile }> = {};
  outputNames.forEach((name, idx) => {
    const byLabel = rawOutputs.find(
      (p) => p.tile.labels[0]?.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (byLabel) {
      outputPinMap[name] = byLabel;
    } else if (rawOutputs[idx]) {
      outputPinMap[name] = rawOutputs[idx];
    } else if (rawOutputs.length === 1 && rawOutputs[0].tile.subtype === 'seg7') {
      // Map seg7 to multiple bits
      outputPinMap[name] = rawOutputs[0];
    }
  });

  return { inputPinMap, outputPinMap, rawInputs, rawOutputs };
}

/**
 * Executes a step-by-step stateful stimulus sequence across the user's sequential circuit.
 * Maintains flip-flop and feedback loop states between steps.
 */
export function executeSequentialTestbench(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): SequentialExecutionResult | null {
  const spec = getSequentialSpec(levelId);
  if (!spec) return null;

  const { inputPinMap, outputPinMap, rawInputs, rawOutputs } = mapSequentialPins(
    grid,
    gridSize,
    spec.inputNames,
    spec.outputNames
  );

  if (rawInputs.length === 0 || rawOutputs.length === 0) {
    return {
      spec,
      inputNames: spec.inputNames,
      outputNames: spec.outputNames,
      stepResults: [],
      passedCount: 0,
      totalSteps: spec.steps.length,
      allPassed: false,
      message: `畫布上缺少必要開關或 LED (需要 ${spec.inputNames.length} 輸入與 ${spec.outputNames.length} 輸出)`,
    };
  }

  // Deep clone grid to maintain stateful flip-flops and gate states across steps
  const simGrid = grid.map((row) =>
    row.map((cell) => (cell ? Object.assign(new Tile(), cell) : null))
  );

  // Initialize gate outStates to false
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const t = simGrid[y]?.[x];
      if (t && t.type === 'gate') {
        t.outState = false;
        t.prevSignal = false;
      }
    }
  }

  const stepResults: SequentialStepResult[] = [];
  let passedCount = 0;

  for (let s = 0; s < spec.steps.length; s++) {
    const step = spec.steps[s];

    // Apply inputs for this step to simGrid
    for (const inName of spec.inputNames) {
      const pin = inputPinMap[inName];
      if (pin && simGrid[pin.y]?.[pin.x]) {
        simGrid[pin.y][pin.x]!.isActive = !!step.inputs[inName];
      }
    }

    // Run simulation tick (including edge detection)
    const { netMap, netCount } = buildNetState(simGrid, gridSize, gridSize, 'logic', {
      opens: [],
      shorts: [],
    });
    const netData = Array(netCount + 1)
      .fill(0)
      .map(() => ({ color: '#4a5568', isHigh: false }));

    LogicEngine.simulate(simGrid, netMap, netData);

    // Read outputs
    const actualOutputs: Record<string, boolean> = {};
    let stepPass = true;

    for (const outName of spec.outputNames) {
      const pin = outputPinMap[outName];
      let isPowered = false;
      if (pin && simGrid[pin.y]?.[pin.x]) {
        const targetTile = simGrid[pin.y][pin.x]!;
        if (targetTile.subtype === 'seg7') {
          const val = targetTile.measureVal || 0;
          if (outName === 'Bit0') isPowered = (val & 1) !== 0;
          else if (outName === 'Bit1') isPowered = (val & 2) !== 0;
          else if (outName === 'Bit2') isPowered = (val & 4) !== 0;
          else if (outName === 'Bit3') isPowered = (val & 8) !== 0;
          else isPowered = !!targetTile.isPowered;
        } else {
          isPowered = !!targetTile.isPowered;
        }
      }
      actualOutputs[outName] = isPowered;

      const expected = !!step.expectedOutputs[outName];
      if (isPowered !== expected) {
        stepPass = false;
      }
    }

    if (stepPass) passedCount++;

    stepResults.push({
      stepIndex: s + 1,
      name: step.name,
      description: step.description,
      inputValues: step.inputs,
      expectedOutputs: step.expectedOutputs,
      actualOutputs,
      pass: stepPass,
    });
  }

  const allPassed = passedCount === spec.steps.length;
  let message = '';
  if (allPassed) {
    message = `🎉 恭喜通關！時序測試全數通過 (${passedCount}/${spec.steps.length})！`;
  } else {
    const firstFail = stepResults.find((r) => !r.pass);
    const failName = firstFail ? `步驟「${firstFail.name}」` : '';
    message = `時序未完全吻合 (${passedCount}/${spec.steps.length} 符合)，請檢查 ${failName} 的觸發邏輯。`;
  }

  return {
    spec,
    inputNames: spec.inputNames,
    outputNames: spec.outputNames,
    stepResults,
    passedCount,
    totalSteps: spec.steps.length,
    allPassed,
    message,
  };
}
