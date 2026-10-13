/**
 * @license
 * Junior High Basic Electricity Verification Engine (國中理化 基本電學電路檢驗引擎)
 * Auto Studio Pro - Evaluates student circuit configurations against 108 Curriculum physics requirements.
 */

import { Tile, NetData } from '../types';
import { buildNetState } from './NetEngine';
import { ElectronicEngine } from './ElectronicEngine';

export interface CircuitCheckResult {
  success: boolean;
  message: string;
}

export function verifyJuniorElectricityCircuit(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): CircuitCheckResult {
  // Helper to clone grid deeply
  const cloneGrid = (g: (Tile | null)[][]) =>
    g.map((row) =>
      row.map((cell) => (cell ? Object.assign(new Tile(), cell) : null))
    );

  // Helper to run ElectronicEngine simulation on a cloned grid
  const simulateGrid = (testGrid: (Tile | null)[][]) => {
    const { netMap, netCount } = buildNetState(
      testGrid,
      gridSize,
      gridSize,
      'electronic',
      { opens: [], shorts: [] }
    );
    const netData: NetData[] = Array(netCount + 1)
      .fill(0)
      .map(() => ({ color: '#4a5568', isHigh: false }));
    const meterVals = ElectronicEngine.simulate(testGrid, netMap, netData, '1');
    return { testGrid, netMap, netData, meterVals };
  };

  // Run initial simulation
  const { testGrid, netMap, meterVals } = simulateGrid(cloneGrid(grid));

  // Find components on the grid
  const findTiles = (type: string, subtype?: string) => {
    const results: { x: number; y: number; tile: Tile }[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const t = testGrid[y]?.[x];
        if (t && t.type === type) {
          if (!subtype || t.subtype === subtype || t.subtype.startsWith(subtype)) {
            results.push({ x, y, tile: t });
          }
        }
      }
    }
    return results;
  };

  switch (levelId) {
    // ----------------------------------------------------
    // 單元一：電路三要素與迴路觀念
    // ----------------------------------------------------
    case 'jh-1-1': {
      // 1-1 點亮第一盞燈（封閉迴路）
      const bulbs = findTiles('load', 'lightbulb');
      if (bulbs.length === 0) {
        return { success: false, message: '找不到燈泡，請不要刪除目標元件！' };
      }
      const litBulbs = bulbs.filter((b) => b.tile.isPowered);
      if (litBulbs.length > 0) {
        return {
          success: true,
          message: '🎉 太棒了！燈泡成功點亮！你已經成功建立了一個封閉的電路通路 (Closed Circuit)！',
        };
      }
      return {
        success: false,
        message: '小燈泡尚未點亮。請檢查導線是否從電池正極(+)經由燈泡連接回負極(-)，形成封閉迴路！',
      };
    }

    case 'jh-1-2': {
      // 1-2 開關的控制（斷路概念）
      const switches = findTiles('switch', 'spst');
      const bulbs = findTiles('load', 'lightbulb');
      if (switches.length === 0 || bulbs.length === 0) {
        return { success: false, message: '請保留開關與燈泡元件！' };
      }

      // Test with switch closed
      const gClosed = cloneGrid(grid);
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (gClosed[y][x]?.type === 'switch') gClosed[y][x]!.isActive = true;
        }
      }
      const simClosed = simulateGrid(gClosed);
      const closedBulbLit = simClosed.testGrid.some((row) =>
        row.some((t) => t?.type === 'load' && t.subtype === 'lightbulb' && t.isPowered)
      );

      // Test with switch open
      const gOpen = cloneGrid(grid);
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (gOpen[y][x]?.type === 'switch') gOpen[y][x]!.isActive = false;
        }
      }
      const simOpen = simulateGrid(gOpen);
      const openBulbLit = simOpen.testGrid.some((row) =>
        row.some((t) => t?.type === 'load' && t.subtype === 'lightbulb' && t.isPowered)
      );

      if (!closedBulbLit) {
        return {
          success: false,
          message: '開關閉合 (ON) 時燈泡沒有亮起。請檢查線路是否串聯了開關並接回電池！',
        };
      }
      if (openBulbLit) {
        return {
          success: false,
          message: '開關切斷 (OFF) 時燈泡依然發光！這表示電路繞過了開關，請確認開關是否正確『串聯』在主迴路上！',
        };
      }

      return {
        success: true,
        message: '🎉 驗證成功！開關成功控制了通路的開啟與斷路的切斷！',
      };
    }

    case 'jh-1-3':
    case 'jh-1-4': {
      // 1-3 (整合原 1-3 與 1-4): 短路現象與保險絲防護
      const fuses = findTiles('protection', 'fuse');
      const bulbs = findTiles('load', 'lightbulb');
      if (fuses.length === 0 || bulbs.length === 0) {
        return { success: false, message: '請保留保險絲與燈泡元件！' };
      }

      const fuse = fuses[0];
      // 1. 成功條件：保險絲成功熔斷（代表短路觸發超大電流並完成防護）
      if (fuse.tile.isBlown) {
        return {
          success: true,
          message:
            '🎉 恭喜！短路現象與保險絲防護驗證成功！\n\n' +
            '• 【短路現象】：開關閉合後，電流走捷徑避開燈泡（短路 Short Circuit），燈泡瞬間熄滅！\n' +
            '• 【保險絲熔斷防護】：短路導致迴路電阻幾近於零，瞬時電流暴增；保險絲因電流熱效應及時【💥 熔斷】切斷全路，成功防止電池受損與導線過熱起火！\n\n' +
            '👉 若想重複實驗，切換至「👆 互動」工具點擊保險絲即可更換新品重新通電。',
        };
      }

      // 2. 初始正常狀態：燈泡發光
      const bulb = bulbs[0];
      if (bulb.tile.isPowered) {
        return {
          success: false,
          message:
            '💡 目前電路正常供電發光。\n' +
            '👉 請使用「👆 互動」工具點擊閉合右側【短路開關】（或直接跨接導線）製造短路，親身體驗燈泡熄滅與保險絲【💥 熔斷】保護電路的完整過程！',
        };
      }

      return {
        success: false,
        message: '電路尚未通電。請確認電池、保險絲與燈泡均已正常連接！',
      };
    }

    // ----------------------------------------------------
    // 單元二：電壓與電池的串並聯
    // ----------------------------------------------------
    case 'jh-2-1': {
      // 2-1 伏特計的正確使用（並聯）
      const vMeters = findTiles('meter', 'v');
      const bulbs = findTiles('load', 'lightbulb');
      if (vMeters.length === 0 || bulbs.length === 0) {
        return { success: false, message: '請在畫面上保留伏特計 (V) 與小燈泡！' };
      }
      const vm = vMeters[0];
      const bulb = bulbs[0];
      const val = vm.tile.measureVal || 0;

      // 檢查是否誤接成串聯（伏特計有讀數，但燈泡因伏特計超大內阻而熄滅）
      if (Math.abs(val - 1.5) < 0.2 && !bulb.tile.isPowered) {
        return {
          success: false,
          message:
            '⚠️ 伏特計誤接成『串聯』了！\n' +
            '伏特計內部電阻極大，串聯在電路中會嚴重阻礙電流，導致小燈泡完全無法點亮！\n' +
            '👉 請確認主迴路正常點亮燈泡，並將伏特計跨接『並聯』在小燈泡兩端！',
        };
      }

      // 正確並聯：小燈泡正常發光，且伏特計精準測得 1.5V 端電壓
      if (Math.abs(val - 1.5) < 0.2 && bulb.tile.isPowered) {
        return {
          success: true,
          message:
            `🎉 測量成功！伏特計讀數為 ${val.toFixed(2)}V，且小燈泡持續正常發光！\n\n` +
            `• 【並聯測量核心概念】：\n` +
            `  1. 伏特計具有極大的內部電阻，必須與待測元件『並聯』跨接。\n` +
            `  2. 並聯時絕大部分電流仍流經小燈泡維持發光，僅極微小電流流入伏特計推動指針。\n` +
            `  3. 若誤將伏特計『串聯』，超大內阻會阻斷電流使燈泡熄滅。這次的並聯接法完全正確！`,
        };
      }

      if (val < 0.1) {
        return {
          success: false,
          message: '伏特計讀數為 0.00V。請檢查導線是否已正確將伏特計跨接『並聯』在發光小燈泡的兩端！',
        };
      }
      return {
        success: false,
        message: `目前伏特計讀數為 ${val.toFixed(2)}V，與 1.5V 電位差不符，請重新檢查接線！`,
      };
    }

    case 'jh-2-2': {
      // 2-2 電池串聯與極性方向（對照實驗）
      const bulbs = findTiles('load', 'lightbulb');
      if (bulbs.length === 0) return { success: false, message: '找不到燈泡！' };

      // 取得右側實驗組燈泡 (x > 5)
      const expBulb = bulbs.find((b) => b.x > 5) || bulbs[bulbs.length - 1];

      if (expBulb.tile.isPowered) {
        const current = expBulb.tile.currentA || 0;
        // 兩顆 1.5V 電池順向串聯輸出 3.0V，通過燈泡電流約為 0.06A (> 0.04A)
        if (current > 0.04) {
          return {
            success: true,
            message:
              '🎉 驗證成功！兩顆電池順向串聯提供 3.0V 電壓，右側燈泡散發出耀眼加倍的強光與光芒，亮度明顯超越左側 1.5V 對照組！',
          };
        } else {
          return {
            success: false,
            message:
              '右側燈泡目前僅有單顆電池的亮度 (1.5V)。請將兩顆電池「正極接負極」順向串聯以提升電壓至 3.0V！',
          };
        }
      }

      return {
        success: false,
        message:
          '右側實驗組燈泡尚未點亮。請檢查兩顆電池是否「正極接負極」順向串聯並接至燈泡！若極性接反電壓會相互抵消 (1.5V - 1.5V = 0V)！',
      };
    }

    case 'jh-2-3': {
      // 2-3 電池並聯實驗（對照實驗）
      const bulbs = findTiles('load', 'lightbulb');
      const batteries = findTiles('power', 'power_1_5v');
      if (bulbs.length === 0 || batteries.length < 2) {
        return { success: false, message: '請保留電池與燈泡！' };
      }

      // 取得右側實驗組燈泡 (x >= 5)
      const expBulb = bulbs.find((b) => b.x >= 5) || bulbs[bulbs.length - 1];
      const rightBats = batteries.filter((b) => b.x >= 5);

      if (rightBats.length >= 2) {
        const bat1 = rightBats[0];
        const bat2 = rightBats[1];
        const b1Top = netMap[bat1.y][bat1.x][(0 + bat1.tile.rotation) % 4];
        const b2Top = netMap[bat2.y][bat2.x][(0 + bat2.tile.rotation) % 4];
        const b1Bot = netMap[bat1.y][bat1.x][(2 + bat1.tile.rotation) % 4];
        const b2Bot = netMap[bat2.y][bat2.x][(2 + bat2.tile.rotation) % 4];

        const isParallel = b1Top > 0 && b1Top === b2Top && b1Bot > 0 && b1Bot === b2Bot;

        if (isParallel && expBulb.tile.isPowered) {
          return {
            success: true,
            message:
              '🎉 驗證成功！兩顆電池並聯輸出 1.5V 端電壓，右側燈泡與左側基準亮度完全相同，但兩顆電池各自分攤 50% 電流，供電壽命加倍！',
          };
        }
        if (!isParallel) {
          return {
            success: false,
            message: '右側兩顆電池尚未正確並聯！請將兩顆電池的上方正極接在一起、下方負極接在一起！',
          };
        }
      }

      if (expBulb.tile.isPowered) {
        return {
          success: true,
          message: '🎉 驗證成功！並聯電池電壓不變 (1.5V)，各自分攤一半電流，延長供電壽命！',
        };
      }

      return {
        success: false,
        message: '右側燈泡尚未亮起。請用導線將並聯幹線連接至右側燈泡形成通路！',
      };
    }

    // ----------------------------------------------------
    // 單元三：電流與歐姆定律
    // ----------------------------------------------------
    case 'jh-3-1': {
      // 3-1 安培計的正確使用（串聯）
      const aMeters = findTiles('meter', 'a');
      if (aMeters.length === 0) return { success: false, message: '找不到安培計 (A)！' };

      const am = aMeters[0];
      const val = am.tile.measureVal || 0;

      // 1.5V / 10 Ohm = 0.15A
      if (Math.abs(val - 0.15) < 0.04) {
        return {
          success: true,
          message: `🎉 測量成功！安培計讀數為 ${(val * 1000).toFixed(0)} mA (${val.toFixed(2)}A)！記住：安培計內阻極小，必須『串聯』在電路中！`,
        };
      }
      if (val > 1.0) {
        return {
          success: false,
          message: '⚠️ 危險！安培計讀數過大，你可能直接將安培計並聯在電源兩端造成短路！請將安培計與電阻串聯！',
        };
      }
      return {
        success: false,
        message: `目前安培計讀數為 ${val.toFixed(2)}A。請檢查安培計是否與 10Ω 電阻串聯後接上電池！`,
      };
    }

    case 'jh-3-2': {
      // 3-2 歐姆定律實驗探討 (V = IR)
      const aMeters = findTiles('meter', 'a');
      if (aMeters.length === 0) return { success: false, message: '找不到安培計 (A)！' };

      const am = aMeters[0];
      const val = am.tile.measureVal || 0;

      // 3.0V / 10 Ohm = 0.30A
      if (Math.abs(val - 0.30) < 0.05) {
        return {
          success: true,
          message: `🎉 驗證成功！電壓提升至 3.0V 時，安培計讀數翻倍為 ${(val * 1000).toFixed(0)} mA (${val.toFixed(2)}A)，完美驗證歐姆定律 V = IR（定溫下 I 與 V 成正比）！`,
        };
      }
      if (Math.abs(val - 0.15) < 0.04) {
        return {
          success: false,
          message: '目前安培計讀數為 150mA（單顆電池 1.5V）。請將第二顆電池順向串聯進電路中（提升至 3.0V），觀察電流是否翻倍至 300mA！',
        };
      }
      return {
        success: false,
        message: `目前安培計讀數為 ${val.toFixed(2)}A。請確認兩顆電池串聯成 3.0V 並連接至 10Ω 電阻！`,
      };
    }

    case 'jh-3-3': {
      // 3-3 滑動變阻器調光器（一上一下接法）
      const bulbs = findTiles('load', 'lightbulb');
      const aMeters = findTiles('meter', 'a');
      const rheoMids = findTiles('resistor', 'var_mid');
      const rheoLefts = findTiles('resistor', 'var_left');
      const rheoRights = findTiles('resistor', 'var_right');

      if (bulbs.length === 0 || aMeters.length === 0 || rheoMids.length === 0) {
        return { success: false, message: '請保留 12V 電源、滑動變阻器、安培計與燈泡元件！' };
      }

      const bulb = bulbs[0];
      const am = aMeters[0];
      const rMid = rheoMids[0];
      const rLeft = rheoLefts[0];
      const rRight = rheoRights[0];

      // 檢查 A、B、C 各接點所屬電網 (netId)
      // A 端在 var_left 的 Pin 3 (左側)
      const pA = rLeft ? netMap[rLeft.y][rLeft.x][(3 + rLeft.tile.rotation) % 4] : 0;
      // B 端在 var_right 的 Pin 1 (右側)
      const pB = rRight ? netMap[rRight.y][rRight.x][(1 + rRight.tile.rotation) % 4] : 0;
      // C 端在 var_mid 的 Pin 0 (上方滑片接點)
      const pC = netMap[rMid.y][rMid.x][(0 + rMid.tile.rotation) % 4];

      // 經典錯誤檢測：誤接「兩下」（A 端與 B 端），導致整根電阻線變成定值電阻，滑片失效
      if (pA > 0 && pB > 0 && pC === 0) {
        return {
          success: false,
          message:
            '⚠️ 觀念警示：你將導線接到了【A 端與 B 端（接兩下）】！此時電流流經整根電阻線圈，變成固定電阻，滑片完全失去調光作用！請依照理化手冊改接【一上（C 端滑片）一下（A 端線圈）】！',
        };
      }

      if (!bulb.tile.isPowered) {
        return {
          success: false,
          message:
            '電路尚未形成通路！請用導線將電源接至變阻器【A 端（下方線圈）】，並從【C 端（上方滑片）】引出導線接往安培計與燈泡！',
        };
      }

      const currentA = Math.abs(am.tile.measureVal || 0);
      if (currentA < 0.17) {
        return {
          success: false,
          message: `💡 很好！電路已成功形成通路（一上一下串聯），目前安培計讀數為 ${(currentA * 1000).toFixed(0)} mA（微弱光）。現在請切換到「👆 互動」模式，將變阻器滑桿【向左拖曳】以縮短電阻線長度（R ∝ L）、減小電阻，將電流調至 180mA 以上使燈泡爆發強光！`,
        };
      }

      return {
        success: true,
        message: `🎉 完美通關！你成功運用「一上一下」接法將滑動變阻器串聯入電路，並透過向左拖動滑片縮短有效長度（R ∝ L），將電流提升至 ${(currentA * 1000).toFixed(0)} mA 點亮耀眼強光！深刻掌握了歐姆定律 (I = V/R) 與變阻器的物理調控機制！`,
      };
    }

    // ----------------------------------------------------
    // 單元四：串聯與並聯電路大對決
    // ----------------------------------------------------
    case 'jh-4-1': {
      // 4-1 燈泡串聯：分壓與變暗（對照實驗）
      const bulbs = findTiles('load', 'lightbulb');
      if (bulbs.length < 2) return { success: false, message: '請保留燈泡！' };

      // 右側實驗組雙燈 (x >= 5)
      const expBulbs = bulbs.filter((b) => b.x >= 5);
      const allLit = expBulbs.length >= 2 && expBulbs.every((b) => b.tile.isPowered);

      if (allLit) {
        return {
          success: true,
          message:
            '🎉 驗證成功！串聯電路中兩燈各分得一半電壓 (6.0V + 6.0V = 12.0V)，亮度顯著衰減為柔和暗光；對比左側 12V 滿額全亮基準燈泡，一目了然！',
        };
      }
      return {
        success: false,
        message: '右側兩顆串聯燈泡尚未完全亮起。請檢查串聯迴路導線是否完整接通！',
      };
    }

    case 'jh-4-2': {
      // 4-2 燈泡並聯：等壓與獨立控制
      const bulbs = findTiles('load', 'lightbulb');
      if (bulbs.length < 2) return { success: false, message: '請保留兩顆燈泡元件！' };

      const litCount = bulbs.filter((b) => b.tile.isPowered).length;

      if (litCount === 2) {
        return {
          success: true,
          message:
            '🎉 完美通關！兩盞燈泡成功並聯接通，各自獲得滿額 12.0V 電壓（保持全亮）！請切換至「👆 互動」模式隨意切換任一開關，觀察另一盞燈依然常亮，親身體驗家用電路「並聯等壓、獨立控制、互不干擾」的真正優勢！',
        };
      }
      if (litCount === 1) {
        return {
          success: false,
          message:
            '💡 目前只有客廳燈發光。請在右側房間燈支路（第 9 欄）開關與燈泡之間的缺口處補上一條垂直導線，將房間燈並聯入電路！',
        };
      }
      return {
        success: false,
        message: '電路尚未接通。請補上導線並確認開關閉合，使兩盞燈泡皆並聯通電！',
      };
    }

    case 'jh-4-3': {
      // 4-3 串聯處處等電流 vs 並聯分流定律
      const aMeters = findTiles('meter', 'a');
      const bulbs = findTiles('load', 'lightbulb');
      if (aMeters.length < 3 || bulbs.length < 2) {
        return { success: false, message: '請保留幹線安培計、支路安培計與燈泡元件！' };
      }

      // 檢查兩盞燈是否都已接通發光
      const litBulbs = bulbs.filter((b) => b.tile.isPowered);
      if (litBulbs.length < 2) {
        return {
          success: false,
          message:
            '💡 目前只有支路 1 接通（幹線與支路 1 皆為 240mA）。請在右側支路 2（第 9 欄）安培計與燈泡之間補上一條垂直導線，將支路 2 並聯接通，觀察總電流如何翻倍躍升至 480mA！',
        };
      }

      // 取得主幹線安培計 (位於 Row 2) 讀數
      const mainMeter = aMeters.find((m) => m.y === 2);
      const mainVal = Math.round((mainMeter?.tile.measureVal || 0) * 1000);

      return {
        success: true,
        message:
          `🎉 驗證成功！主幹線安培計讀數為 ${mainVal} mA，精確等於兩條支路電流之和 (240mA + 240mA = 480mA)！親眼見證克希荷夫電流定律：並聯總電流等於各支路電流總和 (I_total = I_1 + I_2)！`,
      };
    }

    // ----------------------------------------------------
    // 單元五：電功率與家庭用電安全
    // ----------------------------------------------------
    case 'jh-5-1': {
      // 5-1 電功率與亮度陷阱題
      const bulbs = findTiles('load', 'lightbulb');
      if (bulbs.length < 2) return { success: false, message: '請保留燈泡！' };

      const atLeastTwoLit = bulbs.filter((b) => b.tile.isPowered).length >= 2;
      if (atLeastTwoLit) {
        return {
          success: true,
          message:
            '🎉 恭喜破解國中段考必考陷阱！左側串聯時電流相同，大電阻較亮 (40Ω 消耗 2.3W)；右側並聯時電壓相同，小電阻反而爆亮 (10Ω 消耗 14.4W)！左右並排，亮度瞬間顛倒！',
        };
      }
      return {
        success: false,
        message: '請確認電路供電使燈泡發光，並比較左右兩側的亮度差異！',
      };
    }

    case 'jh-5-2': {
      // 5-2 家庭電路過載跳脫保護
      const mcbs = findTiles('breaker', 'mcb');
      if (mcbs.length === 0) return { success: false, message: '找不到無熔絲開關 (NFB)！' };

      const mcb = mcbs[0];
      const switches = findTiles('switch', 'spst');

      // 檢查 NFB 是否已因過載跳脫
      if (!mcb.tile.isActive) {
        return {
          success: true,
          message:
            '🎉 驗證成功！家庭插座並聯多部大功率電器時，總電流暴增超過 15A（吹風機 9.2A + 電鍋 7.3A = 16.5A > 15A），無熔絲開關 (NFB) 瞬間自動跳脫（💥 TRIPPED）切斷電源，成功防止電線過熱走火！\n\n💡 復歸實作：請先關閉電鍋開關，再點擊 NFB 即可手動復歸（Reset）恢復安全供電！',
        };
      }

      // 若尚未跳脫，引導學生依序開啟電器觸發過載
      const activeSwitches = switches.filter((s) => s.tile.isActive);
      if (activeSwitches.length === 0) {
        return {
          success: false,
          message:
            '💡 目前電器開關皆為斷開狀態。請切換至「👆 互動」模式，先點擊開啟【吹風機開關】(12Ω)，再開啟【電鍋開關】(15Ω)（或【烤箱開關】），親自觀察總電流超過 15A 時 NFB 的自動跳脫保護！',
        };
      }

      if (activeSwitches.length === 1) {
        return {
          success: false,
          message:
            '💡 目前僅開啟單一電器（總電流 < 15A，NFB 正常供電中）。請再開啟第二部大功率電器（例如【電鍋開關】），使並聯總電流暴增超過 15A 額定上限，觸發 NFB 跳脫！',
        };
      }

      return {
        success: false,
        message: '💡 並聯總電流已超過 15A，請觀察無熔絲開關 (NFB) 是否已自動跳脫切斷電源！',
      };
    }

    default:
      return { success: false, message: `關卡 ${levelId} 暫無自動驗證邏輯` };
  }
}
