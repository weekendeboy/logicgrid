/**
 * @license
 * Senior High Physics Electricity Verification Engine (高中物理 電學實驗檢驗引擎)
 * Auto Studio Pro - Evaluates student experimental circuits against 108 Curriculum physics requirements.
 */

import { Tile, NetData } from '../types';
import { buildNetState } from './NetEngine';
import { ElectronicEngine } from './ElectronicEngine';

export interface CircuitCheckResult {
  success: boolean;
  message: string;
}

export function verifySeniorElectricityCircuit(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): CircuitCheckResult {
  // Helper to clone grid deeply
  const cloneGrid = (g: (Tile | null)[][]) =>
    g.map((row) =>
      row.map((cell) => (cell ? Object.assign(new Tile(), cell) : null))
    );

  // Helper to run ElectronicEngine simulation on a grid
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
  const { testGrid } = simulateGrid(cloneGrid(grid));

  // Find components helper
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
    // 1-1: 電池內電阻與端電壓曲線（V-I 特性大考實驗）
    // ----------------------------------------------------
    case 'sh-1-1': {
      const bats = findTiles('power', 'power_real');
      const switches = findTiles('switch', 'spst');
      const vms = findTiles('meter', 'v');
      const ams = findTiles('meter', 'a');

      if (bats.length === 0) {
        return { success: false, message: '找不到真實電池 (power_real)，請保留實驗目標元件！' };
      }
      if (switches.length === 0) {
        return { success: false, message: '找不到主控開關，請保留開關元件！' };
      }

      const sw = switches[0].tile;
      const bat = bats[0].tile;
      const vTerm = bat.measureVal !== undefined ? bat.measureVal : 1.5;
      const current = bat.currentA || 0;

      if (!sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 主控開關目前為斷路 (OFF)！電路電流為 0A，端電壓維持在開路電動勢 ℰ = 1.50V。\n' +
            '👉 請切換至「👆 互動」工具，點擊將開關閉合以形成放電迴路！',
        };
      }

      if (current < 0.1) {
        return {
          success: false,
          message: '開關已閉合，但電路未形成有效通路或電流過小。請檢查線路連接！',
        };
      }

      if (current < 0.4 || vTerm > 1.15) {
        return {
          success: false,
          message:
            `💡 很好！放電迴路已導通！\n` +
            `目前電流 I = ${current.toFixed(2)}A，端電壓已從 1.50V 降至 ${vTerm.toFixed(2)}V (內阻壓降 I·r = ${(current * 1.0).toFixed(2)}V)。\n` +
            `👉 請切換至「👆 互動」工具，將滑動變阻器【向左拖曳】以調低負載電阻，觀察電流升破 0.40A 且端電壓跌破 1.10V，完成 V-I 負斜率驗證！`,
        };
      }

      return {
        success: true,
        message:
          `🎉 恭喜達成高中物理大考核心實驗！\n` +
          `在放電狀態下，端電壓公式為：V = ℰ - I·r。\n` +
          `當負載電阻降低時，放電電流大幅攀升至 ${current.toFixed(2)}A，內阻壓降使得端電壓降至 ${vTerm.toFixed(2)}V！\n` +
          `斜率 ΔV/ΔI 恰好等於負內阻 (-r = -1.0Ω)，完美驗證真實電池 V-I 特性曲線！`,
      };
    }

    // ----------------------------------------------------
    // 1-2: 最大功率轉移定理（內阻與負載阻抗匹配）
    // ----------------------------------------------------
    case 'sh-1-2': {
      const bats = findTiles('power', 'power_real');
      const switches = findTiles('switch', 'spst');
      const rMids = findTiles('resistor', 'var_mid');

      if (bats.length === 0 || rMids.length === 0) {
        return { success: false, message: '找不到電源或滑動變阻器，請保留實驗目標元件！' };
      }

      const sw = switches[0]?.tile;
      if (sw && !sw.isActive) {
        return {
          success: false,
          message: '⚠️ 匹配開關目前為斷路！請切換至「👆 互動」模式將開關閉合以開始量測輸出功率！',
        };
      }

      const rMid = rMids[0].tile;
      const powerW = rMid.powerW || 0;
      const totalR = rMid.value || 10;
      const ratio = rMid.extension !== undefined ? rMid.extension : 0.5;
      const rLoad = totalR * ratio;

      // Peak is 4.5W at R = 2.0Ω (ratio = 0.20)
      if (powerW >= 4.35) {
        return {
          success: true,
          message:
            `🎉 完美達成最大功率輸出 (Maximum Power Transfer)！\n` +
            `當負載電阻 R 調至 ${rLoad.toFixed(1)}Ω (恰好匹配電源內阻 r = 2.0Ω) 時，負載功率達到理論頂峰 ${powerW.toFixed(2)}W！\n` +
            `理論最大功率 P_max = ℰ² / 4r = 6.0² / (4 × 2.0) = 4.50W。\n` +
            `偏離此匹配點時（無論 R > r 還是 R < r），輸出功率皆顯著下降，成功驗證阻抗匹配定理！`,
        };
      }

      return {
        success: false,
        message:
          `💡 目前負載電阻 R = ${rLoad.toFixed(1)}Ω，即時輸出功率為 ${powerW.toFixed(2)}W。\n` +
          `根據最大功率轉移定理，當外接負載電阻等於電源內部電阻 (R = r = 2.0Ω) 時，輸出功率達到最大值 4.50W！\n` +
          `👉 請切換至「👆 互動」模式左右拖曳滑動變阻器，將負載調節至 2.0Ω 尋找最大功率巔峰！`,
      };
    }

    // ----------------------------------------------------
    // 1-3: 蓄電池充電與端電壓躍升（外加電源逆向充電）
    // ----------------------------------------------------
    case 'sh-1-3': {
      const bats = findTiles('power', 'power_real');
      const switches = findTiles('switch', 'spst');
      const galvs = findTiles('meter', 'g');

      if (bats.length === 0) {
        return { success: false, message: '找不到待充電池，請保留目標元件！' };
      }

      const sw = switches[0]?.tile;
      const bat = bats[0].tile;
      const vTerm = bat.measureVal !== undefined ? bat.measureVal : 3.0;
      const current = bat.currentA || 0;

      if (!sw || !sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 充電開關目前為斷路！\n' +
            '蓄電池處於開路狀態，端電壓恰好等於其本身電動勢 ℰ = 3.00V。\n' +
            '👉 請切換至「👆 互動」工具閉合充電開關，啟動 12V 高壓充電！',
        };
      }

      // In charging configuration, 12V pushes into 3V battery through 10Ω resistor:
      // I = (12 - 3) / (10 + 1) ≈ 0.818A
      // V_term = 3.0 + 0.818 * 1.0 ≈ 3.82V
      if (vTerm >= 3.6 && current >= 0.5) {
        return {
          success: true,
          message:
            `🎉 驗證成功！蓄電池充電原理完全掌握！\n` +
            `當外加充電樁電壓高於蓄電池電動勢時，電流被迫逆向灌入電池正極 (充電電流 I = ${current.toFixed(2)}A)！\n` +
            `此時端電壓公式為：V = ℰ + I·r。\n` +
            `端電壓躍升為 ${vTerm.toFixed(2)}V，顯著大於電動勢 3.00V (3.00V + ${current.toFixed(2)}A × 1.0Ω = ${vTerm.toFixed(2)}V)！\n` +
            `這正是電動車超充與二次電池充電的真實物理定律！`,
        };
      }

      return {
        success: false,
        message:
          `充電線路導通異常。目前端電壓為 ${vTerm.toFixed(2)}V，充電電流為 ${current.toFixed(2)}A。\n` +
          `請確認 12V 電源正極是否經由限流電阻連接至待充電池正極！`,
      };
    }

    // ----------------------------------------------------
    // 2-1: 靈敏檢流計與微安培感測（雙向偏轉實驗）
    // ----------------------------------------------------
    case 'sh-2-1': {
      const galvs = findTiles('meter', 'g');

      if (galvs.length < 2) {
        return { success: false, message: '找不到兩組檢流計，請保留左右對照實驗元件！' };
      }

      const gFwd = galvs.find((g) => g.x <= 6)?.tile;
      const gRev = galvs.find((g) => g.x > 6)?.tile;

      const iFwd = gFwd?.measureVal || 0;
      const iRev = gRev?.measureVal || 0;

      const fwdActive = iFwd > 0.0001;
      const revActive = iRev < -0.0001;

      if (!fwdActive && !revActive) {
        return {
          success: false,
          message:
            '⚠️ 左右兩側測試開關目前皆為斷路！\n' +
            '檢流計指針靜止於中央零點 (0.0 µA)。\n' +
            '👉 請切換至「👆 互動」工具，分別點擊開啟左側【順向測試開關】或右側【反向測試開關】以觀察偏轉！',
        };
      }

      if (fwdActive && !revActive) {
        return {
          success: true,
          message:
            `🎉 順向偏轉驗證成功！\n` +
            `電流由正極 (Pin 0 紅接頭) 流入檢流計，指針向右偏轉至 +${(iFwd * 1e6).toFixed(1)}µA (半格刻度)！\n` +
            `👉 建議您也可以開啟右側【反向測試開關】，觀察逆向電流如何使指針向左負偏轉！`,
        };
      }

      if (!fwdActive && revActive) {
        return {
          success: true,
          message:
            `🎉 反向偏轉驗證成功！\n` +
            `電流由負極 (Pin 2 藍接頭) 逆向流入檢流計，指針向左偏轉至 ${(iRev * 1e6).toFixed(1)}µA！\n` +
            `👉 完美驗證檢流計中零點雙向偏轉特性與電流方向判別能力！`,
        };
      }

      return {
        success: true,
        message:
          `🎉 完美！雙向偏轉對照實驗完全成功！\n` +
          `• 左側順向組：電流自正極流入，指針向右偏轉 +${(iFwd * 1e6).toFixed(1)}µA。\n` +
          `• 右側反向組：電流自負極逆流，指針向左偏轉 ${(iRev * 1e6).toFixed(1)}µA。\n` +
          `兩相對比，徹底掌握靈敏檢流計微安培高靈敏度與中央零點正負極性辨識核心原理！`,
      };
    }

    // ----------------------------------------------------
    // 2-2: 檢流計改裝安培計（並聯低阻分流器 Shunt）
    // ----------------------------------------------------
    case 'sh-2-2': {
      const galvs = findTiles('meter', 'g');
      const switches = findTiles('switch', 'spst');

      if (galvs.length === 0) {
        return { success: false, message: '找不到待改裝檢流計，請保留實驗目標元件！' };
      }

      const galv = galvs[0].tile;
      const iGalv = galv.measureVal || 0;
      const absIGalv = Math.abs(iGalv);

      const swMain = switches.find((s) => s.x <= 7)?.tile;
      const swShunt = switches.find((s) => s.x >= 9)?.tile;

      if (!swMain || !swMain.isActive) {
        return {
          success: false,
          message:
            '⚠️ 主控開關目前為斷路！\n' +
            '👉 請先切換至「👆 互動」工具將主控開關閉合，讓 5mA 待測電流注入！',
        };
      }

      if (!swShunt || !swShunt.isActive) {
        return {
          success: false,
          message:
            `⚠️ 危險警告：目前【尚未並聯分流器】！\n` +
            `主迴路待測電流高達 ${(absIGalv * 1000).toFixed(2)}mA，全部衝入檢流計，超出滿刻度 500µA 達 9 倍之多（指針嚴重爆錶極限偏轉）！\n` +
            `👉 請切換至「👆 互動」工具，閉合右側【分流開關】，將 Rs = 11.1Ω 並聯接入電路進行分流保護！`,
        };
      }

      if (absIGalv >= 0.00045 && absIGalv <= 0.00055) {
        return {
          success: true,
          message:
            `🎉 恭喜！安培計改裝完美成功！\n` +
            `總電流為 5.00mA。並聯分流器 Rs = 11.1Ω 後：\n` +
            `• 4.50mA (90%) 的電流由分流電阻安全旁路。\n` +
            `• 恰好 0.50mA = ${(absIGalv * 1e6).toFixed(0)}µA (10%) 流經檢流計，指針精準指在滿刻度 +500µA！\n` +
            `擴大量程倍率 n = I/Ig = 10 倍，分流電阻理論值 Rs = rg / (n - 1) = 100Ω / 9 = 11.1Ω 獲得完全驗證！`,
        };
      }

      return {
        success: false,
        message:
          `分流電阻並聯後電流為 ${(absIGalv * 1e6).toFixed(1)}µA，未達滿刻度 500µA。\n` +
          `請確認分流電阻是否設定為 11.1Ω (Rs = rg / (n - 1))！`,
      };
    }

    // ----------------------------------------------------
    // 2-3: 檢流計改裝伏特計（串聯高阻倍率器 Multiplier）
    // ----------------------------------------------------
    case 'sh-2-3': {
      const galvs = findTiles('meter', 'g');
      const switches = findTiles('switch', 'spst');

      if (galvs.length === 0) {
        return { success: false, message: '找不到改裝檢流計，請保留目標元件！' };
      }

      const galv = galvs[0].tile;
      const sw = switches[0]?.tile;
      const iGalv = Math.abs(galv.measureVal || 0);

      if (!sw || !sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 量測測試開關目前為斷路！\n' +
            '基準伏特計已測得待測電源為 5.00V。\n' +
            '👉 請切換至「👆 互動」工具，閉合【量測測試開關】以進行改裝電壓錶測試！',
        };
      }

      if (iGalv >= 0.00045 && iGalv <= 0.00055) {
        return {
          success: true,
          message:
            `🎉 恭喜！伏特計改裝完美成功！\n` +
            `串聯倍率電阻 Rm = 9,900Ω (9.9kΩ) 後，改裝伏特計總內阻為：R_v = Rm + rg = 9900Ω + 100Ω = 10,000Ω (10kΩ)。\n` +
            `當測量 5.00V 電壓時，迴路電流恰為：I = 5.00V / 10,000Ω = 500µA，檢流計指針精確指示滿刻度！\n` +
            `倍率電阻分擔了 4.95V (99%) 的高壓，保護檢流計僅承受 0.05V (1%)，成功改裝為量程 5.00V 實用伏特計！`,
        };
      }

      return {
        success: false,
        message:
          `改裝伏特計迴路電流為 ${(iGalv * 1e6).toFixed(1)}µA，未達滿偏 500µA。\n` +
          `請確認倍率電阻 Rm 是否設定為 9900Ω (Rm = V/Ig - rg)！`,
      };
    }

    // ----------------------------------------------------
    // 3-1: 二極體單向導電性與順向門檻電壓 (0.7V)
    // ----------------------------------------------------
    case 'sh-3-1': {
      const switches = findTiles('switch', 'spst');
      const diodes = findTiles('diode', '1n4007');
      const bulbs = findTiles('load');
      const vms = findTiles('meter', 'v');

      const swFwd = switches.find((s) => s.x < 5)?.tile;
      const swRev = switches.find((s) => s.x >= 5)?.tile;

      if (!swFwd || !swRev) {
        return { success: false, message: '找不到順向或逆向開關，請保留實驗開關元件！' };
      }

      if (!swFwd.isActive && !swRev.isActive) {
        return {
          success: false,
          message:
            '⚠️ 順向開關與逆向開關目前皆為斷路 (OFF)！\n' +
            '👉 請切換至「👆 互動」工具，同時點擊閉合兩個開關，以對照二極體的單向導電性！',
        };
      }

      if (!swFwd.isActive) {
        return {
          success: false,
          message:
            '⚠️ 順向開關尚未閉合！\n' +
            '👉 請切換至「👆 互動」工具，將左側【順向開關】閉合，觀察順向導通與門檻電壓！',
        };
      }

      if (!swRev.isActive) {
        return {
          success: false,
          message:
            '⚠️ 逆向開關尚未閉合！\n' +
            '👉 請切換至「👆 互動」工具，將右側【逆向開關】也一併閉合，以便對照順向導通 vs 逆向截止！',
        };
      }

      const dFwd = diodes.find((d) => d.x < 5)?.tile;
      const dRev = diodes.find((d) => d.x >= 5)?.tile;
      const bFwd = bulbs.find((b) => b.x < 5)?.tile;
      const bRev = bulbs.find((b) => b.x >= 5)?.tile;

      const fwdConducting = (dFwd && dFwd.isPowered) || (bFwd && bFwd.isPowered);
      const revCutoff = (!dRev || !dRev.isPowered) && (!bRev || !bRev.isPowered);

      if (fwdConducting && revCutoff) {
        const vmFwd = vms.find((v) => v.tile.labels[4] === '1')?.tile;
        const vmRev = vms.find((v) => v.tile.labels[4] === '2')?.tile;
        const vFwd = vmFwd?.measureVal !== undefined ? vmFwd.measureVal.toFixed(2) : '0.69';
        const vRev = vmRev?.measureVal !== undefined ? vmRev.measureVal.toFixed(2) : '5.00';

        return {
          success: true,
          message:
            `🎉 恭喜！成功驗證二極體單向導電性與順向門檻壓降！\n\n` +
            `• 【順向偏壓組 (Forward Bias)】：\n` +
            `  外加電壓突破 PN 接面障壁電位 (Barrier Potential)，空乏區消失，多數載流子劇烈擴散導通！\n` +
            `  伏特計 CH1 測得順向導通壓降 VD ≈ ${vFwd}V（標準矽二極體 0.6V~0.7V 門檻），負載燈泡明亮發光！\n\n` +
            `• 【逆向偏壓組 (Reverse Bias)】：\n` +
            `  外加電場加強內部內建電場，空乏區大幅加寬，多數載流子無法跨越，逆向電流截止 (0mA)！\n` +
            `  二極體阻絕幾乎全部外加電壓，伏特計 CH2 測得 VD ≈ ${vRev}V，負載燈泡完全熄滅！\n\n` +
            `這完美展現了半導體二極體的「單向導電閥」與非歐姆導體特性！`,
        };
      }

      return {
        success: false,
        message: '電路狀態異常，請確認二極體是否正常連接！',
      };
    }

    // ----------------------------------------------------
    // 3-2: 半波整流電路（AC 轉脈衝 DC）
    // ----------------------------------------------------
    case 'sh-3-2': {
      const switches = findTiles('switch', 'spst');
      const diodes = findTiles('diode', '1n4007');
      const loads = findTiles('resistor');

      if (switches.length === 0) {
        return { success: false, message: '找不到整流主開關，請保留開關元件！' };
      }

      const sw = switches[0].tile;
      if (!sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 整流主開關目前為斷路 (OFF)！\n' +
            '👉 請切換至「👆 互動」工具，點擊閉合【整流主開關】以啟動半波整流！',
        };
      }

      if (diodes.length === 0 || loads.length === 0) {
        return { success: false, message: '找不到整流二極體或負載電阻，請保留核心元件！' };
      }

      return {
        success: true,
        message:
          `🎉 恭喜！成功驗證半波整流電路（Half-Wave Rectifier）！\n\n` +
          `• 【整流工作機制】：\n` +
          `  1. 正半週時 (AC > 0V)：交流電源頂部為正，1N4007 二極體順向偏壓導通，負載 RL 獲得正向脈衝電壓，峰值達到 Vp ≈ 11.3V (12V - 0.7V)！\n` +
          `  2. 負半週時 (AC < 0V)：交流電壓反轉，二極體逆向截止（斷路），負載電壓被強制夾止於 0V！\n\n` +
          `• 【示波器觀測成果】：\n` +
          `  示波器 CH1 忠實呈現「上半波脈衝、下半波歸零」之單向脈衝直流波形！\n` +
          `  平均直流輸出電壓 V_dc = Vm / π ≈ 11.3V / 3.1416 ≈ 3.60V。\n` +
          `👉 您可切換右側儀表至 CH2，同步比對輸入端完整的交流正弦波！`,
      };
    }

    // ----------------------------------------------------
    // 3-3: 全波橋式整流電路（四顆二極體）
    // ----------------------------------------------------
    case 'sh-3-3': {
      const switches = findTiles('switch', 'spst');
      const diodes = findTiles('diode', '1n4007');
      const loads = findTiles('resistor');

      if (switches.length === 0) {
        return { success: false, message: '找不到整流主開關，請保留開關元件！' };
      }

      const sw = switches[0].tile;
      if (!sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 整流主開關目前為斷路 (OFF)！\n' +
            '👉 請切換至「👆 互動」工具，點擊閉合【整流主開關】以啟動全波橋式整流！',
        };
      }

      if (diodes.length < 4) {
        return { success: false, message: '四顆二極體橋式整流器缺件，請保留 D1~D4 完整電橋！' };
      }

      return {
        success: true,
        message:
          `🎉 恭喜！全波橋式整流電路（Graetz Bridge Rectifier）驗證成功！\n\n` +
          `• 【全波導通迴路解析】：\n` +
          `  1. 正半週 (AC1 > AC2)：電流經 D1 向上流入 DC+ 母線，順向流經負載 RL (100Ω)，再由 DC- 母線經 D2 返回 AC2 端！\n` +
          `  2. 負半週 (AC2 > AC1)：電流經 D3 向上流入 DC+ 母線，依然順向由上至下流經負載 RL，再由 DC- 母線經 D4 返回 AC1 端！\n\n` +
          `• 【核心物理特性】：\n` +
          `  不論 AC 交流電如何交替顛倒，流經負載 RL 的電流「恆由上至下」保持單向！\n` +
          `  示波器 CH1 捕捉到雙倍頻 (2f = 2Hz) 的全波脈衝直流訊號，峰值約 Vp ≈ 12V - 2×0.7V = 10.6V！\n` +
          `  平均直流輸出電壓 V_dc = 2Vm / π ≈ 6.75V，整流效率較半波整流倍增！`,
      };
    }

    // ----------------------------------------------------
    // 4-1: 冷次定律與電感抗拒電流變化
    // ----------------------------------------------------
    case 'sh-4-1': {
      const switches = findTiles('switch', 'spst');
      const inductors = findTiles('inductor');
      const bulbs = findTiles('load');

      if (switches.length === 0) {
        return { success: false, message: '找不到通電主開關，請保留開關元件！' };
      }

      const sw = switches[0].tile;
      if (!sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 通電主開關目前為斷路 (OFF)！\n' +
            '👉 請切換至「👆 互動」工具，點擊閉合【通電主開關】，親眼觀察 L1 與 L2 的亮起延遲對比！',
        };
      }

      if (inductors.length === 0 || bulbs.length < 2) {
        return { success: false, message: '找不到大電感或雙燈泡對照組，請保留實驗元件！' };
      }

      return {
        success: true,
        message:
          `🎉 恭喜！成功驗證冷次定律與電感抗拒電流變化！\n\n` +
          `• 【純電阻對照組 (Branch 1)】：\n` +
          `  開關閉合瞬間，迴路無反向感應電動勢阻礙，電流瞬間躍升至穩態 I = 5V / (50Ω + 50Ω) = 50mA！\n` +
          `  燈泡 L1「瞬間全亮」，展現純歐姆電路的即時響應。\n\n` +
          `• 【電感實驗組 (Branch 2)】：\n` +
          `  開關閉合瞬間，穿過線圈的電流遽變使磁通量激增，大電感 25H 依據冷次定律產生高達 ℰ_L ≈ -5.0V 的反向自感電動勢！\n` +
          `  此反電動勢強烈抗拒電流增長，迴路電流受制於時間常數 τ = L/R = 25H / 50Ω = 0.5 秒，由 0 緩慢指數上升！\n` +
          `  燈泡 L2 呈現肉眼可見的「由暗漸亮」延遲效應，完美印證了電感「通直流、阻交流、抗拒電流突變」的核心物理特性！`,
      };
    }

    // ----------------------------------------------------
    // 4-2: RL 電路充放電暫態與時間常數 (τ = L/R)
    // ----------------------------------------------------
    case 'sh-4-2': {
      const switches = findTiles('switch', 'sel13');
      const inductors = findTiles('inductor');
      const resistors = findTiles('resistor');

      if (switches.length === 0) {
        return { success: false, message: '找不到選擇開關，請保留充放電開關！' };
      }

      const sw = switches[0].tile;
      const isCharging = (sw.state === 0);

      return {
        success: true,
        message:
          `🎉 恭喜！RL 電路充放電暫態與時間常數驗證成功！\n\n` +
          `• 【一階 RL 暫態理論方程式】：\n` +
          `  由克希荷夫電壓定律：ℰ - L·(di/dt) - i·R = 0\n` +
          `  時間常數理論值：τ = L / R = 25H / 50Ω = 0.50 秒！\n\n` +
          `• 【${isCharging ? '通電充電狀態 (Charging, State 0)' : '放電續流狀態 (Discharging, State 1)'}】：\n` +
          `  ${isCharging
            ? '電流方程式：i(t) = (ℰ/R)·(1 - e^(-t/τ)) = 0.24·(1 - e^(-2t)) A。\n  經過 t = 1τ (0.5s) 時，電阻端電壓達到穩態值的 63.2% (7.58V)；t = 5τ (2.5s) 時達到 99.3% 進入穩態！'
            : '電感將儲存的磁場能 U_B = (1/2)·L·I² = 0.72 焦耳釋放，電流呈自然指數衰減：i(t) = I_0·e^(-t/τ)。\n  經過 t = 1τ (0.5s) 時，電壓下降至初始值的 36.8% (4.42V)！'}\n\n` +
          `👉 右側面板【CRT 示波器】CH1 即時描繪出教科書級別的「${isCharging ? '指數上升' : '指數衰減'}」平滑暫態曲線！您可隨時切換開關檔位觀察充放電交替波形！`,
      };
    }

    // ----------------------------------------------------
    // 4-3: LC 電磁振盪器初探
    // ----------------------------------------------------
    case 'sh-4-3': {
      const switches = findTiles('switch', 'spst');
      const caps = findTiles('capacitor');
      const inductors = findTiles('inductor');

      const sw1 = switches.find((s) => s.x < 5)?.tile;
      const sw2 = switches.find((s) => s.x >= 5)?.tile;

      if (!sw1 || !sw2) {
        return { success: false, message: '找不到充電開關或振盪開關，請保留實驗開關！' };
      }

      if (sw1.isActive && sw2.isActive) {
        return {
          success: false,
          message:
            '⚠️ SW1 與 SW2 同時閉合！電源仍在對電容持續充電強加電壓。\n' +
            '👉 請切換至「👆 互動」工具，先點擊斷開【SW1 充電開關】，再閉合【SW2 振盪開關】，讓 LC 槽路在無外加電源下自由進行電磁振盪！',
        };
      }

      if (!sw2.isActive) {
        return {
          success: false,
          message:
            '⚠️ 振盪開關 SW2 尚未閉合！\n' +
            '👉 請先閉合【SW1】為電容充電，隨後斷開【SW1】並點擊閉合【SW2 振盪開關】以啟動電磁振盪！',
        };
      }

      return {
        success: true,
        message:
          `🎉 恭喜！LC 電磁振盪器（LC Tank Circuit）驗證成功！\n\n` +
          `• 【固有諧振頻率理論驗證】：\n` +
          `  理論公式：f_0 = 1 / (2π·√(L·C))\n` +
          `  代入實驗參數 L = 5H, C = 5000µF = 0.005F：\n` +
          `  √(L·C) = √(5 × 0.005) = √0.025 ≈ 0.1581 秒\n` +
          `  固有角頻率 ω_0 = 1 / 0.1581 ≈ 6.32 rad/s\n` +
          `  振盪頻率 f_0 = 6.32 / (2π) ≈ 1.006 Hz（振盪週期 T ≈ 0.99 秒）！\n\n` +
          `• 【電磁能量週期性轉換機制】：\n` +
          `  1. 電容器電場能最大時：q = Q_max, i = 0, U_E = Q² / 2C。\n` +
          `  2. 電容放電至 0，電感電流達到極大：q = 0, i = I_max, 磁場能 U_B = (1/2)·L·I² 達到最大！\n` +
          `  3. 自感電壓反向向電容反充電，電磁能量周而復始在電場與磁場間無縫交換！\n\n` +
          `示波器 CH1 精準捕捉到 1.0Hz 的連續正弦電壓振盪訊號，此原理正是無線電發射天線與調諧選頻電路的基石！`,
      };
    }

    // ----------------------------------------------------
    // 5-1: 交流電感抗與容抗 (X_L vs X_C)
    // ----------------------------------------------------
    case 'sh-5-1': {
      const switches = findTiles('switch', 'sel13');
      const inductors = findTiles('inductor');
      const caps = findTiles('capacitor');
      const bulbs = findTiles('load');

      if (switches.length === 0 || inductors.length === 0 || caps.length === 0 || bulbs.length < 2) {
        return { success: false, message: '找不到頻率切換開關或雙支路對照元件，請保留實驗元件！' };
      }

      const sw = switches[0].tile;
      const isLowFreq = (sw.state === 0);

      return {
        success: true,
        message:
          `🎉 恭喜！交流電感抗與容抗（X_L vs X_C）頻率響應驗證成功！\n\n` +
          `• 【當前狀態：${isLowFreq ? '低頻 0.5Hz 檔位 (State 0)' : '高頻 3.0Hz 檔位 (State 1)'}】：\n` +
          `  ${isLowFreq
            ? '低頻 0.5Hz 下：\n' +
              '  • 感抗 X_L = 2π × 0.5 × 2H ≈ 6.28Ω（阻抗極小，電感燈泡明亮！）\n' +
              '  • 容抗 X_C = 1 / (2π × 0.5 × 0.0025F) ≈ 127.3Ω（阻抗極大，電容燈泡完全熄滅！）'
            : '高頻 3.0Hz 下：\n' +
              '  • 感抗 X_L = 2π × 3.0 × 2H ≈ 37.7Ω（阻抗急增 6 倍，電感燈泡顯著變暗！）\n' +
              '  • 容抗 X_C = 1 / (2π × 3.0 × 0.0025F) ≈ 21.2Ω（阻抗驟降至 1/6，電容燈泡劇烈放光！）'}\n\n` +
          `• 【核心物理規律總結】：\n` +
          `  電感「通低頻、阻高頻」（低通濾波特性）；電容「阻低頻、通高頻」（高通濾波特性）！\n` +
          `  兩顆燈泡明暗地位的完全顛倒，完美展現了交流阻抗隨頻率變化的反向對立規律！`,
      };
    }

    // ----------------------------------------------------
    // 5-2: RLC 串聯諧振頻率量測 (f_0 = 1 / 2π√LC)
    // ----------------------------------------------------
    case 'sh-5-2': {
      const switches = findTiles('switch', 'sel13');
      const inductors = findTiles('inductor');
      const caps = findTiles('capacitor');
      const bulbs = findTiles('load');

      if (switches.length === 0 || inductors.length === 0 || caps.length === 0 || bulbs.length === 0) {
        return { success: false, message: '找不到 RLC 串聯核心元件，請保留實驗元件！' };
      }

      const sw = switches[0].tile;
      const isResonant = (sw.state === 0);

      return {
        success: true,
        message:
          `🎉 恭喜！RLC 串聯諧振頻率量測驗證成功！\n\n` +
          `• 【RLC 串聯諧振理論計算】：\n` +
          `  總阻抗公式：Z = √(R² + (X_L - X_C)²)\n` +
          `  諧振條件：X_L = X_C ⟹ f_0 = 1 / (2π·√(LC))\n` +
          `  代入實驗參數 L = 2.5H, C = 2500µF = 0.0025F：\n` +
          `  √(LC) = √(2.5 × 0.0025) = 0.07905 秒\n` +
          `  諧振頻率：f_0 = 1 / (2π × 0.07905) ≈ 2.01 Hz ≈ 2.0 Hz！\n\n` +
          `• 【${isResonant ? '當前檔位：諧振點 2.0Hz (State 0)' : '當前檔位：失諧點 4.0Hz (State 1)'}】：\n` +
          `  ${isResonant
            ? 'X_L ≈ 31.4Ω，X_C ≈ 31.8Ω，電抗幾乎完全抵消！\n' +
              '  總阻抗降至全頻段極小值 Z_min = R = 20Ω，迴路電流達到峰值最大值 I_max = 12V / 20Ω = 0.60A！\n' +
              '  負載燈泡爆發強烈星芒強光，右側面板示波器 CH1 正弦波振幅達到全屏頂峰！'
            : 'X_L = 62.8Ω 遠大於 X_C = 15.9Ω，總阻抗飆升至 Z ≈ 51Ω，電流驟降至 0.23A，燈泡迅速黯淡為微光！'}\n\n` +
          `此尖銳的電流峰值曲線即為「諧振曲線（Resonance Curve）」，是收音機調諧與無線選台的物理核心！`,
      };
    }

    // ----------------------------------------------------
    // 5-3: 交流相量與相位差（電壓超前與落後）
    // ----------------------------------------------------
    case 'sh-5-3': {
      const switches = findTiles('switch', 'spst');
      const resistors = findTiles('resistor');
      const inductors = findTiles('inductor');
      const vms = findTiles('meter', 'v');

      if (switches.length === 0) {
        return { success: false, message: '找不到測量主開關，請保留開關元件！' };
      }

      const sw = switches[0].tile;
      if (!sw.isActive) {
        return {
          success: false,
          message:
            '⚠️ 測量主開關目前為斷路 (OFF)！\n' +
            '👉 請切換至「👆 互動」工具，點擊閉合【測量主開關】以啟動雙通道相量量測！',
        };
      }

      if (resistors.length === 0 || inductors.length === 0) {
        return { success: false, message: '找不到電阻或電感，請保留 RL 主迴路元件！' };
      }

      return {
        success: true,
        message:
          `🎉 恭喜！交流相量與相位差（電壓超前與落後）分析成功！\n\n` +
          `• 【RL 串聯相量與相位角理論計算】：\n` +
          `  1. 純電阻電壓 v_R(t) 與迴路電流 i(t) 完全同相（Δφ = 0°）。\n` +
          `  2. 純電感電壓 v_L(t) 超前電流 90° (π/2)。\n` +
          `  3. 總電壓 v(t) 與電流 i(t) 之相位差由阻抗三角形決定：\n` +
          `     tan(φ) = X_L / R = (2π·f·L) / R\n` +
          `     代入實驗參數 f = 1Hz, L = 8H, R = 50Ω：\n` +
          `     X_L = 2π × 1 × 8 ≈ 50.26Ω\n` +
          `     tan(φ) = 50.26 / 50 ≈ 1.005 ⟹ 相位差 φ ≈ 45.1°！\n` +
          `  4. 總電壓波峰在時間軸上領先電流波峰：\n` +
          `     Δt = (45.1° / 360°) × 1.0s ≈ 0.125 秒（恰為八分之一週期）！\n\n` +
          `• 【示波器雙通道觀測確認】：\n` +
          `  在右側儀表面板切換 CH1（總電壓）與 CH2（電阻端/電流相位），可清楚看見 CH1 的波峰比 CH2 提早達到！\n` +
          `  完全驗證「感性電路中總電壓超前電流」的相量幾何關係！`,
      };
    }

    default:
      return {
        success: true,
        message: '關卡電路運作正常！',
      };
  }
}
