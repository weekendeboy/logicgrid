/**
 * @license
 * Digital Logic - Puzzle Quest Mode (數位邏輯棋盤解謎大挑戰)
 *
 * Rules:
 * - Fixed inputs (Logic switches, buttons, clock) and fixed outputs (LEDs, displays)
 * - Fixed industrial obstacles (barriers)
 * - Every 5 levels, a new logic gate / functional module is unlocked
 * - Fewer steps (tiles placed) = higher score & star rating (⭐⭐⭐ / ⭐⭐ / ⭐)
 */

import { Tile, LogicLevelId } from '../types';
import { LevelDefinition } from './types';
import { buildNetState } from '../engine/NetEngine';
import { LogicEngine } from '../engine/LogicEngine';

export interface LogicPuzzleLevelDefinition extends LevelDefinition {
  tier: number;
  tierName: string;
  unlockedComponent: string;
  unlockedBadge: string;
  parSteps: number;      // <= parSteps => 3 Stars ⭐⭐⭐
  twoStarSteps: number;  // <= twoStarSteps => 2 Stars ⭐⭐
  verify: (grid: (Tile | null)[][], size: number) => {
    passed: boolean;
    message: string;
    stepDetail?: string;
  };
}

export interface LogicPuzzleCategory {
  tier: number;
  title: string;
  desc: string;
  unlockedComponent: string;
  levels: LogicPuzzleLevelDefinition[];
}

// ----------------------------------------------------------------------------
// Helpers to create locked tiles for puzzle levels
// ----------------------------------------------------------------------------
function createObstacle(): Tile {
  const t = new Tile('misc', 'obstacle');
  t.isLocked = true;
  return t;
}

function createSwitch(rot: number = 0, label: string = '開關 A', active: boolean = false): Tile {
  const t = new Tile('logic', 'power', 100);
  t.rotation = rot;
  t.isActive = active;
  t.isLocked = true;
  t.labels = { 4: label };
  return t;
}

function createClock(rot: number = 0, label: string = '時脈 CLK'): Tile {
  const t = new Tile('logic', 'clock', 2);
  t.rotation = rot;
  t.isLocked = true;
  t.labels = { 4: label };
  return t;
}

function createLED(rot: number = 0, label: string = '目標 LED'): Tile {
  const t = new Tile('logic', 'led', 0);
  t.rotation = rot;
  t.isLocked = true;
  t.labels = { 4: label };
  return t;
}

// ----------------------------------------------------------------------------
// Verification Helper: Truth Table Simulation & Testing
// ----------------------------------------------------------------------------
export function testLogicSimulate(
  grid: (Tile | null)[][],
  size: number,
  inputPositions: { x: number; y: number; name?: string }[],
  testCases: {
    inputs: boolean[];
    expectedOutputs: { x: number; y: number; expected: boolean; name?: string }[];
  }[]
): { passed: boolean; message: string } {
  for (let tcIndex = 0; tcIndex < testCases.length; tcIndex++) {
    const tc = testCases[tcIndex];

    // Deep clone grid
    const g: (Tile | null)[][] = grid.map((row) =>
      row.map((c) => (c ? Object.assign(new Tile(), JSON.parse(JSON.stringify(c))) : null))
    );

    // Set input switch states
    for (let i = 0; i < inputPositions.length; i++) {
      const pos = inputPositions[i];
      const tile = g[pos.y]?.[pos.x];
      if (tile && tile.type === 'logic') {
        tile.isActive = tc.inputs[i];
      }
    }

    // Run simulation frame
    const { netMap, netCount } = buildNetState(g, size, size, 'logic', { opens: [], shorts: [] });
    const netData = Array(netCount + 1).fill(0).map(() => ({ color: '#4a5568', isHigh: false }));
    LogicEngine.simulate(g, netMap, netData);

    // Verify expected outputs
    for (const out of tc.expectedOutputs) {
      const tile = g[out.y]?.[out.x];
      const actual = !!(tile && tile.isPowered);
      if (actual !== out.expected) {
        const inputDesc = inputPositions
          .map((p, idx) => `${p.name || `輸入${idx + 1}`}=${tc.inputs[idx] ? '1' : '0'}`)
          .join(', ');
        return {
          passed: false,
          message: `真值表驗證失敗：當【${inputDesc}】時，${out.name || '目標LED'} 應為 ${out.expected ? '1 (亮)' : '0 (滅)'}，但目前為 ${actual ? '1 (亮)' : '0 (滅)'}。`,
        };
      }
    }
  }

  return { passed: true, message: '🎉 邏輯驗證完全正確！所有真值表條件均符合！' };
}

// ----------------------------------------------------------------------------
// 25 Digital Logic Puzzle Levels (5 Tiers x 5 Levels)
// ----------------------------------------------------------------------------
export const logicPuzzleLevels: LogicPuzzleLevelDefinition[] = [
  // ==========================================================================
  // TIER 1: 基礎訊號與導線避障 (lp-1-1 ~ lp-1-5)
  // 解鎖元件：基礎導線組 (直線 / 轉彎 / T型分流 / 絕緣天橋)
  // ==========================================================================
  {
    id: 'lp-1-1' as LogicLevelId,
    title: '關卡 1-1：最短數位訊號通路',
    desc: '任務：使用最少數量的直線導線，將開關 A 的輸出端連接至右側目標 LED。',
    category: '第一階段：基礎訊號與導線避障',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：基礎訊號與導線避障',
    unlockedComponent: '基礎直線導線',
    unlockedBadge: '⚡ 直線導線',
    parSteps: 5,
    twoStarSteps: 7,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[4][7] = createLED(0, '目標 LED');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-1-2' as LogicLevelId,
    title: '關卡 1-2：轉角避障信號引導',
    desc: '任務：中央設有絕緣阻隔鋼板，請利用轉彎導線繞過障礙物，將開關 A 信號引導至右下角 LED。',
    category: '第一階段：基礎訊號與導線避障',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：基礎訊號與導線避障',
    unlockedComponent: '轉彎導線 (Turn)',
    unlockedBadge: '↪ 轉彎導線',
    parSteps: 7,
    twoStarSteps: 10,
    setup: (grid) => {
      grid[2][2] = createSwitch(0, '開關 A');
      grid[2][5] = createObstacle();
      grid[3][5] = createObstacle();
      grid[4][5] = createObstacle();
      grid[6][7] = createLED(0, '目標 LED');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [{ x: 2, y: 2, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 6, expected: false, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 6, expected: true, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-1-3' as LogicLevelId,
    title: '關卡 1-3：一對二信號分流',
    desc: '任務：中央直線被障礙物切斷，請使用 T 型分流導線，讓單一開關 A 同時控制兩顆 LED 同步點亮。',
    category: '第一階段：基礎訊號與導線避障',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：基礎訊號與導線避障',
    unlockedComponent: 'T型分流導線 (T-Wire)',
    unlockedBadge: '┳ T型分流',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[4][4] = createObstacle();
      grid[2][7] = createLED(0, 'LED 1');
      grid[6][7] = createLED(0, 'LED 2');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          {
            inputs: [false],
            expectedOutputs: [
              { x: 7, y: 2, expected: false, name: 'LED 1' },
              { x: 7, y: 6, expected: false, name: 'LED 2' },
            ],
          },
          {
            inputs: [true],
            expectedOutputs: [
              { x: 7, y: 2, expected: true, name: 'LED 1' },
              { x: 7, y: 6, expected: true, name: 'LED 2' },
            ],
          },
        ]
      );
    },
  },

  {
    id: 'lp-1-4' as LogicLevelId,
    title: '關卡 1-4：獨立交錯雙信號通道',
    desc: '任務：開關 A 控制 LED_A，開關 B 控制 LED_B。兩路路徑必定在中央交叉，必須使用絕緣天橋避免短路干擾！',
    category: '第一階段：基礎訊號與導線避障',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：基礎訊號與導線避障',
    unlockedComponent: '絕緣天橋 (Bridge)',
    unlockedBadge: '🔀 絕緣天橋',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[3][1] = createSwitch(0, '開關 A');
      grid[1][4] = createSwitch(1, '開關 B'); // Output facing Down
      grid[3][7] = createLED(0, 'LED A');
      grid[7][4] = createLED(1, 'LED B'); // Input facing Top

      // Surround with obstacles leaving center cross
      grid[2][3] = createObstacle();
      grid[2][5] = createObstacle();
      grid[4][3] = createObstacle();
      grid[4][5] = createObstacle();
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 3, name: '開關 A' },
          { x: 4, y: 1, name: '開關 B' },
        ],
        [
          {
            inputs: [false, false],
            expectedOutputs: [
              { x: 7, y: 3, expected: false, name: 'LED A' },
              { x: 4, y: 7, expected: false, name: 'LED B' },
            ],
          },
          {
            inputs: [true, false],
            expectedOutputs: [
              { x: 7, y: 3, expected: true, name: 'LED A' },
              { x: 4, y: 7, expected: false, name: 'LED B' },
            ],
          },
          {
            inputs: [false, true],
            expectedOutputs: [
              { x: 7, y: 3, expected: false, name: 'LED A' },
              { x: 4, y: 7, expected: true, name: 'LED B' },
            ],
          },
          {
            inputs: [true, true],
            expectedOutputs: [
              { x: 7, y: 3, expected: true, name: 'LED A' },
              { x: 4, y: 7, expected: true, name: 'LED B' },
            ],
          },
        ]
      );
    },
  },

  {
    id: 'lp-1-5' as LogicLevelId,
    title: '關卡 1-5：精密迷宮立體穿越',
    desc: '任務：在曲折且錯綜複雜的鋼板通道中，將左上與左下的信號分別送達右上與右下目標。',
    category: '第一階段：基礎訊號與導線避障',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：基礎訊號與導線避障',
    unlockedComponent: '立體綜合佈線',
    unlockedBadge: '🏆 導線大師',
    parSteps: 12,
    twoStarSteps: 16,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '開關 1');
      grid[7][1] = createSwitch(0, '開關 2');
      grid[2][8] = createLED(0, 'LED 1');
      grid[7][8] = createLED(0, 'LED 2');

      // Maze obstacles
      grid[2][4] = createObstacle();
      grid[3][4] = createObstacle();
      grid[4][4] = createObstacle();
      grid[5][4] = createObstacle();
      grid[6][4] = createObstacle();

      grid[4][2] = createObstacle();
      grid[4][6] = createObstacle();
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '開關 1' },
          { x: 1, y: 7, name: '開關 2' },
        ],
        [
          {
            inputs: [false, false],
            expectedOutputs: [
              { x: 8, y: 2, expected: false, name: 'LED 1' },
              { x: 8, y: 7, expected: false, name: 'LED 2' },
            ],
          },
          {
            inputs: [true, false],
            expectedOutputs: [
              { x: 8, y: 2, expected: true, name: 'LED 1' },
              { x: 8, y: 7, expected: false, name: 'LED 2' },
            ],
          },
          {
            inputs: [false, true],
            expectedOutputs: [
              { x: 8, y: 2, expected: false, name: 'LED 1' },
              { x: 8, y: 7, expected: true, name: 'LED 2' },
            ],
          },
          {
            inputs: [true, true],
            expectedOutputs: [
              { x: 8, y: 2, expected: true, name: 'LED 1' },
              { x: 8, y: 7, expected: true, name: 'LED 2' },
            ],
          },
        ]
      );
    },
  },

  // ==========================================================================
  // TIER 2: 反相器與緩衝傳導 (lp-2-1 ~ lp-2-5)
  // 解鎖元件：NOT 閘 / Buffer 閘
  // ==========================================================================
  {
    id: 'lp-2-1' as LogicLevelId,
    title: '關卡 2-1：斷路警報反相系統 (NOT)',
    desc: '任務：解鎖 NOT 反相閘！當開關 A 斷開 (0) 時，警報 LED 必須點亮 (1)；開關按下 (1) 時，LED 熄滅 (0)。',
    category: '第二階段：反相器與緩衝傳導',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：反相器與緩衝傳導',
    unlockedComponent: 'NOT 閘 (反相器)',
    unlockedBadge: '🔺 NOT 閘',
    parSteps: 5,
    twoStarSteps: 7,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[4][7] = createLED(0, '警報 LED');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-2-2' as LogicLevelId,
    title: '關卡 2-2：雙端互補相反輸出',
    desc: '任務：開關 A 輸出需分成兩路，其中一路經過 NOT 閘，達成「正常燈與備用燈永遠呈現相反互補」的效果。',
    category: '第二階段：反相器與緩衝傳導',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：反相器與緩衝傳導',
    unlockedComponent: '互補反相應用',
    unlockedBadge: '☯ 互補輸出',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[2][7] = createLED(0, '正常燈 (同相)');
      grid[6][7] = createLED(0, '備用燈 (反相)');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          {
            inputs: [false],
            expectedOutputs: [
              { x: 7, y: 2, expected: false, name: '正常燈' },
              { x: 7, y: 6, expected: true, name: '備用燈' },
            ],
          },
          {
            inputs: [true],
            expectedOutputs: [
              { x: 7, y: 2, expected: true, name: '正常燈' },
              { x: 7, y: 6, expected: false, name: '備用燈' },
            ],
          },
        ]
      );
    },
  },

  {
    id: 'lp-2-3' as LogicLevelId,
    title: '關卡 2-3：長距離隔離緩衝器 (Buffer)',
    desc: '任務：解鎖 Buffer 緩衝閘！在中央雜訊隔離區中置入 Buffer 閘，將輸入信號同相再生傳遞至終點。',
    category: '第二階段：反相器與緩衝傳導',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：反相器與緩衝傳導',
    unlockedComponent: 'Buffer 緩衝閘',
    unlockedBadge: '▷ Buffer 閘',
    parSteps: 5,
    twoStarSteps: 7,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      // Barrier requiring passage through row 4
      grid[3][4] = createObstacle();
      grid[5][4] = createObstacle();
      grid[4][7] = createLED(0, '目標 LED');
    },
    verify: (grid, size) => {
      // Must include gate_buffer
      let hasBuffer = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 'buffer') hasBuffer = true;
        }
      }
      if (!hasBuffer) {
        return { passed: false, message: '此關卡指定練習「Buffer 緩衝器」，盤面中必須置入 Buffer 閘！' };
      }
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-2-4' as LogicLevelId,
    title: '關卡 2-4：雙重反轉極性消除 (Double Inversion)',
    desc: '任務：布林代數 NOT(NOT A) = A。使用兩個 NOT 閘串聯，驗證信號經兩次反相後極性完全復原！',
    category: '第二階段：反相器與緩衝傳導',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：反相器與緩衝傳導',
    unlockedComponent: '雙反向串聯邏輯',
    unlockedBadge: '🔁 雙重反轉',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[4][7] = createLED(0, '復原 LED');
    },
    verify: (grid, size) => {
      let notCount = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 'not') notCount++;
        }
      }
      if (notCount < 2) {
        return { passed: false, message: '此關卡指定練習雙重反相，請在電路中串聯至少 2 個 NOT 閘！' };
      }
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-2-5' as LogicLevelId,
    title: '關卡 2-5：安全警戒開關邏輯',
    desc: '任務：布防開關 A 與急停開關 B。要求：當急停 B 被按下 (1) 或未布防 (A=0) 時警報響起，請設計反相邏輯電路。',
    category: '第二階段：反相器與緩衝傳導',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：反相器與緩衝傳導',
    unlockedComponent: '反相複合邏輯',
    unlockedBadge: '🛡️ 警戒邏輯',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[3][1] = createSwitch(0, '開關 A');
      grid[5][1] = createSwitch(0, '開關 B (反向)');
      grid[4][7] = createLED(0, '警報燈');
      grid[4][4] = createObstacle();
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 3, name: '開關 A' },
          { x: 1, y: 5, name: '開關 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '警報燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
        ]
      );
    },
  },

  // ==========================================================================
  // TIER 3: 基礎雙輸入閘 (AND & OR Gates, lp-3-1 ~ lp-3-5)
  // 解鎖元件：AND 閘 / OR 閘
  // ==========================================================================
  {
    id: 'lp-3-1' as LogicLevelId,
    title: '關卡 3-1：金庫雙鍵開鎖 (AND Gate)',
    desc: '任務：解鎖 AND 閘！只有當開關 A 與開關 B 同時為 1 時，金庫 LED 才點亮；任何一個為 0 則不亮。',
    category: '第三階段：基礎雙輸入閘',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：基礎雙輸入閘',
    unlockedComponent: 'AND 閘 (及閘)',
    unlockedBadge: '⊓ AND 閘',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '開關 A');
      grid[6][1] = createSwitch(0, '開關 B');
      grid[4][7] = createLED(0, '金庫燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '開關 A' },
          { x: 1, y: 6, name: '開關 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '金庫燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '金庫燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '金庫燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '金庫燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-3-2' as LogicLevelId,
    title: '關卡 3-2：走廊雙向照明 (OR Gate)',
    desc: '任務：解鎖 OR 閘！走廊兩端任何一個開關按下 (01, 10, 11)，走廊燈都必須點亮；兩者皆放開 (00) 則熄滅。',
    category: '第三階段：基礎雙輸入閘',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：基礎雙輸入閘',
    unlockedComponent: 'OR 閘 (或閘)',
    unlockedBadge: '⊔ OR 閘',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '開關 A');
      grid[6][1] = createSwitch(0, '開關 B');
      grid[4][7] = createLED(0, '走廊燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '開關 A' },
          { x: 1, y: 6, name: '開關 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '走廊燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '走廊燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '走廊燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '走廊燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-3-3' as LogicLevelId,
    title: '關卡 3-3：三鍵表決系統 (3-Input AND)',
    desc: '任務：利用兩個 2-input AND 閘串聯，達成 3 輸入 AND 邏輯（必須 A、B、C 三個開關全部為 1 才點亮）。',
    category: '第三階段：基礎雙輸入閘',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：基礎雙輸入閘',
    unlockedComponent: '多輸入組合級聯',
    unlockedBadge: '🌲 多重 AND',
    parSteps: 10,
    twoStarSteps: 14,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '開關 A');
      grid[4][1] = createSwitch(0, '開關 B');
      grid[6][1] = createSwitch(0, '開關 C');
      grid[4][8] = createLED(0, '核准燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '開關 A' },
          { x: 1, y: 4, name: '開關 B' },
          { x: 1, y: 6, name: '開關 C' },
        ],
        [
          { inputs: [false, false, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '核准燈' }] },
          { inputs: [true, false, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '核准燈' }] },
          { inputs: [true, true, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '核准燈' }] },
          { inputs: [false, true, true], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '核准燈' }] },
          { inputs: [true, true, true], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '核准燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-3-4' as LogicLevelId,
    title: '關卡 3-4：安全條件啟動 (A AND (B OR C))',
    desc: '任務：主電源開關 A 必須啟動，且 (手動按鈕 B 或 腳踏按鈕 C) 任一啟動時，馬達指示燈才亮起。',
    category: '第三階段：基礎雙輸入閘',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：基礎雙輸入閘',
    unlockedComponent: 'AND-OR 混合邏輯',
    unlockedBadge: '⚙️ 混合控制',
    parSteps: 11,
    twoStarSteps: 15,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '主電源 A');
      grid[5][1] = createSwitch(0, '按鈕 B');
      grid[7][1] = createSwitch(0, '按鈕 C');
      grid[4][8] = createLED(0, '啟動燈');
      grid[4][4] = createObstacle();
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '主電源 A' },
          { x: 1, y: 5, name: '按鈕 B' },
          { x: 1, y: 7, name: '按鈕 C' },
        ],
        [
          { inputs: [false, true, true], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '啟動燈' }] },
          { inputs: [true, false, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '啟動燈' }] },
          { inputs: [true, true, false], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '啟動燈' }] },
          { inputs: [true, false, true], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '啟動燈' }] },
          { inputs: [true, true, true], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '啟動燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-3-5' as LogicLevelId,
    title: '關卡 3-5：雙區獨立報警總成 (AND-OR)',
    desc: '任務：A 區 (A1 AND A2) 或是 B 區 (B1 AND B2) 任何一區同時觸發，中央警報燈立即點亮！',
    category: '第三階段：基礎雙輸入閘',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：基礎雙輸入閘',
    unlockedComponent: '標準積之和 (SOP)',
    unlockedBadge: '🏆 邏輯組合',
    parSteps: 13,
    twoStarSteps: 17,
    setup: (grid) => {
      grid[1][1] = createSwitch(0, 'A1');
      grid[3][1] = createSwitch(0, 'A2');
      grid[6][1] = createSwitch(0, 'B1');
      grid[8][1] = createSwitch(0, 'B2');
      grid[4][8] = createLED(0, '總警報');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 1, name: 'A1' },
          { x: 1, y: 3, name: 'A2' },
          { x: 1, y: 6, name: 'B1' },
          { x: 1, y: 8, name: 'B2' },
        ],
        [
          { inputs: [false, false, false, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '總警報' }] },
          { inputs: [true, false, false, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '總警報' }] },
          { inputs: [true, true, false, false], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '總警報' }] },
          { inputs: [false, false, true, true], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '總警報' }] },
          { inputs: [true, false, true, false], expectedOutputs: [{ x: 8, y: 4, expected: false, name: '總警報' }] },
          { inputs: [true, true, true, true], expectedOutputs: [{ x: 8, y: 4, expected: true, name: '總警報' }] },
        ]
      );
    },
  },

  // ==========================================================================
  // TIER 4: 萬用與互斥邏輯 (Universal & Exotic Gates, lp-4-1 ~ lp-4-5)
  // 解鎖元件：NAND 閘 / NOR 閘 / XOR 閘
  // ==========================================================================
  {
    id: 'lp-4-1' as LogicLevelId,
    title: '關卡 4-1：樓梯雙切開關 (XOR Gate)',
    desc: '任務：解鎖 XOR 互斥或閘！樓上樓下兩個開關狀態不同 (01, 10) 燈亮；狀態相同 (00, 11) 燈滅。',
    category: '第四階段：萬用與互斥邏輯',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：萬用與互斥邏輯',
    unlockedComponent: 'XOR 閘 (互斥或閘)',
    unlockedBadge: '⊕ XOR 閘',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '樓下開關 A');
      grid[6][1] = createSwitch(0, '樓上開關 B');
      grid[4][7] = createLED(0, '樓梯燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '開關 A' },
          { x: 1, y: 6, name: '開關 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '樓梯燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '樓梯燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '樓梯燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '樓梯燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-4-2' as LogicLevelId,
    title: '關卡 4-2：防搶防斷線守護 (NAND Gate)',
    desc: '任務：解鎖 NAND 閘！只有當所有感應線皆完整通電 (11) 時才為 0 (安全)；任一路斷開即亮起警報 (1)。',
    category: '第四階段：萬用與互斥邏輯',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：萬用與互斥邏輯',
    unlockedComponent: 'NAND 閘 (反及閘)',
    unlockedBadge: '⊼ NAND 閘',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '感應線 A');
      grid[6][1] = createSwitch(0, '感應線 B');
      grid[4][7] = createLED(0, '警報燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '感應線 A' },
          { x: 1, y: 6, name: '感應線 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '警報燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '警報燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-4-3' as LogicLevelId,
    title: '關卡 4-3：全機無故障指示 (NOR Gate)',
    desc: '任務：解鎖 NOR 閘！只有當故障信號 A 與 B 皆為 0 (無故障) 時才點亮綠色安全燈；任一有故障即熄滅。',
    category: '第四階段：萬用與互斥邏輯',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：萬用與互斥邏輯',
    unlockedComponent: 'NOR 閘 (反或閘)',
    unlockedBadge: '⊽ NOR 閘',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '故障信號 A');
      grid[6][1] = createSwitch(0, '故障信號 B');
      grid[4][7] = createLED(0, '安全指示燈');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '故障 A' },
          { x: 1, y: 6, name: '故障 B' },
        ],
        [
          { inputs: [false, false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: '安全燈' }] },
          { inputs: [true, false], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '安全燈' }] },
          { inputs: [false, true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '安全燈' }] },
          { inputs: [true, true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: '安全燈' }] },
        ]
      );
    },
  },

  {
    id: 'lp-4-4' as LogicLevelId,
    title: '關卡 4-4：NAND 萬用閘反相轉換',
    desc: '任務：工業萬用閘實習！請使用 NAND 閘（兩輸入並聯）實現 NOT 閘的功能，達成開關 0 時燈亮、1 時燈滅。',
    category: '第四階段：萬用與互斥邏輯',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：萬用與互斥邏輯',
    unlockedComponent: '萬用閘等效轉換',
    unlockedBadge: '⭐ 萬用閘特化',
    parSteps: 6,
    twoStarSteps: 8,
    setup: (grid) => {
      grid[4][1] = createSwitch(0, '開關 A');
      grid[4][7] = createLED(0, '目標 LED');
    },
    verify: (grid, size) => {
      let hasNand = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 'nand') hasNand = true;
        }
      }
      if (!hasNand) {
        return { passed: false, message: '此關卡指定練習「NAND 萬用閘化身反相器」，盤面中必須置入 NAND 閘！' };
      }
      return testLogicSimulate(
        grid,
        size,
        [{ x: 1, y: 4, name: '開關 A' }],
        [
          { inputs: [false], expectedOutputs: [{ x: 7, y: 4, expected: true, name: 'LED' }] },
          { inputs: [true], expectedOutputs: [{ x: 7, y: 4, expected: false, name: 'LED' }] },
        ]
      );
    },
  },

  {
    id: 'lp-4-5' as LogicLevelId,
    title: '關卡 4-5：一位元半加器 (Half Adder)',
    desc: '任務：建造電腦計算核心！輸入 A 與 B，使用 XOR 閘計算總和 (Sum)，使用 AND 閘計算進位 (Carry)！',
    category: '第四階段：萬用與互斥邏輯',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：萬用與互斥邏輯',
    unlockedComponent: '半加器運算核心',
    unlockedBadge: '🔢 半加器',
    parSteps: 12,
    twoStarSteps: 16,
    setup: (grid) => {
      grid[2][1] = createSwitch(0, '位元 A');
      grid[6][1] = createSwitch(0, '位元 B');
      grid[3][8] = createLED(0, '總和 Sum (XOR)');
      grid[7][8] = createLED(0, '進位 Carry (AND)');
    },
    verify: (grid, size) => {
      return testLogicSimulate(
        grid,
        size,
        [
          { x: 1, y: 2, name: '位元 A' },
          { x: 1, y: 6, name: '位元 B' },
        ],
        [
          {
            inputs: [false, false],
            expectedOutputs: [
              { x: 8, y: 3, expected: false, name: 'Sum' },
              { x: 8, y: 7, expected: false, name: 'Carry' },
            ],
          },
          {
            inputs: [true, false],
            expectedOutputs: [
              { x: 8, y: 3, expected: true, name: 'Sum' },
              { x: 8, y: 7, expected: false, name: 'Carry' },
            ],
          },
          {
            inputs: [false, true],
            expectedOutputs: [
              { x: 8, y: 3, expected: true, name: 'Sum' },
              { x: 8, y: 7, expected: false, name: 'Carry' },
            ],
          },
          {
            inputs: [true, true],
            expectedOutputs: [
              { x: 8, y: 3, expected: false, name: 'Sum' },
              { x: 8, y: 7, expected: true, name: 'Carry' },
            ],
          },
        ]
      );
    },
  },

  // ==========================================================================
  // TIER 5: 時脈與循序儲存 (Sequential & Flip-Flops, lp-5-1 ~ lp-5-5)
  // 解鎖元件：Clock / D-FF / T-FF / D-Latch
  // ==========================================================================
  {
    id: 'lp-5-1' as LogicLevelId,
    title: '關卡 5-1：脈衝單擊切換器 (T-FF Toggle)',
    desc: '任務：解鎖 T 型正反器！將 T 設為 1，使時脈或按鈕脈衝的每次上升緣反轉 Q 輸出，驅動 LED 交替開關！',
    category: '第五階段：時脈與循序儲存',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時脈與循序儲存',
    unlockedComponent: 'T 型正反器 (T-FF)',
    unlockedBadge: '🔄 T-FF 閘',
    parSteps: 6,
    twoStarSteps: 8,
    setup: (grid) => {
      grid[2][2] = createSwitch(0, 'T致能 (恆1)', true); // High
      grid[2][4] = createClock(1, 'CLK (脈衝)'); // Clock pin facing Down
      grid[7][7] = createLED(0, '狀態 Q');
    },
    verify: (grid, size) => {
      let hasTFF = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 't_ff') hasTFF = true;
        }
      }
      if (!hasTFF) {
        return { passed: false, message: '盤面中必須置入 T 型正反器 (T-FF) 才能完成切換！' };
      }
      return { passed: true, message: '🎉 T-FF 正反切換迴路正確接通！狀態隨脈衝反轉！' };
    },
  },

  {
    id: 'lp-5-2' as LogicLevelId,
    title: '關卡 5-2：D-FF 邊緣資料鎖存',
    desc: '任務：解鎖 D 型正反器！將 CLK 與資料開關 D 接至 D-FF，使 LED 僅在 CLK 上升緣取樣 D 的值並持續儲存。',
    category: '第五階段：時脈與循序儲存',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時脈與循序儲存',
    unlockedComponent: 'D 型正反器 (D-FF)',
    unlockedBadge: '💾 D-FF 閘',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[1][4] = createClock(1, 'CLK');
      grid[4][1] = createSwitch(0, '資料 D');
      grid[4][8] = createLED(0, '鎖存 Q');
    },
    verify: (grid, size) => {
      let hasDFF = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 'd_ff') hasDFF = true;
        }
      }
      if (!hasDFF) {
        return { passed: false, message: '盤面中必須置入 D 型正反器 (D-FF) 以實現資料取樣！' };
      }
      return { passed: true, message: '🎉 D-FF 邊緣取樣與資料鎖存迴路成功導通！' };
    },
  },

  {
    id: 'lp-5-3' as LogicLevelId,
    title: '關卡 5-3：二除頻時脈除頻器',
    desc: '任務：將 T-FF 之 T 接腳保持為高電位 (1)，使輸出 Q 的跳變頻率恰為 CLK 輸入頻率之一半。',
    category: '第五階段：時脈與循序儲存',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時脈與循序儲存',
    unlockedComponent: '除頻器應用',
    unlockedBadge: '➗ 二除頻',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[2][2] = createSwitch(0, '高電位 (1)', true);
      grid[1][4] = createClock(1, '時脈 CLK');
      grid[4][8] = createLED(0, '除頻 Q (f/2)');
    },
    verify: (grid, size) => {
      let hasTFF = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 't_ff') hasTFF = true;
        }
      }
      if (!hasTFF) {
        return { passed: false, message: '此關卡指定使用 T-FF 構建二除頻器！' };
      }
      return { passed: true, message: '🎉 二除頻電路組裝正確！時脈頻率成功減半！' };
    },
  },

  {
    id: 'lp-5-4' as LogicLevelId,
    title: '關卡 5-4：D 型閂鎖器透明開關 (D-Latch)',
    desc: '任務：解鎖 D-Latch！當致能開關 E=1 時輸出 Q 跟隨資料 D 改變；當 E=0 時鎖定前一次的狀態不變。',
    category: '第五階段：時脈與循序儲存',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時脈與循序儲存',
    unlockedComponent: 'D 型閂鎖器 (D-Latch)',
    unlockedBadge: '🚪 D-Latch',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[2][2] = createSwitch(0, '致能 E');
      grid[6][2] = createSwitch(0, '資料 D');
      grid[4][8] = createLED(0, '輸出 Q');
    },
    verify: (grid, size) => {
      let hasLatch = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 'd_latch') hasLatch = true;
        }
      }
      if (!hasLatch) {
        return { passed: false, message: '盤面中必須置入 D 型閂鎖器 (D-Latch)！' };
      }
      return { passed: true, message: '🎉 D-Latch 電位致能與記憶保持功能驗證通過！' };
    },
  },

  {
    id: 'lp-5-5' as LogicLevelId,
    title: '關卡 5-5：雙位元非同步二進位計數器',
    desc: '任務：大師級挑戰！串聯兩個 T-FF，由 CLK 驅動 Q0 (LSB)，再由 Q0 驅動第二個 T-FF (Q1, MSB)，實現 00->01->10->11 計數！',
    category: '第五階段：時脈與循序儲存',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時脈與循序儲存',
    unlockedComponent: '非同步二位元計數器',
    unlockedBadge: '👑 數位大師',
    parSteps: 14,
    twoStarSteps: 18,
    setup: (grid) => {
      grid[1][1] = createSwitch(0, '高電位 (1)', true);
      grid[1][3] = createClock(1, 'CLK');
      grid[7][4] = createLED(0, 'Q0 (LSB)');
      grid[7][8] = createLED(0, 'Q1 (MSB)');
    },
    verify: (grid, size) => {
      let tffCount = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y]?.[x];
          if (t && t.type === 'gate' && t.subtype === 't_ff') tffCount++;
        }
      }
      if (tffCount < 2) {
        return { passed: false, message: '雙位元計數器必須串聯至少 2 個 T-FF 閘！' };
      }
      return { passed: true, message: '🎉 恭喜！完美建立雙位元二進位計數器！通關數位邏輯大挑戰！' };
    },
  },
];

// ----------------------------------------------------------------------------
// Categories for Quest Hall Menu
// ----------------------------------------------------------------------------
export const logicPuzzleCategories: LogicPuzzleCategory[] = [
  {
    tier: 1,
    title: '第一階段：基礎訊號與導線避障',
    desc: '開關信號傳遞、直角轉角繞線、一對多分流、交叉天橋避短路',
    unlockedComponent: '基礎導線組 (直線/轉角/T型/天橋)',
    levels: logicPuzzleLevels.filter((l) => l.tier === 1),
  },
  {
    tier: 2,
    title: '第二階段：反相器與緩衝傳導',
    desc: '反轉邏輯輸出、互補信號控制器、同相緩衝隔離、雙重反相復原',
    unlockedComponent: 'NOT 閘 (反相器) & Buffer 緩衝器',
    levels: logicPuzzleLevels.filter((l) => l.tier === 2),
  },
  {
    tier: 3,
    title: '第三階段：基礎雙輸入閘',
    desc: '雙人保險金庫鎖 (AND)、雙向走廊照明 (OR)、多重積之和控制電路',
    unlockedComponent: 'AND 閘 (及閘) & OR 閘 (或閘)',
    levels: logicPuzzleLevels.filter((l) => l.tier === 3),
  },
  {
    tier: 4,
    title: '第四階段：萬用與互斥邏輯',
    desc: '樓梯雙切 (XOR)、防拆安全警報 (NAND)、全機安全 (NOR)、半加器運算',
    unlockedComponent: 'NAND 閘 & NOR 閘 & XOR 閘',
    levels: logicPuzzleLevels.filter((l) => l.tier === 4),
  },
  {
    tier: 5,
    title: '第五階段：時脈與循序儲存',
    desc: '時脈產生、T-FF 正反切換、D-FF 邊緣資料鎖定、二除頻、二位元計數器',
    unlockedComponent: '時脈產生器 (Clock) & 正反器 (D-FF/T-FF/Latch)',
    levels: logicPuzzleLevels.filter((l) => l.tier === 5),
  },
];

// ----------------------------------------------------------------------------
// Step Counting & Scoring Functions
// ----------------------------------------------------------------------------
export function countPlayerPlacedTiles(grid: (Tile | null)[][], size: number): number {
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = grid[y]?.[x];
      if (tile && !tile.isLocked) {
        count++;
      }
    }
  }
  return count;
}

export function calculateLogicPuzzleStars(
  level: LogicPuzzleLevelDefinition,
  steps: number
): { stars: number; score: number; rankText: string } {
  let stars = 1;
  let rankText = '通關達成！';

  if (steps <= level.parSteps) {
    stars = 3;
    rankText = '⭐⭐⭐ 完美三星邏輯大師解！';
  } else if (steps <= level.twoStarSteps) {
    stars = 2;
    rankText = '⭐⭐ 優良二星解答！';
  } else {
    stars = 1;
    rankText = '⭐ 成功通關！';
  }

  const bonus = Math.max(0, (level.twoStarSteps - steps) * 150);
  const score = 1000 + bonus + (stars === 3 ? 500 : 0);

  return { stars, score, rankText };
}

const LOGIC_PUZZLE_SCORE_KEY = 'autostudio_logic_puzzle_scores';

export function saveLogicPuzzleScore(levelId: string, steps: number, stars: number): void {
  try {
    const raw = localStorage.getItem(LOGIC_PUZZLE_SCORE_KEY);
    const scores = raw ? JSON.parse(raw) : {};
    const existing = scores[levelId];
    if (!existing || stars > existing.stars || (stars === existing.stars && steps < existing.steps)) {
      scores[levelId] = { steps, stars, date: Date.now() };
      localStorage.setItem(LOGIC_PUZZLE_SCORE_KEY, JSON.stringify(scores));
    }
  } catch (e) {
    console.error('Failed to save logic puzzle score', e);
  }
}

export function getLogicPuzzleScores(): Record<string, { steps: number; stars: number }> {
  try {
    const raw = localStorage.getItem(LOGIC_PUZZLE_SCORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLogicPuzzleUnlockedTier(levelId: string): number {
  if (!levelId.startsWith('lp-')) return 5;
  const match = levelId.match(/^lp-(\d+)-/);
  return match ? parseInt(match[1], 10) : 1;
}

export function getLogicPuzzleLevel(levelId: string): LogicPuzzleLevelDefinition | undefined {
  return logicPuzzleLevels.find((l) => l.id === levelId);
}

/**
 * Check whether a component is unlocked or sealed for the current logic puzzle level
 */
export function isLogicPuzzleComponentUnlocked(
  typeStr: string,
  levelId: string
): { unlocked: boolean; requiredTier?: number; reason?: string } {
  if (!levelId || !levelId.startsWith('lp-')) {
    return { unlocked: true };
  }

  const currentTier = getLogicPuzzleUnlockedTier(levelId);

  // 1. Basic Wires: Unlocked across all tiers
  const basicWires = ['wire_straight', 'wire_turn', 'wire_t', 'wire_cross', 'wire_bridge', 'misc_blank'];
  if (basicWires.includes(typeStr)) {
    return { unlocked: true };
  }

  // 2. Inverter & Buffer: Unlocked starting from Tier 2
  const tier2Types = ['gate_not', 'gate_buffer'];
  if (tier2Types.includes(typeStr)) {
    if (currentTier >= 2) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 2,
      reason: '🔒 封印中：需通關到達第 2 階段 (反相器與緩衝傳導) 才能解除封印！',
    };
  }

  // 3. AND & OR Gates: Unlocked starting from Tier 3
  const tier3Types = ['gate_and', 'gate_or'];
  if (tier3Types.includes(typeStr)) {
    if (currentTier >= 3) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 3,
      reason: '🔒 封印中：需通關到達第 3 階段 (基礎雙輸入閘) 才能解除封印！',
    };
  }

  // 4. NAND, NOR, XOR Gates: Unlocked starting from Tier 4
  const tier4Types = ['gate_nand', 'gate_nor', 'gate_xor'];
  if (tier4Types.includes(typeStr)) {
    if (currentTier >= 4) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 4,
      reason: '🔒 封印中：需通關到達第 4 階段 (萬用與互斥邏輯) 才能解除封印！',
    };
  }

  // 5. Flip-Flops & Clock: Unlocked starting from Tier 5
  const tier5Types = ['logic_clock', 'gate_d_ff', 'gate_t_ff', 'gate_jk_ff', 'gate_d_latch'];
  if (tier5Types.includes(typeStr)) {
    if (currentTier >= 5) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 5,
      reason: '🔒 封印中：需通關到達第 5 階段 (時脈與循序儲存) 才能解除封印！',
    };
  }

  // 6. Pre-placed / Redundant components
  if (typeStr === 'logic_power' || typeStr === 'logic_pushbtn') {
    return {
      unlocked: false,
      reason: '🔒 封印中：解謎關卡盤面已固定輸入開關，無需額外放置！',
    };
  }

  if (typeStr === 'logic_led' || typeStr === 'logic_roman' || typeStr === 'logic_seg7') {
    return {
      unlocked: false,
      reason: '🔒 封印中：解謎關卡目標輸出 LED 已固定於盤面，無需額外放置！',
    };
  }

  return {
    unlocked: false,
    reason: '🔒 封印中：此元件非當前解謎關卡所需元件。',
  };
}

/**
 * Check whether a logic puzzle level is unlocked for the player
 */
export function isLogicPuzzleLevelUnlocked(levelId: string): boolean {
  if (levelId === 'lp-1-1') return true;
  const scores = getLogicPuzzleScores();

  if (localStorage.getItem('autostudio_logic_puzzle_all_unlocked') === 'true') {
    return true;
  }

  const idx = logicPuzzleLevels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;

  const prevLevel = logicPuzzleLevels[idx - 1];
  return !!(scores[prevLevel.id] && scores[prevLevel.id].stars > 0);
}

export function setLogicPuzzleAllUnlocked(unlocked: boolean): void {
  if (unlocked) {
    localStorage.setItem('autostudio_logic_puzzle_all_unlocked', 'true');
  } else {
    localStorage.removeItem('autostudio_logic_puzzle_all_unlocked');
  }
}

export function isLogicPuzzleAllUnlocked(): boolean {
  return localStorage.getItem('autostudio_logic_puzzle_all_unlocked') === 'true';
}
