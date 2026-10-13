/**
 * @license
 * Industrial Wiring Level Specifications & Testbench Verification Engine
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

import { Tile, LogicLevelId } from '../types';
import { buildNetState } from './NetEngine';
import { WiringEngine } from './WiringEngine';

export interface WiringStepResult {
  stepName: string;
  passed: boolean;
  detail: string;
}

export interface WiringVerificationResult {
  allPassed: boolean;
  message: string;
  steps: WiringStepResult[];
  diagnosticMessage?: string;
}

export interface WiringLevelSpec {
  levelId: LogicLevelId;
  title: string;
  category: string;
  description: string;
  guideHint: string;
  verify: (grid: (Tile | null)[][], size: number) => WiringVerificationResult;
}

/**
 * Deep clone grid for non-destructive testbench simulation
 */
function cloneGrid(grid: (Tile | null)[][], size: number): (Tile | null)[][] {
  const cloned: (Tile | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  for (let y = 0; y < Math.min(grid.length, size); y++) {
    for (let x = 0; x < Math.min(grid[0].length, size); x++) {
      if (grid[y][x]) {
        cloned[y][x] = Object.assign(new Tile(), JSON.parse(JSON.stringify(grid[y][x])));
      }
    }
  }
  return cloned;
}

/**
 * Execute iterative simulation passes to allow electromagnetic feedback loops (e.g. self-holding)
 * to stabilize into a steady state.
 */
function simulateStep(grid: (Tile | null)[][], size: number, passes: number = 3): {
  isShortCircuit: boolean;
  shortDetail?: string;
} {
  let isShort = false;
  let shortDetail = '';

  for (let p = 0; p < passes; p++) {
    const { netMap, netCount } = buildNetState(grid, size, size, 'wiring', { opens: [], shorts: [] });
    const netData = Array(netCount + 1).fill(0).map(() => ({ color: '#4a5568', isHigh: false }));

    WiringEngine.simulate(grid, netMap, netData);

    // Detect L-N, 24V-0V, or Phase-Phase short
    const lNets = new Set<number>();
    const nNets = new Set<number>();
    const plusNets = new Set<number>();
    const zeroNets = new Set<number>();
    const rNets = new Set<number>();
    const sNets = new Set<number>();
    const tNets = new Set<number>();

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const t = grid[y][x];
        if (t && t.type === 'wire') {
          const pinNet = netMap[y]?.[x]?.[(2 + t.rotation) % 4];
          if (t.subtype === 'l' || t.subtype === 'h') lNets.add(pinNet);
          if (t.subtype === 'n' || t.subtype === 'g') nNets.add(pinNet);
          if (t.subtype === 'plus') plusNets.add(pinNet);
          if (t.subtype === 'minus' || t.subtype === 'ground') zeroNets.add(pinNet);
        }
        if (t && t.type === 'power') {
          const pinNet = netMap[y]?.[x]?.[(2 + t.rotation) % 4];
          if (t.subtype === '3phase_r') rNets.add(pinNet);
          if (t.subtype === '3phase_s') sNets.add(pinNet);
          if (t.subtype === '3phase_t') tNets.add(pinNet);
        }
      }
    }
    lNets.delete(0);
    nNets.delete(0);
    plusNets.delete(0);
    zeroNets.delete(0);
    rNets.delete(0);
    sNets.delete(0);
    tNets.delete(0);

    const hasLNShort = [...lNets].some((n) => nNets.has(n));
    const hasDCShort = [...plusNets].some((n) => zeroNets.has(n));
    const hasPhaseShort =
      [...rNets].some((n) => sNets.has(n) || tNets.has(n)) ||
      [...sNets].some((n) => rNets.has(n) || tNets.has(n)) ||
      [...tNets].some((n) => rNets.has(n) || sNets.has(n));

    if (hasLNShort || hasDCShort || hasPhaseShort) {
      isShort = true;
      if (hasLNShort) shortDetail = 'L 與 N 電源直接短路！';
      else if (hasDCShort) shortDetail = '+24V 與 0V 直流短路！';
      else shortDetail = '三相交流電源發生相間短路！';
      break;
    }
  }

  return { isShortCircuit: isShort, shortDetail };
}

/**
 * Resilient tile finder: checks expected coordinate first, falls back to scanning grid
 */
function getOrFindTile(
  grid: (Tile | null)[][],
  expectedY: number,
  expectedX: number,
  type: string,
  subtype?: string,
  label?: string
): Tile | null {
  const atPos = grid[expectedY]?.[expectedX];
  if (
    atPos &&
    atPos.type === type &&
    (!subtype || atPos.subtype === subtype) &&
    (!label || (atPos.labels && atPos.labels[4] === label))
  ) {
    return atPos;
  }
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const t = grid[y][x];
      if (t && t.type === type && (!subtype || t.subtype === subtype)) {
        if (!label || (t.labels && t.labels[4] === label)) {
          return t;
        }
      }
    }
  }
  return atPos || null;
}

// ============================================================================
// Level Verification Specifications (w-1-1 through w-2-4)
// ============================================================================

export const WIRING_LEVEL_SPECS: Record<string, WiringLevelSpec> = {
  // --------------------------------------------------------------------------
  // w-1-1: 點亮指示燈
  // --------------------------------------------------------------------------
  'w-1-1': {
    levelId: 'w-1-1',
    title: 'w-1-1 點亮指示燈',
    category: '第一大類：基礎配線與接點邏輯',
    description: '將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。',
    guideHint: '請使用導線將 L 連接至按鈕輸入端，按鈕輸出端連接至指示燈，指示燈另一端接回 N。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btn = getOrFindTile(g, 3, 4, 'btn', 'no');
      const light = getOrFindTile(g, 5, 4, 'load', 'lightbulb');

      if (!btn || !light) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請勿刪除按鈕或指示燈。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 未按下按鈕 -> 燈泡不應點亮
      btn.isActive = false;
      const sim1 = simulateStep(g, size);
      if (sim1.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim1.shortDetail}`,
          steps: [{ stepName: '短路防護檢查', passed: false, detail: sim1.shortDetail! }],
        };
      }
      const p1 = !light.isPowered;
      steps.push({
        stepName: '常開按鈕釋放狀態 (OFF)',
        passed: p1,
        detail: p1 ? '按鈕未按下時，迴路斷開，指示燈不亮 (正確)' : '按鈕未按下時指示燈已點亮，可能繞過了開關直接接通電源',
      });

      // Step 2: 按下按鈕 -> 燈泡必須點亮
      btn.isActive = true;
      const sim2 = simulateStep(g, size);
      if (sim2.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 按下按鈕時電路短路：${sim2.shortDetail}`,
          steps: [...steps, { stepName: '按壓導通檢查', passed: false, detail: sim2.shortDetail! }],
        };
      }
      const p2 = !!light.isPowered;
      steps.push({
        stepName: '常開按鈕按壓導通 (ON)',
        passed: p2,
        detail: p2 ? '按鈕按下時，迴路閉合，指示燈成功點亮 (正確)' : '按下按鈕後指示燈未點亮，請檢查 L->按鈕->燈泡->N 是否完整接通',
      });

      const allPassed = p1 && p2;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功完成基礎指示燈控制迴路！'
          : '配線邏輯尚未完全符合要求，請根據步驟診斷調整接線。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-1-2: 串聯與及邏輯 (AND)
  // --------------------------------------------------------------------------
  'w-1-2': {
    levelId: 'w-1-2',
    title: 'w-1-2 串聯與及邏輯',
    category: '第一大類：基礎配線與接點邏輯',
    description: '必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。',
    guideHint: '將電源 L 經過按鈕 1，按鈕 1 輸出接按鈕 2 輸入，按鈕 2 輸出接指示燈，最後回到 N。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btn1 = getOrFindTile(g, 2, 4, 'btn', 'no');
      const btn2 = getOrFindTile(g, 4, 4, 'btn', 'no');
      const light = getOrFindTile(g, 6, 4, 'load', 'lightbulb');

      if (!btn1 || !btn2 || !light) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 1、按鈕 2 或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請勿刪除按鈕或指示燈。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 兩者皆未按 (0, 0) -> OFF
      btn1.isActive = false;
      btn2.isActive = false;
      simulateStep(g, size);
      const p1 = !light.isPowered;
      steps.push({
        stepName: '雙按鈕未按 (0, 0)',
        passed: p1,
        detail: p1 ? '指示燈熄滅 (正確)' : '未按按鈕時燈泡點亮，接線有誤',
      });

      // Step 2: 僅按按鈕 1 (1, 0) -> OFF
      btn1.isActive = true;
      btn2.isActive = false;
      simulateStep(g, size);
      const p2 = !light.isPowered;
      steps.push({
        stepName: '僅按開關 1 (1, 0)',
        passed: p2,
        detail: p2 ? '指示燈保持熄滅 (正確串聯特性)' : '只按開關 1 燈就點亮，不是串聯迴路',
      });

      // Step 3: 僅按按鈕 2 (0, 1) -> OFF
      btn1.isActive = false;
      btn2.isActive = true;
      simulateStep(g, size);
      const p3 = !light.isPowered;
      steps.push({
        stepName: '僅按開關 2 (0, 1)',
        passed: p3,
        detail: p3 ? '指示燈保持熄滅 (正確串聯特性)' : '只按開關 2 燈就點亮，不是串聯迴路',
      });

      // Step 4: 兩者皆按 (1, 1) -> ON
      btn1.isActive = true;
      btn2.isActive = true;
      simulateStep(g, size);
      const p4 = !!light.isPowered;
      steps.push({
        stepName: '同時按下兩開關 (1, 1)',
        passed: p4,
        detail: p4 ? '指示燈成功點亮 (硬體 AND 邏輯成立)' : '兩開關同時按下時指示燈未亮，請檢查串聯接線',
      });

      const allPassed = p1 && p2 && p3 && p4;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功實現硬體及邏輯 (Series AND) 串聯電路！'
          : '串聯邏輯未完全通過，請檢查兩開關是否頭尾相連串在迴路中。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-1-3: 並聯與或邏輯 (OR)
  // --------------------------------------------------------------------------
  'w-1-3': {
    levelId: 'w-1-3',
    title: 'w-1-3 並聯與或邏輯',
    category: '第一大類：基礎配線與接點邏輯',
    description: '兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。',
    guideHint: '使用 T 型導線分流，將兩個按鈕的輸入端接在一起，輸出端也接在一起並聯，再接入指示燈。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btn1 = getOrFindTile(g, 3, 3, 'btn', 'no');
      const btn2 = getOrFindTile(g, 3, 5, 'btn', 'no');
      const light = getOrFindTile(g, 5, 4, 'load', 'lightbulb');

      if (!btn1 || !btn2 || !light) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 1、按鈕 2 或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請勿刪除按鈕或指示燈。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 兩者皆未按 (0, 0) -> OFF
      btn1.isActive = false;
      btn2.isActive = false;
      simulateStep(g, size);
      const p1 = !light.isPowered;
      steps.push({
        stepName: '雙按鈕未按 (0, 0)',
        passed: p1,
        detail: p1 ? '指示燈熄滅 (正確)' : '未按按鈕時燈泡已點亮，接線有誤',
      });

      // Step 2: 僅按按鈕 1 (1, 0) -> ON
      btn1.isActive = true;
      btn2.isActive = false;
      simulateStep(g, size);
      const p2 = !!light.isPowered;
      steps.push({
        stepName: '僅按開關 1 (1, 0)',
        passed: p2,
        detail: p2 ? '指示燈成功點亮 (正確 OR 特性)' : '按下開關 1 時燈泡未亮，請檢查開關 1 接線',
      });

      // Step 3: 僅按按鈕 2 (0, 1) -> ON
      btn1.isActive = false;
      btn2.isActive = true;
      simulateStep(g, size);
      const p3 = !!light.isPowered;
      steps.push({
        stepName: '僅按開關 2 (0, 1)',
        passed: p3,
        detail: p3 ? '指示燈成功點亮 (正確 OR 特性)' : '按下開關 2 時燈泡未亮，請檢查開關 2 接線',
      });

      const allPassed = p1 && p2 && p3;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功實現硬體或邏輯 (Parallel OR) 並聯電路！'
          : '並聯邏輯未完全通過，請確保任一按鈕皆能獨立通電至燈泡。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-1-4: 常閉接點 (NC) 應用
  // --------------------------------------------------------------------------
  'w-1-4': {
    levelId: 'w-1-4',
    title: 'w-1-4 常閉接點 (NC) 應用',
    category: '第一大類：基礎配線與接點邏輯',
    description: '燈泡預設是亮的，按下按鈕 (NC) 後燈滅。',
    guideHint: '常閉接點 (NC) 未按壓時內部金屬片相通；按壓時金屬片彈開斷路。常作為急停或停止按鈕。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const ncBtn = getOrFindTile(g, 3, 4, 'btn', 'nc');
      const light = getOrFindTile(g, 5, 4, 'load', 'lightbulb');

      if (!ncBtn || !light) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（常閉按鈕或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請勿刪除按鈕或指示燈。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 未按壓 (常態導通) -> 燈泡必須點亮
      ncBtn.isActive = false;
      simulateStep(g, size);
      const p1 = !!light.isPowered;
      steps.push({
        stepName: '常態未按壓 (NC 導通狀態)',
        passed: p1,
        detail: p1 ? '常態下指示燈點亮 (正確)' : '常態未按壓時指示燈未亮，請檢查 NC 迴路是否接通',
      });

      // Step 2: 按下 NC 按鈕 (切斷) -> 燈泡必須熄滅
      ncBtn.isActive = true;
      simulateStep(g, size);
      const p2 = !light.isPowered;
      steps.push({
        stepName: '按壓 NC 按鈕 (斷路狀態)',
        passed: p2,
        detail: p2 ? '按壓後指示燈立即熄滅 (正確切斷電源)' : '按壓 NC 按鈕後燈泡仍亮著，未正確通過 NC 接點',
      });

      const allPassed = p1 && p2;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功掌握常閉接點 (NC) 的斷路控制！'
          : '常閉接點測試未通過，請檢查接線。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-1-5: 複合接點與同態邏輯 (XNOR)
  // --------------------------------------------------------------------------
  'w-1-5': {
    levelId: 'w-1-5',
    title: 'w-1-5 複合接點與同態邏輯 (XNOR)',
    category: '第一大類：基礎配線與接點邏輯',
    description: '將 PB1、PB2 的常開接點 (NO) 串聯作為上支路，常閉接點 (NC) 串聯作為下支路並聯。體驗只有兩按鈕「狀態一致（都不按或同時按下）」時指示燈才會點亮的同態 (XNOR) 控制！',
    guideHint: '上方支路：L -> PB1(NO) -> PB2(NO) -> 燈泡。下方支路：L -> PB1(NC) -> PB2(NC) -> 燈泡。燈泡另一端回 N。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const pb1 = getOrFindTile(g, 3, 3, 'btn', undefined, 'PB1') || getOrFindTile(g, 3, 3, 'btn');
      const pb2 = getOrFindTile(g, 3, 5, 'btn', undefined, 'PB2') || getOrFindTile(g, 3, 5, 'btn');
      const light = getOrFindTile(g, 3, 7, 'load', 'lightbulb') || getOrFindTile(g, 5, 4, 'load', 'lightbulb');
      const pb1_nc = getOrFindTile(g, 5, 3, 'relay', 'nc', 'PB1');
      const pb2_nc = getOrFindTile(g, 5, 5, 'relay', 'nc', 'PB2');

      if (!pb1 || !pb2 || !light) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 PB1、PB2 或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請勿刪除按鈕 PB1、PB2 或指示燈。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Helper to set button and contact states
      const setInputs = (b1: boolean, b2: boolean) => {
        pb1.isActive = b1;
        pb2.isActive = b2;
        if (pb1_nc) pb1_nc.isActive = b1;
        if (pb2_nc) pb2_nc.isActive = b2;
      };

      // Step 1: 雙按鈕皆未按 (0, 0) -> NC 串聯導通 -> ON
      setInputs(false, false);
      const sim1 = simulateStep(g, size);
      if (sim1.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim1.shortDetail}`,
          steps: [{ stepName: '短路防護檢查', passed: false, detail: sim1.shortDetail! }],
        };
      }
      const p1 = !!light.isPowered;
      steps.push({
        stepName: '雙按鈕皆釋放 (0, 0)',
        passed: p1,
        detail: p1
          ? '兩按鈕皆釋放時，電流經常閉 (NC) 串聯支路導通，指示燈點亮 (正確)'
          : '未按按鈕時指示燈未亮，請檢查 NC 串聯支路是否完整接通至電源與指示燈',
      });

      // Step 2: 僅按壓開關 PB1 (1, 0) -> 兩支路皆斷開 -> OFF
      setInputs(true, false);
      const sim2 = simulateStep(g, size);
      if (sim2.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim2.shortDetail}`,
          steps: [...steps, { stepName: '按壓短路檢查', passed: false, detail: sim2.shortDetail! }],
        };
      }
      const p2 = !light.isPowered;
      steps.push({
        stepName: '僅按壓開關 PB1 (1, 0)',
        passed: p2,
        detail: p2
          ? '僅按 PB1 時，NC 支路切斷且 NO 支路未通，指示燈熄滅 (正確)'
          : '僅按 PB1 時指示燈仍亮著，可能繞過了開關或常閉接點未正確斷開',
      });

      // Step 3: 僅按壓開關 PB2 (0, 1) -> 兩支路皆斷開 -> OFF
      setInputs(false, true);
      const sim3 = simulateStep(g, size);
      if (sim3.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim3.shortDetail}`,
          steps: [...steps, { stepName: '按壓短路檢查', passed: false, detail: sim3.shortDetail! }],
        };
      }
      const p3 = !light.isPowered;
      steps.push({
        stepName: '僅按壓開關 PB2 (0, 1)',
        passed: p3,
        detail: p3
          ? '僅按 PB2 時，NC 支路切斷且 NO 支路未通，指示燈熄滅 (正確)'
          : '僅按 PB2 時指示燈仍亮著，可能常開與常閉接點接錯位置',
      });

      // Step 4: 雙按鈕同時按下 (1, 1) -> NO 串聯導通 -> ON
      setInputs(true, true);
      const sim4 = simulateStep(g, size);
      if (sim4.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim4.shortDetail}`,
          steps: [...steps, { stepName: '按壓短路檢查', passed: false, detail: sim4.shortDetail! }],
        };
      }
      const p4 = !!light.isPowered;
      steps.push({
        stepName: '雙按鈕同時按下 (1, 1)',
        passed: p4,
        detail: p4
          ? '雙按鈕同時按下時，電流經常開 (NO) 串聯支路導通，指示燈成功點亮 (同態 XNOR 成立！)'
          : '雙按鈕同時按下時指示燈未亮，請檢查 NO 串聯支路是否接通',
      });

      const allPassed = p1 && p2 && p3 && p4;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功掌握雙開關複合接點與同態邏輯 (XNOR)！'
          : '同態邏輯檢驗未完全通過，請確認 NO 串聯與 NC 串聯兩支路是否皆正確並聯至指示燈。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-2-1: 電磁接觸器 (MC) 基礎
  // --------------------------------------------------------------------------
  'w-2-1': {
    levelId: 'w-2-1',
    title: 'w-2-1 電磁接觸器 (MC) 基礎',
    category: '第二大類：電磁接觸器與記憶電路',
    description: '用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。',
    guideHint: '控制迴路：L -> 按鈕 -> 線圈 K1 -> N。主迴路：電源 -> 接點 K1 -> 馬達 -> N。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btn = getOrFindTile(g, 3, 3, 'btn', 'no');
      const coil = getOrFindTile(g, 3, 5, 'relay', 'coil', 'K1');
      const relayNo = getOrFindTile(g, 5, 3, 'relay', 'no', 'K1');
      const motor = getOrFindTile(g, 5, 5, 'motor');

      if (!btn || !coil || !relayNo || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕、線圈 K1、接點 K1 或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 未按下按鈕 -> 線圈與馬達皆停止
      btn.isActive = false;
      simulateStep(g, size);
      const p1 = !coil.isActive && !motor.isPowered;
      steps.push({
        stepName: '未按按鈕初始狀態',
        passed: p1,
        detail: p1 ? '線圈未激磁，馬達靜止 (正確)' : '未按按鈕時線圈或馬達已啟動，請檢查控制線路',
      });

      // Step 2: 按下按鈕 -> 線圈激磁、MC接點閉合、馬達運轉
      btn.isActive = true;
      simulateStep(g, size, 4);
      const coilOk = !!coil.isActive;
      const motorOk = !!motor.isPowered;
      const p2 = coilOk && motorOk;
      steps.push({
        stepName: '按壓啟動按鈕',
        passed: p2,
        detail: p2
          ? '線圈成功激磁，帶動常開接點閉合，馬達啟動運轉 (正確)'
          : !coilOk
          ? '按下按鈕後線圈 K1 未能激磁，請檢查 L->按鈕->線圈->N 控制迴路'
          : '線圈已激磁，但馬達未運轉！請檢查電源是否經由接點 K1 接入馬達',
      });

      // Step 3: 放開按鈕 -> 線圈釋放、馬達停止 (點動吋動模式)
      btn.isActive = false;
      simulateStep(g, size, 4);
      const p3 = !coil.isActive && !motor.isPowered;
      steps.push({
        stepName: '放開按鈕 (吋動復歸)',
        passed: p3,
        detail: p3 ? '放開按鈕後線圈釋放，馬達停轉 (寸動特性正確)' : '放開按鈕後無法復歸',
      });

      const allPassed = p1 && p2 && p3;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功掌握電磁接觸器 (MC) 的小電流控大動力原理！'
          : 'MC 基礎控制未完全通過，請檢查控制迴路與主迴路。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-2-2: 繼電器 C 接點應用（雙燈切換）
  // --------------------------------------------------------------------------
  'w-2-2': {
    levelId: 'w-2-2',
    title: 'w-2-2 繼電器 C 接點應用（雙燈切換）',
    category: '第二大類：電磁接觸器與記憶電路',
    description: '利用繼電器 C 接點 (COM, NO, NC) 控制兩盞指示燈，體驗未激磁常閉亮、激磁切換常開亮的交互控制！',
    guideHint: '上方 AC 迴路：L -> PB1 -> K1 線圈 -> N。下方 DC 迴路：+24V 接 C 接點 COM 端；NC 接燈 2；NO 接燈 1；兩燈另一端匯流回 0V。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const pb1 = getOrFindTile(g, 2, 3, 'btn', undefined, 'PB1') || getOrFindTile(g, 2, 3, 'btn');
      const coil = getOrFindTile(g, 2, 5, 'relay', 'coil', 'K1');
      const relayCon = getOrFindTile(g, 5, 3, 'relay', 'con', 'K1');
      const light1 = getOrFindTile(g, 4, 5, 'load', 'lightbulb');
      const light2 = getOrFindTile(g, 5, 5, 'load', 'lightbulb');

      if (!pb1 || !coil || !relayCon || !light1 || !light2) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 PB1、線圈 K1、C接點 K1 或指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 未按下 PB1 (初始待機) -> K1 未激磁, 燈 2 亮, 燈 1 滅
      pb1.isActive = false;
      const sim1 = simulateStep(g, size, 4);
      if (sim1.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim1.shortDetail}`,
          steps: [{ stepName: '短路防護檢查', passed: false, detail: sim1.shortDetail! }],
        };
      }
      const p1 = !coil.isActive && !light1.isPowered && !!light2.isPowered;
      steps.push({
        stepName: '未按按鈕待機狀態 (NC 導通)',
        passed: p1,
        detail: p1
          ? '平時未按 PB1：K1 未激磁，C 接點維持 NC 導通，燈 2 亮、燈 1 熄滅 (待機指示正確)'
          : !light2.isPowered
          ? '平時待機時燈 2 未亮，請檢查 +24V -> K1(COM) -> K1(NC) -> 燈2 -> 0V 迴路'
          : '平時待機時燈 1 異常點亮，NO 接點不應在未激磁時導通',
      });

      // Step 2: 按下 PB1 (激磁動作) -> K1 激磁, 燈 1 亮, 燈 2 滅
      pb1.isActive = true;
      const sim2 = simulateStep(g, size, 4);
      if (sim2.isShortCircuit) {
        return {
          allPassed: false,
          message: `⚠️ 電路短路：${sim2.shortDetail}`,
          steps: [...steps, { stepName: '激磁短路檢查', passed: false, detail: sim2.shortDetail! }],
        };
      }
      const coilOk = !!coil.isActive;
      const light1Ok = !!light1.isPowered;
      const light2Off = !light2.isPowered;
      const p2 = coilOk && light1Ok && light2Off;
      steps.push({
        stepName: '按壓 PB1 激磁切換 (NO 導通)',
        passed: p2,
        detail: p2
          ? '按壓 PB1 激磁：K1 線圈吸合，C 接點切至 NO，燈 1 亮、燈 2 熄滅 (切換動作正確)'
          : !coilOk
          ? '按下 PB1 時線圈 K1 未能激磁，請檢查 AC 控制迴路 (L -> PB1 -> K1 -> N)'
          : !light1Ok
          ? 'K1 已激磁，但燈 1 未點亮，請檢查 K1(NO) 經由上方導線至燈 1 的迴路'
          : 'K1 激磁時燈 2 未熄滅，NC 接點未成功切離',
      });

      // Step 3: 放開 PB1 (復歸待機) -> K1 釋放, 燈 2 復亮, 燈 1 熄滅
      pb1.isActive = false;
      simulateStep(g, size, 4);
      const p3 = !coil.isActive && !light1.isPowered && !!light2.isPowered;
      steps.push({
        stepName: '放開 PB1 復歸待機',
        passed: p3,
        detail: p3
          ? '放開按鈕後線圈釋放，C 接點彈回 NC 端，燈 2 恢復亮起、燈 1 熄滅 (復歸正確)'
          : '放開按鈕後雙燈狀態未能正確復歸',
      });

      const allPassed = p1 && p2 && p3;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功掌握繼電器 C 接點 (SPDT) 雙燈互補切換控制！'
          : 'C 接點雙燈切換檢驗未完全通過，請檢查接線與接點配置。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-2-3: 自保持電路 (Self-Holding)
  // --------------------------------------------------------------------------
  'w-2-3': {
    levelId: 'w-2-3',
    title: 'w-2-3 自保持電路 (Self-Holding)',
    category: '第二大類：電磁接觸器與記憶電路',
    description: '按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。',
    guideHint: '將接點 K1 (位於 grid[3][3]) 的兩端，分別並聯接到啟動按鈕的兩端。如此一來按鈕放開後，電流能藉由閉合的 K1 繼續流向線圈！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btn = getOrFindTile(g, 1, 3, 'btn', 'no');
      const coil = getOrFindTile(g, 1, 5, 'relay', 'coil', 'K1');
      const auxNo = getOrFindTile(g, 3, 3, 'relay', 'no', 'K1');
      const mainNo = getOrFindTile(g, 5, 3, 'relay', 'no', 'K1');
      const motor = getOrFindTile(g, 5, 5, 'motor');

      if (!btn || !coil || !auxNo || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（啟動按鈕、線圈 K1、自保持接點 K1 或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 初始斷電
      btn.isActive = false;
      simulateStep(g, size, 3);
      const p1 = !coil.isActive && !motor.isPowered;
      steps.push({
        stepName: '初始靜止狀態',
        passed: p1,
        detail: p1 ? '初始狀態無電流，馬達靜止 (正確)' : '初始狀態已有電力流動，請檢查電源接線',
      });

      // Step 2: 觸發啟動 (按住按鈕)
      btn.isActive = true;
      simulateStep(g, size, 4);
      const coilStart = !!coil.isActive;
      const motorStart = !!motor.isPowered;
      const p2 = coilStart && motorStart;
      steps.push({
        stepName: '按鈕觸發啟動 (Pulse Start)',
        passed: p2,
        detail: p2
          ? '啟動按鈕按下時，線圈激磁且馬達開始運轉 (正確)'
          : !coilStart
          ? '按下啟動按鈕時線圈 K1 未激磁，請檢查啟動按鈕控制迴路'
          : '線圈已激磁，但馬達未啟動運轉，請檢查主迴路',
      });

      // Step 3: 放開按鈕 -> 檢驗自保持 (Self-Holding Memory)
      btn.isActive = false;
      simulateStep(g, size, 5); // Multi-pass simulation of feedback loop
      const coilHeld = !!coil.isActive;
      const motorHeld = !!motor.isPowered;
      const p3 = coilHeld && motorHeld;
      steps.push({
        stepName: '放開按鈕後的自保持維持 (Self-Holding)',
        passed: p3,
        detail: p3
          ? '放開按鈕後，輔助接點 K1 成功旁路維持線圈激磁，馬達持續運轉！(自保持成立)'
          : '❌ 放開按鈕後馬達停止！請確認是否已將常開輔助接點 K1 (位於 grid[3][3]) 與啟動按鈕並聯。',
      });

      const allPassed = p1 && p2 && p3;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！經典自保持電路 (Self-Holding) 驗證完全正確！'
          : '自保持電路測試未通過，請檢查輔助接點是否確實與啟動按鈕並聯。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-2-4: 啟動與停止電路
  // --------------------------------------------------------------------------
  // w-2-4: 三種停止接法安全比較（正常／無法停止／同時啟動）
  // --------------------------------------------------------------------------
  'w-2-4': {
    levelId: 'w-2-4',
    title: 'w-2-4 三種停止接法安全比較（正常／無法停止／同時啟動）',
    category: '第二大類：電磁接觸器與記憶電路',
    description:
      '本單元由三組經典自保持電路對照組成，深入剖析工業配線中停止按鈕 (NC) 的三種接法與重大安全後果：\n' +
      '1. 正常開關（停止優先）：標準安全接法。按 PB2 啟動自保持，按 PB1 立即斷電；兩者同時按下時停止優先，確保絕對安全。\n' +
      '2. 無法關閉（嚴重錯誤）：停止按鈕 PB3 誤接在啟動支路上。一旦自保持閉合，電源繞過 PB3，按下停止完全無法斷電！\n' +
      '3. 同時按下仍啟動（啟動優先）：停止按鈕 PB5 接於自保持支路。平時按 PB5 可斷開自保持，但若 PB5 與 PB6 同時按下，線圈仍會強制激磁運轉。',
    guideHint:
      '請在畫布或即時監控 HUD 中依序操作三組電路：\n' +
      '• 迴路一（正常開關）：按 PB2 啟動 K1，按 PB1 停止 K1。若兩按鈕同時按壓，K1 保持安全斷電！\n' +
      '• 迴路二（無法關閉）：按 PB4 啟動 K2，此時按 PB3 發現完全無法關閉 K2！（自保持旁路錯誤）\n' +
      '• 迴路三（同時啟動）：按 PB6 啟動 K3，按 PB5 停止 K3。若同時按壓 PB5 與 PB6，K3 仍會強制運轉！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const pb1 = getOrFindTile(g, 0, 2, 'btn', 'nc', 'PB1');
      const pb2 = getOrFindTile(g, 0, 4, 'btn', 'no', 'PB2');
      const k1Coil = getOrFindTile(g, 0, 6, 'relay', 'coil', 'K1');

      const pb3 = getOrFindTile(g, 3, 2, 'btn', 'nc', 'PB3');
      const pb4 = getOrFindTile(g, 3, 4, 'btn', 'no', 'PB4');
      const k2Coil = getOrFindTile(g, 3, 6, 'relay', 'coil', 'K2');

      const pb6 = getOrFindTile(g, 6, 4, 'btn', 'no', 'PB6');
      const k3Coil = getOrFindTile(g, 6, 6, 'relay', 'coil', 'K3');
      const pb5 = getOrFindTile(g, 7, 2, 'btn', 'nc', 'PB5');

      if (!pb1 || !pb2 || !k1Coil || !pb3 || !pb4 || !k2Coil || !pb5 || !pb6 || !k3Coil) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 PB1~PB6 或線圈 K1~K3 未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有三組對照電路元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // ==========================================
      // 迴路一測試：正常開關 (停止優先 / 標準安全接法)
      // ==========================================
      // Step 1-1: PB2 啟動並自保持
      pb1.isActive = false;
      pb2.isActive = true;
      simulateStep(g, size, 4);
      pb2.isActive = false;
      simulateStep(g, size, 5);
      const k1Latched = !!k1Coil.isActive;

      // Step 1-2: PB1 按下停止
      pb1.isActive = true; // pressed NC = open
      simulateStep(g, size, 4);
      const k1Stopped = !k1Coil.isActive;
      pb1.isActive = false;
      simulateStep(g, size, 4);
      const k1RemainOff = !k1Coil.isActive;
      const step1Ok = k1Latched && k1Stopped && k1RemainOff;
      steps.push({
        stepName: '迴路一：正常開關起停 (PB2 啟動 / PB1 停止)',
        passed: step1Ok,
        detail: step1Ok
          ? '按壓 PB2 成功自保持運轉；按壓 PB1 立即安全斷電且不自復 (標準接法正確)'
          : !k1Latched
          ? '按壓 PB2 後未能成功建立自保持'
          : '按下 PB1 後未能切斷線圈 K1',
      });

      // Step 1-3: PB1 (Stop) 與 PB2 (Start) 同時按下 -> 停止優先
      pb1.isActive = true;
      pb2.isActive = true;
      simulateStep(g, size, 4);
      const k1BothStopPriority = !k1Coil.isActive;
      pb1.isActive = false;
      pb2.isActive = false;
      simulateStep(g, size, 4);
      steps.push({
        stepName: '迴路一：PB1+PB2 同時按下 (停止優先檢驗)',
        passed: k1BothStopPriority,
        detail: k1BothStopPriority
          ? '同時按下啟動與停止時，停止優先切斷電源，K1 保持不激磁 (最高安全等級！)'
          : '同時按下時 K1 竟然啟動了，請確認 PB1 是否串接在幹線最前端',
      });

      // ==========================================
      // 迴路二測試：無法關閉 (停止失效 / 嚴重接錯)
      // ==========================================
      // Step 2-1: PB4 啟動並自保持
      pb3.isActive = false;
      pb4.isActive = true;
      simulateStep(g, size, 4);
      pb4.isActive = false;
      simulateStep(g, size, 5);
      const k2Latched = !!k2Coil.isActive;

      // Step 2-2: 按下 PB3 停止 -> 檢驗「無法關閉」現象！
      pb3.isActive = true; // pressed NC
      simulateStep(g, size, 5);
      const k2CannotStop = !!k2Coil.isActive; // In this faulty circuit, K2 stays ACTIVE!
      pb3.isActive = false;
      simulateStep(g, size, 3);
      steps.push({
        stepName: '迴路二：按下 PB3 檢驗「無法關閉」現象',
        passed: k2Latched && k2CannotStop,
        detail: k2Latched && k2CannotStop
          ? '⚠️ 驗證成立！PB3 誤接在啟動支路上，自保持接點 K2 繞過 PB3，按下停止完全無法關閉 K2！(體會致命危險)'
          : '迴路二未呈現「無法關閉」現象，請確認 PB3 是否與 PB4 串聯並與 K2 NO 接點並聯',
      });

      // ==========================================
      // 迴路三測試：同時按下還是會啟動 (啟動優先)
      // ==========================================
      // Step 3-1: PB6 啟動並自保持
      pb5.isActive = false;
      pb6.isActive = true;
      simulateStep(g, size, 4);
      pb6.isActive = false;
      simulateStep(g, size, 5);
      const k3Latched = !!k3Coil.isActive;

      // Step 3-2: 單獨按 PB5 停止
      pb5.isActive = true;
      simulateStep(g, size, 4);
      const k3SingleStop = !k3Coil.isActive;
      pb5.isActive = false;
      simulateStep(g, size, 4);

      // Step 3-3: PB5 與 PB6 同時按下 -> 啟動優先 (仍然啟動！)
      pb5.isActive = true; // Stop held
      pb6.isActive = true; // Start held
      simulateStep(g, size, 4);
      const k3BothStartPriority = !!k3Coil.isActive; // K3 STILL ENERGIZES!
      pb5.isActive = false;
      pb6.isActive = false;
      simulateStep(g, size, 4);

      steps.push({
        stepName: '迴路三：PB5+PB6 同時按下 (啟動優先檢驗)',
        passed: k3Latched && k3SingleStop && k3BothStartPriority,
        detail: k3Latched && k3SingleStop && k3BothStartPriority
          ? '⚠️ 驗證成立！PB5 接於自保持支路，平時按 PB5 可停止；但若 PB5 與 PB6 同時按下，電流直通線圈仍會強制啟動！'
          : '迴路三未呈現「同時按下仍啟動」現象，請確認接線配置',
      });

      const allPassed =
        step1Ok &&
        k1BothStopPriority &&
        k2Latched &&
        k2CannotStop &&
        k3Latched &&
        k3SingleStop &&
        k3BothStartPriority;

      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功深入理解三種停止接法之行為差異與安全危害（正常停止優先 vs 停止失效無法關閉 vs 啟動優先）！'
          : '三種停止接法檢驗未完全符合，請確認三組電路配置。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-2-5: 兩地控制 (Two-Place Control)
  // --------------------------------------------------------------------------
  'w-2-5': {
    levelId: 'w-2-5',
    title: 'w-2-5 兩地控制 (Two-Place Control)',
    category: '第二大類：電磁接觸器與記憶電路',
    description: '在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。',
    guideHint: '「起並停串」法則：兩地的啟動按鈕 (NO) 互相並聯；兩地的停止按鈕 (NC) 互相串聯。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const stop1 = getOrFindTile(g, 1, 2, 'btn', 'nc');
      const start1 = getOrFindTile(g, 1, 4, 'btn', 'no');
      const coil = getOrFindTile(g, 1, 6, 'relay', 'coil', 'K1');

      const stop2 = getOrFindTile(g, 3, 2, 'btn', 'nc');
      const start2 = getOrFindTile(g, 3, 4, 'btn', 'no');
      const motor = getOrFindTile(g, 7, 6, 'motor');

      if (!stop1 || !start1 || !stop2 || !start2 || !coil || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（兩組按鈕、線圈或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Test 1: 甲地啟動 (Start 1) -> 自保持 -> 甲地停止 (Stop 1)
      stop1.isActive = false;
      stop2.isActive = false;
      start1.isActive = true;
      start2.isActive = false;
      simulateStep(g, size, 4);
      start1.isActive = false;
      simulateStep(g, size, 5);
      const run1 = !!coil.isActive && !!motor.isPowered;

      stop1.isActive = true;
      simulateStep(g, size, 4);
      const stop1Ok = !coil.isActive && !motor.isPowered;
      stop1.isActive = false;
      simulateStep(g, size, 4);

      const p1 = run1 && stop1Ok;
      steps.push({
        stepName: '甲地啟動 / 甲地停止 (Place A Control)',
        passed: p1,
        detail: p1 ? '甲地 Start1 啟動自保持正常，Stop1 停止正常 (正確)' : '甲地無法正常啟動自保持或停止',
      });

      // Test 2: 乙地啟動 (Start 2) -> 自保持 -> 乙地停止 (Stop 2)
      start2.isActive = true;
      simulateStep(g, size, 4);
      start2.isActive = false;
      simulateStep(g, size, 5);
      const run2 = !!coil.isActive && !!motor.isPowered;

      stop2.isActive = true;
      simulateStep(g, size, 4);
      const stop2Ok = !coil.isActive && !motor.isPowered;
      stop2.isActive = false;
      simulateStep(g, size, 4);

      const p2 = run2 && stop2Ok;
      steps.push({
        stepName: '乙地啟動 / 乙地停止 (Place B Control)',
        passed: p2,
        detail: p2 ? '乙地 Start2 啟動自保持正常，Stop2 停止正常 (正確)' : '乙地無法正常啟動自保持或停止，請檢查 Start2 並聯與 Stop2 串聯',
      });

      // Test 3: 交叉測試：甲地啟動 (Start 1) -> 乙地停止 (Stop 2)
      start1.isActive = true;
      simulateStep(g, size, 4);
      start1.isActive = false;
      simulateStep(g, size, 5);
      const crossRun = !!coil.isActive && !!motor.isPowered;

      stop2.isActive = true;
      simulateStep(g, size, 4);
      const crossStop = !coil.isActive && !motor.isPowered;
      stop2.isActive = false;
      simulateStep(g, size, 4);

      const p3 = crossRun && crossStop;
      steps.push({
        stepName: '交叉控制 (甲地啟動，乙地停止)',
        passed: p3,
        detail: p3 ? '甲地啟動後，成功由乙地 Stop2 切斷停機 (正確)' : '交叉控制失敗，Stop2 未能切斷甲地啟動的迴路',
      });

      const allPassed = p1 && p2 && p3;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！兩地控制「起並停串」全數測試通過！'
          : '兩地控制未完全通過，請確認兩地啟動按鈕並聯、停止按鈕串聯。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-3-1: 電氣互鎖 (Electrical Interlock)
  // --------------------------------------------------------------------------
  'w-3-1': {
    levelId: 'w-3-1',
    title: 'w-3-1 電氣互鎖 (Electrical Interlock)',
    category: '第三大類：互鎖與安全控制',
    description: '兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。',
    guideHint: '互鎖黃金法則：MC1 的控制線中串入 MC2 的常閉接點 (NC)；MC2 的控制線中串入 MC1 的常閉接點 (NC)。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNc = getOrFindTile(g, 1, 1, 'btn', 'nc');
      const btnNo1 = getOrFindTile(g, 1, 5, 'btn', 'no');
      const coilK1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1');
      const btnNo2 = getOrFindTile(g, 5, 5, 'btn', 'no');
      const coilK2 = getOrFindTile(g, 5, 7, 'relay', 'coil', 'K2');

      if (!btnNc || !btnNo1 || !coilK1 || !btnNo2 || !coilK2) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（停止按鈕、啟動按鈕 1/2 或線圈 K1/K2 未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Test 1: 啟動 MC1 自保持
      btnNc.isActive = false;
      btnNo1.isActive = true;
      btnNo2.isActive = false;
      simulateStep(g, size, 4);
      btnNo1.isActive = false;
      simulateStep(g, size, 5);
      const k1Run = !!coilK1.isActive;
      steps.push({
        stepName: 'MC1 獨立啟動與自保持',
        passed: k1Run,
        detail: k1Run ? '按下 PB1 後，MC1 成功激磁並維持自保持 (正確)' : 'MC1 啟動或自保持失敗，請檢查 PB1 迴路',
      });

      // Test 2: MC1 激磁期間，測試互鎖是否阻斷 MC2
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      const k2BlockedByK1 = !coilK2.isActive && !!coilK1.isActive;
      btnNo2.isActive = false;
      simulateStep(g, size, 4);
      steps.push({
        stepName: 'MC1 激磁時阻斷 MC2 (電氣互鎖)',
        passed: k2BlockedByK1,
        detail: k2BlockedByK1
          ? 'MC1 運轉中按下 PB2，MC2 成功被互鎖常閉接點阻斷，未發生短路 (安全防護成立)'
          : '❌ 互鎖失敗！MC1 激磁時按下 PB2，MC2 竟然激磁！請在 MC2 迴路中串聯 MC1 的常閉接點 (NC)。',
      });

      // Test 3: 按下停止切斷 MC1
      btnNc.isActive = true;
      simulateStep(g, size, 4);
      btnNc.isActive = false;
      simulateStep(g, size, 4);
      const k1Stop = !coilK1.isActive && !coilK2.isActive;

      // Test 4: 啟動 MC2 自保持
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      btnNo2.isActive = false;
      simulateStep(g, size, 5);
      const k2Run = !!coilK2.isActive;
      steps.push({
        stepName: 'MC2 獨立啟動與自保持',
        passed: k1Stop && k2Run,
        detail: k2Run ? '按下 PB2 後，MC2 成功激磁並維持自保持 (正確)' : 'MC2 啟動或自保持失敗，請檢查 PB2 迴路',
      });

      // Test 5: MC2 激磁期間，測試互鎖是否阻斷 MC1
      btnNo1.isActive = true;
      simulateStep(g, size, 4);
      const k1BlockedByK2 = !coilK1.isActive && !!coilK2.isActive;
      btnNo1.isActive = false;
      simulateStep(g, size, 4);
      steps.push({
        stepName: 'MC2 激磁時阻斷 MC1 (電氣互鎖)',
        passed: k1BlockedByK2,
        detail: k1BlockedByK2
          ? 'MC2 運轉中按下 PB1，MC1 成功被互鎖常閉接點阻斷 (雙向電氣互鎖成立)'
          : '❌ 互鎖失敗！MC2 激磁時按下 PB1，MC1 竟然激磁！請在 MC1 迴路中串聯 MC2 的常閉接點 (NC)。',
      });

      const allPassed = k1Run && k2BlockedByK1 && k2Run && k1BlockedByK2;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！電氣互鎖 (Electrical Interlock) 雙向安全防護驗證完全正確！'
          : '互鎖測試未通過，請檢查兩接觸器常閉接點 (NC) 是否交叉串入對方的控制迴路。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-3-2: 後動作優先互鎖電路（免按停止直接切換）
  // --------------------------------------------------------------------------
  'w-3-2': {
    levelId: 'w-3-2',
    title: 'w-3-2 後動作優先互鎖電路（免按停止直接切換）',
    category: '第三大類：互鎖與安全控制',
    description:
      '本單元探討後動作優先（後按優先／免按停止直接切換）互鎖控制。將常閉接點 (NC) 串在自保持支路，而不是啟動按鈕前端：\n' +
      '1. 按 PB1 啟動 K1 運轉並自保持。\n' +
      '2. 運轉中直接按 PB3，K2 立即投入並強制切斷 K1 的自保持；放開 PB3 後由 K2 自保持接管！\n' +
      '3. 運轉中直接按 PB1，又可直接切回 K1，完全無需先按停止按鈕！\n' +
      '4. 按下 PB2 或 PB4 可隨時獨立切斷對應迴路。',
    guideHint:
      '操作方式：\n' +
      '• 按下 PB1 啟動 K1，放開後 K1 保持運轉。\n' +
      '• 無需按停止鈕，直接按下 PB3，觀察 K1 立即釋放、K2 取代運轉！\n' +
      '• 再次直接按下 PB1，觀察 K2 釋放、K1 再次接管！\n' +
      '• 這是收音機選台、多段變速切換等控制的核心電路！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const pb1 = getOrFindTile(g, 1, 1, 'btn', 'no', 'PB1');
      const pb2 = getOrFindTile(g, 1, 5, 'btn', 'nc', 'PB2');
      const k1Coil = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1');

      const pb3 = getOrFindTile(g, 4, 1, 'btn', 'no', 'PB3');
      const pb4 = getOrFindTile(g, 4, 5, 'btn', 'nc', 'PB4');
      const k2Coil = getOrFindTile(g, 4, 7, 'relay', 'coil', 'K2');

      if (!pb1 || !pb2 || !k1Coil || !pb3 || !pb4 || !k2Coil) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕 PB1~PB4 或線圈 K1/K2 未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有按鈕與線圈元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 初始斷電狀態
      pb1.isActive = false;
      pb2.isActive = false;
      pb3.isActive = false;
      pb4.isActive = false;
      simulateStep(g, size, 4);
      const initOk = !k1Coil.isActive && !k2Coil.isActive;
      steps.push({
        stepName: '初始靜止狀態',
        passed: initOk,
        detail: initOk ? '電驛 K1、K2 皆處於初始釋放狀態 (正確)' : '初始狀態已有電驛激磁，請檢查接線',
      });

      // Step 2: 按下 PB1 啟動 K1 並自保持
      pb1.isActive = true;
      simulateStep(g, size, 4);
      pb1.isActive = false;
      simulateStep(g, size, 5);
      const k1Latched = !!k1Coil.isActive && !k2Coil.isActive;
      steps.push({
        stepName: '啟動 K1 並自保持運轉',
        passed: k1Latched,
        detail: k1Latched
          ? '按下 PB1 後，K1 成功激磁並透過自保持迴路維持運轉 (正確)'
          : 'K1 啟動或自保持失敗，請檢查 K1 自保持支路',
      });

      // Step 3: 免按停止，直接按下 PB3 切換至 K2 (後動作優先關鍵測試)
      pb3.isActive = true;
      simulateStep(g, size, 4);
      pb3.isActive = false;
      simulateStep(g, size, 5);
      const switch1Ok = !k1Coil.isActive && !!k2Coil.isActive;
      steps.push({
        stepName: '直接按 PB3 切換至 K2 (後動作優先驗證 1)',
        passed: switch1Ok,
        detail: switch1Ok
          ? '免按停止鈕，直接按 PB3 即可讓 K2 激磁並成功迫使 K1 自保持斷電，由 K2 接管運轉 (後入優先成立！)'
          : '切換失敗！按 PB3 時 K1 未能及時釋放或 K2 未能順利自保持',
      });

      // Step 4: 免按停止，再次直接按下 PB1 切回 K1 (雙向切換測試)
      pb1.isActive = true;
      simulateStep(g, size, 4);
      pb1.isActive = false;
      simulateStep(g, size, 5);
      const switch2Ok = !!k1Coil.isActive && !k2Coil.isActive;
      steps.push({
        stepName: '直接按 PB1 切回 K1 (後動作優先驗證 2)',
        passed: switch2Ok,
        detail: switch2Ok
          ? '直接按 PB1 成功讓 K1 重新激磁並迫使 K2 釋放，實現完美的雙向無縫互鎖切換！'
          : '切回失敗！按 PB1 時無法順利切回 K1',
      });

      // Step 5: 停止測試 (按下 PB2 停止 K1)
      pb2.isActive = true;
      simulateStep(g, size, 4);
      const k1Stopped = !k1Coil.isActive;
      pb2.isActive = false;
      simulateStep(g, size, 4);
      const stop1Ok = k1Stopped && !k1Coil.isActive && !k2Coil.isActive;
      steps.push({
        stepName: '按下停止按鈕 PB2 停機',
        passed: stop1Ok,
        detail: stop1Ok ? '按下 PB2 成功切斷 K1 並安全停機 (正確)' : 'PB2 未能切斷 K1 迴路',
      });

      // Step 6: 啟動 K2 後，按下 PB4 停止 K2
      pb3.isActive = true;
      simulateStep(g, size, 4);
      pb3.isActive = false;
      simulateStep(g, size, 5);
      pb4.isActive = true;
      simulateStep(g, size, 4);
      const k2Stopped = !k2Coil.isActive;
      pb4.isActive = false;
      simulateStep(g, size, 4);
      const stop2Ok = k2Stopped && !k1Coil.isActive && !k2Coil.isActive;
      steps.push({
        stepName: '按下停止按鈕 PB4 停機',
        passed: stop2Ok,
        detail: stop2Ok ? '按下 PB4 成功切斷 K2 並安全停機 (正確)' : 'PB4 未能切斷 K2 迴路',
      });

      const allPassed = initOk && k1Latched && switch1Ok && switch2Ok && stop1Ok && stop2Ok;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！成功掌握後動作優先（後按優先／後入優先）互鎖切換電路！'
          : '後動作優先驗證未完全通過，請檢查自保持支路中 NC 接點之互鎖接線。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-3-3: 三相感應馬達正反轉
  // --------------------------------------------------------------------------
  'w-3-3': {
    levelId: 'w-3-3',
    title: 'w-3-3 三相感應馬達正反轉',
    category: '第三大類：互鎖與安全控制',
    description: '結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。',
    guideHint: '正轉 MC1 激磁時馬達正相序運轉；反轉 MC2 激磁時對調兩條相線逆相序運轉。兩者必須嚴格電氣互鎖！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNc = getOrFindTile(g, 1, 1, 'btn', 'nc');
      const btnNo1 = getOrFindTile(g, 1, 5, 'btn', 'no');
      const coilK1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1');
      const btnNo2 = getOrFindTile(g, 3, 5, 'btn', 'no');
      const coilK2 = getOrFindTile(g, 3, 7, 'relay', 'coil', 'K2');
      const motor = getOrFindTile(g, 7, 5, 'motor');

      if (!btnNc || !btnNo1 || !coilK1 || !btnNo2 || !coilK2 || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕、線圈或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 正轉啟動 (Forward Start)
      btnNc.isActive = false;
      btnNo1.isActive = true;
      btnNo2.isActive = false;
      simulateStep(g, size, 4);
      btnNo1.isActive = false;
      simulateStep(g, size, 5);
      const fwdOk = !!coilK1.isActive && !!motor.isPowered && motor.motorDir > 0;
      steps.push({
        stepName: '正轉啟動 (Forward Run)',
        passed: fwdOk,
        detail: fwdOk
          ? 'MC1 激磁，馬達順向正轉運轉 (↻ FWD) 且自保持成立 (正確)'
          : '正轉啟動失敗，請檢查 MC1 控制迴路與馬達主迴路接線',
      });

      // Step 2: 正轉運轉中的互鎖保護
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      const fwdInterlock = !coilK2.isActive && !!coilK1.isActive;
      btnNo2.isActive = false;
      simulateStep(g, size, 4);
      steps.push({
        stepName: '正轉運轉互鎖防護',
        passed: fwdInterlock,
        detail: fwdInterlock ? '正轉時按反轉按鈕無效，成功防止相間短路 (正確)' : '互鎖失敗！正轉時反轉接觸器投入，造成重大短路！',
      });

      // Step 3: 停機
      btnNc.isActive = true;
      simulateStep(g, size, 4);
      btnNc.isActive = false;
      simulateStep(g, size, 4);

      // Step 4: 反轉啟動 (Reverse Start)
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      btnNo2.isActive = false;
      simulateStep(g, size, 5);
      const revOk = !!coilK2.isActive && !!motor.isPowered && motor.motorDir < 0;
      steps.push({
        stepName: '反轉啟動 (Reverse Run)',
        passed: revOk,
        detail: revOk
          ? 'MC2 激磁，馬達逆向反轉運轉 (↺ REV) 且自保持成立 (正確)'
          : '反轉啟動失敗，請檢查 MC2 控制迴路與對調相序接線',
      });

      // Step 5: 反轉運轉中的互鎖保護
      btnNo1.isActive = true;
      simulateStep(g, size, 4);
      const revInterlock = !coilK1.isActive && !!coilK2.isActive;
      btnNo1.isActive = false;
      simulateStep(g, size, 4);
      steps.push({
        stepName: '反轉運轉互鎖防護',
        passed: revInterlock,
        detail: revInterlock ? '反轉時按正轉按鈕無效，互鎖安全可靠 (正確)' : '互鎖失敗！反轉時正轉接觸器投入，造成重大短路！',
      });

      const allPassed = fwdOk && fwdInterlock && revOk && revInterlock;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！三相感應馬達正反轉 (FWD/REV) 與安全互鎖驗證完全正確！'
          : '正反轉控制未完全通過，請檢查正轉/反轉主迴路相序與控制迴路互鎖。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-3-4: 順序啟動 (Sequential Start)
  // --------------------------------------------------------------------------
  'w-3-4': {
    levelId: 'w-3-4',
    title: 'w-3-4 順序啟動 (Sequential Start)',
    category: '第三大類：互鎖與安全控制',
    description: '廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。',
    guideHint: '將接觸器 MC1 的常開接點 (NO) 串在接觸器 MC2 的控制幹線上。當 MC1 未吸磁時，MC2 根本無電可用！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNc = getOrFindTile(g, 1, 1, 'btn', 'nc');
      const btnNo1 = getOrFindTile(g, 1, 5, 'btn', 'no');
      const coilK1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1');
      const btnNo2 = getOrFindTile(g, 3, 5, 'btn', 'no');
      const coilK2 = getOrFindTile(g, 3, 7, 'relay', 'coil', 'K2');
      const motor1 = getOrFindTile(g, 6, 7, 'motor');
      const motor2 = getOrFindTile(g, 8, 7, 'motor');

      if (!btnNc || !btnNo1 || !coilK1 || !btnNo2 || !coilK2 || !motor1 || !motor2) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕、線圈或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 順序阻斷測試：尚未啟動馬達 1 前，先按按鈕 2
      btnNc.isActive = false;
      btnNo1.isActive = false;
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      btnNo2.isActive = false;
      simulateStep(g, size, 4);
      const seqBlockOk = !coilK2.isActive && !motor2.isPowered;
      steps.push({
        stepName: '尚未啟動 A 之前阻斷 B (順序條件驗證)',
        passed: seqBlockOk,
        detail: seqBlockOk
          ? '未啟動馬達 A 時，按下按鈕 2 馬達 B 保持靜止 (正確順序聯鎖)'
          : '❌ 順序啟動失敗！未啟動馬達 A 之前，馬達 B 竟然啟動了！請將 MC1 的常開接點串在 MC2 啟動線上。',
      });

      // Step 2: 啟動馬達 1 (A)
      btnNo1.isActive = true;
      simulateStep(g, size, 4);
      btnNo1.isActive = false;
      simulateStep(g, size, 5);
      const m1Ok = !!coilK1.isActive && !!motor1.isPowered;
      steps.push({
        stepName: '啟動馬達 A (先導馬達運轉)',
        passed: m1Ok,
        detail: m1Ok ? '馬達 A 成功啟動並自保持運轉 (正確)' : '馬達 A 啟動失敗，請檢查 PB1 迴路',
      });

      // Step 3: 啟動馬達 2 (B)
      btnNo2.isActive = true;
      simulateStep(g, size, 4);
      btnNo2.isActive = false;
      simulateStep(g, size, 5);
      const m2Ok = !!coilK2.isActive && !!motor2.isPowered && !!motor1.isPowered;
      steps.push({
        stepName: '在 A 運轉中啟動馬達 B',
        passed: m2Ok,
        detail: m2Ok ? '馬達 A 運轉中，按鈕 2 成功啟動馬達 B (兩台馬達同時運轉正確)' : '馬達 B 啟動失敗',
      });

      // Step 4: 連鎖停機測試：按下停止按鈕，A、B 必須同時停止！
      btnNc.isActive = true;
      simulateStep(g, size, 4);
      btnNc.isActive = false;
      simulateStep(g, size, 4);
      const bothStop = !motor1.isPowered && !motor2.isPowered && !coilK1.isActive && !coilK2.isActive;
      steps.push({
        stepName: '連鎖停機 (A 停 B 跟著停)',
        passed: bothStop,
        detail: bothStop
          ? '按下停止按鈕，馬達 A 停止且馬達 B 連鎖自動停止 (連鎖安全特性符合規範)'
          : '❌ 連鎖停機失敗！馬達 A 停止後，馬達 B 竟然持續運轉！',
      });

      const allPassed = seqBlockOk && m1Ok && m2Ok && bothStop;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！抽風機順序啟動與連鎖停機 (Sequential Start) 驗證全數通過！'
          : '順序控制未完全通過，請確認 MC1 常開接點是否串入 MC2 迴路。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-4-1: 通電延遲 (ON-Delay)
  // --------------------------------------------------------------------------
  'w-4-1': {
    levelId: 'w-4-1',
    title: 'w-4-1 通電延遲 (ON-Delay)',
    category: '第四大類：時間控制與自動化',
    description: '按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。',
    guideHint: 'TON 接點特性：線圈通電開始計時；時限到達前，NC 接通 (警報響)；時限到達後，NC 斷開、NO 閉合 (馬達運轉)。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNo = getOrFindTile(g, 1, 3, 'btn', 'no');
      const coilT1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'T1');
      const light = getOrFindTile(g, 5, 7, 'load', 'lightbulb');
      const motor = getOrFindTile(g, 7, 7, 'motor');
      const tonNc = getOrFindTile(g, 5, 1, 'relay', 'ton_nc', 'T1');
      const tonNo = getOrFindTile(g, 7, 1, 'relay', 'ton_no', 'T1');

      if (!btnNo || !coilT1 || !light || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕、計時器 T1、燈泡或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 按下啟動按鈕
      btnNo.isActive = true;
      simulateStep(g, size, 4);
      btnNo.isActive = false;
      simulateStep(g, size, 5);
      const t1Start = !!coilT1.isActive;
      steps.push({
        stepName: '啟動 Timer 計時器 (T1 激磁自保持)',
        passed: t1Start,
        detail: t1Start ? 'Timer T1 成功激磁並開始計時 (正確)' : '按下按鈕後 Timer T1 未激磁自保持，請檢查接線',
      });

      // Step 2: 延遲 3 秒內階段 (t < 3s)
      if (tonNc) tonNc.isPoweredAt = Date.now();
      if (tonNo) tonNo.isPoweredAt = Date.now();
      simulateStep(g, size, 4);
      const delayPhaseOk = !!light.isPowered && !motor.isPowered;
      steps.push({
        stepName: '延遲計時階段 (0 ~ 3 秒)：警報預警',
        passed: delayPhaseOk,
        detail: delayPhaseOk
          ? '延遲 3 秒內：警報器/指示燈持續動作，馬達安全靜止 (正確 TON-NC 特性)'
          : '延遲階段異常，請檢查 TON-NC 接點接指示燈、TON-NO 接馬達',
      });

      // Step 3: 延遲 3 秒後時限到達 (t >= 3s)
      if (tonNc) tonNc.isPoweredAt = Date.now() - 3500;
      if (tonNo) tonNo.isPoweredAt = Date.now() - 3500;
      simulateStep(g, size, 5);
      const runPhaseOk = !light.isPowered && !!motor.isPowered;
      steps.push({
        stepName: '時限到達階段 (t >= 3 秒)：切換馬達運轉',
        passed: runPhaseOk,
        detail: runPhaseOk
          ? '計時 3 秒完畢：警報切斷熄滅，馬達自動接通全速運轉！(通電延遲正確成立)'
          : '3 秒後未正確切換至馬達運轉，請檢查 TON-NO 接點接線',
      });

      const allPassed = t1Start && delayPhaseOk && runPhaseOk;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！通電延遲 (ON-Delay) 自動化時序控制完全正確！'
          : '通電延遲時序動作未完全通過，請檢查 TON 接點接線。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-4-2: 自動停止 (Auto-Stop)
  // --------------------------------------------------------------------------
  'w-4-2': {
    levelId: 'w-4-2',
    title: 'w-4-2 自動停止 (Auto-Stop)',
    category: '第四大類：時間控制與自動化',
    description: '馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。',
    guideHint: '將通電延遲常閉接點 (TON-NC) 串聯在自保持電路的主幹線上。5 秒後接點彈開，自保持自動斷電復歸！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNo = getOrFindTile(g, 1, 5, 'btn', 'no');
      const coilT1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'T1');
      const tonNc = getOrFindTile(g, 1, 3, 'relay', 'ton_nc', 'T1');
      const motor = getOrFindTile(g, 5, 7, 'motor');

      if (!btnNo || !coilT1 || !motor) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（啟動按鈕、計時器 T1 或馬達未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 啟動運轉
      btnNo.isActive = true;
      simulateStep(g, size, 4);
      btnNo.isActive = false;
      if (tonNc) tonNc.isPoweredAt = Date.now();
      simulateStep(g, size, 5);
      const runOk = !!coilT1.isActive && !!motor.isPowered;
      steps.push({
        stepName: '啟動運轉與計時開始',
        passed: runOk,
        detail: runOk ? '按下啟動按鈕後，馬達立即運轉且 Timer 開始 5 秒計時 (正確)' : '啟動失敗，請檢查啟動自保持迴路',
      });

      // Step 2: 5 秒計時完畢自動切斷
      if (tonNc) tonNc.isPoweredAt = Date.now() - 5500;
      simulateStep(g, size, 5);
      const autoStopOk = !motor.isPowered && !coilT1.isActive;
      steps.push({
        stepName: '5 秒自動停止 (TON-NC 開啟斷電)',
        passed: autoStopOk,
        detail: autoStopOk
          ? '5 秒時限到達，TON-NC 接點自動開啟切斷自保持，馬達自動安全停機 (自動停止成立)'
          : '❌ 5 秒後馬達未自動停止！請確認是否已將 TON-NC 接點串聯在控制線路上。',
      });

      const allPassed = runOk && autoStopOk;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！自動停止 (Auto-Stop) 時序控制驗證完全正確！'
          : '自動停止未完全通過，請檢查 TON-NC 接點是否串在自保持電源端。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-4-3: 閃爍與交替控制 (Flasher)
  // --------------------------------------------------------------------------
  'w-4-3': {
    levelId: 'w-4-3',
    title: 'w-4-3 閃爍與交替控制 (Flasher)',
    category: '第四大類：時間控制與自動化',
    description: '利用閃爍繼電器 (F1) 或雙 Timer，控制紅 (PL1) 與綠 (PL2) 兩顆指示燈交互閃爍。',
    guideHint: '閃爍繼電器 F1 激磁時會週期性導通/斷開其接點。使用 F1 的常閉接點接紅燈，常開接點接綠燈，即可達成反相交替閃爍！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNo = getOrFindTile(g, 1, 3, 'btn', 'no');
      const coilK1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1');
      const flashCoil = getOrFindTile(g, 3, 7, 'relay', 'flash_coil', 'F1');
      const lightRed = getOrFindTile(g, 5, 7, 'load', 'lightbulb');
      const lightGreen = getOrFindTile(g, 7, 7, 'load', 'lightbulb');

      if (!btnNo || !coilK1 || !flashCoil || !lightRed || !lightGreen) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（按鈕、閃爍電驛 F1 或紅綠指示燈未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 啟動系統
      btnNo.isActive = true;
      simulateStep(g, size, 4);
      btnNo.isActive = false;
      simulateStep(g, size, 5);
      const startOk = !!coilK1.isActive;
      steps.push({
        stepName: '啟動控制迴路 (K1 自保持激磁)',
        passed: startOk,
        detail: startOk ? '主接觸器 K1 激磁自保持正常 (正確)' : '啟動失敗，請檢查啟動按鈕與 K1 接線',
      });

      // Step 2: 週期前半段 (Phase 1: F1 接點未吸合時 -> 紅燈亮, 綠燈滅)
      flashCoil.isPoweredAt = Date.now() - 200; // t % 2000 < 1000
      simulateStep(g, size, 4);
      const phase1Ok = !!lightRed.isPowered && !lightGreen.isPowered;
      steps.push({
        stepName: '交替週期前半段 (0~1s)：紅燈亮、綠燈滅',
        passed: phase1Ok,
        detail: phase1Ok
          ? '前半週期：NC 接點導通紅燈 PL1，NO 接點斷開綠燈 PL2 (正確)'
          : '前半週期狀態有誤，請確認紅燈是否接在 F1-NC、綠燈接在 F1-NO',
      });

      // Step 3: 週期後半段 (Phase 2: F1 接點吸合時 -> 紅燈滅, 綠燈亮)
      flashCoil.isPoweredAt = Date.now() - 1200; // t % 2000 >= 1000
      simulateStep(g, size, 4);
      const phase2Ok = !lightRed.isPowered && !!lightGreen.isPowered;
      steps.push({
        stepName: '交替週期後半段 (1~2s)：紅燈滅、綠燈亮',
        passed: phase2Ok,
        detail: phase2Ok
          ? '後半週期：NC 接點斷開紅燈 PL1，NO 接點閉合綠燈 PL2 (反相交替閃爍成立！)'
          : '後半週期狀態有誤，未實現交互閃爍',
      });

      const allPassed = startOk && phase1Ok && phase2Ok;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！紅綠雙燈交互閃爍與交替控制 (Flasher) 驗證完全正確！'
          : '交替閃爍控制未完全通過，請檢查 F1 常閉/常開接點與雙燈接線。',
        steps,
      };
    },
  },

  // --------------------------------------------------------------------------
  // w-4-4: 星角降壓啟動 (Y-Δ Starting)
  // --------------------------------------------------------------------------
  'w-4-4': {
    levelId: 'w-4-4',
    title: 'w-4-4 星角降壓啟動 (Y-Δ Starting)',
    category: '第四大類：時間控制與自動化',
    description: '大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。',
    guideHint: 'Star 啟動階段：MC1 (主接觸器) 與 MC2 (星接) 同時激磁；3 秒後 Timer 切換：MC2 切斷，MC3 (角接) 激磁全壓運轉！MC2 與 MC3 必須嚴格電氣互鎖！',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const btnNo = getOrFindTile(g, 1, 3, 'btn', 'no');
      const coilK1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'K1'); // Main Contactor
      const timerT1 = getOrFindTile(g, 3, 7, 'relay', 'coil', 'T1'); // Timer
      const coilK2 = getOrFindTile(g, 5, 7, 'relay', 'coil', 'K2'); // Star Contactor
      const coilK3 = getOrFindTile(g, 7, 7, 'relay', 'coil', 'K3'); // Delta Contactor
      const tonNcT1 = getOrFindTile(g, 5, 2, 'relay', 'ton_nc', 'T1');
      const tonNoT1 = getOrFindTile(g, 7, 2, 'relay', 'ton_no', 'T1');

      if (!btnNo || !coilK1 || !coilK2 || !coilK3) {
        return {
          allPassed: false,
          message: '盤面關鍵元件遺失（主接觸器 MC1、星接 MC2 或角接 MC3 未在預設位置）。',
          steps: [{ stepName: '元件定位檢查', passed: false, detail: '請確認所有預設元件皆保留在盤面上。' }],
        };
      }

      const steps: WiringStepResult[] = [];

      // Step 1: 啟動並進入 Y 接降壓階段 (Star Stage: MC1 ON, MC2 ON, MC3 OFF)
      btnNo.isActive = true;
      simulateStep(g, size, 4);
      btnNo.isActive = false;
      if (tonNcT1) tonNcT1.isPoweredAt = Date.now();
      if (tonNoT1) tonNoT1.isPoweredAt = Date.now();
      simulateStep(g, size, 5);

      const starStageOk = !!coilK1.isActive && !!coilK2.isActive && !coilK3.isActive;
      steps.push({
        stepName: 'Y 接降壓啟動階段 (Star Starting)：MC1 + MC2 激磁',
        passed: starStageOk,
        detail: starStageOk
          ? '主接觸器 MC1 與星接 MC2 激磁吸合，馬達進入 Y 接降壓啟動 (正確降低啟動電流)'
          : 'Y 接啟動異常！應為 MC1 激磁、MC2 激磁、MC3 關閉。請檢查 Timer TON-NC 與 MC3 互鎖接點',
      });

      // Step 2: 檢查 Star / Delta 互鎖防護
      const interlockSafety = !(coilK2.isActive && coilK3.isActive);
      steps.push({
        stepName: '星角電氣互鎖防護 (防相間短路)',
        passed: interlockSafety,
        detail: interlockSafety
          ? 'MC2 與 MC3 互鎖正常，絕對不同時吸合 (防止致命三相短路)'
          : '❌ 致命錯誤！MC2 (星接) 與 MC3 (角接) 同時激磁，引發相間金屬短路！',
      });

      // Step 3: 計時 3 秒完畢，切換至 Δ 接全壓運轉 (Delta Stage: MC1 ON, MC2 OFF, MC3 ON)
      if (tonNcT1) tonNcT1.isPoweredAt = Date.now() - 3500;
      if (tonNoT1) tonNoT1.isPoweredAt = Date.now() - 3500;
      simulateStep(g, size, 5);

      const deltaStageOk = !!coilK1.isActive && !coilK2.isActive && !!coilK3.isActive;
      steps.push({
        stepName: 'Δ 接全壓運轉階段 (Delta Running)：MC1 + MC3 激磁',
        passed: deltaStageOk,
        detail: deltaStageOk
          ? '3 秒到達：Timer 切斷 MC2 星接，順利接通 MC3 角接全壓運轉！(星角啟動成功切換)'
          : 'Δ 接切換異常！應為 MC1 激磁、MC2 關閉、MC3 激磁。請檢查 Timer TON-NO 與 MC2 互鎖接點',
      });

      const allPassed = starStageOk && interlockSafety && deltaStageOk;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！工業配線經典星角降壓啟動 (Y-Δ Starting) 驗證全數通過！'
          : '星角降壓啟動驗證未完全通過，請檢查時序 Timer 與星角接觸器互鎖。',
        steps,
      };
    },
  },

  'w-5-1': {
    levelId: 'w-5-1',
    title: 'w-5-1 過載保護 (Thermal Overload)',
    category: '第五章：保護與極限開關',
    description: '將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。',
    guideHint: '將 TH-RY 95-96 常閉接點串於控制電源迴路；將 TH-RY 97-98 常開接點並聯接至 OL 故障黃燈。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const steps: WiringStepResult[] = [];

      // Step 0: 靜態電路與短路檢查
      const staticRes = simulateStep(g, size, 2);
      if (staticRes.isShortCircuit) {
        return {
          allPassed: false,
          message: `❌ 電路發生嚴重短路：${staticRes.shortDetail}`,
          steps: [{ stepName: '短路防護安全檢查', passed: false, detail: staticRes.shortDetail || '電源短路' }],
        };
      }

      const btnOff = getOrFindTile(g, 1, 2, 'btn', 'nc', 'OFF');
      const btnOn = getOrFindTile(g, 1, 4, 'btn', 'no', 'ON');
      const coilMC1 = getOrFindTile(g, 1, 6, 'relay', 'coil', 'MC1');
      const thryNc = getOrFindTile(g, 1, 1, 'relay', 'nc', 'TH-RY');
      const thryNo = getOrFindTile(g, 5, 4, 'relay', 'no', 'TH-RY');
      const lampOL = getOrFindTile(g, 5, 6, 'load', 'lightbulb', 'OL');
      const motor = getOrFindTile(g, 7, 6, 'motor', 'motor', 'M1');
      const thryHeater = getOrFindTile(g, 7, 4, 'protection', 'ol_2p', 'TH-RY');

      if (!btnOn || !coilMC1) {
        return {
          allPassed: false,
          message: '缺少關鍵啟動按鈕或 MC1 線圈。',
          steps: [{ stepName: '元件完整性檢查', passed: false, detail: '請確認 PB_ON 與 MC1 接觸器已正確放置。' }],
        };
      }

      // Step 1: 正常啟動測試 (Normal Start & Self-Holding)
      btnOn.isActive = true;
      simulateStep(g, size, 3);
      btnOn.isActive = false;
      simulateStep(g, size, 5);

      const normalStartOk = !!coilMC1.isActive && !!motor?.isPowered && !lampOL?.isPowered;
      steps.push({
        stepName: '正常啟動與自保持測試 (Normal Start & Hold)',
        passed: normalStartOk,
        detail: normalStartOk
          ? '按 ON 啟動成功，MC1 激磁自保持，馬達順利運轉，OL 故障燈保持熄滅。'
          : '無法正常啟動！請檢查 MC1 啟動迴路與自保持常開輔助接點配線。',
      });

      // Step 2: 積熱電驛過載跳脫測試 (Overload Trip)
      if (thryHeater) thryHeater.isActive = true;
      if (thryNc) thryNc.isActive = true;
      if (thryNo) thryNo.isActive = true;
      simulateStep(g, size, 5);

      const overloadCutoffOk = !coilMC1.isActive && !motor?.isPowered;
      const overloadLampOk = !!lampOL?.isPowered;
      const overloadOk = overloadCutoffOk && overloadLampOk;

      steps.push({
        stepName: '過載跳脫保護測試 (TH-RY Trip Protection)',
        passed: overloadOk,
        detail: overloadOk
          ? 'TH-RY 95-96 (NC) 確實切斷 MC1 控制迴路，馬達安全停機；97-98 (NO) 導通點亮 OL 故障警示燈！'
          : `過載保護異常！${!overloadCutoffOk ? 'MC1 未被切斷停機 (95-96常閉接點未串入控制線)；' : ''}${!overloadLampOk ? 'OL 故障燈未亮 (97-98常開接點未串入警示燈)；' : ''}`,
      });

      // Step 3: 手動復歸測試 (Manual Reset)
      if (thryHeater) thryHeater.isActive = false;
      if (thryNc) thryNc.isActive = false;
      if (thryNo) thryNo.isActive = false;
      simulateStep(g, size, 5);

      const resetOk = !lampOL?.isPowered && !coilMC1.isActive && !motor?.isPowered;
      steps.push({
        stepName: '過載復歸安全鎖定測試 (Manual Reset Safety)',
        passed: resetOk,
        detail: resetOk
          ? 'TH-RY 復歸後 OL 燈熄滅，且馬達維持安全停機 (不會無預警自動重啟，符合工業安全規範)。'
          : '復歸異常！請確認 TH-RY 復歸後電路狀態。',
      });

      const allPassed = normalStartOk && overloadOk && resetOk;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！積熱電驛 (TH-RY) 過載保護與故障警報配線驗證全數通過！'
          : '過載保護配線驗證未完全通過，請檢查 TH-RY 95-96 常閉與 97-98 常開接點。',
        steps,
      };
    },
  },

  'w-5-2': {
    levelId: 'w-5-2',
    title: 'w-5-2 極限開關應用 (Limit Switch)',
    category: '第五章：保護與極限開關',
    description: '電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。',
    guideHint: '將上限極限開關 LS1 (NC 接點) 串接於上升接觸器 MC1 線圈前；撞擊 LS1 時切斷線圈達成自動停止。',
    verify: (grid, size) => {
      const g = cloneGrid(grid, size);
      const steps: WiringStepResult[] = [];

      // Step 0: 靜態電路與短路檢查
      const staticRes = simulateStep(g, size, 2);
      if (staticRes.isShortCircuit) {
        return {
          allPassed: false,
          message: `❌ 電路發生嚴重短路：${staticRes.shortDetail}`,
          steps: [{ stepName: '短路防護安全檢查', passed: false, detail: staticRes.shortDetail || '電源短路' }],
        };
      }

      const btnOff = getOrFindTile(g, 1, 1, 'btn', 'nc', 'OFF');
      const btnUp = getOrFindTile(g, 1, 3, 'btn', 'no', 'UP');
      const ls1 = getOrFindTile(g, 1, 5, 'btn', 'nc', 'LS1');
      const coilMC1 = getOrFindTile(g, 1, 7, 'relay', 'coil', 'MC1');
      const motor = getOrFindTile(g, 5, 7, 'motor', 'motor', 'M1');

      if (!btnUp || !coilMC1 || !ls1) {
        return {
          allPassed: false,
          message: '缺少關鍵上升按鈕、MC1 線圈或極限開關 LS1。',
          steps: [{ stepName: '元件完整性檢查', passed: false, detail: '請確認 PB_UP、MC1 與 LS1 已正確放置。' }],
        };
      }

      // Step 1: 按下 UP 啟動上升 (Roll Up & Hold)
      btnUp.isActive = true;
      simulateStep(g, size, 3);
      btnUp.isActive = false;
      simulateStep(g, size, 5);

      const upStartOk = !!coilMC1.isActive && !!motor?.isPowered;
      steps.push({
        stepName: '捲門上升啟動測試 (Roll Up & Self-Holding)',
        passed: upStartOk,
        detail: upStartOk
          ? '按 UP 啟動成功，MC1 激磁自保持，電動捲門馬達順暢上升運轉。'
          : '無法啟動上升！請檢查 PB_UP 與 MC1 輔助常開自保持接點配線。',
      });

      // Step 2: 捲門到達頂部，撞擊上限極限開關 LS1 (Hit Upper Limit)
      ls1.isActive = true;
      ls1.isPhysicallyPushed = true;
      simulateStep(g, size, 5);

      const limitStopOk = !coilMC1.isActive && !motor?.isPowered;
      steps.push({
        stepName: '上限極限開關自動停止測試 (Upper Limit Auto-Stop)',
        passed: limitStopOk,
        detail: limitStopOk
          ? '捲門觸碰 LS1 極限開關，LS1 常閉接點斷開，MC1 立即斷電釋放，捲門安全停於頂部！'
          : '極限開關未切斷！捲門未停止，可能導致捲門機構嚴重衝頂損壞。請將 LS1 常閉接點串入 MC1 線圈迴路。',
      });

      // Step 3: 極限開關釋放後的安全鎖定測試 (LS1 Released - Safe Lockout)
      ls1.isActive = false;
      ls1.isPhysicallyPushed = false;
      simulateStep(g, size, 5);

      const safetyLockOk = !coilMC1.isActive && !motor?.isPowered;
      steps.push({
        stepName: '自保持清除與安全防護測試 (Self-Holding Cleared Safety)',
        passed: safetyLockOk,
        detail: safetyLockOk
          ? '極限開關復歸後，MC1 依然維持斷電停機，自保持已徹底消除，非按 UP 不會重啟 (符合國家安全標準)。'
          : '自保持未解除！極限開關復歸後馬達意外重啟，極度危險！',
      });

      const allPassed = upStartOk && limitStopOk && safetyLockOk;
      return {
        allPassed,
        message: allPassed
          ? '🎉 恭喜通關！極限開關 (Limit Switch) 行程定位與自動停止配線驗證全數通過！'
          : '極限開關應用驗證未完全通過，請檢查 LS1 接線與 MC1 自保持迴路。',
        steps,
      };
    },
  },
};

/**
 * Get wiring specification for level
 */
export function getWiringLevelSpec(levelId: LogicLevelId): WiringLevelSpec | undefined {
  return WIRING_LEVEL_SPECS[levelId];
}

/**
 * Execute automated wiring circuit verification
 */
export function executeWiringVerification(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: LogicLevelId
): WiringVerificationResult {
  const spec = getWiringLevelSpec(levelId);
  if (!spec) {
    return {
      allPassed: false,
      message: '此關卡目前尚未啟用自動化驗證。',
      steps: [],
    };
  }

  return spec.verify(grid, gridSize);
}
