/**
 * @license
 * Industrial Wiring - Puzzle Quest Mode (棋盤闖關解謎遊戲)
 *
 * Rules:
 * - Fixed start (L / +24V) and end (Lightbulb, Motor, Coil, N / 0V)
 * - Fixed industrial obstacles (barriers)
 * - Every 5 levels, a new functional component is introduced to increase puzzle depth
 * - Step count: fewer tiles used = higher star rating (⭐⭐⭐ / ⭐⭐ / ⭐)
 */

import { Tile, LogicLevelId } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';
import { buildNetState } from '../engine/NetEngine';
import { WiringEngine } from '../engine/WiringEngine';

export interface PuzzleLevelDefinition extends LevelDefinition {
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

// ----------------------------------------------------------------------------
// Simulation Helper for Puzzle Verification
// ----------------------------------------------------------------------------
function testSimulate(grid: (Tile | null)[][], size: number, steps: number = 3) {
  const g = grid.map((row) =>
    row.map((c) => (c ? Object.assign(new Tile(), JSON.parse(JSON.stringify(c))) : null))
  );

  let isShort = false;
  let shortMsg = '';

  for (let s = 0; s < steps; s++) {
    const { netMap, netCount } = buildNetState(g, size, size, 'wiring', { opens: [], shorts: [] });
    const netData = Array(netCount + 1)
      .fill(0)
      .map(() => ({ color: '#4a5568', isHigh: false }));

    WiringEngine.simulate(g, netMap, netData);

    // Check L-N short
    const lNets = new Set<number>();
    const nNets = new Set<number>();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const t = g[y]?.[x];
        if (t && t.type === 'wire') {
          if (t.subtype === 'l' && netMap[y][x][2] > 0) lNets.add(netMap[y][x][2]);
          if (t.subtype === 'n' && netMap[y][x][2] > 0) nNets.add(netMap[y][x][2]);
        }
      }
    }
    for (const ln of lNets) {
      if (nNets.has(ln)) {
        isShort = true;
        shortMsg = '⚠️ 電路發生直接短路（L 與 N 短接）！';
        break;
      }
    }
    if (isShort) break;
  }

  return { grid: g, isShort, shortMsg };
}

// Helper to create obstacle tile
function createObstacle(): Tile {
  const t = new Tile('misc', 'obstacle');
  t.isLocked = true;
  return t;
}

// Helper to create locked start wire L
function createStartL(rot: number = 3): Tile {
  const t = new Tile('wire', 'l');
  t.rotation = rot;
  t.isLocked = true;
  return t;
}

// Helper to create locked end wire N
function createEndN(rot: number = 1): Tile {
  const t = new Tile('wire', 'n');
  t.rotation = rot;
  t.isLocked = true;
  return t;
}

// Helper to create locked end lightbulb
function createEndLight(label: string = '目標指示燈'): Tile {
  const t = new Tile('load', 'lightbulb');
  t.rotation = 1;
  t.isLocked = true;
  t.labels = { 4: label };
  return t;
}

// Helper to create locked motor
function createEndMotor(label: string = '目標馬達'): Tile {
  const t = new Tile('motor', 'motor');
  t.rotation = 1;
  t.isLocked = true;
  t.labels = { 4: label };
  return t;
}

// ----------------------------------------------------------------------------
// 25 Puzzle Levels (5 Tiers x 5 Levels)
// ----------------------------------------------------------------------------
export const wiringPuzzleLevels: PuzzleLevelDefinition[] = [
  // ==========================================================================
  // TIER 1: 基礎導線與避障迷宮 (wp-1-1 ~ wp-1-5)
  // 解鎖元件：基礎導線組 (直線 / 轉彎 / T型分流)
  // ==========================================================================
  {
    id: 'wp-1-1' as LogicLevelId,
    title: '關卡 1-1：最短直線通路',
    desc: '任務：使用最少數量的直線導線，將左側電源 (L) 連接至右側目標指示燈，並回流至 (N)。',
    category: '第一階段：導線避障入門',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：導線避障入門',
    unlockedComponent: '基礎直線導線',
    unlockedBadge: '⚡ 直線導線',
    parSteps: 4,
    twoStarSteps: 6,
    setup: (grid) => {
      grid[4][1] = createStartL(3); // faces right
      grid[4][6] = createEndLight();
      grid[4][7] = createEndN(1);
    },
    verify: (grid, size) => {
      const { grid: g, isShort, shortMsg } = testSimulate(grid, size);
      if (isShort) return { passed: false, message: shortMsg };
      const light = g[4]?.[6];
      if (light && light.isPowered) {
        return { passed: true, message: '🎉 成功導通！目標指示燈順利點亮！' };
      }
      return { passed: false, message: '目標指示燈未點亮，請檢查從起點 (L) 到燈泡是否為連續通路。' };
    },
  },

  {
    id: 'wp-1-2' as LogicLevelId,
    title: '關卡 1-2：直角轉角避障',
    desc: '任務：中央設有絕緣防護鋼板，請利用轉彎導線繞過障礙，將電力輸送給右下方的指示燈。',
    category: '第一階段：導線避障入門',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：導線避障入門',
    unlockedComponent: '直角轉彎導線 (Turn)',
    unlockedBadge: '↪ 轉彎導線',
    parSteps: 6,
    twoStarSteps: 8,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      // Barriers blocking straight line
      grid[2][3] = createObstacle();
      grid[3][3] = createObstacle();
      grid[4][3] = createObstacle();

      grid[5][6] = createEndLight();
      grid[5][7] = createEndN(1);
    },
    verify: (grid, size) => {
      const { grid: g, isShort, shortMsg } = testSimulate(grid, size);
      if (isShort) return { passed: false, message: shortMsg };
      const light = g[5]?.[6];
      if (light && light.isPowered) {
        return { passed: true, message: '🎉 成功繞過障礙！指示燈順利通電！' };
      }
      return { passed: false, message: '指示燈未點亮，請確認繞行導線轉向接合完整。' };
    },
  },

  {
    id: 'wp-1-3' as LogicLevelId,
    title: '關卡 1-3：S 型迷宮繞行',
    desc: '任務：盤面有兩道交錯障礙牆形成 S 型迷宮，請找出消耗最少步數的走線路徑到達終點。',
    category: '第一階段：導線避障入門',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：導線避障入門',
    unlockedComponent: '導線迷宮最佳化',
    unlockedBadge: '🧩 迷宮繞線',
    parSteps: 9,
    twoStarSteps: 12,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      // Wall 1 from top down
      grid[1][3] = createObstacle();
      grid[2][3] = createObstacle();
      grid[3][3] = createObstacle();
      grid[4][3] = createObstacle();

      // Wall 2 from bottom up
      grid[3][6] = createObstacle();
      grid[4][6] = createObstacle();
      grid[5][6] = createObstacle();
      grid[6][6] = createObstacle();

      grid[6][8] = createEndLight();
      grid[6][9] = createEndN(1);
    },
    verify: (grid, size) => {
      const { grid: g, isShort, shortMsg } = testSimulate(grid, size);
      if (isShort) return { passed: false, message: shortMsg };
      const light = g[6]?.[8];
      if (light && light.isPowered) {
        return { passed: true, message: '🎉 恭喜穿越迷宮！精準命中目標指示燈！' };
      }
      return { passed: false, message: '指示燈未點亮，請檢查 S 型迂迴走線是否完全導通。' };
    },
  },

  {
    id: 'wp-1-4' as LogicLevelId,
    title: '關卡 1-4：T 型分流雙燈同步',
    desc: '任務：使用 T 型導線完成分流，讓單一電源 (L) 同步點亮上下兩盞指示燈！',
    category: '第一階段：導線避障入門',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：導線避障入門',
    unlockedComponent: 'T 型三向分流導線',
    unlockedBadge: '┳ T型分流',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[4][1] = createStartL(3);
      // Barrier in center
      grid[4][5] = createObstacle();

      // Lamp 1 (top)
      grid[2][7] = createEndLight('指示燈 1');
      grid[2][8] = createEndN(1);

      // Lamp 2 (bottom)
      grid[6][7] = createEndLight('指示燈 2');
      grid[6][8] = createEndN(1);
    },
    verify: (grid, size) => {
      const { grid: g, isShort, shortMsg } = testSimulate(grid, size);
      if (isShort) return { passed: false, message: shortMsg };
      const l1 = g[2]?.[7];
      const l2 = g[6]?.[7];
      if (l1?.isPowered && l2?.isPowered) {
        return { passed: true, message: '🎉 雙燈同步點亮！成功掌握 T 型並聯分流！' };
      }
      if (l1?.isPowered || l2?.isPowered) {
        return { passed: false, message: '只有一盞燈亮起，請使用 T 型導線將電源同時分流至兩盞燈。' };
      }
      return { passed: false, message: '兩盞燈皆未點亮，請檢查電源分流接線。' };
    },
  },

  {
    id: 'wp-1-5' as LogicLevelId,
    title: '關卡 1-5：短路雷區考驗',
    desc: '任務：盤面中央佈滿危險接地與相鄰導電端，一旦線路誤碰即短路爆炸！必須小心繞行雷區通達終點。',
    category: '第一階段：導線避障入門',
    defaultGridSize: 10,
    tier: 1,
    tierName: '第一階段：導線避障入門',
    unlockedComponent: '避雷短路安全防護',
    unlockedBadge: '🛡️ 短路防護',
    parSteps: 9,
    twoStarSteps: 12,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      // Hazard minefield in center
      grid[2][4] = createObstacle();
      grid[3][4] = createObstacle();
      grid[4][4] = createObstacle();
      grid[4][5] = createObstacle();
      grid[4][6] = createObstacle();

      grid[6][7] = createEndLight('安全終點燈');
      grid[6][8] = createEndN(1);
    },
    verify: (grid, size) => {
      const { grid: g, isShort, shortMsg } = testSimulate(grid, size);
      if (isShort) return { passed: false, message: shortMsg };
      const light = g[6]?.[7];
      if (light && light.isPowered) {
        return { passed: true, message: '🎉 完美避開雷區！成功將電力安全送達終點！' };
      }
      return { passed: false, message: '終點燈未亮起，請小心尋找最安全的繞行路徑。' };
    },
  },

  // ==========================================================================
  // TIER 2: 開關閘門與邏輯接點 (wp-2-1 ~ wp-2-5)
  // 解鎖新元件：常開按鈕 (NO PB) 與 常閉按鈕 (NC PB)
  // ==========================================================================
  {
    id: 'wp-2-1' as LogicLevelId,
    title: '關卡 2-1：單鈕開關防護閘',
    desc: '任務：【解鎖常開按鈕 (NO)】在起點與終點之間串入常開按鈕，未按時保持斷路，按壓時才能導通點亮燈號！',
    category: '第二階段：按鈕與邏輯接點',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：按鈕與邏輯接點',
    unlockedComponent: '常開按鈕 (Push Button NO)',
    unlockedBadge: '🟢 NO 按鈕',
    parSteps: 5,
    twoStarSteps: 7,
    setup: (grid) => {
      grid[4][1] = createStartL(3);
      grid[4][7] = createEndLight('受控指示燈');
      grid[4][8] = createEndN(1);
    },
    verify: (grid, size) => {
      // Find button
      let btnTile: Tile | null = null;
      let bx = -1, by = -1;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && (t.type === 'btn' || t.type === 'switch') && t.subtype === 'no') {
            btnTile = t;
            bx = x; by = y;
            break;
          }
        }
        if (btnTile) break;
      }
      if (!btnTile) {
        return { passed: false, message: '盤面上尚未擺放「常開按鈕 (NO)」，請從工具箱拖入按鈕！' };
      }

      // Test 1: Button unpressed -> must be OFF
      btnTile.isActive = false;
      const simOff = testSimulate(grid, size);
      if (simOff.isShort) return { passed: false, message: simOff.shortMsg };
      if (simOff.grid[4]?.[7]?.isPowered) {
        return { passed: false, message: '按鈕未按下時燈泡就亮了，線路繞過了按鈕或接成了常通！' };
      }

      // Test 2: Button pressed -> must be ON
      btnTile.isActive = true;
      const simOn = testSimulate(grid, size);
      btnTile.isActive = false; // restore
      if (simOn.isShort) return { passed: false, message: simOn.shortMsg };
      if (simOn.grid[4]?.[7]?.isPowered) {
        return { passed: true, message: '🎉 成功通過！掌握常開按鈕 (NO) 的安全隔離控制！' };
      }
      return { passed: false, message: '按下按鈕時燈號未能點亮，請檢查按鈕兩端是否正確串入電路。' };
    },
  },

  {
    id: 'wp-2-2' as LogicLevelId,
    title: '關卡 2-2：雙手操作防夾閘 (AND 串聯)',
    desc: '任務：符合工業安全防夾規範，必須串聯兩顆分散的 NO 按鈕（PB1 與 PB2），雙手同時按壓才能導通！',
    category: '第二階段：按鈕與邏輯接點',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：按鈕與邏輯接點',
    unlockedComponent: '串聯及邏輯 (Series AND)',
    unlockedBadge: '🔗 串聯 AND',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[4][1] = createStartL(3);
      grid[4][4] = createObstacle();
      grid[4][7] = createEndLight('沖壓機安全燈');
      grid[4][8] = createEndN(1);
    },
    verify: (grid, size) => {
      const btns: { t: Tile; x: number; y: number }[] = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') {
            btns.push({ t, x, y });
          }
        }
      }
      if (btns.length < 2) {
        return { passed: false, message: '需要至少 2 顆 NO 按鈕來實現雙手操作防夾安全迴路！' };
      }

      const [b1, b2] = btns;
      // Test 1: (0, 0) -> OFF
      b1.t.isActive = false; b2.t.isActive = false;
      if (testSimulate(grid, size).grid[4]?.[7]?.isPowered) {
        return { passed: false, message: '按鈕未按時已點亮，迴路有誤。' };
      }

      // Test 2: (1, 0) -> OFF
      b1.t.isActive = true; b2.t.isActive = false;
      if (testSimulate(grid, size).grid[4]?.[7]?.isPowered) {
        return { passed: false, message: '只按單一按鈕即通電，未能達成雙手防夾串聯！' };
      }

      // Test 3: (0, 1) -> OFF
      b1.t.isActive = false; b2.t.isActive = true;
      if (testSimulate(grid, size).grid[4]?.[7]?.isPowered) {
        return { passed: false, message: '只按單一按鈕即通電，未能達成雙手防夾串聯！' };
      }

      // Test 4: (1, 1) -> ON
      b1.t.isActive = true; b2.t.isActive = true;
      const simBoth = testSimulate(grid, size);
      b1.t.isActive = false; b2.t.isActive = false;
      if (simBoth.grid[4]?.[7]?.isPowered) {
        return { passed: true, message: '🎉 雙手防夾 AND 邏輯安全成立！完美通過！' };
      }
      return { passed: false, message: '兩顆按鈕同時按下時指示燈未亮，請檢查串聯走線。' };
    },
  },

  {
    id: 'wp-2-3' as LogicLevelId,
    title: '關卡 2-3：雙路應急備援閘 (OR 並聯)',
    desc: '任務：排風抽氣系統需要兩處按鈕皆能獨立啟動。將兩顆 NO 按鈕並聯，任一按下即能通電！',
    category: '第二階段：按鈕與邏輯接點',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：按鈕與邏輯接點',
    unlockedComponent: '並聯或邏輯 (Parallel OR)',
    unlockedBadge: '🔀 並聯 OR',
    parSteps: 8,
    twoStarSteps: 10,
    setup: (grid) => {
      grid[4][1] = createStartL(3);
      grid[4][4] = createObstacle();
      grid[4][8] = createEndLight('排風運轉燈');
      grid[4][9] = createEndN(1);
    },
    verify: (grid, size) => {
      const btns: Tile[] = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') btns.push(t);
        }
      }
      if (btns.length < 2) {
        return { passed: false, message: '請在盤面上放置 2 顆 NO 按鈕以建立雙路備援！' };
      }
      const [b1, b2] = btns;
      b1.isActive = false; b2.isActive = false;
      if (testSimulate(grid, size).grid[4]?.[8]?.isPowered) return { passed: false, message: '平時未按按鈕時不應通電。' };

      b1.isActive = true; b2.isActive = false;
      const p1 = !!testSimulate(grid, size).grid[4]?.[8]?.isPowered;
      b1.isActive = false; b2.isActive = true;
      const p2 = !!testSimulate(grid, size).grid[4]?.[8]?.isPowered;
      b1.isActive = false; b2.isActive = false;

      if (p1 && p2) return { passed: true, message: '🎉 雙路並聯 OR 邏輯成立！任一按鈕皆可成功點亮負載！' };
      return { passed: false, message: '其中一個按鈕無法獨立點亮燈號，請檢查是否成功並聯分流。' };
    },
  },

  {
    id: 'wp-2-4' as LogicLevelId,
    title: '關卡 2-4：常閉急停安全門 (NC 斷路)',
    desc: '任務：【解鎖常閉按鈕 (NC)】負載平時必須保持運轉，按壓急停按鈕 (NC) 時必須立即斷電切斷負載！',
    category: '第二階段：按鈕與邏輯接點',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：按鈕與邏輯接點',
    unlockedComponent: '常閉按鈕 (NC E-Stop)',
    unlockedBadge: '🔴 NC 按鈕',
    parSteps: 5,
    twoStarSteps: 7,
    setup: (grid) => {
      grid[4][1] = createStartL(3);
      grid[4][7] = createEndLight('常時運轉燈');
      grid[4][8] = createEndN(1);
    },
    verify: (grid, size) => {
      let ncBtn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'nc') {
            ncBtn = t; break;
          }
        }
        if (ncBtn) break;
      }
      if (!ncBtn) return { passed: false, message: '請放置「常閉按鈕 (NC)」以實現急停切斷！' };

      ncBtn.isActive = false; // normal (conducting)
      const pNormal = !!testSimulate(grid, size).grid[4]?.[7]?.isPowered;
      ncBtn.isActive = true; // pressed (open circuit)
      const pCut = !testSimulate(grid, size).grid[4]?.[7]?.isPowered;
      ncBtn.isActive = false;

      if (pNormal && pCut) return { passed: true, message: '🎉 完美急停！常閉接點平時導通、按壓斷電完全符合規範！' };
      if (!pNormal) return { passed: false, message: '常態下指示燈未亮，請確認 NC 迴路已正確串接。' };
      return { passed: false, message: '按壓急停時燈號仍亮著，未正確經過 NC 接點切斷！' };
    },
  },

  {
    id: 'wp-2-5' as LogicLevelId,
    title: '關卡 2-5：雙控防呆同態閘 (NO+NC)',
    desc: '任務：結合 NO 與 NC 按鈕，打造工業級安全防呆迴路，只有在指定安全條件滿足時方可導通！',
    category: '第二階段：按鈕與邏輯接點',
    defaultGridSize: 10,
    tier: 2,
    tierName: '第二階段：按鈕與邏輯接點',
    unlockedComponent: '複合接點聯鎖',
    unlockedBadge: '⚖️ 複合接點',
    parSteps: 8,
    twoStarSteps: 10,
    setup: (grid) => {
      grid[3][1] = createStartL(3);
      grid[3][4] = createObstacle();
      grid[4][4] = createObstacle();
      grid[3][8] = createEndLight('安全閘門燈');
      grid[3][9] = createEndN(1);
    },
    verify: (grid, size) => {
      let noBtn: Tile | null = null;
      let ncBtn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn') {
            if (t.subtype === 'no') noBtn = t;
            if (t.subtype === 'nc') ncBtn = t;
          }
        }
      }
      if (!noBtn || !ncBtn) return { passed: false, message: '需要同時使用 NO 與 NC 按鈕建立同態防呆！' };

      noBtn.isActive = false; ncBtn.isActive = false;
      const offInit = !testSimulate(grid, size).grid[3]?.[8]?.isPowered;

      noBtn.isActive = true; ncBtn.isActive = false;
      const onRun = !!testSimulate(grid, size).grid[3]?.[8]?.isPowered;

      noBtn.isActive = true; ncBtn.isActive = true;
      const cutStop = !testSimulate(grid, size).grid[3]?.[8]?.isPowered;

      noBtn.isActive = false; ncBtn.isActive = false;

      if (offInit && onRun && cutStop) {
        return { passed: true, message: '🎉 完美達成起停防呆！NO 啟動且 NC 隨時可急停切斷！' };
      }
      return { passed: false, message: '邏輯條件未完全滿足，請確保 NO 與 NC 串聯於主幹線。' };
    },
  },

  // ==========================================================================
  // TIER 3: 電磁接觸器與自保持記憶 (wp-3-1 ~ wp-3-5)
  // 解鎖新元件：電磁線圈 (Coil K1) 與 輔助常開接點 (NO K1)
  // ==========================================================================
  {
    id: 'wp-3-1' as LogicLevelId,
    title: '關卡 3-1：初探記憶自保持 (Self-Holding)',
    desc: '任務：【解鎖電磁接觸器】按下啟動按鈕瞬間激磁 K1，放開按鈕後電流必須藉由 K1 輔助接點持續自鎖！',
    category: '第三階段：接觸器與自保持',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：接觸器與自保持',
    unlockedComponent: '接觸器線圈 (Coil K1) & 輔助接點 (NO)',
    unlockedBadge: '🧲 自保持 (MC)',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.labels = { 4: 'K1' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);

      grid[5][7] = createEndMotor('自保持馬達');
      grid[5][8] = createEndN(1);
    },
    verify: (grid, size) => {
      // Find start button
      let btn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') { btn = t; break; }
        }
        if (btn) break;
      }
      if (!btn) return { passed: false, message: '請放置一顆啟動按鈕 (NO PB)！' };

      // Step 1: pulse button
      btn.isActive = true;
      let sim = testSimulate(grid, size, 4);
      btn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);

      const k1 = sim.grid[2]?.[7];
      if (k1 && k1.isActive) {
        return { passed: true, message: '🎉 自保持記憶成立！放開按鈕後接觸器持續鎖住通電！' };
      }
      return { passed: false, message: '按鈕放開後線圈釋放，自保持未成立！請將 K1 的輔助常開接點與啟動按鈕並聯。' };
    },
  },

  {
    id: 'wp-3-2' as LogicLevelId,
    title: '關卡 3-2：極簡方寸自鎖',
    desc: '任務：盤面空間大幅壓縮！在只有 4×4 格的窄小空間中完成電磁線圈自保持並聯。',
    category: '第三階段：接觸器與自保持',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：接觸器與自保持',
    unlockedComponent: '空間極致壓縮走線',
    unlockedBadge: '📐 極限自鎖',
    parSteps: 7,
    twoStarSteps: 9,
    setup: (grid) => {
      grid[3][1] = createStartL(3);
      grid[3][6] = new Tile('relay', 'coil');
      grid[3][6]!.rotation = 1;
      grid[3][6]!.labels = { 4: 'K1' };
      grid[3][6]!.isLocked = true;
      grid[3][7] = createEndN(1);

      // Boundaries blocking outer spaces
      grid[1][3] = createObstacle();
      grid[5][3] = createObstacle();
    },
    verify: (grid, size) => {
      let btn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') { btn = t; break; }
        }
        if (btn) break;
      }
      if (!btn) return { passed: false, message: '需要啟動按鈕觸發自保持！' };

      btn.isActive = true;
      let sim = testSimulate(grid, size, 4);
      btn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);

      if (sim.grid[3]?.[6]?.isActive) {
        return { passed: true, message: '🎉 窄小空間自鎖成功！配線大師實至名歸！' };
      }
      return { passed: false, message: '自保持未能成功維持，請檢查極限並聯走線。' };
    },
  },

  {
    id: 'wp-3-3' as LogicLevelId,
    title: '關卡 3-3：起停兼備自保持電路',
    desc: '任務：加入停止按鈕 (NC)，要求：按下啟動可自保持運轉；按壓停止可安全切斷歸零！',
    category: '第三階段：接觸器與自保持',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：接觸器與自保持',
    unlockedComponent: '標準起停自鎖控制',
    unlockedBadge: '⏹️ 起停控制',
    parSteps: 9,
    twoStarSteps: 12,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.labels = { 4: 'K1' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);
    },
    verify: (grid, size) => {
      let startBtn: Tile | null = null;
      let stopBtn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn') {
            if (t.subtype === 'no') startBtn = t;
            if (t.subtype === 'nc') stopBtn = t;
          }
        }
      }
      if (!startBtn || !stopBtn) return { passed: false, message: '需要同時配有啟動按鈕 (NO) 與停止按鈕 (NC)！' };

      // 1. Start & hold
      startBtn.isActive = true;
      let sim = testSimulate(grid, size, 4);
      startBtn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);
      const holdOk = !!sim.grid[2]?.[7]?.isActive;

      // 2. Stop
      stopBtn.isActive = true;
      sim = testSimulate(sim.grid, size, 4);
      stopBtn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);
      const stopOk = !sim.grid[2]?.[7]?.isActive;

      if (holdOk && stopOk) return { passed: true, message: '🎉 起停兼備！啟動自保持與停止切斷皆完美無瑕！' };
      if (!holdOk) return { passed: false, message: '啟動自保持未成功。' };
      return { passed: false, message: '按下停止按鈕後無法切斷線圈！' };
    },
  },

  {
    id: 'wp-3-4' as LogicLevelId,
    title: '關卡 3-4：自保持雙負載指示',
    desc: '任務：自保持建立後，動力馬達運轉且指示燈亮起；停止時兩者同時停止。',
    category: '第三階段：接觸器與自保持',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：接觸器與自保持',
    unlockedComponent: '輔助主接點同步帶載',
    unlockedBadge: '💡 雙負載同步',
    parSteps: 10,
    twoStarSteps: 13,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.labels = { 4: 'K1' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);

      grid[5][7] = createEndLight('運轉指示燈');
      grid[5][8] = createEndN(1);
    },
    verify: (grid, size) => {
      let btn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') { btn = t; break; }
        }
        if (btn) break;
      }
      if (!btn) return { passed: false, message: '請放置啟動按鈕！' };
      btn.isActive = true;
      let sim = testSimulate(grid, size, 4);
      btn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);

      const k1 = sim.grid[2]?.[7]?.isActive;
      const lamp = sim.grid[5]?.[7]?.isPowered;
      if (k1 && lamp) return { passed: true, message: '🎉 自保持線圈與運轉燈同步鎖定！大獲全勝！' };
      return { passed: false, message: '自保持建立後運轉指示燈未能同步點亮。' };
    },
  },

  {
    id: 'wp-3-5' as LogicLevelId,
    title: '關卡 3-5：過載保護跳脫自解鎖',
    desc: '任務：在自保持電路中串入積熱電驛 (TH-RY) 常閉保護接點，模擬過載時自動跳脫釋放！',
    category: '第三階段：接觸器與自保持',
    defaultGridSize: 10,
    tier: 3,
    tierName: '第三階段：接觸器與自保持',
    unlockedComponent: '過載保護連動自解鎖',
    unlockedBadge: '⚡ 過載跳脫',
    parSteps: 10,
    twoStarSteps: 13,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.labels = { 4: 'K1' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);
    },
    verify: (grid, size) => {
      let btn: Tile | null = null;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') { btn = t; break; }
        }
        if (btn) break;
      }
      if (!btn) return { passed: false, message: '請配置啟動迴路！' };
      btn.isActive = true;
      let sim = testSimulate(grid, size, 4);
      btn.isActive = false;
      sim = testSimulate(sim.grid, size, 4);
      if (sim.grid[2]?.[7]?.isActive) {
        return { passed: true, message: '🎉 成功掌握過載連鎖自保持控制！' };
      }
      return { passed: false, message: '自保持未能成功建立。' };
    },
  },

  // ==========================================================================
  // TIER 4: 電氣互鎖與雙向防短路 (wp-4-1 ~ wp-4-5)
  // 解鎖新元件：常閉互鎖接點 (NC K1 / NC K2)
  // ==========================================================================
  {
    id: 'wp-4-1' as LogicLevelId,
    title: '關卡 4-1：雙線圈互鎖防短路 (Interlock)',
    desc: '任務：【解鎖互鎖常閉接點】MC1 與 MC2 絕對不能同時激磁！請利用常閉接點 (NC) 交叉互鎖。',
    category: '第四階段：互鎖與安全防護',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：互鎖與安全防護',
    unlockedComponent: '互鎖常閉接點 (Interlock NC)',
    unlockedBadge: '⛔ 互鎖 NC',
    parSteps: 9,
    twoStarSteps: 12,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      grid[1][7] = new Tile('relay', 'coil');
      grid[1][7]!.rotation = 1;
      grid[1][7]!.labels = { 4: 'K1' };
      grid[1][7]!.isLocked = true;
      grid[1][8] = createEndN(1);

      grid[4][1] = createStartL(3);
      grid[4][7] = new Tile('relay', 'coil');
      grid[4][7]!.rotation = 1;
      grid[4][7]!.labels = { 4: 'K2' };
      grid[4][7]!.isLocked = true;
      grid[4][8] = createEndN(1);
    },
    verify: (grid, size) => {
      // Find two start buttons
      const btns: Tile[] = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = grid[y][x];
          if (t && t.type === 'btn' && t.subtype === 'no') btns.push(t);
        }
      }
      if (btns.length < 2) return { passed: false, message: '需要 2 顆 NO 按鈕分別控制 K1 與 K2！' };

      // Activate K1
      btns[0].isActive = true;
      let sim = testSimulate(grid, size, 4);
      btns[0].isActive = false;
      sim = testSimulate(sim.grid, size, 4);
      const k1On = !!sim.grid[1]?.[7]?.isActive;

      // While K1 on, press PB2
      btns[1].isActive = true;
      sim = testSimulate(sim.grid, size, 4);
      btns[1].isActive = false;
      const k2Blocked = !sim.grid[4]?.[7]?.isActive;

      if (k1On && k2Blocked) {
        return { passed: true, message: '🎉 電氣互鎖成立！K1 運轉時成功阻斷 K2 投入！' };
      }
      if (!k1On) return { passed: false, message: 'K1 啟動失敗。' };
      return { passed: false, message: '互鎖失敗！K1 運轉時 K2 竟然可以激磁！請在 K2 迴路串入 K1 的 NC 接點。' };
    },
  },

  {
    id: 'wp-4-2' as LogicLevelId,
    title: '關卡 4-2：馬達正反轉互鎖走線',
    desc: '任務：控制三相馬達正轉 (FWD) 與反轉 (REV)，正轉與反轉必須嚴格互鎖，防止重大短路！',
    category: '第四階段：互鎖與安全防護',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：互鎖與安全防護',
    unlockedComponent: '正反轉雙向相序互鎖',
    unlockedBadge: '↻ 正反轉互鎖',
    parSteps: 11,
    twoStarSteps: 14,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      grid[1][7] = new Tile('relay', 'coil');
      grid[1][7]!.rotation = 1;
      grid[1][7]!.labels = { 4: 'K1' };
      grid[1][7]!.isLocked = true;
      grid[1][8] = createEndN(1);

      grid[4][1] = createStartL(3);
      grid[4][7] = new Tile('relay', 'coil');
      grid[4][7]!.rotation = 1;
      grid[4][7]!.labels = { 4: 'K2' };
      grid[4][7]!.isLocked = true;
      grid[4][8] = createEndN(1);

      grid[7][7] = createEndMotor('雙向馬達');
      grid[7][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 馬達正反轉互鎖保護驗證通過！' };
    },
  },

  {
    id: 'wp-4-3' as LogicLevelId,
    title: '關卡 4-3：後動作優先直接換手',
    desc: '任務：將 NC 互鎖接點接於「自保持支路」內，實現免按停止鈕、直接按新按鈕無縫切換！',
    category: '第四階段：互鎖與安全防護',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：互鎖與安全防護',
    unlockedComponent: '自保持支路後按優先',
    unlockedBadge: '⏩ 後按優先',
    parSteps: 10,
    twoStarSteps: 13,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      grid[1][7] = new Tile('relay', 'coil');
      grid[1][7]!.rotation = 1;
      grid[1][7]!.labels = { 4: 'K1' };
      grid[1][7]!.isLocked = true;
      grid[1][8] = createEndN(1);

      grid[4][1] = createStartL(3);
      grid[4][7] = new Tile('relay', 'coil');
      grid[4][7]!.rotation = 1;
      grid[4][7]!.labels = { 4: 'K2' };
      grid[4][7]!.isLocked = true;
      grid[4][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 後動作優先驗證成功！免按停止直接順暢換手！' };
    },
  },

  {
    id: 'wp-4-4' as LogicLevelId,
    title: '關卡 4-4：按鈕電氣雙重互鎖',
    desc: '任務：結合按鈕機械互鎖與接觸器電氣互鎖，達成最高等級防短路雙重保護！',
    category: '第四階段：互鎖與安全防護',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：互鎖與安全防護',
    unlockedComponent: '按鈕機械+電氣雙重互鎖',
    unlockedBadge: '🛡️ 雙重互鎖',
    parSteps: 11,
    twoStarSteps: 14,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      grid[1][7] = new Tile('relay', 'coil');
      grid[1][7]!.rotation = 1;
      grid[1][7]!.labels = { 4: 'K1' };
      grid[1][7]!.isLocked = true;
      grid[1][8] = createEndN(1);

      grid[5][1] = createStartL(3);
      grid[5][7] = new Tile('relay', 'coil');
      grid[5][7]!.rotation = 1;
      grid[5][7]!.labels = { 4: 'K2' };
      grid[5][7]!.isLocked = true;
      grid[5][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 雙重互鎖最高安全等級成立！' };
    },
  },

  {
    id: 'wp-4-5' as LogicLevelId,
    title: '關卡 4-5：三線圈互鎖安全鏈',
    desc: '任務：挑戰三組負載線圈互相連鎖，任一動作均自動切斷其他兩組！',
    category: '第四階段：互鎖與安全防護',
    defaultGridSize: 10,
    tier: 4,
    tierName: '第四階段：互鎖與安全防護',
    unlockedComponent: '多組閉環互鎖矩陣',
    unlockedBadge: '⛓️ 互鎖矩陣',
    parSteps: 12,
    twoStarSteps: 15,
    setup: (grid) => {
      grid[1][1] = createStartL(3);
      grid[1][7] = new Tile('relay', 'coil');
      grid[1][7]!.rotation = 1;
      grid[1][7]!.labels = { 4: 'K1' };
      grid[1][7]!.isLocked = true;
      grid[1][8] = createEndN(1);

      grid[4][1] = createStartL(3);
      grid[4][7] = new Tile('relay', 'coil');
      grid[4][7]!.rotation = 1;
      grid[4][7]!.labels = { 4: 'K2' };
      grid[4][7]!.isLocked = true;
      grid[4][8] = createEndN(1);

      grid[7][1] = createStartL(3);
      grid[7][7] = new Tile('relay', 'coil');
      grid[7][7]!.rotation = 1;
      grid[7][7]!.labels = { 4: 'K3' };
      grid[7][7]!.isLocked = true;
      grid[7][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 三向互鎖閉環驗證完全正確！' };
    },
  },

  // ==========================================================================
  // TIER 5: 時間電驛與時序自動化 (wp-5-1 ~ wp-5-5)
  // 解鎖新元件：通電延遲計時器 (TON Timer / Flasher)
  // ==========================================================================
  {
    id: 'wp-5-1' as LogicLevelId,
    title: '關卡 5-1：通電延遲啟動 (ON-Delay)',
    desc: '任務：【解鎖通電延遲 Timer】通電後時限到達前負載靜止，延遲時間到後自動接通馬達運轉！',
    category: '第五階段：時間電驛與時序自動化',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時間電驛與時序自動化',
    unlockedComponent: '通電延遲電驛 (Timer TON)',
    unlockedBadge: '⏱️ TON 計時器',
    parSteps: 8,
    twoStarSteps: 11,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.value = 3000;
      grid[2][7]!.labels = { 4: 'T1' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);

      grid[5][7] = createEndMotor('延遲啟動馬達');
      grid[5][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 通電延遲計時精準啟動！時序自動化達成！' };
    },
  },

  {
    id: 'wp-5-2' as LogicLevelId,
    title: '關卡 5-2：自動定時切斷 (Auto-Off)',
    desc: '任務：利用計時器常閉接點 (NC)，達成馬達運轉時限到達後自動停機，防呆省電！',
    category: '第五階段：時間電驛與時序自動化',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時間電驛與時序自動化',
    unlockedComponent: '限時運轉自動切除',
    unlockedBadge: '⏳ 定時斷電',
    parSteps: 9,
    twoStarSteps: 12,
    setup: (grid) => {
      grid[3][1] = createStartL(3);
      grid[3][7] = createEndMotor('定時運轉馬達');
      grid[3][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 定時自動斷電切除驗證通過！' };
    },
  },

  {
    id: 'wp-5-3' as LogicLevelId,
    title: '關卡 5-3：預警延時啟動 (警報響 $\\to$ 馬達動)',
    desc: '任務：按下按鈕後警報蜂鳴器先響起預警，計時完畢後蜂鳴器停、馬達正式運轉！',
    category: '第五階段：時間電驛與時序自動化',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時間電驛與時序自動化',
    unlockedComponent: '聲光預警時序聯鎖',
    unlockedBadge: '🚨 預警啟動',
    parSteps: 11,
    twoStarSteps: 14,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = createEndLight('預警蜂鳴燈');
      grid[2][8] = createEndN(1);

      grid[6][7] = createEndMotor('主運轉馬達');
      grid[6][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 先預警後啟動時序驗證完全正確！安全規範滿分！' };
    },
  },

  {
    id: 'wp-5-4' as LogicLevelId,
    title: '關卡 5-4：交替閃爍信號燈 (Flasher)',
    desc: '任務：利用雙計時器或閃爍電驛，讓紅燈與綠燈交替閃爍變換。',
    category: '第五階段：時間電驛與時序自動化',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時間電驛與時序自動化',
    unlockedComponent: '閃爍交替震盪迴路',
    unlockedBadge: '🚥 雙燈閃爍',
    parSteps: 10,
    twoStarSteps: 13,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = createEndLight('閃爍燈 A');
      grid[2][8] = createEndN(1);

      grid[6][1] = createStartL(3);
      grid[6][7] = createEndLight('閃爍燈 B');
      grid[6][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 交替閃爍震盪電路大成功！' };
    },
  },

  {
    id: 'wp-5-5' as LogicLevelId,
    title: '關卡 5-5：星角降壓切換 (Y-Δ Automation)',
    desc: '任務：終極大挑戰！以 Y 接低電流啟動，計時到達後自動切至 Δ 接全速運轉！',
    category: '第五階段：時間電驛與時序自動化',
    defaultGridSize: 10,
    tier: 5,
    tierName: '第五階段：時間電驛與時序自動化',
    unlockedComponent: '星角降壓全自動時序控制',
    unlockedBadge: '⭐ 星角降壓',
    parSteps: 13,
    twoStarSteps: 16,
    setup: (grid) => {
      grid[2][1] = createStartL(3);
      grid[2][7] = new Tile('relay', 'coil');
      grid[2][7]!.rotation = 1;
      grid[2][7]!.labels = { 4: 'KM_Y' };
      grid[2][7]!.isLocked = true;
      grid[2][8] = createEndN(1);

      grid[6][1] = createStartL(3);
      grid[6][7] = new Tile('relay', 'coil');
      grid[6][7]!.rotation = 1;
      grid[6][7]!.labels = { 4: 'KM_D' };
      grid[6][7]!.isLocked = true;
      grid[6][8] = createEndN(1);
    },
    verify: (grid, size) => {
      return { passed: true, message: '🎉 恭喜通關終極大挑戰！完美實現星角全自動降壓切換！' };
    },
  },
];

// ----------------------------------------------------------------------------
// Menu Categories for Puzzle Quest Mode (5 Tiers)
// ----------------------------------------------------------------------------
export interface PuzzleCategory {
  title: string;
  tier: number;
  unlockedComponent: string;
  desc: string;
  levels: PuzzleLevelDefinition[];
}

export const wiringPuzzleCategories: PuzzleCategory[] = [
  {
    title: '第一階段：導線避障入門 (Wire Pathfinding)',
    tier: 1,
    unlockedComponent: '基礎直線／轉彎／T型分流導線',
    desc: '在固定起終點與障礙物之間尋找最佳走線路徑，避開短路雷區。',
    levels: wiringPuzzleLevels.filter((l) => l.tier === 1),
  },
  {
    title: '第二階段：按鈕與接點邏輯 (Button Gates & Logic)',
    tier: 2,
    unlockedComponent: '常開按鈕 (NO PB) 與 常閉按鈕 (NC PB)',
    desc: '串聯 AND 雙手防夾、並聯 OR 應急備援與 NC 急停切斷防呆。',
    levels: wiringPuzzleLevels.filter((l) => l.tier === 2),
  },
  {
    title: '第三階段：電磁接觸器與自保持 (Contactor & Self-Holding)',
    tier: 3,
    unlockedComponent: '接觸器線圈 (Coil K1) 與 輔助常開接點 (NO)',
    desc: '脈衝觸發持續運轉，方寸狹窄空間中的極簡記憶自鎖考驗。',
    levels: wiringPuzzleLevels.filter((l) => l.tier === 3),
  },
  {
    title: '第四階段：電氣互鎖與雙向防短路 (Interlock & Safety)',
    tier: 4,
    unlockedComponent: '常閉互鎖接點 (Interlock NC)',
    desc: '正反轉防相間短路、後動作優先直接換手與雙重安全防護。',
    levels: wiringPuzzleLevels.filter((l) => l.tier === 4),
  },
  {
    title: '第五階段：時間電驛與時序自動化 (Timers & Automation)',
    tier: 5,
    unlockedComponent: '通電延遲 (TON Timer) 與 閃爍電驛 (Flasher)',
    desc: '時間差控制、聲光預警延時啟動與星角降壓全自動切換。',
    levels: wiringPuzzleLevels.filter((l) => l.tier === 5),
  },
];

// Helper to get puzzle level by ID
export function getPuzzleLevel(id: string): PuzzleLevelDefinition | undefined {
  return wiringPuzzleLevels.find((l) => l.id === id);
}

// Helper to count player placed tiles (non-locked tiles)
export function countPlayerPlacedTiles(grid: (Tile | null)[][], size: number): number {
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = grid[y]?.[x];
      if (t && !t.isLocked) {
        count++;
      }
    }
  }
  return count;
}

// Calculate stars based on step count
export function calculatePuzzleStars(
  level: PuzzleLevelDefinition,
  steps: number
): { stars: number; score: number; rankText: string } {
  let stars = 1;
  let rankText = '通關達成！';

  if (steps <= level.parSteps) {
    stars = 3;
    rankText = '⭐⭐⭐ 完美三星大師解！';
  } else if (steps <= level.twoStarSteps) {
    stars = 2;
    rankText = '⭐⭐ 優良二星解答！';
  } else {
    stars = 1;
    rankText = '⭐ 成功通關！';
  }

  // Score formula: 1000 base + (parSteps - steps) * 150
  const bonus = Math.max(0, (level.twoStarSteps - steps) * 150);
  const score = 1000 + bonus + (stars === 3 ? 500 : 0);

  return { stars, score, rankText };
}

// LocalStorage score persistence
const PUZZLE_SCORE_KEY = 'autostudio_puzzle_scores';

export function savePuzzleScore(levelId: string, steps: number, stars: number): void {
  try {
    const raw = localStorage.getItem(PUZZLE_SCORE_KEY);
    const scores = raw ? JSON.parse(raw) : {};
    const existing = scores[levelId];
    if (!existing || stars > existing.stars || (stars === existing.stars && steps < existing.steps)) {
      scores[levelId] = { steps, stars, date: Date.now() };
      localStorage.setItem(PUZZLE_SCORE_KEY, JSON.stringify(scores));
    }
  } catch (e) {
    console.error('Failed to save puzzle score', e);
  }
}

export function getPuzzleScores(): Record<string, { steps: number; stars: number }> {
  try {
    const raw = localStorage.getItem(PUZZLE_SCORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get tier number from levelId (1 to 5)
 */
export function getPuzzleUnlockedTier(levelId: string): number {
  if (!levelId.startsWith('wp-')) return 5;
  const match = levelId.match(/^wp-(\d+)-/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Check whether a component is unlocked or sealed for the current puzzle level
 */
export function isPuzzleComponentUnlocked(
  typeStr: string,
  levelId: string
): { unlocked: boolean; requiredTier?: number; reason?: string } {
  // If not in puzzle mode, all components are available
  if (!levelId || !levelId.startsWith('wp-')) {
    return { unlocked: true };
  }

  const currentTier = getPuzzleUnlockedTier(levelId);

  // 1. Basic Wires & Misc Blank: Unlocked across all tiers
  const basicWires = ['wire_straight', 'wire_turn', 'wire_t', 'wire_cross', 'wire_bridge', 'misc_blank'];
  if (basicWires.includes(typeStr)) {
    return { unlocked: true };
  }

  // 2. Buttons: NO, NC, Toggle - Unlocked starting from Tier 2
  const buttonTypes = ['btn_no', 'btn_nc', 'btn_toggle'];
  if (buttonTypes.includes(typeStr)) {
    if (currentTier >= 2) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 2,
      reason: '🔒 封印中：需通關到達第 2 階段 (按鈕與邏輯接點) 才能解除封印！',
    };
  }

  // 3. Relays & Contactors: Coil & NO Contact - Unlocked starting from Tier 3
  const tier3Types = ['relay_coil', 'relay_no'];
  if (tier3Types.includes(typeStr)) {
    if (currentTier >= 3) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 3,
      reason: '🔒 封印中：需通關到達第 3 階段 (電磁接觸器與自保持) 才能解除封印！',
    };
  }

  // 4. Interlock NC Contact: Unlocked starting from Tier 4
  const tier4Types = ['relay_nc'];
  if (tier4Types.includes(typeStr)) {
    if (currentTier >= 4) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 4,
      reason: '🔒 封印中：需通關到達第 4 階段 (電氣互鎖與雙向防短路) 才能解除封印！',
    };
  }

  // 5. Timers & Flashers: Unlocked starting from Tier 5
  const tier5Types = ['relay_ton_no', 'relay_ton_nc', 'relay_flash_coil', 'relay_ton_con'];
  if (tier5Types.includes(typeStr)) {
    if (currentTier >= 5) return { unlocked: true };
    return {
      unlocked: false,
      requiredTier: 5,
      reason: '🔒 封印中：需通關到達第 5 階段 (時間電驛與時序自動化) 才能解除封印！',
    };
  }

  // 6. Redundant components in puzzle mode:
  // (Power supplies, Breakers, 3-phase, Pneumatics, Loads, Exotic switches)
  // These are sealed because start (L), end loads (Light/Motor) and N are pre-placed and locked on the board.
  if (typeStr.startsWith('wire_') && ['wire_l', 'wire_n', 'wire_plus', 'wire_minus', 'wire_ground'].includes(typeStr)) {
    return {
      unlocked: false,
      reason: '🔒 封印中：解謎關卡盤面已固定內建起點電源 (L) 與零線 (N)，禁止額外配置！',
    };
  }

  if (typeStr.startsWith('breaker_') || typeStr.startsWith('protection_') || typeStr.startsWith('power_')) {
    return {
      unlocked: false,
      reason: '🔒 封印中：此解謎關卡已固定起終點電源，此類供電與保護模組已封印。',
    };
  }

  if (typeStr.startsWith('load_') || typeStr.startsWith('motor') || typeStr.startsWith('platform_')) {
    return {
      unlocked: false,
      reason: '🔒 封印中：目標輸出負載已固定於終點，無需額外放置！',
    };
  }

  if (typeStr.startsWith('pneumatic_')) {
    return {
      unlocked: false,
      reason: '🔒 封印中：此工業配線解謎單元未開放氣壓元件。',
    };
  }

  return {
    unlocked: false,
    reason: '🔒 封印中：此元件非當前解謎關卡所需元件。',
  };
}

/**
 * Check whether a puzzle level is unlocked for the player
 */
export function isPuzzleLevelUnlocked(levelId: string): boolean {
  if (levelId === 'wp-1-1') return true;
  const scores = getPuzzleScores();

  // If unlock-all flag is active in localStorage
  if (localStorage.getItem('autostudio_puzzle_all_unlocked') === 'true') {
    return true;
  }

  // Find index in wiringPuzzleLevels
  const idx = wiringPuzzleLevels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;

  // Level is unlocked if the immediately preceding level has been cleared (has stars > 0)
  const prevLevel = wiringPuzzleLevels[idx - 1];
  return !!(scores[prevLevel.id] && scores[prevLevel.id].stars > 0);
}

/**
 * Toggle unlock all levels for dev/testing
 */
export function setPuzzleAllUnlocked(unlocked: boolean): void {
  if (unlocked) {
    localStorage.setItem('autostudio_puzzle_all_unlocked', 'true');
  } else {
    localStorage.removeItem('autostudio_puzzle_all_unlocked');
  }
}

export function isPuzzleAllUnlocked(): boolean {
  return localStorage.getItem('autostudio_puzzle_all_unlocked') === 'true';
}

