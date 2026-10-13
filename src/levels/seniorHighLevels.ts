/**
 * @license
 * Senior High Physics Electricity Levels (高中物理 電學實驗系列) for Auto Studio Pro
 * Aligned with 108 Curriculum (Senior High Electromagnetism & DC Circuit Analysis)
 */

import { Tile } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';

export const seniorHighMenuCategories: LevelMenuCategory[] = [
  {
    title: '第一單元：真實電源——電動勢 ℰ、內阻 r 與端電壓 V (Real Power Sources)',
    levels: [
      {
        id: 'sh-1-1',
        title: '1-1 電池內電阻與端電壓曲線（V-I 特性大考實驗）',
        desc: '閉合開關並拖曳滑動變阻器改變負載，觀察端電壓 V 隨放電電流 I 增加而下降之負斜率 (V = ℰ - I·r)！',
      },
      {
        id: 'sh-1-2',
        title: '1-2 最大功率轉移定理（內阻與負載阻抗匹配）',
        desc: '調整變阻器阻值，驗證當負載電阻等於電源內阻 (R = r) 時，負載獲得最大輸出功率 P_max = ℰ² / 4r！',
      },
      {
        id: 'sh-1-3',
        title: '1-3 蓄電池充電與端電壓躍升（外加電源逆向充電）',
        desc: '使用高電壓充電樁逆向注入電流，驗證充電狀態下端電壓躍升大於電動勢 (V = ℰ + I·r > ℰ)！',
      },
    ],
  },
  {
    title: '第二單元：微小電流偵測與電錶改裝 (Galvanometer & Multi-range Meters)',
    levels: [
      {
        id: 'sh-2-1',
        title: '2-1 靈敏檢流計與微安培感測（雙向偏轉實驗）',
        desc: '探索中零點檢流計特性：滿刻度 500µA 微電流感測、正向偏轉 (+250µA) 與反向偏轉 (-250µA) 對照實驗。',
      },
      {
        id: 'sh-2-2',
        title: '2-2 檢流計改裝安培計（並聯低阻分流器 Shunt）',
        desc: '並聯微小分流電阻 Rs = 11.1Ω 擴大量程 10 倍，90% 大電流安全旁路，成功改裝為 5.00mA 實用安培計。',
      },
      {
        id: 'sh-2-3',
        title: '2-3 檢流計改裝伏特計（串聯高阻倍率器 Multiplier）',
        desc: '串聯高阻倍率電阻 Rm = 9.9kΩ 分擔 99% 高壓，將 50mV 滿偏檢流計成功改裝為 5.00V 實用伏特計。',
      },
    ],
  },
  {
    title: '第三單元：非歐姆導體與二極體單向導電 (Diode & PN Junction)',
    levels: [
      {
        id: 'sh-3-1',
        title: '3-1 二極體單向導電性與順向門檻電壓 (0.7V)',
        desc: '1N4007 PN接面特性：順向偏壓突破 0.7V 門檻發光導通，逆向偏壓空乏區截止徹底斷路。',
      },
      {
        id: 'sh-3-2',
        title: '3-2 半波整流電路（AC 轉脈衝 DC）',
        desc: '單顆二極體阻截 AC 負半波，示波器即時捕捉正半波脈衝直流波形。',
      },
      {
        id: 'sh-3-3',
        title: '3-3 全波橋式整流電路（四顆二極體）',
        desc: '四顆二極體電橋雙向導引，負載電流方向恆定，AC 負半周翻轉為雙倍頻率全波直流。',
      },
    ],
  },
  {
    title: '第四單元：電感器與 RL 暫態電路 (Inductor & RL Transient)',
    levels: [
      {
        id: 'sh-4-1',
        title: '4-1 冷次定律與電感抗拒電流變化',
        desc: '通電瞬間電感產生反電動勢抗拒電流遽增；斷電瞬間產生高壓感應電動勢。',
      },
      {
        id: 'sh-4-2',
        title: '4-2 RL 電路充放電暫態與時間常數 (τ = L/R)',
        desc: '利用示波器觀察 RL 電路中電流指數上升與指數衰減曲線。',
      },
      {
        id: 'sh-4-3',
        title: '4-3 LC 電磁振盪器初探',
        desc: '電感與電容並聯，電場能與磁場能相互週期轉換產生振盪訊號。',
      },
    ],
  },
  {
    title: '第五單元：交流電 RLC 諧振與相量初探 (AC RLC Resonance)',
    levels: [
      {
        id: 'sh-5-1',
        title: '5-1 交流電感抗與容抗 (X_L vs X_C)',
        desc: '在不同頻率交流電驅動下，電感阻抗隨頻率上升，電容阻抗隨頻率下降。',
      },
      {
        id: 'sh-5-2',
        title: '5-2 RLC 串聯諧振頻率量測 (f_0 = 1 / 2π√LC)',
        desc: '調節訊號源頻率至諧振點，阻抗最小、電流最大，示波器捕捉純電阻同相狀態。',
      },
      {
        id: 'sh-5-3',
        title: '5-3 交流相量與相位差（電壓超前與落後）',
        desc: '示波器雙通道比對總電壓與電阻電流波形，驗證電感電壓超前、電容電壓落後 90° 相位關係。',
      },
    ],
  },
];

export const seniorHighLevels: LevelDefinition[] = [
  // =========================================================================
  // Level 1-1: 電池內電阻與端電壓曲線（V-I 特性大考實驗）
  // =========================================================================
  {
    id: 'sh-1-1',
    title: '1-1 電池內電阻與端電壓曲線（V-I 特性大考實驗）',
    desc: '💡 高中物理大考核心實驗：真實電池內部具有內電阻 r，端電壓滿足 V = ℰ - I·r。\n' +
      '1. 觀察開路時 (I = 0)，端電壓等於電動勢 ℰ = 1.50V。\n' +
      '2. 切換至「👆 互動」工具，點擊閉合開關，觀察端電壓立即因內阻分壓而下降。\n' +
      '3. 將滑動變阻器向左拖曳（降低負載電阻 R），觀察電流顯著激增，端電壓持續下探，親身體驗 V-I 的負斜率特性！',
    category: '第一單元：真實電源——電動勢 ℰ、內阻 r 與端電壓 V',
    defaultGridSize: 12,
    setup: (grid) => {
      // 1. 真實電池 (y=5, x=2)：ℰ = 1.5V, r = 1.0Ω
      const bat = new Tile('power', 'power_real');
      bat.value = 1.5;
      bat.internalR = 1.0;
      bat.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      bat.isLocked = true;
      bat.labels[4] = '真實電池 (1.5V, 1Ω)';
      grid[5][2] = bat;

      // 2. 伏特計 (y=5, x=4)：跨接於電池兩端測量即時端電壓 V
      const vm = new Tile('meter', 'v');
      vm.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      vm.isLocked = true;
      vm.labels[4] = '端電壓錶 V';
      grid[5][4] = vm;

      // 3. 上方供電幹線 (Row 3)
      // 電池正極 (y=5, x=2) -> 向上經 [4][2] 至 [3][2]
      const wBatTop = new Tile('wire', 'straight'); wBatTop.rotation = 0; grid[4][2] = wBatTop;
      const wTopTurnL = new Tile('wire', 'turn'); wTopTurnL.rotation = 1; grid[3][2] = wTopTurnL; // 下 & 右
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[3][3] = wTop1;
      // [3][4] 為 T 型接頭，引出支路向下至伏特計正極 (左、右、下 = rotation 0)
      const wTopT = new Tile('wire', 't'); wTopT.rotation = 0; grid[3][4] = wTopT;
      const wVmTop = new Tile('wire', 'straight'); wVmTop.rotation = 0; grid[4][4] = wVmTop;

      // 4. 開關 (y=3, x=6)：水平開關控制主迴路
      const wSwIn = new Tile('wire', 'straight'); wSwIn.rotation = 1; grid[3][5] = wSwIn;
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1; // Horizontal switch
      sw.isActive = false; // 初始斷路
      sw.isLocked = true;
      sw.labels[4] = '主控開關';
      grid[3][6] = sw;

      // 5. 3格滑動變阻器 (Row 3, Col 8~10)：負載 R
      const gid = 'rheo_sh_1_1';
      const rLeft = new Tile('resistor', 'var_left');
      rLeft.groupId = gid;
      rLeft.rotation = 0;
      rLeft.isLocked = true;
      rLeft.labels[4] = 'A端(下)';
      grid[3][8] = rLeft;

      const wSwToR = new Tile('wire', 'straight'); wSwToR.rotation = 1; grid[3][7] = wSwToR;

      const rMid = new Tile('resistor', 'var_mid');
      rMid.groupId = gid;
      rMid.rotation = 0;
      rMid.value = 10; // 10Ω 總電阻
      rMid.extension = 0.5; // 初始 50% = 5Ω
      rMid.isLocked = true;
      rMid.labels[4] = 'C端(滑片)';
      grid[3][9] = rMid;

      const rRight = new Tile('resistor', 'var_right');
      rRight.groupId = gid;
      rRight.rotation = 0;
      rRight.isLocked = true;
      rRight.labels[4] = 'B端(下)';
      grid[3][10] = rRight;

      // 6. Wiper C (y=3, x=9) 底部 Pin 2 引出電流 -> 串聯安培計 (y=5, x=9)
      const wWiperDown = new Tile('wire', 'straight'); wWiperDown.rotation = 0; grid[4][9] = wWiperDown;
      const am = new Tile('meter', 'a');
      am.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      am.isLocked = true;
      am.labels[4] = '迴路電流錶 A';
      grid[5][9] = am;

      // 7. 下方返回接地幹線 (Row 7)
      const wAmBot = new Tile('wire', 'straight'); wAmBot.rotation = 0; grid[6][9] = wAmBot;
      const wBotTurnR = new Tile('wire', 'turn'); wBotTurnR.rotation = 3; grid[7][9] = wBotTurnR; // 上 & 左

      const wBot8 = new Tile('wire', 'straight'); wBot8.rotation = 1; grid[7][8] = wBot8;
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;

      // [7][4] 為 T 型接頭，接收伏特計負極返回端 (左、右、上 = rotation 2)
      const wBotT = new Tile('wire', 't'); wBotT.rotation = 2; grid[7][4] = wBotT;
      const wVmBot = new Tile('wire', 'straight'); wVmBot.rotation = 0; grid[6][4] = wVmBot;

      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnL = new Tile('wire', 'turn'); wBotTurnL.rotation = 0; grid[7][2] = wBotTurnL; // 上 & 右
      const wBatBot = new Tile('wire', 'straight'); wBatBot.rotation = 0; grid[6][2] = wBatBot;
    },
  },

  // =========================================================================
  // Level 1-2: 最大功率轉移定理（內阻與負載阻抗匹配）
  // =========================================================================
  {
    id: 'sh-1-2',
    title: '1-2 最大功率轉移定理（內阻與負載阻抗匹配）',
    desc: '💡 高中物理阻抗匹配核心：當外接負載電阻 R 等於電源內部電阻 r (R = r) 時，負載獲得最大功率 P_max = ℰ² / 4r！\n' +
      '本電源電動勢 ℰ = 6.0V、內阻 r = 2.0Ω。\n' +
      '1. 閉合開關，切換至「👆 互動」模式左右拖曳滑動變阻器 (1Ω ~ 9Ω)。\n' +
      '2. 觀察變阻器上的即時功率數值 [P=...W]，驗證當 R 調至 2.0Ω 時，功率達到峰值 4.50W！偏離 2.0Ω 則功率皆減小！',
    category: '第一單元：真實電源——電動勢 ℰ、內阻 r 與端電壓 V',
    defaultGridSize: 12,
    setup: (grid) => {
      // 1. 6V 高內阻真實電源 (y=5, x=2)：ℰ = 6.0V, r = 2.0Ω
      const bat = new Tile('power', 'power_real');
      bat.value = 6.0;
      bat.internalR = 2.0;
      bat.rotation = 0;
      bat.isLocked = true;
      bat.labels[4] = '真實電源 (6V, 2Ω)';
      grid[5][2] = bat;

      // 2. 伏特計 (y=5, x=4)：跨接端電壓
      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      vm.labels[4] = '端電壓錶 V';
      grid[5][4] = vm;

      // 3. 上方幹線 (Row 3)
      const wBatTop = new Tile('wire', 'straight'); wBatTop.rotation = 0; grid[4][2] = wBatTop;
      const wTopTurnL = new Tile('wire', 'turn'); wTopTurnL.rotation = 1; grid[3][2] = wTopTurnL;
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[3][3] = wTop1;
      const wTopT = new Tile('wire', 't'); wTopT.rotation = 0; grid[3][4] = wTopT;
      const wVmTop = new Tile('wire', 'straight'); wVmTop.rotation = 0; grid[4][4] = wVmTop;

      // 4. 開關 (y=3, x=6)
      const wSwIn = new Tile('wire', 'straight'); wSwIn.rotation = 1; grid[3][5] = wSwIn;
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '匹配開關';
      grid[3][6] = sw;

      // 5. 3格滑動變阻器 (Row 3, Col 8~10)：總阻值 10Ω
      const gid = 'rheo_sh_1_2';
      const rLeft = new Tile('resistor', 'var_left');
      rLeft.groupId = gid;
      rLeft.rotation = 0;
      rLeft.isLocked = true;
      rLeft.labels[4] = 'A端(下)';
      grid[3][8] = rLeft;

      const wSwToR = new Tile('wire', 'straight'); wSwToR.rotation = 1; grid[3][7] = wSwToR;

      const rMid = new Tile('resistor', 'var_mid');
      rMid.groupId = gid;
      rMid.rotation = 0;
      rMid.value = 10;
      rMid.extension = 0.6; // 初始 6Ω，非最佳匹配點 (3.38W)
      rMid.isLocked = true;
      rMid.labels[4] = 'C端(滑片)';
      grid[3][9] = rMid;

      const rRight = new Tile('resistor', 'var_right');
      rRight.groupId = gid;
      rRight.rotation = 0;
      rRight.isLocked = true;
      rRight.labels[4] = 'B端(下)';
      grid[3][10] = rRight;

      // 6. Wiper C (y=3, x=9) -> 串聯安培計 (y=5, x=9)
      const wWiperDown = new Tile('wire', 'straight'); wWiperDown.rotation = 0; grid[4][9] = wWiperDown;
      const am = new Tile('meter', 'a');
      am.rotation = 0;
      am.isLocked = true;
      am.labels[4] = '電流錶 A';
      grid[5][9] = am;

      // 7. 下方返回幹線 (Row 7)
      const wAmBot = new Tile('wire', 'straight'); wAmBot.rotation = 0; grid[6][9] = wAmBot;
      const wBotTurnR = new Tile('wire', 'turn'); wBotTurnR.rotation = 3; grid[7][9] = wBotTurnR;

      const wBot8 = new Tile('wire', 'straight'); wBot8.rotation = 1; grid[7][8] = wBot8;
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;

      const wBotT = new Tile('wire', 't'); wBotT.rotation = 2; grid[7][4] = wBotT;
      const wVmBot = new Tile('wire', 'straight'); wVmBot.rotation = 0; grid[6][4] = wVmBot;

      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnL = new Tile('wire', 'turn'); wBotTurnL.rotation = 0; grid[7][2] = wBotTurnL;
      const wBatBot = new Tile('wire', 'straight'); wBatBot.rotation = 0; grid[6][2] = wBatBot;
    },
  },

  // =========================================================================
  // Level 1-3: 蓄電池充電與端電壓躍升（外加電源逆向充電）
  // =========================================================================
  {
    id: 'sh-1-3',
    title: '1-3 蓄電池充電與端電壓躍升（外加電源逆向充電）',
    desc: '💡 二次電池充電物理機制：外加高壓電源逆向注入電流時，端電壓滿足 V = ℰ + I·r > ℰ！\n' +
      '1. 觀察未充電時，待充蓄電池 (3.0V, r=1Ω) 斷路端電壓恰為 3.00V。\n' +
      '2. 切換至「👆 互動」模式閉合充電開關，12V 充電樁開始向蓄電池正極強行灌入電流。\n' +
      '3. 觀察檢流計 G 指針明顯偏轉，且蓄電池端電壓瞬間躍升至 3.82V (> 3.0V)，親手驗證充電端電壓躍升原理！',
    category: '第一單元：真實電源——電動勢 ℰ、內阻 r 與端電壓 V',
    defaultGridSize: 12,
    setup: (grid) => {
      // 1. 左側高壓充電樁：12V 直流電源 (y=5, x=2)
      const psu = new Tile('power', 'power_12v');
      psu.rotation = 0; // Pin 0 Top (+12V), Pin 2 Bottom (0V)
      psu.isLocked = true;
      psu.labels[4] = '12V 充電樁';
      grid[5][2] = psu;

      // 2. 上方供電幹線 (Row 3)
      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][2] = wPsuTop;
      const wTopTurnL = new Tile('wire', 'turn'); wTopTurnL.rotation = 1; grid[3][2] = wTopTurnL;
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[3][3] = wTop1;

      // 3. 限流保護電阻 (y=3, x=4)：10Ω (橫向放置，Pin 0 右，Pin 2 左)
      const rLimit = new Tile('resistor', 'standard', 10);
      rLimit.rotation = 1;
      rLimit.isLocked = true;
      rLimit.labels[4] = '限流電阻 10Ω';
      grid[3][4] = rLimit;

      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[3][5] = wTop2;

      // 4. 充電開關 (y=3, x=6)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '充電開關';
      grid[3][6] = sw;

      // 5. 導線接至右側支路 (Col 8)
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[3][7] = wTop3;
      const wTopTurnR = new Tile('wire', 'turn'); wTopTurnR.rotation = 2; grid[3][8] = wTopTurnR; // 左 & 下

      // 6. 靈敏檢流計 (y=4, x=8)：監測充電電流方向
      const galv = new Tile('meter', 'g');
      galv.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      galv.internalR = 0.05; // Low-resistance inline monitor
      galv.isLocked = true;
      galv.labels[4] = '檢流計 G';
      grid[4][8] = galv;

      // 7. [5][8] 為 T 型接頭：連接檢流計、蓄電池正極、右側伏特計 (上、下、右 = rotation 3)
      const wMidT = new Tile('wire', 't'); wMidT.rotation = 3; grid[5][8] = wMidT;

      // 8. 待充真實蓄電池 (y=6, x=8)：ℰ = 3.0V, r = 1.0Ω
      const bat = new Tile('power', 'power_real');
      bat.value = 3.0;
      bat.internalR = 1.0;
      bat.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      bat.isLocked = true;
      bat.labels[4] = '待充電池 (3V, 1Ω)';
      grid[6][8] = bat;

      // 9. 跨接於蓄電池兩端的端電壓錶 (y=6, x=10)
      const wVmTopTurn = new Tile('wire', 'turn'); wVmTopTurn.rotation = 2; grid[5][10] = wVmTopTurn; // 左 & 下
      const wVmTopMid = new Tile('wire', 'straight'); wVmTopMid.rotation = 1; grid[5][9] = wVmTopMid; // 連接 [5][8] T接頭與 [5][10]

      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      vm.labels[4] = '電池端電壓 V';
      grid[6][10] = vm;

      const wVmBotTurn = new Tile('wire', 'turn'); wVmBotTurn.rotation = 3; grid[7][10] = wVmBotTurn; // 左 & 上

      // 10. 下方返回接地幹線 (Row 7)
      // [7][8] 為 T 型接頭：連接左側回路、右側伏特計回路、上方電池負極 (左、右、上 = rotation 2)
      const wBotT = new Tile('wire', 't'); wBotT.rotation = 2; grid[7][8] = wBotT;
      const wBot9 = new Tile('wire', 'straight'); wBot9.rotation = 1; grid[7][9] = wBot9;

      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnL = new Tile('wire', 'turn'); wBotTurnL.rotation = 0; grid[7][2] = wBotTurnL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][2] = wPsuBot;
    },
  },

  // =========================================================================
  // Level 2-1: 靈敏檢流計與微安培感測（雙向偏轉實驗）
  // =========================================================================
  {
    id: 'sh-2-1',
    title: '2-1 靈敏檢流計與微安培感測（雙向偏轉實驗）',
    desc: '💡 靈敏檢流計 Ⓖ 核心特性：滿偏電流僅 500µA，具備中央零點 (Center-Zero) 與正負雙向偏轉能力。\n' +
      '1. 左側為【順向電流測試組】：點擊開關使電流由正極 (Pin 0 紅接頭) 流入，觀察指針向右偏轉至 +250µA 半格刻度。\n' +
      '2. 右側為【反向電流測試組】：點擊開關使電流由負極 (Pin 2 藍接頭) 逆向流入，觀察指針向左偏轉至 -250µA 半格刻度。\n' +
      '3. 親手驗證檢流計對微小電流的高靈敏度與電流方向判別功能！',
    category: '第二單元：微小電流偵測與電錶改裝 (Galvanometer & Multi-range Meters)',
    defaultGridSize: 12,
    setup: (grid) => {
      // ===== 左側：順向電流測試組 (Cols 1 ~ 5) =====
      const bat1 = new Tile('power', 'power_1_5v');
      bat1.rotation = 0;
      bat1.isLocked = true;
      grid[5][1] = bat1;

      const wBat1Top = new Tile('wire', 'straight'); wBat1Top.rotation = 0; grid[4][1] = wBat1Top;
      const wTurn1L = new Tile('wire', 'turn'); wTurn1L.rotation = 1; grid[3][1] = wTurn1L; // 下 & 右
      const wTop1_2 = new Tile('wire', 'straight'); wTop1_2.rotation = 1; grid[3][2] = wTop1_2;

      // 限流電阻 5900Ω (y=3, x=3) (5900 + 100 = 6000Ω -> 1.5V/6000Ω = 250µA)
      const r1 = new Tile('resistor', 'standard', 5900);
      r1.rotation = 1;
      r1.isLocked = true;
      r1.labels[4] = '限流電阻 5.9kΩ';
      grid[3][3] = r1;

      // 順向開關 (y=3, x=4)
      const sw1 = new Tile('switch', 'spst');
      sw1.rotation = 1;
      sw1.isActive = false;
      sw1.isLocked = true;
      sw1.labels[4] = '順向測試開關';
      grid[3][4] = sw1;

      const wTurn1R = new Tile('wire', 'turn'); wTurn1R.rotation = 2; grid[3][5] = wTurn1R; // 左 & 下
      const wGalv1Top = new Tile('wire', 'straight'); wGalv1Top.rotation = 0; grid[4][5] = wGalv1Top;

      // 順向檢流計 (y=5, x=5)：Pin 0 在頂部 (紅接頭)
      const galv1 = new Tile('meter', 'g');
      galv1.rotation = 0;
      galv1.internalR = 100;
      galv1.isLocked = true;
      galv1.labels[4] = '檢流計 (順向)';
      grid[5][5] = galv1;

      const wGalv1Bot = new Tile('wire', 'straight'); wGalv1Bot.rotation = 0; grid[6][5] = wGalv1Bot;
      const wBotTurn1R = new Tile('wire', 'turn'); wBotTurn1R.rotation = 3; grid[7][5] = wBotTurn1R; // 上 & 左
      const wBot1_4 = new Tile('wire', 'straight'); wBot1_4.rotation = 1; grid[7][4] = wBot1_4;
      const wBot1_3 = new Tile('wire', 'straight'); wBot1_3.rotation = 1; grid[7][3] = wBot1_3;
      const wBot1_2 = new Tile('wire', 'straight'); wBot1_2.rotation = 1; grid[7][2] = wBot1_2;
      const wBotTurn1L = new Tile('wire', 'turn'); wBotTurn1L.rotation = 0; grid[7][1] = wBotTurn1L; // 上 & 右
      const wBat1Bot = new Tile('wire', 'straight'); wBat1Bot.rotation = 0; grid[6][1] = wBat1Bot;

      // ===== 右側：反向電流測試組 (Cols 7 ~ 11) =====
      const bat2 = new Tile('power', 'power_1_5v');
      bat2.rotation = 0;
      bat2.isLocked = true;
      grid[5][7] = bat2;

      const wBat2Top = new Tile('wire', 'straight'); wBat2Top.rotation = 0; grid[4][7] = wBat2Top;
      const wTurn2L = new Tile('wire', 'turn'); wTurn2L.rotation = 1; grid[3][7] = wTurn2L; // 下 & 右
      const wTop2_8 = new Tile('wire', 'straight'); wTop2_8.rotation = 1; grid[3][8] = wTop2_8;

      // 限流電阻 5900Ω (y=3, x=9)
      const r2 = new Tile('resistor', 'standard', 5900);
      r2.rotation = 1;
      r2.isLocked = true;
      r2.labels[4] = '限流電阻 5.9kΩ';
      grid[3][9] = r2;

      // 反向開關 (y=3, x=10)
      const sw2 = new Tile('switch', 'spst');
      sw2.rotation = 1;
      sw2.isActive = false;
      sw2.isLocked = true;
      sw2.labels[4] = '反向測試開關';
      grid[3][10] = sw2;

      const wTurn2R = new Tile('wire', 'turn'); wTurn2R.rotation = 2; grid[3][11] = wTurn2R; // 左 & 下
      const wGalv2Top = new Tile('wire', 'straight'); wGalv2Top.rotation = 0; grid[4][11] = wGalv2Top;

      // 反向檢流計 (y=5, x=11)：rotation = 2 (Pin 2 藍接頭在頂部，Pin 0 紅接頭在底部)
      const galv2 = new Tile('meter', 'g');
      galv2.rotation = 2;
      galv2.internalR = 100;
      galv2.isLocked = true;
      galv2.labels[4] = '檢流計 (反向)';
      grid[5][11] = galv2;

      const wGalv2Bot = new Tile('wire', 'straight'); wGalv2Bot.rotation = 0; grid[6][11] = wGalv2Bot;
      const wBotTurn2R = new Tile('wire', 'turn'); wBotTurn2R.rotation = 3; grid[7][11] = wBotTurn2R; // 上 & 左
      const wBot2_10 = new Tile('wire', 'straight'); wBot2_10.rotation = 1; grid[7][10] = wBot2_10;
      const wBot2_9 = new Tile('wire', 'straight'); wBot2_9.rotation = 1; grid[7][9] = wBot2_9;
      const wBot2_8 = new Tile('wire', 'straight'); wBot2_8.rotation = 1; grid[7][8] = wBot2_8;
      const wBotTurn2L = new Tile('wire', 'turn'); wBotTurn2L.rotation = 0; grid[7][7] = wBotTurn2L; // 上 & 右
      const wBat2Bot = new Tile('wire', 'straight'); wBat2Bot.rotation = 0; grid[6][7] = wBat2Bot;
    },
  },

  // =========================================================================
  // Level 2-2: 檢流計改裝安培計（並聯低阻分流器 Shunt）
  // =========================================================================
  {
    id: 'sh-2-2',
    title: '2-2 檢流計改裝安培計（並聯低阻分流器 Shunt）',
    desc: '💡 安培計改裝原理：檢流計滿刻度僅 500µA，欲擴大量程為 5.00mA (擴大 10 倍)，必須並聯微小分流電阻 Rs！\n' +
      '理論計算：Rs = rg / (n - 1) = 100Ω / (10 - 1) ≈ 11.1Ω。\n' +
      '1. 閉合主開關，但【保持分流開關斷開】，觀察 5mA 大電流全部衝入檢流計造成嚴重爆錶 (> 4.5mA)！\n' +
      '2. 切換至「👆 互動」工具，閉合右側【分流開關】，將 Rs = 11.1Ω 並聯接上。\n' +
      '3. 觀察 90% 的電流 (4.50mA) 被 Rs 分流排走，只有 10% (500µA) 通過檢流計，指針恰好滿刻度偏轉，成功改裝為 5mA 安培計！',
    category: '第二單元：微小電流偵測與電錶改裝 (Galvanometer & Multi-range Meters)',
    defaultGridSize: 12,
    setup: (grid) => {
      // 1. 5V 直流電源 (y=5, x=2)
      const psu = new Tile('power', 'power_dc');
      psu.value = 5;
      psu.rotation = 0;
      psu.isLocked = true;
      psu.labels[4] = '5.0V 直流電源';
      grid[5][2] = psu;

      // 2. 上方幹線 (Row 3)
      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][2] = wPsuTop;
      const wTopTurnL = new Tile('wire', 'turn'); wTopTurnL.rotation = 1; grid[3][2] = wTopTurnL; // 下 & 右
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[3][3] = wTop3;

      // 主迴路負載電阻 990Ω (y=3, x=4) (990 + 10 = 1000Ω -> 總電流剛好 5.00mA)
      const rMain = new Tile('resistor', 'standard', 990);
      rMain.rotation = 1;
      rMain.isLocked = true;
      rMain.labels[4] = '負載電阻 990Ω';
      grid[3][4] = rMain;

      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[3][5] = wTop5;

      // 主控開關 (y=3, x=6)
      const swMain = new Tile('switch', 'spst');
      swMain.rotation = 1;
      swMain.isActive = false;
      swMain.isLocked = true;
      swMain.labels[4] = '主控開關';
      grid[3][6] = swMain;

      // 串聯基準總電流錶 (y=3, x=7)：監測總電流 (目標 5.00mA)
      const amRef = new Tile('meter', 'a');
      amRef.rotation = 1;
      amRef.isLocked = true;
      amRef.labels[4] = '總電流 5mA';
      grid[3][7] = amRef;

      // [3][8] 為 T 型接頭：引出檢流計支路與並聯分流支路 (左、右、下 = rotation 0)
      const wTopT = new Tile('wire', 't'); wTopT.rotation = 0; grid[3][8] = wTopT;

      // ===== 中央支路：待改裝檢流計 Ⓖ (Col 8) =====
      const wGalvTop = new Tile('wire', 'straight'); wGalvTop.rotation = 0; grid[4][8] = wGalvTop;
      const galv = new Tile('meter', 'g');
      galv.rotation = 0;
      galv.internalR = 100;
      galv.isLocked = true;
      galv.labels[4] = '檢流計 (100Ω)';
      grid[5][8] = galv;
      const wGalvBot = new Tile('wire', 'straight'); wGalvBot.rotation = 0; grid[6][8] = wGalvBot;

      // ===== 右側支路：並聯分流器 Rs (Col 10) =====
      const wTop9 = new Tile('wire', 'straight'); wTop9.rotation = 1; grid[3][9] = wTop9;
      const wTopTurnR = new Tile('wire', 'turn'); wTopTurnR.rotation = 2; grid[3][10] = wTopTurnR; // 左 & 下

      // 分流開關 (y=4, x=10)：縱向放置
      const swShunt = new Tile('switch', 'spst');
      swShunt.rotation = 0; // Vertical
      swShunt.isActive = false; // 初始斷開，以體驗未並聯時的爆錶
      swShunt.isLocked = true;
      swShunt.labels[4] = '分流開關';
      grid[4][10] = swShunt;

      // 分流電阻 Rs = 11.1Ω (y=5, x=10)
      const rShunt = new Tile('resistor', 'standard', 11.1);
      rShunt.rotation = 0;
      rShunt.isLocked = true;
      rShunt.labels[4] = '分流電阻 11.1Ω';
      grid[5][10] = rShunt;

      const wShuntBot = new Tile('wire', 'straight'); wShuntBot.rotation = 0; grid[6][10] = wShuntBot;
      const wBotTurnR = new Tile('wire', 'turn'); wBotTurnR.rotation = 3; grid[7][10] = wBotTurnR; // 上 & 左

      // 下方接地返回幹線 (Row 7)
      const wBot9 = new Tile('wire', 'straight'); wBot9.rotation = 1; grid[7][9] = wBot9;

      // [7][8] 為 T 型接頭：匯流檢流計與分流器電流 (左、右、上 = rotation 2)
      const wBotT = new Tile('wire', 't'); wBotT.rotation = 2; grid[7][8] = wBotT;

      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnL = new Tile('wire', 'turn'); wBotTurnL.rotation = 0; grid[7][2] = wBotTurnL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][2] = wPsuBot;
    },
  },

  // =========================================================================
  // Level 2-3: 檢流計改裝伏特計（串聯高阻倍率器 Multiplier）
  // =========================================================================
  {
    id: 'sh-2-3',
    title: '2-3 檢流計改裝伏特計（串聯高阻倍率器 Multiplier）',
    desc: '💡 伏特計改裝原理：檢流計滿偏電壓僅 Vg = Ig·rg = 500µA × 100Ω = 0.05V (50mV)！\n' +
      '欲改裝為 5.00V 伏特計，必須串聯高阻倍率電阻 Rm：\n' +
      'Rm = V_target / Ig - rg = 5.00V / 0.0005A - 100Ω = 9,900Ω (9.9kΩ)。\n' +
      '1. 觀察左側 5.0V 直流電壓源與標準伏特計 (5.00V)。\n' +
      '2. 切換至「👆 互動」工具，閉合【量測測試開關】。\n' +
      '3. 觀察串聯 9.9kΩ 倍率電阻後，迴路電流恰好為 500µA，檢流計指針精確指示滿刻度！成功將 50mV 檢流計改裝為 5.00V 實用伏特計！',
    category: '第二單元：微小電流偵測與電錶改裝 (Galvanometer & Multi-range Meters)',
    defaultGridSize: 12,
    setup: (grid) => {
      // 1. 5V 直流電源 (y=5, x=2)
      const psu = new Tile('power', 'power_dc');
      psu.value = 5;
      psu.rotation = 0;
      psu.isLocked = true;
      psu.labels[4] = '5.0V 直流電源';
      grid[5][2] = psu;

      // 2. 上方供電幹線 (Row 3)
      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][2] = wPsuTop;
      const wTopTurnL = new Tile('wire', 'turn'); wTopTurnL.rotation = 1; grid[3][2] = wTopTurnL; // 下 & 右
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[3][3] = wTop3;

      // [3][4] 為 T 型接頭：引出基準伏特計 (左、右、下 = rotation 0)
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[3][4] = wTopT1;

      // 3. 基準伏特計 (y=5, x=4)：監測電源精確 5.00V
      const wVmRefTop = new Tile('wire', 'straight'); wVmRefTop.rotation = 0; grid[4][4] = wVmRefTop;
      const vmRef = new Tile('meter', 'v');
      vmRef.rotation = 0;
      vmRef.isLocked = true;
      vmRef.labels[4] = '基準電壓錶 V';
      grid[5][4] = vmRef;
      const wVmRefBot = new Tile('wire', 'straight'); wVmRefBot.rotation = 0; grid[6][4] = wVmRefBot;

      // 4. 幹線向右連接至改裝模組
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[3][5] = wTop5;

      // 測試開關 (y=3, x=6)
      const swTest = new Tile('switch', 'spst');
      swTest.rotation = 1;
      swTest.isActive = false;
      swTest.isLocked = true;
      swTest.labels[4] = '量測測試開關';
      grid[3][6] = swTest;

      const wTop7 = new Tile('wire', 'straight'); wTop7.rotation = 1; grid[3][7] = wTop7;
      const wTopTurnR = new Tile('wire', 'turn'); wTopTurnR.rotation = 2; grid[3][8] = wTopTurnR; // 左 & 下

      // 5. 改裝伏特計模組 (Col 8)：
      // 串聯倍率電阻 Rm = 9900Ω (y=4, x=8)
      const rMult = new Tile('resistor', 'standard', 9900);
      rMult.rotation = 0; // Vertical
      rMult.isLocked = true;
      rMult.labels[4] = '倍率電阻 9.9kΩ';
      grid[4][8] = rMult;

      // 串聯檢流計 (y=5, x=8) (Pin 0 在頂部)
      const galv = new Tile('meter', 'g');
      galv.rotation = 0;
      galv.internalR = 100;
      galv.isLocked = true;
      galv.labels[4] = '改裝伏特計 (G)';
      grid[5][8] = galv;

      const wGalvBot = new Tile('wire', 'straight'); wGalvBot.rotation = 0; grid[6][8] = wGalvBot;
      const wBotTurnR = new Tile('wire', 'turn'); wBotTurnR.rotation = 3; grid[7][8] = wBotTurnR; // 上 & 左

      // 6. 下方返回接地幹線 (Row 7)
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;

      // [7][4] 為 T 型接頭：接回基準伏特計負極 (左、右、上 = rotation 2)
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][4] = wBotT1;

      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnL = new Tile('wire', 'turn'); wBotTurnL.rotation = 0; grid[7][2] = wBotTurnL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][2] = wPsuBot;
    },
  },

  // =========================================================================
  // 第三單元：非歐姆導體與二極體單向導電 (Diode & PN Junction)
  // =========================================================================
  {
    id: 'sh-3-1',
    title: '3-1 二極體單向導電性與順向門檻電壓 (0.7V)',
    category: '第三單元：非歐姆導體與二極體單向導電',
    description:
      '【實驗物理原理】：\n' +
      '二極體（1N4007）由 P 型與 N 型半導體組成 PN 接面，具有非線性且單向導電之非歐姆特性：\n' +
      '1. 順向偏壓 (Forward Bias)：外加電壓突破障壁電位門檻（矽二極體約 0.7V），空乏區消失，多數載流子劇烈擴散導通，燈泡點亮！伏特計 CH1 測得順向導通壓降約 0.69V。\n' +
      '2. 逆向偏壓 (Reverse Bias)：外加電場增強內建電場，空乏區擴大，僅有微弱少數載流子漂移逆向漏電流（近似斷路），燈泡完全熄滅！伏特計 CH2 測得承受全部電源電壓 5.00V。\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，同時閉合左側【順向開關】與右側【逆向開關】。\n' +
      '2. 觀察左側 1N4007 晶體發出青綠導通光暈與燈泡發光，並對照右側逆向二極體之截止狀態。\n' +
      '3. 點擊「⚡ 驗證實驗」完成單元評測！',
    targetComponentTypes: ['diode', 'load', 'meter'],
    initGrid: (grid: (Tile | null)[][]) => {
      // ----------------------------------------------------
      // 左組：順向偏壓 (Forward Bias) - Cols 1..4
      // ----------------------------------------------------
      // 1. 5V 直流電源 (y=5, x=1)
      const psuFwd = new Tile('power', 'power_dc', 5);
      psuFwd.rotation = 0; // Pin 0 top (+), Pin 2 bottom (-)
      psuFwd.isLocked = true;
      psuFwd.labels[4] = '5.0V 電源';
      grid[5][1] = psuFwd;

      const wPsuFwdTop = new Tile('wire', 'straight'); wPsuFwdTop.rotation = 0; grid[4][1] = wPsuFwdTop;
      const wFwdTurnTL = new Tile('wire', 'turn'); wFwdTurnTL.rotation = 1; grid[3][1] = wFwdTurnTL; // 下 & 右

      // 2. 順向開關 (y=3, x=2)
      const swFwd = new Tile('switch', 'spst');
      swFwd.rotation = 1;
      swFwd.isActive = false;
      swFwd.isLocked = true;
      swFwd.labels[4] = '順向開關';
      grid[3][2] = swFwd;

      // 3. 上分流接頭 (y=3, x=3) (左、右、下 = rotation 0)
      const wFwdTTop = new Tile('wire', 't'); wFwdTTop.rotation = 0; grid[3][3] = wFwdTTop;

      // 4. 順向 1N4007 二極體 (y=4, x=3) (Pin 0 頂部陽極, Pin 2 底部陰極)
      const diodeFwd = new Tile('diode', '1n4007');
      diodeFwd.rotation = 0;
      diodeFwd.isLocked = true;
      diodeFwd.labels[4] = '1N4007 順向';
      grid[4][3] = diodeFwd;

      // 5. 並聯伏特計 CH1 (y=4, x=4)
      const wFwdVmTop = new Tile('wire', 'turn'); wFwdVmTop.rotation = 2; grid[3][4] = wFwdVmTop; // 左 & 下
      const vmFwd = new Tile('meter', 'v');
      vmFwd.rotation = 0;
      vmFwd.isLocked = true;
      vmFwd.labels[4] = '1'; // CH1
      grid[4][4] = vmFwd;
      const wFwdVmBot = new Tile('wire', 'turn'); wFwdVmBot.rotation = 3; grid[5][4] = wFwdVmBot; // 上 & 左

      // 6. 下匯流接頭 (y=5, x=3) (上、下、右 = rotation 3)
      const wFwdTBot = new Tile('wire', 't'); wFwdTBot.rotation = 3; grid[5][3] = wFwdTBot;

      // 7. 負載燈泡 (y=6, x=3)
      const bulbFwd = new Tile('load', 'bulb', 50);
      bulbFwd.rotation = 0;
      bulbFwd.isLocked = true;
      bulbFwd.labels[4] = '負載燈泡 50Ω';
      grid[6][3] = bulbFwd;

      // 8. 返回接地線 (Row 7)
      const wFwdTurnBL = new Tile('wire', 'turn'); wFwdTurnBL.rotation = 3; grid[7][3] = wFwdTurnBL; // 上 & 左
      const wFwdBot2 = new Tile('wire', 'straight'); wFwdBot2.rotation = 1; grid[7][2] = wFwdBot2;
      const wFwdTurnBR = new Tile('wire', 'turn'); wFwdTurnBR.rotation = 0; grid[7][1] = wFwdTurnBR; // 上 & 右
      const wPsuFwdBot = new Tile('wire', 'straight'); wPsuFwdBot.rotation = 0; grid[6][1] = wPsuFwdBot;

      // ----------------------------------------------------
      // 右組：逆向偏壓 (Reverse Bias) - Cols 7..10
      // ----------------------------------------------------
      // 1. 5V 直流電源 (y=5, x=7)
      const psuRev = new Tile('power', 'power_dc', 5);
      psuRev.rotation = 0;
      psuRev.isLocked = true;
      psuRev.labels[4] = '5.0V 電源';
      grid[5][7] = psuRev;

      const wPsuRevTop = new Tile('wire', 'straight'); wPsuRevTop.rotation = 0; grid[4][7] = wPsuRevTop;
      const wRevTurnTL = new Tile('wire', 'turn'); wRevTurnTL.rotation = 1; grid[3][7] = wRevTurnTL; // 下 & 右

      // 2. 逆向開關 (y=3, x=8)
      const swRev = new Tile('switch', 'spst');
      swRev.rotation = 1;
      swRev.isActive = false;
      swRev.isLocked = true;
      swRev.labels[4] = '逆向開關';
      grid[3][8] = swRev;

      // 3. 上分流接頭 (y=3, x=9)
      const wRevTTop = new Tile('wire', 't'); wRevTTop.rotation = 0; grid[3][9] = wRevTTop;

      // 4. 逆向 1N4007 二極體 (y=4, x=9) (rotation 2: Pin 2 頂部陰極, Pin 0 底部陽極)
      const diodeRev = new Tile('diode', '1n4007');
      diodeRev.rotation = 2; // 反向安裝
      diodeRev.isLocked = true;
      diodeRev.labels[4] = '1N4007 逆向';
      grid[4][9] = diodeRev;

      // 5. 並聯伏特計 CH2 (y=4, x=10)
      const wRevVmTop = new Tile('wire', 'turn'); wRevVmTop.rotation = 2; grid[3][10] = wRevVmTop;
      const vmRev = new Tile('meter', 'v');
      vmRev.rotation = 0;
      vmRev.isLocked = true;
      vmRev.labels[4] = '2'; // CH2
      grid[4][10] = vmRev;
      const wRevVmBot = new Tile('wire', 'turn'); wRevVmBot.rotation = 3; grid[5][10] = wRevVmBot;

      // 6. 下匯流接頭 (y=5, x=9)
      const wRevTBot = new Tile('wire', 't'); wRevTBot.rotation = 3; grid[5][9] = wRevTBot;

      // 7. 負載燈泡 (y=6, x=9)
      const bulbRev = new Tile('load', 'bulb', 50);
      bulbRev.rotation = 0;
      bulbRev.isLocked = true;
      bulbRev.labels[4] = '負載燈泡 50Ω';
      grid[6][9] = bulbRev;

      // 8. 返回接地線 (Row 7)
      const wRevTurnBL = new Tile('wire', 'turn'); wRevTurnBL.rotation = 3; grid[7][9] = wRevTurnBL;
      const wRevBot8 = new Tile('wire', 'straight'); wRevBot8.rotation = 1; grid[7][8] = wRevBot8;
      const wRevTurnBR = new Tile('wire', 'turn'); wRevTurnBR.rotation = 0; grid[7][7] = wRevTurnBR;
      const wPsuRevBot = new Tile('wire', 'straight'); wPsuRevBot.rotation = 0; grid[6][7] = wPsuRevBot;
    },
  },

  {
    id: 'sh-3-2',
    title: '3-2 半波整流電路（AC 轉脈衝 DC）',
    category: '第三單元：非歐姆導體與二極體單向導電',
    description:
      '【實驗物理原理】：\n' +
      '交流電源輸出正弦波電壓：v(t) = 12·sin(2π·f·t)（f = 1Hz, 峰值 12V）。\n' +
      '1. 正半週時 (0 < 2πft < π)：交流電源頂部為正，二極體 1N4007 順向偏壓導通，負載獲得正向脈衝電壓（峰值約 12V - 0.7V = 11.3V）。\n' +
      '2. 負半週時 (π < 2πft < 2π)：交流電源極性反轉，二極體逆向截止（斷路），負載電壓被嚴格夾止於 0V！\n' +
      '3. 示波器觀測：右側示波器設為 CH1 時即時捕捉負載端之【正半波脈衝直流】；切換至 CH2 可同步觀察輸入端【完整正弦交流電】！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，閉合【整流主開關】。\n' +
      '2. 觀察右側面板【CRT 示波器】CH1 即時顯示之正半波整流波形。\n' +
      '3. 點擊「⚡ 驗證實驗」完成檢驗！',
    targetComponentTypes: ['power', 'diode', 'resistor', 'meter'],
    initGrid: (grid: (Tile | null)[][]) => {
      // 1. 交流電源 (y=5, x=2) 12V 峰值, 1Hz
      const acPsu = new Tile('power', 'power_ac', 1); // 1Hz AC
      acPsu.rotation = 0;
      acPsu.isLocked = true;
      acPsu.labels[4] = 'AC 12V 1Hz';
      grid[5][2] = acPsu;

      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][2] = wPsuTop;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[3][2] = wTurnTL; // 下 & 右
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[3][3] = wTop3;

      // 2. 整流主開關 (y=3, x=4)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '整流主開關';
      grid[3][4] = sw;

      // 3. AC 輸入監測點 (Col 5)
      // 上方分流 T (y=3, x=5) (左、右、下 = rotation 0)
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[3][5] = wTopT1;

      // AC 輸入監測伏特計 (y=4, x=5) (CH2)
      const vmAc = new Tile('meter', 'v');
      vmAc.rotation = 0;
      vmAc.isLocked = true;
      vmAc.labels[4] = '2'; // CH2 (AC Input Monitor)
      grid[4][5] = vmAc;

      const wAcVmBot = new Tile('wire', 'straight'); wAcVmBot.rotation = 0; grid[5][5] = wAcVmBot;
      const wAcVmBot2 = new Tile('wire', 'straight'); wAcVmBot2.rotation = 0; grid[6][5] = wAcVmBot2;
      // 接地匯流接頭 (y=7, x=5) (左、上、右 = rotation 2)
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][5] = wBotT1;

      // 4. 整流二極體 (Col 7)
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[3][6] = wTop6;
      const wTurnTR = new Tile('wire', 'turn'); wTurnTR.rotation = 2; grid[3][7] = wTurnTR; // 左 & 下

      // 1N4007 二極體 (y=4, x=7) (Pin 0 頂部陽極, Pin 2 底部陰極)
      const diode = new Tile('diode', '1n4007');
      diode.rotation = 0;
      diode.isLocked = true;
      diode.labels[4] = '1N4007 半波整流';
      grid[4][7] = diode;

      // 二極體陰極與負載連接接頭 (y=5, x=7) (上、下、右 = rotation 3)
      const wLoadTTop = new Tile('wire', 't'); wLoadTTop.rotation = 3; grid[5][7] = wLoadTTop;

      // 負載電阻 RL = 100Ω (y=6, x=7)
      const rLoad = new Tile('resistor', 'standard', 100);
      rLoad.rotation = 0;
      rLoad.isLocked = true;
      rLoad.labels[4] = '負載 RL 100Ω';
      grid[6][7] = rLoad;

      // 下方接地匯流接頭 (y=7, x=7) (左、上、右 = rotation 2)
      const wBotT2 = new Tile('wire', 't'); wBotT2.rotation = 2; grid[7][7] = wBotT2;

      // 5. 輸出示波器探棒 / 伏特計 CH1 (Col 9)
      const wProbeTopTurn = new Tile('wire', 'straight'); wProbeTopTurn.rotation = 1; grid[5][8] = wProbeTopTurn;
      const wProbeTurnR = new Tile('wire', 'turn'); wProbeTurnR.rotation = 2; grid[5][9] = wProbeTurnR; // 左 & 下

      // 輸出端測量伏特計 (y=6, x=9) (CH1)
      const vmOut = new Tile('meter', 'v');
      vmOut.rotation = 0;
      vmOut.isLocked = true;
      vmOut.labels[4] = '1'; // CH1 (Oscilloscope Output Probe)
      grid[6][9] = vmOut;

      const wProbeTurnBR = new Tile('wire', 'turn'); wProbeTurnBR.rotation = 3; grid[7][9] = wProbeTurnBR; // 上 & 左
      const wProbeBotTurn = new Tile('wire', 'straight'); wProbeBotTurn.rotation = 1; grid[7][8] = wProbeBotTurn;

      // 6. 接地返回主線 (Row 7)
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBotTurnBL = new Tile('wire', 'turn'); wBotTurnBL.rotation = 0; grid[7][2] = wBotTurnBL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][2] = wPsuBot;
    },
  },

  {
    id: 'sh-3-3',
    title: '3-3 全波橋式整流電路（四顆二極體）',
    category: '第三單元：非歐姆導體與二極體單向導電',
    description:
      '【實驗物理原理】：\n' +
      '全波橋式整流器（Graetz Bridge）由 4 顆二極體（D1~D4）構成閉合電橋：\n' +
      '1. 正半週（AC1 正、AC2 負）：電流經 D1 向上注入 DC+ 母線，順向穿過負載 RL，再由 DC- 母線經 D2 返回 AC2 端。\n' +
      '2. 負半週（AC2 正、AC1 負）：電流經 D3 向上注入 DC+ 母線，依然順向穿過負載 RL，再由 DC- 母線經 D4 返回 AC1 端。\n' +
      '3. 輸出特性：負載 RL 的電流方向恆由上至下！交流負半週被徹底「翻轉」為正電壓，脈衝頻率為交流電的 2 倍（2f = 2Hz），直流轉換效率為半波整流之兩倍！\n' +
      '4. 中間絕緣天橋 (Bridge Wire)：巧妙跨接 AC2 訊號線穿透 D1/D4 橋臂，實現乾淨俐落之平面電路！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，閉合【整流主開關】。\n' +
      '2. 觀看四顆 1N4007 二極體兩兩交替導通光暈 (D1+D2 ↔ D3+D4)。\n' +
      '3. 在右側面板【CRT 示波器】CH1 觀察雙倍頻全波整流波形，點擊「⚡ 驗證實驗」完成檢驗！',
    targetComponentTypes: ['power', 'diode', 'resistor', 'wire', 'meter'],
    initGrid: (grid: (Tile | null)[][]) => {
      // 1. 交流電源 (y=5, x=1) 12V 峰值, 1Hz
      const acPsu = new Tile('power', 'power_ac', 1);
      acPsu.rotation = 0;
      acPsu.isLocked = true;
      acPsu.labels[4] = 'AC 12V 1Hz';
      grid[5][1] = acPsu;

      // 2. AC1 上主線 (經過開關)
      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][1] = wPsuTop;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[3][1] = wTurnTL; // 下 & 右

      // 整流主開關 (y=3, x=2)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '整流主開關';
      grid[3][2] = sw;

      const wTurnSwR = new Tile('wire', 'turn'); wTurnSwR.rotation = 2; grid[3][3] = wTurnSwR; // 左 & 下
      const wTurnAc1 = new Tile('wire', 'turn'); wTurnAc1.rotation = 0; grid[4][3] = wTurnAc1; // 上 & 右
      const wAc1_4 = new Tile('wire', 'straight'); wAc1_4.rotation = 1; grid[4][4] = wAc1_4;

      // 3. AC2 下主線 (繞過 AC1，穿過絕緣天橋)
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][1] = wPsuBot;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[7][1] = wTurnBL; // 上 & 右
      const wAc2_2 = new Tile('wire', 'straight'); wAc2_2.rotation = 1; grid[7][2] = wAc2_2;
      const wTurnAc2_3 = new Tile('wire', 'turn'); wTurnAc2_3.rotation = 3; grid[7][3] = wTurnAc2_3; // 上 & 左
      const wAc2_6_3 = new Tile('wire', 'straight'); wAc2_6_3.rotation = 0; grid[6][3] = wAc2_6_3;
      const wTurnAc2_5_3 = new Tile('wire', 'turn'); wTurnAc2_5_3.rotation = 1; grid[5][3] = wTurnAc2_5_3; // 下 & 右
      const wAc2_4 = new Tile('wire', 'straight'); wAc2_4.rotation = 1; grid[5][4] = wAc2_4;

      // 4. Graetz 橋臂一 (Col 5)：
      // [4][5] 為 AC1 接頭：向上連接 D1 陽極，向下穿過天橋垂直引線連接 D4 陰極
      const wNodeA = new Tile('wire', 't'); wNodeA.rotation = 1; grid[4][5] = wNodeA; // 下、左、上 = rotation 1

      // D1 二極體 (y=3, x=5) (rotation 2: Pin 0 底部陽極, Pin 2 頂部陰極)
      const d1 = new Tile('diode', '1n4007');
      d1.rotation = 2;
      d1.isLocked = true;
      d1.labels[4] = 'D1';
      grid[3][5] = d1;

      // 絕緣天橋 (y=5, x=5)：Pin 0/2 垂直導通 (Node A -> D4 陰極)；Pin 3/1 水平拱起跨接 AC2！
      const bridge = new Tile('wire', 'bridge');
      bridge.rotation = 0;
      bridge.isLocked = true;
      grid[5][5] = bridge;

      // D4 二極體 (y=6, x=5) (rotation 2: Pin 0 底部陽極, Pin 2 頂部陰極)
      const d4 = new Tile('diode', '1n4007');
      d4.rotation = 2;
      d4.isLocked = true;
      d4.labels[4] = 'D4';
      grid[6][5] = d4;

      // 5. AC2 穿越天橋後連接至橋臂二 (Col 6..7)：
      const wAc2_6 = new Tile('wire', 'straight'); wAc2_6.rotation = 1; grid[5][6] = wAc2_6;

      // 6. Graetz 橋臂二 (Col 7)：
      // [5][7] 為 AC2 接頭：向上連接 D3 陽極，向下連接 D2 陰極
      const wNodeB = new Tile('wire', 't'); wNodeB.rotation = 1; grid[5][7] = wNodeB; // 下、左、上 = rotation 1
      const wD3Lead = new Tile('wire', 'straight'); wD3Lead.rotation = 0; grid[4][7] = wD3Lead;

      // D3 二極體 (y=3, x=7) (rotation 2: Pin 0 底部陽極, Pin 2 頂部陰極)
      const d3 = new Tile('diode', '1n4007');
      d3.rotation = 2;
      d3.isLocked = true;
      d3.labels[4] = 'D3';
      grid[3][7] = d3;

      // D2 二極體 (y=6, x=7) (rotation 2: Pin 0 底部陽極, Pin 2 頂部陰極)
      const d2 = new Tile('diode', '1n4007');
      d2.rotation = 2;
      d2.isLocked = true;
      d2.labels[4] = 'D2';
      grid[6][7] = d2;

      // 7. DC+ 頂部母線 (Row 2)
      const wDcPlusTL = new Tile('wire', 'turn'); wDcPlusTL.rotation = 1; grid[2][5] = wDcPlusTL; // 下 & 右
      const wDcPlus6 = new Tile('wire', 'straight'); wDcPlus6.rotation = 1; grid[2][6] = wDcPlus6;
      const wDcPlusT3 = new Tile('wire', 't'); wDcPlusT3.rotation = 0; grid[2][7] = wDcPlusT3; // 左、下、右
      const wDcPlus8 = new Tile('wire', 'straight'); wDcPlus8.rotation = 1; grid[2][8] = wDcPlus8;
      const wDcPlus9 = new Tile('wire', 'straight'); wDcPlus9.rotation = 1; grid[2][9] = wDcPlus9;
      const wDcPlusTR = new Tile('wire', 'turn'); wDcPlusTR.rotation = 2; grid[2][10] = wDcPlusTR; // 左 & 下

      // 8. DC- 底部母線 (Row 7)
      const wDcMinusBL = new Tile('wire', 'turn'); wDcMinusBL.rotation = 0; grid[7][5] = wDcMinusBL; // 上 & 右
      const wDcMinus6 = new Tile('wire', 'straight'); wDcMinus6.rotation = 1; grid[7][6] = wDcMinus6;
      const wDcMinusT2 = new Tile('wire', 't'); wDcMinusT2.rotation = 2; grid[7][7] = wDcMinusT2; // 左、上、右
      const wDcMinus8 = new Tile('wire', 'straight'); wDcMinus8.rotation = 1; grid[7][8] = wDcMinus8;
      const wDcMinus9 = new Tile('wire', 'straight'); wDcMinus9.rotation = 1; grid[7][9] = wDcMinus9;
      const wDcMinusBR = new Tile('wire', 'turn'); wDcMinusBR.rotation = 3; grid[7][10] = wDcMinusBR; // 上 & 左

      // 9. 負載電阻與示波器探棒 (Col 10..11)
      const wLoadLeadTop = new Tile('wire', 'straight'); wLoadLeadTop.rotation = 0; grid[3][10] = wLoadLeadTop;
      const wLoadTTop = new Tile('wire', 't'); wLoadTTop.rotation = 3; grid[4][10] = wLoadTTop; // 上、下、右

      // 負載電阻 RL = 100Ω (y=5, x=10)
      const rLoad = new Tile('resistor', 'standard', 100);
      rLoad.rotation = 0;
      rLoad.isLocked = true;
      rLoad.labels[4] = '負載 RL 100Ω';
      grid[5][10] = rLoad;

      const wLoadTBot = new Tile('wire', 't'); wLoadTBot.rotation = 3; grid[6][10] = wLoadTBot; // 上、下、右

      // 示波器 CH1 探棒 / 伏特計 (y=5, x=11)
      const wVmTopTurn = new Tile('wire', 'turn'); wVmTopTurn.rotation = 2; grid[4][11] = wVmTopTurn; // 左 & 下
      const vmBridge = new Tile('meter', 'v');
      vmBridge.rotation = 0;
      vmBridge.isLocked = true;
      vmBridge.labels[4] = '1'; // CH1
      grid[5][11] = vmBridge;
      const wVmBotTurn = new Tile('wire', 'turn'); wVmBotTurn.rotation = 3; grid[6][11] = wVmBotTurn; // 上 & 左
    },
  },

  // =========================================================================
  // 第四單元：電感器與 RL 暫態電路 (Inductor & RL Transient)
  // =========================================================================
  {
    id: 'sh-4-1',
    title: '4-1 冷次定律與電感抗拒電流變化',
    category: '第四單元：電感器與 RL 暫態電路',
    desc: '💡 冷次定律雙支路對照實驗：閉合通電開關，觀察純電阻支路燈泡 L1「瞬間全亮」與大電感支路燈泡 L2「緩慢漸亮」的鮮明對比！',
    description:
      '【實驗物理原理】：\n' +
      '根據法拉第電磁感應定律與冷次定律（Lenz\'s Law）：\n' +
      '當流經線圈之電流急遽變化時，線圈內部磁通量產生變化，進而感應出反抗磁通變化的自感電動勢（Back EMF）：\n' +
      'ℰ_L = -L · (di/dt)。\n\n' +
      '【雙支路對照實驗】：\n' +
      '1. 左側【純電阻對照組】：串聯電阻 50Ω 與燈泡 L1 (50Ω)。開關閉合瞬間，無反電動勢阻礙，電流瞬間達穩態 50mA，燈泡 L1 瞬間全亮！\n' +
      '2. 右側【電感實驗組】：串聯大電感 25H 與同款燈泡 L2 (50Ω)。開關閉合瞬間，自感電動勢極大抵消電源電壓，迴路電流由 0 緩慢指數爬升（時間常數 τ = L/R = 0.5s），燈泡 L2 呈現肉眼可見的「由暗漸亮」延遲亮起！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，點擊閉合【通電主開關】。\n' +
      '2. 親眼觀察對照燈泡 L1「瞬間發光」與實驗燈泡 L2「緩慢漸亮」的鮮明對比！\n' +
      '3. 點擊「⚡ 驗證實驗」完成評測！',
    defaultGridSize: 12,
    targetComponentTypes: ['inductor', 'load', 'resistor'],
    setup: (grid: (Tile | null)[][]) => {
      // 1. 5V 直流電源 (y=5, x=1)
      const psu = new Tile('power', 'power_dc', 5);
      psu.rotation = 0; // Pin 0 top (+), Pin 2 bottom (-)
      psu.isLocked = true;
      psu.labels[4] = '5.0V 電源';
      grid[5][1] = psu;

      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][1] = wPsuTop;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[3][1] = wTurnTL; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[3][2] = wTop2;

      // 2. 通電主開關 (y=3, x=3)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '通電主開關';
      grid[3][3] = sw;

      const wTop4 = new Tile('wire', 'straight'); wTop4.rotation = 1; grid[3][4] = wTop4;
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[3][5] = wTop5;

      // 3. 支路一分流接頭 (y=3, x=6) (左、下、右 = rotation 0)
      const wTopT = new Tile('wire', 't'); wTopT.rotation = 0; grid[3][6] = wTopT;

      const rRef = new Tile('resistor', 'standard', 50);
      rRef.rotation = 0;
      rRef.isLocked = true;
      rRef.labels[4] = '電阻 50Ω';
      grid[4][6] = rRef;

      const bulb1 = new Tile('load', 'lightbulb', 50);
      bulb1.rotation = 0;
      bulb1.isLocked = true;
      bulb1.labels[4] = 'L1 (即亮)';
      grid[5][6] = bulb1;

      const wRefLead = new Tile('wire', 'straight'); wRefLead.rotation = 0; grid[6][6] = wRefLead;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][6] = wBotT1; // 左、上、右

      // 4. 支路二：電感實驗組 (Col 9)
      const wTop7 = new Tile('wire', 'straight'); wTop7.rotation = 1; grid[3][7] = wTop7;
      const wTop8 = new Tile('wire', 'straight'); wTop8.rotation = 1; grid[3][8] = wTop8;
      const wIndTurn = new Tile('wire', 'turn'); wIndTurn.rotation = 2; grid[3][9] = wIndTurn; // 左 & 下

      // 大鐵芯電感 L = 25H (25000mH)
      const ind = new Tile('inductor', 'standard', 25000);
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '電感 25H';
      grid[4][9] = ind;

      // 實驗燈泡 L2 (50Ω)
      const bulb2 = new Tile('load', 'lightbulb', 50);
      bulb2.rotation = 0;
      bulb2.isLocked = true;
      bulb2.labels[4] = 'L2 (漸亮)';
      grid[5][9] = bulb2;

      const wIndLead = new Tile('wire', 'straight'); wIndLead.rotation = 0; grid[6][9] = wIndLead;
      const wBotTurnR = new Tile('wire', 'turn'); wBotTurnR.rotation = 3; grid[7][9] = wBotTurnR; // 上 & 左

      // 5. 下方接地幹線 (Row 7)
      const wBot8 = new Tile('wire', 'straight'); wBot8.rotation = 1; grid[7][8] = wBot8;
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[7][2] = wBot2;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[7][1] = wTurnBL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][1] = wPsuBot;
    },
  },

  {
    id: 'sh-4-2',
    title: '4-2 RL 電路充放電暫態與時間常數 (τ = L/R)',
    category: '第四單元：電感器與 RL 暫態電路',
    desc: '💡 RL 電路充放電暫態實驗：點擊充放電開關，透過右側面板【CRT 示波器】觀察電阻端電壓的「指數上升」與「指數衰減」平滑波形（時間常數 τ = L/R = 0.5 秒）！',
    defaultGridSize: 12,
    description:
      '【實驗物理原理】：\n' +
      '在電感與電阻串聯的電路中，由克希荷夫電壓定律與一階常微分方程求解：\n' +
      '1. 充電/通電暫態 (Charging Transient)：\n' +
      '   i(t) = (ℰ/R)·(1 - e^(-t/τ))，電阻端電壓 v_R(t) = ℰ·(1 - e^(-t/τ))。\n' +
      '   時間常數定義為 τ = L / R = 25H / 50Ω = 0.50 秒。\n' +
      '   當經過 t = τ (0.5s) 時，電流達到最大值的 63.2% (7.58V)；經過 t = 5τ (2.5s) 時達到 99.3% 進入穩態。\n' +
      '2. 放電/續流暫態 (Discharging Transient)：\n' +
      '   切換至放電檔位，電源斷開且自身短路續流，電感將儲存的磁能 U_B = (1/2)·L·I² 釋放：\n' +
      '   i(t) = I_0·e^(-t/τ)，呈現完美的自然指數衰減曲線！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，點擊【充放電選擇開關】切換至「通電充電」檔位。\n' +
      '2. 觀察右側面板【CRT 示波器】CH1 動態繪製之【指數上升暫態曲線】。\n' +
      '3. 再點擊切換至「放電續流」檔位，觀察示波器動態繪製之【指數衰減曲線】。\n' +
      '4. 點擊「⚡ 驗證實驗」完成時間常數理論檢驗！',
    targetComponentTypes: ['switch', 'resistor', 'inductor', 'meter'],
    setup: (grid: (Tile | null)[][]) => {
      // 1. 12V 直流電源 (y=5, x=1)
      const psu = new Tile('power', 'power_dc', 12);
      psu.rotation = 0;
      psu.isLocked = true;
      psu.labels[4] = '12V 電源';
      grid[5][1] = psu;

      // 頂部導線 (Row 2)
      const wPsuTop = new Tile('wire', 'straight'); wPsuTop.rotation = 0; grid[4][1] = wPsuTop;
      const wPsuTop2 = new Tile('wire', 'straight'); wPsuTop2.rotation = 0; grid[3][1] = wPsuTop2;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[2][1] = wTurnTL; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][2] = wTop2;
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[2][3] = wTop3;
      const wTurnPsuIn = new Tile('wire', 'turn'); wTurnPsuIn.rotation = 2; grid[2][4] = wTurnPsuIn; // 左 & 下

      // 2. 單刀雙擲選擇開關 (y=3, x=4)
      // Pin 0 (頂部): 12V 電源輸入
      // Pin 1 (右側): 放電接地迴路
      // Pin 2 (底部): 共用端 (接 RL 支路)
      const sw = new Tile('switch', 'sel13');
      sw.rotation = 0;
      sw.state = 0; // 0 = 充電, 1 = 放電
      sw.isLocked = true;
      sw.labels[4] = '充放電開關';
      grid[3][4] = sw;

      // 3. 放電續流引線 (從 Pin 1 右側接出，引至 Col 6 返回接地)
      const wDis1 = new Tile('wire', 'straight'); wDis1.rotation = 1; grid[3][5] = wDis1;
      const wDisTR = new Tile('wire', 'turn'); wDisTR.rotation = 2; grid[3][6] = wDisTR; // 左 & 下
      const wDis4 = new Tile('wire', 'straight'); wDis4.rotation = 0; grid[4][6] = wDis4;
      const wDis5 = new Tile('wire', 'straight'); wDis5.rotation = 0; grid[5][6] = wDis5;
      const wDis6 = new Tile('wire', 'straight'); wDis6.rotation = 0; grid[6][6] = wDis6;
      const wDis7 = new Tile('wire', 'straight'); wDis7.rotation = 0; grid[7][6] = wDis7;
      const wDisBR = new Tile('wire', 'turn'); wDisBR.rotation = 3; grid[8][6] = wDisBR; // 上 & 左

      // 4. RL 核心支路 (Col 4)
      // 上方示波器分接頭 (y=4, x=4) (下、左、上 = rotation 1)
      const wRLTTop = new Tile('wire', 't'); wRLTTop.rotation = 1; grid[4][4] = wRLTTop;

      // 測量電阻 R = 50Ω (y=5, x=4)
      const r = new Tile('resistor', 'standard', 50);
      r.rotation = 0;
      r.isLocked = true;
      r.labels[4] = '電阻 R 50Ω';
      grid[5][4] = r;

      // 中間示波器匯流接頭 (y=6, x=4) (下、左、上 = rotation 1)
      const wRLTBot = new Tile('wire', 't'); wRLTBot.rotation = 1; grid[6][4] = wRLTBot;

      // 大電感 L = 25H (y=7, x=4)
      const ind = new Tile('inductor', 'standard', 25000);
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '電感 L 25H';
      grid[7][4] = ind;

      // 5. 示波器 CH1 探棒 (Col 3，跨接電阻 R 兩端追蹤 v_R(t))
      const wVmTurnT = new Tile('wire', 'turn'); wVmTurnT.rotation = 1; grid[4][3] = wVmTurnT; // 下 & 右
      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      vm.labels[4] = '1'; // CH1
      grid[5][3] = vm;
      const wVmTurnB = new Tile('wire', 'turn'); wVmTurnB.rotation = 0; grid[6][3] = wVmTurnB; // 上 & 右

      // 6. 下方接地幹線 (Row 8)
      const wBotT4 = new Tile('wire', 't'); wBotT4.rotation = 2; grid[8][4] = wBotT4; // 左、上、右
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[8][5] = wBot5;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[8][3] = wBot3;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[8][2] = wBot2;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[8][1] = wTurnBL; // 上 & 右
      const wPsuBot7 = new Tile('wire', 'straight'); wPsuBot7.rotation = 0; grid[7][1] = wPsuBot7;
      const wPsuBot6 = new Tile('wire', 'straight'); wPsuBot6.rotation = 0; grid[6][1] = wPsuBot6;
    },
  },

  {
    id: 'sh-4-3',
    title: '4-3 LC 電磁振盪器初探',
    desc: '💡 LC 電磁振盪器實驗：先閉合 SW1 為電容充電至 12V，隨後斷開 SW1 並閉合 SW2，透過右側面板【CRT 示波器】捕捉 1.0Hz 的連續正弦電磁振盪波形！',
    defaultGridSize: 12,
    description:
      '【實驗物理原理】：\n' +
      'LC 諧振迴路由電容器（儲存電場能 U_E = Q²/2C）與電感器（儲存磁場能 U_B = (1/2)·L·I²）並聯構成：\n' +
      '1. 固有諧振頻率公式：f_0 = 1 / (2π·√(L·C))。\n' +
      '   本實驗配置 L = 5H (5000mH) 與 C = 5000µF (0.005F)：\n' +
      '   √(LC) = √(5 × 0.005) = √0.025 ≈ 0.1581 秒，f_0 ≈ 1.006 Hz（週期 T ≈ 0.99 秒）！\n' +
      '2. 電磁能量無縫轉換：\n' +
      '   電容充滿電壓後斷開電源，閉合振盪開關：電容放電使電感電流增大，電場能轉化為磁場能；\n' +
      '   電流達到最大時，自感電動勢反向向電容反向充電，磁場能轉化為電場能，周而復始產生自然正弦波振盪！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，先閉合【SW1 充電開關】使 5000µF 電容充至 12V 飽和。\n' +
      '2. 點擊斷開【SW1】，隨即閉合【SW2 振盪開關】。\n' +
      '3. 觀察右側面板【CRT 示波器】CH1 捕捉到 1.0Hz 的連續正弦電磁振盪波形！\n' +
      '4. 點擊「⚡ 驗證實驗」完成 LC 振盪理論驗證！',
    targetComponentTypes: ['capacitor', 'inductor', 'switch', 'meter'],
    setup: (grid: (Tile | null)[][]) => {
      // 1. 12V 直流電源 (y=5, x=1)
      const psu = new Tile('power', 'power_dc', 12);
      psu.rotation = 0;
      psu.isLocked = true;
      psu.labels[4] = '12V 電源';
      grid[5][1] = psu;

      // 頂部充電幹線 (Row 2)
      const wPsuTop4 = new Tile('wire', 'straight'); wPsuTop4.rotation = 0; grid[4][1] = wPsuTop4;
      const wPsuTop3 = new Tile('wire', 'straight'); wPsuTop3.rotation = 0; grid[3][1] = wPsuTop3;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[2][1] = wTurnTL; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][2] = wTop2;

      // 2. SW1 充電開關 (y=2, x=3)
      const sw1 = new Tile('switch', 'spst');
      sw1.rotation = 1;
      sw1.isActive = false;
      sw1.isLocked = true;
      sw1.labels[4] = 'SW1 充電';
      grid[2][3] = sw1;

      const wTop4 = new Tile('wire', 'straight'); wTop4.rotation = 1; grid[2][4] = wTop4;
      // [2][5] 電容頂部匯流接頭 (左、下、右 = rotation 0)
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[2][5] = wTopT1;

      // 3. 電容器 C = 5000µF (y=4, x=5)
      const wCapLeadTop = new Tile('wire', 'straight'); wCapLeadTop.rotation = 0; grid[3][5] = wCapLeadTop;
      const cap = new Tile('capacitor', 'standard', 5000);
      cap.rotation = 0;
      cap.isLocked = true;
      cap.labels[4] = '5000µF';
      grid[4][5] = cap;
      const wCapLeadBot = new Tile('wire', 'straight'); wCapLeadBot.rotation = 0; grid[5][5] = wCapLeadBot;
      const wCapLeadBot6 = new Tile('wire', 'straight'); wCapLeadBot6.rotation = 0; grid[6][5] = wCapLeadBot6;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][5] = wBotT1; // 左、上、右

      // 4. SW2 振盪開關 (y=2, x=7)
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[2][6] = wTop6;
      const sw2 = new Tile('switch', 'spst');
      sw2.rotation = 1;
      sw2.isActive = false;
      sw2.isLocked = true;
      sw2.labels[4] = 'SW2 振盪';
      grid[2][7] = sw2;

      // 5. 電感器 L = 5H (Col 8)
      // [2][8] 上匯流接頭 (左、下、右 = rotation 0)
      const wTopT2 = new Tile('wire', 't'); wTopT2.rotation = 0; grid[2][8] = wTopT2;
      const wIndLeadTop = new Tile('wire', 'straight'); wIndLeadTop.rotation = 0; grid[3][8] = wIndLeadTop;

      const ind = new Tile('inductor', 'standard', 5000);
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '5H (5000mH)';
      grid[4][8] = ind;

      const wIndLeadBot = new Tile('wire', 'straight'); wIndLeadBot.rotation = 0; grid[5][8] = wIndLeadBot;
      const wIndLeadBot6 = new Tile('wire', 'straight'); wIndLeadBot6.rotation = 0; grid[6][8] = wIndLeadBot6;
      const wBotT2 = new Tile('wire', 't'); wBotT2.rotation = 2; grid[7][8] = wBotT2; // 左、上、右

      // 6. 示波器 CH1 探棒 (Col 10)
      const wTop9 = new Tile('wire', 'straight'); wTop9.rotation = 1; grid[2][9] = wTop9;
      const wTurnTR = new Tile('wire', 'turn'); wTurnTR.rotation = 2; grid[2][10] = wTurnTR; // 左 & 下
      const wVmLeadTop = new Tile('wire', 'straight'); wVmLeadTop.rotation = 0; grid[3][10] = wVmLeadTop;

      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      vm.labels[4] = '1'; // CH1
      grid[4][10] = vm;

      const wVmLeadBot = new Tile('wire', 'straight'); wVmLeadBot.rotation = 0; grid[5][10] = wVmLeadBot;
      const wVmLeadBot6 = new Tile('wire', 'straight'); wVmLeadBot6.rotation = 0; grid[6][10] = wVmLeadBot6;
      const wTurnBR = new Tile('wire', 'turn'); wTurnBR.rotation = 3; grid[7][10] = wTurnBR; // 上 & 左

      // 7. 下方接地幹線 (Row 7)
      const wBot9 = new Tile('wire', 'straight'); wBot9.rotation = 1; grid[7][9] = wBot9;
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[7][2] = wBot2;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[7][1] = wTurnBL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][1] = wPsuBot;
    },
  },

  // =========================================================================
  // 第五單元：交流電 RLC 諧振與相量初探 (AC RLC Resonance)
  // =========================================================================
  {
    id: 'sh-5-1',
    title: '5-1 交流電感抗與容抗 (X_L vs X_C)',
    category: '第五單元：交流電 RLC 諧振與相量初探',
    description:
      '【實驗物理原理】：\n' +
      '在交流電路中，電感與電容對交流電的阻礙能力分別稱為感抗（X_L）與容抗（X_C）：\n' +
      '1. 感抗公式：X_L = 2π·f·L，感抗與頻率成正比（頻率越高阻抗越大，具有「通低頻、阻高頻」之低通特性）。\n' +
      '2. 容抗公式：X_C = 1 / (2π·f·C)，容抗與頻率成反比（頻率越低阻抗越大，具有「阻低頻、通高頻」之高通特性）。\n\n' +
      '【雙支路對照實驗】：\n' +
      '• 支路一【電感支路】：串聯電感 L = 2H 與燈泡 L_ind (20Ω)。\n' +
      '• 支路二【電容支路】：串聯電容 C = 2500µF 與燈泡 L_cap (20Ω)。\n' +
      '• 切換【SPDT 頻率選擇開關】：\n' +
      '  - 切至【低頻 0.5Hz】時：X_L 極小 (6.3Ω)，電感燈泡明亮；X_C 極大 (127Ω)，電容燈泡完全熄滅！\n' +
      '  - 切至【高頻 3.0Hz】時：X_L 大增 (38Ω)，電感燈泡變暗；X_C 驟降 (21Ω)，電容燈泡耀眼發光！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，點擊【頻率選擇開關】在「低頻 0.5Hz」與「高頻 3.0Hz」之間切換。\n' +
      '2. 觀察電感燈泡與電容燈泡明暗地位的完全反轉！\n' +
      '3. 點擊「⚡ 驗證實驗」完成感抗容抗特性驗證！',
    targetComponentTypes: ['switch', 'inductor', 'capacitor', 'load'],
    defaultGridSize: 12,
    initGrid: (grid: (Tile | null)[][]) => {
      // 1. 低頻交流電源 0.5Hz, 12V (y=5, x=3) -> State 0
      const acLow = new Tile('power', 'power_ac', 0.5);
      acLow.rotation = 0;
      acLow.isLocked = true;
      acLow.labels[4] = '0.5Hz 低頻';
      grid[5][3] = acLow;

      // 2. 高頻交流電源 3.0Hz, 12V (y=5, x=1) -> State 1
      const acHigh = new Tile('power', 'power_ac', 3);
      acHigh.rotation = 0;
      acHigh.isLocked = true;
      acHigh.labels[4] = '3.0Hz 高頻';
      grid[5][1] = acHigh;

      // 頂部導線：3.0Hz 高頻電源經 Row 2 引至 SPDT Pin 1 (Top)
      const wPsuHighTop = new Tile('wire', 'straight'); wPsuHighTop.rotation = 0; grid[4][1] = wPsuHighTop;
      const wPsuHighTop3 = new Tile('wire', 'straight'); wPsuHighTop3.rotation = 0; grid[3][1] = wPsuHighTop3;
      const wTurnTL1 = new Tile('wire', 'turn'); wTurnTL1.rotation = 1; grid[2][1] = wTurnTL1; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][2] = wTop2;
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[2][3] = wTop3;
      const wTopTurnHigh = new Tile('wire', 'turn'); wTopTurnHigh.rotation = 2; grid[2][4] = wTopTurnHigh; // 左 & 下

      // 導線：0.5Hz 低頻電源引至 SPDT Pin 0 (Left)
      const wPsuLowTop = new Tile('wire', 'straight'); wPsuLowTop.rotation = 0; grid[4][3] = wPsuLowTop;
      const wLowTurn = new Tile('wire', 'turn'); wLowTurn.rotation = 1; grid[3][3] = wLowTurn; // 下 & 右

      // SPDT 選擇開關 (y=3, x=4, rotation=3)
      // Pin 0 (Left): 0.5Hz 低頻輸入 (State 0)
      // Pin 1 (Top): 3.0Hz 高頻輸入 (State 1)
      // Pin 2 (Right): Common 輸出至負載支路
      const sw = new Tile('switch', 'sel13');
      sw.rotation = 3;
      sw.state = 0; // 0 = 低頻, 1 = 高頻
      sw.isLocked = true;
      sw.labels[4] = '頻率選擇';
      grid[3][4] = sw;

      // 分流接頭 (y=3, x=5) (左、下、右 = rotation 0)
      const wTopT = new Tile('wire', 't'); wTopT.rotation = 0; grid[3][5] = wTopT;

      // 3. 支路一：電感支路 (Col 5)
      const ind = new Tile('inductor', 'standard', 2000); // 2H
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '電感 2H';
      grid[4][5] = ind;

      const bulbInd = new Tile('load', 'lightbulb', 20);
      bulbInd.rotation = 0;
      bulbInd.isLocked = true;
      bulbInd.labels[4] = 'L_ind (20Ω)';
      grid[5][5] = bulbInd;

      const wIndLeadBot = new Tile('wire', 'straight'); wIndLeadBot.rotation = 0; grid[6][5] = wIndLeadBot;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][5] = wBotT1; // 左、上、右

      // 4. 支路二：電容支路 (Col 8)
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[3][6] = wTop6;
      const wTop7 = new Tile('wire', 'straight'); wTop7.rotation = 1; grid[3][7] = wTop7;
      const wCapTurnTR = new Tile('wire', 'turn'); wCapTurnTR.rotation = 2; grid[3][8] = wCapTurnTR; // 左 & 下

      const cap = new Tile('capacitor', 'standard', 2500); // 2500µF
      cap.rotation = 0;
      cap.isLocked = true;
      cap.labels[4] = '電容 2500µF';
      grid[4][8] = cap;

      const bulbCap = new Tile('load', 'lightbulb', 20);
      bulbCap.rotation = 0;
      bulbCap.isLocked = true;
      bulbCap.labels[4] = 'L_cap (20Ω)';
      grid[5][8] = bulbCap;

      const wCapLeadBot = new Tile('wire', 'straight'); wCapLeadBot.rotation = 0; grid[6][8] = wCapLeadBot;
      const wBotTurnCap = new Tile('wire', 'turn'); wBotTurnCap.rotation = 3; grid[7][8] = wBotTurnCap; // 上 & 左

      // 5. 下方接地幹線 (Row 7)
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[7][7] = wBot7;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[7][4] = wBot4;
      const wBotT_ac = new Tile('wire', 't'); wBotT_ac.rotation = 2; grid[7][3] = wBotT_ac; // 左、上、右 (接低頻電源底)
      const wPsuLowBot = new Tile('wire', 'straight'); wPsuLowBot.rotation = 0; grid[6][3] = wPsuLowBot;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[7][2] = wBot2;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[7][1] = wTurnBL; // 上 & 右 (接高頻電源底)
      const wPsuHighBot = new Tile('wire', 'straight'); wPsuHighBot.rotation = 0; grid[6][1] = wPsuHighBot;
    },
  },

  {
    id: 'sh-5-2',
    title: '5-2 RLC 串聯諧振頻率量測 (f_0 = 1 / 2π√LC)',
    category: '第五單元：交流電 RLC 諧振與相量初探',
    description:
      '【實驗物理原理】：\n' +
      '在電阻 R、電感 L、電容 C 串聯電路中，交流總阻抗為：\n' +
      'Z = √(R² + (X_L - X_C)²) = √(R² + (2πfL - 1/(2πfC))²)。\n\n' +
      '【諧振點物理特徵 (Resonance Point)】：\n' +
      '1. 當頻率剛好等於諧振頻率 f_0 = 1 / (2π·√(LC)) 時，感抗等於容抗 (X_L = X_C)，電抗完全抵消！\n' +
      '2. 總阻抗達到全頻段最小值 Z_min = R，迴路電流達到峰值最大值 I_max = V / R！\n' +
      '3. 本實驗配置 L = 2.5H (2500mH)、C = 2500µF (0.0025F)、R = 20Ω 負載燈泡：\n' +
      '   √(LC) = √(2.5 × 0.0025) = √0.00625 ≈ 0.07905 秒。\n' +
      '   諧振頻率 f_0 = 1 / (2π × 0.07905) ≈ 2.01 Hz ≈ 2.0 Hz！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，切換【頻率選擇開關】。\n' +
      '2. 觀察切換至【諧振 2.0Hz】時，負載燈泡爆發強光，右側面板【CRT 示波器】CH1 負載電壓波幅達到最大峰值 (12V)！\n' +
      '3. 切換至【失諧 4.0Hz】時，阻抗急增，燈泡迅速黯淡為微光，波幅銳減至約 4.7V。\n' +
      '4. 點擊「⚡ 驗證實驗」完成 RLC 串聯諧振檢驗！',
    targetComponentTypes: ['switch', 'resistor', 'inductor', 'capacitor', 'meter'],
    defaultGridSize: 12,
    initGrid: (grid: (Tile | null)[][]) => {
      // 1. 諧振交流電源 2.0Hz, 12V (y=5, x=3) -> State 0
      const acRes = new Tile('power', 'power_ac', 2); // 2Hz 諧振源
      acRes.rotation = 0;
      acRes.isLocked = true;
      acRes.labels[4] = '2.0Hz 諧振';
      grid[5][3] = acRes;

      // 2. 失諧交流電源 4.0Hz, 12V (y=5, x=1) -> State 1
      const acOff = new Tile('power', 'power_ac', 4); // 4Hz 失諧源
      acOff.rotation = 0;
      acOff.isLocked = true;
      acOff.labels[4] = '4.0Hz 失諧';
      grid[5][1] = acOff;

      // 頂部導線：4.0Hz 電源經 Row 2 引至 SPDT Pin 1 (Top)
      const wPsuOffTop = new Tile('wire', 'straight'); wPsuOffTop.rotation = 0; grid[4][1] = wPsuOffTop;
      const wPsuOffTop3 = new Tile('wire', 'straight'); wPsuOffTop3.rotation = 0; grid[3][1] = wPsuOffTop3;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[2][1] = wTurnTL; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][2] = wTop2;
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[2][3] = wTop3;
      const wTopTurnOff = new Tile('wire', 'turn'); wTopTurnOff.rotation = 2; grid[2][4] = wTopTurnOff; // 左 & 下

      // 導線：2.0Hz 諧振電源引至 SPDT Pin 0 (Left)
      const wPsuResTop = new Tile('wire', 'straight'); wPsuResTop.rotation = 0; grid[4][3] = wPsuResTop;
      const wResTurn = new Tile('wire', 'turn'); wResTurn.rotation = 1; grid[3][3] = wResTurn; // 下 & 右

      // SPDT 頻率切換開關 (y=3, x=4, rotation=3)
      // Pin 0 (Left): 2.0Hz 諧振源 (State 0)
      // Pin 1 (Top): 4.0Hz 失諧源 (State 1)
      // Pin 2 (Right): Common 輸出至 RLC 串聯迴路
      const sw = new Tile('switch', 'sel13');
      sw.rotation = 3;
      sw.state = 0; // 預設 2.0Hz 諧振
      sw.isLocked = true;
      sw.labels[4] = '諧振選擇';
      grid[3][4] = sw;

      // 輸出引線 (Pin 2 右側引出至 Col 6)
      const wOut = new Tile('wire', 'straight'); wOut.rotation = 1; grid[3][5] = wOut;

      // 頂部分流接頭 (y=3, x=6) (左、下、右 = rotation 0)
      // 下接燈泡頂部，右接示波器 CH1 高端探棒
      const wTopT_rlc = new Tile('wire', 't'); wTopT_rlc.rotation = 0; grid[3][6] = wTopT_rlc;

      // 3. RLC 串聯迴路 (Col 6)
      // (1) R: 負載燈泡 (20Ω) (y=4, x=6)
      const bulb = new Tile('load', 'lightbulb', 20);
      bulb.rotation = 0;
      bulb.isLocked = true;
      bulb.labels[4] = '燈泡 R (20Ω)';
      grid[4][6] = bulb;

      // (2) 燈泡下端 T 型引出接頭 (y=5, x=6) (上、右、下 = rotation 3)
      // 上接燈泡底，下接電感頂，右接示波器 CH1 低端探棒 (量測燈泡兩端電壓)
      const wBulbMidT = new Tile('wire', 't'); wBulbMidT.rotation = 3; grid[5][6] = wBulbMidT;

      // (3) L: 電感 2.5H (2500mH) (y=6, x=6)
      const ind = new Tile('inductor', 'standard', 2500);
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '電感 2.5H';
      grid[6][6] = ind;

      // (4) C: 電容 2500µF (y=7, x=6)
      const cap = new Tile('capacitor', 'standard', 2500);
      cap.rotation = 0;
      cap.isLocked = true;
      cap.labels[4] = '電容 2500µF';
      grid[7][6] = cap;

      // 4. 示波器 CH1 探棒 (Col 8, 並聯量測燈泡端電壓)
      const wTop6_7 = new Tile('wire', 'straight'); wTop6_7.rotation = 1; grid[3][7] = wTop6_7;
      const wVmTurnTR = new Tile('wire', 'turn'); wVmTurnTR.rotation = 2; grid[3][8] = wVmTurnTR; // 左 & 下

      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      vm.labels[4] = '1'; // CH1
      grid[4][8] = vm;

      const wVmTurnBR = new Tile('wire', 'turn'); wVmTurnBR.rotation = 3; grid[5][8] = wVmTurnBR; // 上 & 左
      const wVmLeadBot7 = new Tile('wire', 'straight'); wVmLeadBot7.rotation = 1; grid[5][7] = wVmLeadBot7;

      // 5. 下方接地幹線 (Row 8)
      const wPsuOffBot = new Tile('wire', 'straight'); wPsuOffBot.rotation = 0; grid[6][1] = wPsuOffBot;
      const wPsuOffBot7 = new Tile('wire', 'straight'); wPsuOffBot7.rotation = 0; grid[7][1] = wPsuOffBot7;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[8][1] = wTurnBL; // 上 & 右
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[8][2] = wBot2;

      const wPsuResBot = new Tile('wire', 'straight'); wPsuResBot.rotation = 0; grid[6][3] = wPsuResBot;
      const wPsuResBot7 = new Tile('wire', 'straight'); wPsuResBot7.rotation = 0; grid[7][3] = wPsuResBot7;
      const wBotT_res = new Tile('wire', 't'); wBotT_res.rotation = 2; grid[8][3] = wBotT_res; // 左、上、右

      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[8][4] = wBot4;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[8][5] = wBot5;
      const wTurnBR_rlc = new Tile('wire', 'turn'); wTurnBR_rlc.rotation = 3; grid[8][6] = wTurnBR_rlc; // 上 & 左
    },
  },

  {
    id: 'sh-5-3',
    title: '5-3 交流相量與相位差（電壓超前與落後）',
    category: '第五單元：交流電 RLC 諧振與相量初探',
    description:
      '【實驗物理原理】：\n' +
      '在包含電感或電容的交流電路中，電壓與電流不再同步，產生時間上的相位差（Phase Shift）：\n' +
      '1. 純電阻中：電壓與電流完全同相 (Δφ = 0°)。\n' +
      '2. 純電感中：自感反電動勢抗拒電流變化，電壓超前電流 90° (π/2)。\n' +
      '3. 在 RL 串聯電路中：\n' +
      '   總電壓與電流之相位差滿足：tan(φ) = X_L / R = (2π·f·L) / R。\n' +
      '   本實驗配置 f = 1Hz, L = 8H (8000mH), R = 50Ω：\n' +
      '   X_L = 2π × 1 × 8 ≈ 50.26Ω。\n' +
      '   tan(φ) = 50.26 / 50 ≈ 1.005 ⟹ 相位差 φ ≈ 45°（總電壓比電流提早 1/8 週期到達峰值）！\n\n' +
      '【示波器雙通道比對觀測】：\n' +
      '• CH1（總電壓探棒）：監測交流電源總電壓波形 v(t)。\n' +
      '• CH2（電阻端探棒）：監測純電阻端電壓 v_R(t)，波形完全等同於迴路電流 i(t)。\n' +
      '• 在右側儀表面板切換 CH1 與 CH2，親眼觀測總電壓波峰領先於電流波峰之超前相位關係！\n\n' +
      '【實驗操作任務】：\n' +
      '1. 切換至「👆 互動」工具，點擊閉合【測量主開關】。\n' +
      '2. 在右側儀表面板切換【CH1】與【CH2】，對照示波器上總電壓與電流的波峰超前落後特徵。\n' +
      '3. 點擊「⚡ 驗證實驗」完成相量相位分析評測！',
    targetComponentTypes: ['power', 'switch', 'resistor', 'inductor', 'meter'],
    defaultGridSize: 12,
    initGrid: (grid: (Tile | null)[][]) => {
      // 1. 12V 1Hz 交流信號源 (y=5, x=1)
      const acPsu = new Tile('power', 'power_ac', 1); // 1Hz AC
      acPsu.rotation = 0;
      acPsu.isLocked = true;
      acPsu.labels[4] = 'AC 12V 1Hz';
      grid[5][1] = acPsu;

      // 頂部主線 (Row 2)
      const wPsuTop4 = new Tile('wire', 'straight'); wPsuTop4.rotation = 0; grid[4][1] = wPsuTop4;
      const wPsuTop3 = new Tile('wire', 'straight'); wPsuTop3.rotation = 0; grid[3][1] = wPsuTop3;
      const wTurnTL = new Tile('wire', 'turn'); wTurnTL.rotation = 1; grid[2][1] = wTurnTL; // 下 & 右
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][2] = wTop2;

      // 2. 測量主開關 (y=2, x=3)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1;
      sw.isActive = false;
      sw.isLocked = true;
      sw.labels[4] = '測量主開關';
      grid[2][3] = sw;

      // 3. CH1 總電壓探棒 (Col 4)
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[2][4] = wTopT1; // 左、下、右
      const wLeadCh1Top = new Tile('wire', 'straight'); wLeadCh1Top.rotation = 0; grid[3][4] = wLeadCh1Top;

      const vmCh1 = new Tile('meter', 'v');
      vmCh1.rotation = 0;
      vmCh1.isLocked = true;
      vmCh1.labels[4] = '1'; // CH1: Total AC Voltage
      grid[4][4] = vmCh1;

      const wLeadCh1Bot5 = new Tile('wire', 'straight'); wLeadCh1Bot5.rotation = 0; grid[5][4] = wLeadCh1Bot5;
      const wLeadCh1Bot6 = new Tile('wire', 'straight'); wLeadCh1Bot6.rotation = 0; grid[6][4] = wLeadCh1Bot6;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[7][4] = wBotT1; // 左、上、右

      // 4. 串聯主迴路 (Col 7)
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[2][5] = wTop5;
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[2][6] = wTop6;
      const wTurnTR_rl = new Tile('wire', 'turn'); wTurnTR_rl.rotation = 2; grid[2][7] = wTurnTR_rl; // 左 & 下
      const wLeadTop7 = new Tile('wire', 't'); wLeadTop7.rotation = 3; grid[3][7] = wLeadTop7; // 上、下、右

      // 電阻 R = 50Ω (y=4, x=7)
      const r = new Tile('resistor', 'standard', 50);
      r.rotation = 0;
      r.isLocked = true;
      r.labels[4] = '電阻 50Ω';
      grid[4][7] = r;

      // 中間分接頭 (y=5, x=7)
      const wMidT7 = new Tile('wire', 't'); wMidT7.rotation = 3; grid[5][7] = wMidT7; // 上、下、右

      // 大電感 L = 8H (y=6, x=7)
      const ind = new Tile('inductor', 'standard', 8000);
      ind.rotation = 0;
      ind.isLocked = true;
      ind.labels[4] = '電感 8H';
      grid[6][7] = ind;

      const wTurnBR_rl = new Tile('wire', 'turn'); wTurnBR_rl.rotation = 3; grid[7][7] = wTurnBR_rl; // 上 & 左

      // 5. CH2 電阻電壓探棒 (Col 9，跨接在電阻 R 兩端)
      const wTopLead8 = new Tile('wire', 'straight'); wTopLead8.rotation = 1; grid[3][8] = wTopLead8;
      const wTurnTR_ch2 = new Tile('wire', 'turn'); wTurnTR_ch2.rotation = 2; grid[3][9] = wTurnTR_ch2; // 左 & 下

      const vmCh2 = new Tile('meter', 'v');
      vmCh2.rotation = 0;
      vmCh2.isLocked = true;
      vmCh2.labels[4] = '2'; // CH2: Resistor Voltage (Current Phase)
      grid[4][9] = vmCh2;

      const wMidLead8 = new Tile('wire', 'straight'); wMidLead8.rotation = 1; grid[5][8] = wMidLead8;
      const wTurnBR_ch2 = new Tile('wire', 'turn'); wTurnBR_ch2.rotation = 3; grid[5][9] = wTurnBR_ch2; // 上 & 左

      // 6. 接地返回幹線 (Row 7)
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[7][6] = wBot6;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[7][5] = wBot5;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[7][3] = wBot3;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[7][2] = wBot2;
      const wTurnBL = new Tile('wire', 'turn'); wTurnBL.rotation = 0; grid[7][1] = wTurnBL; // 上 & 右
      const wPsuBot = new Tile('wire', 'straight'); wPsuBot.rotation = 0; grid[6][1] = wPsuBot;
    },
  },
];

// Normalize desc and setup for universal compatibility
seniorHighLevels.forEach((l) => {
  if (!l.desc && l.description) l.desc = l.description;
  if (!l.setup && l.initGrid) l.setup = l.initGrid;
});
