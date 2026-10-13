/**
 * @license
 * Junior High Basic Electricity Levels (國中理化 基本電學) for Auto Studio Pro
 * Aligned with 108 Curriculum (Grade 9 Physics: Voltage, Current, Ohm's Law, Series/Parallel, Power & Safety)
 */

import { Tile } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';

export const juniorHighMenuCategories: LevelMenuCategory[] = [
  {
    title: '第一單元：電路三要素與迴路觀念 (Circuit Basics)',
    levels: [
      {
        id: 'jh-1-1',
        title: '1-1 點亮第一盞燈（封閉迴路）',
        desc: '利用 1.5V 電池、導線與小燈泡組成封閉迴路，使燈泡發光（通路概念）。',
      },
      {
        id: 'jh-1-2',
        title: '1-2 開關的控制（斷路概念）',
        desc: '在迴路中串聯開關，體驗通路 (Closed) 與斷路 (Open) 的電路控制。',
      },
      {
        id: 'jh-1-3',
        title: '1-3 短路現象與保險絲防護（短路與熔斷）',
        desc: '閉合開關製造短路使燈泡熄滅，觀察瞬間巨大電流如何觸發保險絲熔斷切斷電路！',
      },
    ],
  },
  {
    title: '第二單元：電壓與電池的串並聯 (Voltage & Batteries)',
    levels: [
      {
        id: 'jh-2-1',
        title: '2-1 伏特計的正確使用（並聯）',
        desc: '伏特計內阻極大，必須與待測元件「並聯」，測量發光燈泡兩端的電位差。',
      },
      {
        id: 'jh-2-2',
        title: '2-2 電池串聯與極性方向',
        desc: '將兩顆 1.5V 電池順向串聯測得 3.0V，燈泡明顯變亮；極性接反則電壓相互抵消。',
      },
      {
        id: 'jh-2-3',
        title: '2-3 電池並聯實驗',
        desc: '將兩顆 1.5V 電池並聯，測出總電壓仍為 1.5V，燈泡亮度不變但供電更持久。',
      },
    ],
  },
  {
    title: '第三單元：電流與歐姆定律 (Current & Ohm\'s Law)',
    levels: [
      {
        id: 'jh-3-1',
        title: '3-1 安培計的正確使用（串聯）',
        desc: '安培計內阻極小，必須「串聯」於電路中測量電流，嚴禁直接並聯電源！',
      },
      {
        id: 'jh-3-2',
        title: '3-2 歐姆定律實驗探討 (V = IR)',
        desc: '固定 10Ω 電阻，分別施加 1.5V 與 3.0V 電壓，驗證通過電流與電壓成正比。',
      },
      {
        id: 'jh-3-3',
        title: '3-3 滑動變阻器調光器',
        desc: '滑動變阻器改變導線電阻長度（R ∝ L），觀察燈泡亮度連續平滑變化。',
      },
    ],
  },
  {
    title: '第四單元：串聯與並聯電路大對決 (Series vs Parallel)',
    levels: [
      {
        id: 'jh-4-1',
        title: '4-1 燈泡串聯：分壓與變暗',
        desc: '兩顆相同燈泡串聯，分壓各為總電壓一半，燈泡變暗；一顆斷開則全數熄滅。',
      },
      {
        id: 'jh-4-2',
        title: '4-2 燈泡並聯：等壓與獨立控制',
        desc: '兩顆燈泡並聯，端電壓皆等於電源電壓，維持全亮且互不影響（家庭用電原理）。',
      },
      {
        id: 'jh-4-3',
        title: '4-3 串聯處處等電流 vs 並聯分流',
        desc: '驗證串聯電路電流處處相等 (I=I1=I2)，並聯總電流等於各支路電流和。',
      },
    ],
  },
  {
    title: '第五單元：電功率與家庭用電安全 (Power & Safety)',
    levels: [
      {
        id: 'jh-5-1',
        title: '5-1 電功率與亮度陷阱題',
        desc: '比較不同電阻燈泡在串聯（電阻大較亮）與並聯（電阻小較亮）的經典理化考題！',
      },
      {
        id: 'jh-5-2',
        title: '5-2 家庭電路過載跳脫保護',
        desc: '模擬 110V 插座同時並聯多組大功率負載，總電流超過安全負載引發開關跳脫。',
      },
    ],
  },
];

export const juniorHighLevels: LevelDefinition[] = [
  // 1-1
  {
    id: 'jh-1-1',
    title: '1-1 點亮第一盞燈（封閉迴路）',
    desc: '請使用導線將 1.5V 電池的正極(+)與負極(-)分別連接至小燈泡兩端，形成完整通路使燈泡發光！',
    category: '第一單元：電路三要素與迴路觀念',
    defaultGridSize: 10,
    setup: (grid) => {
      // 1.5V Battery at (3, 3)
      const bat = new Tile('power', 'power_1_5v');
      bat.rotation = 0;
      bat.isLocked = true;
      grid[3][3] = bat;

      // Lightbulb at (3, 6)
      const bulb = new Tile('load', 'lightbulb');
      bulb.rotation = 0;
      bulb.isLocked = true;
      grid[3][6] = bulb;
    },
  },

  // 1-2
  {
    id: 'jh-1-2',
    title: '1-2 開關的控制（斷路概念）',
    desc: '在電路中串聯一個開關。接線完成後，點擊「👆 互動」工具切換開關，觀察燈泡在通路與斷路下的亮滅！',
    category: '第一單元：電路三要素與迴路觀念',
    defaultGridSize: 10,
    setup: (grid) => {
      // 1.5V Battery on the left (vertical, row 4, col 2)
      const bat = new Tile('power', 'power_1_5v');
      bat.rotation = 0;
      bat.isLocked = true;
      grid[4][2] = bat;

      // SPST Switch on the top (horizontal, row 2, col 4)
      const sw = new Tile('switch', 'spst');
      sw.rotation = 1; // Horizontal switch for easy left-to-right wiring
      sw.isLocked = true;
      sw.isActive = false; // Initially open
      grid[2][4] = sw;

      // Lightbulb on the right (vertical, row 4, col 6)
      const bulb = new Tile('load', 'lightbulb');
      bulb.rotation = 0;
      bulb.isLocked = true;
      grid[4][6] = bulb;
    },
  },

  // 1-3 (整合原 1-3 短路與 1-4 保險絲)
  {
    id: 'jh-1-3',
    title: '1-3 短路現象與保險絲防護（短路與熔斷）',
    desc: '💡 【短路現象與保險絲保護機制】：\n' +
      '1. 正常供電：電池經由上方保險絲對燈泡供電，燈泡正常發光。\n' +
      '2. 製造短路：使用「👆 互動」工具點擊閉合右側【短路開關】（或直接跨接導線）。\n' +
      '3. 短路與熔斷：電流走捷徑避開燈泡（燈泡熄滅），瞬間急遽暴增的巨大短路電流觸發保險絲【💥 熔斷】，及時切斷全路保護電源！\n' +
      '4. 點擊「⚡ 驗證電路」完成評測（若需重新測試，點擊熔斷的保險絲即可更換新品）。',
    category: '第一單元：電路三要素與迴路觀念',
    defaultGridSize: 10,
    setup: (grid) => {
      // 1.5V 電池（左側電源）
      const bat = new Tile('power', 'power_1_5v');
      bat.rotation = 0;
      bat.isLocked = true;
      grid[4][2] = bat;

      // 小燈泡（右側負載）
      const bulb = new Tile('load', 'lightbulb');
      bulb.rotation = 0;
      bulb.isLocked = true;
      grid[4][6] = bulb;

      // 保險絲（串聯在上方供電幹線中段，守護電路）
      const fuse = new Tile('protection', 'fuse');
      fuse.rotation = 1; // 水平方向
      fuse.isLocked = true;
      fuse.isBlown = false;
      grid[2][4] = fuse;

      // 上方供電幹線
      const wRise = new Tile('wire', 'straight'); wRise.rotation = 0; grid[3][2] = wRise;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][2] = wTopL;
      const wTopM1 = new Tile('wire', 'straight'); wTopM1.rotation = 1; grid[2][3] = wTopM1;
      const wTopM3 = new Tile('wire', 'straight'); wTopM3.rotation = 1; grid[2][5] = wTopM3;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][6] = wTopR;

      // 燈泡上方 T 型分流接頭
      const wTTop = new Tile('wire', 't'); wTTop.rotation = 3; grid[3][6] = wTTop;

      // 燈泡下方 T 型分流接頭
      const wTBot = new Tile('wire', 't'); wTBot.rotation = 3; grid[5][6] = wTBot;

      // 下方返回幹線
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[6][6] = wBotR;
      const wBotM3 = new Tile('wire', 'straight'); wBotM3.rotation = 1; grid[6][5] = wBotM3;
      const wBotM2 = new Tile('wire', 'straight'); wBotM2.rotation = 1; grid[6][4] = wBotM2;
      const wBotM1 = new Tile('wire', 'straight'); wBotM1.rotation = 1; grid[6][3] = wBotM1;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[6][2] = wBotL;
      const wBotDrop = new Tile('wire', 'straight'); wBotDrop.rotation = 0; grid[5][2] = wBotDrop;

      // 右側短路跨接支路（第七欄）
      const wBypassTop = new Tile('wire', 'turn'); wBypassTop.rotation = 2; grid[3][7] = wBypassTop;
      const wBypassBot = new Tile('wire', 'turn'); wBypassBot.rotation = 3; grid[5][7] = wBypassBot;

      // 短路開關（初始斷開 OFF，閉合 ON 即可製造短路）
      const sw = new Tile('switch', 'spst');
      sw.rotation = 0;
      sw.isActive = false; // Initially open
      grid[4][7] = sw;
    },
  },

  // 1-4 (相容別名)
  {
    id: 'jh-1-4',
    title: '1-4 短路現象與保險絲防護（短路與熔斷）',
    desc: '💡 【短路現象與保險絲保護機制】：\n' +
      '1. 正常供電：電池經由上方保險絲對燈泡供電，燈泡正常發光。\n' +
      '2. 製造短路：使用「👆 互動」工具點擊閉合右側【短路開關】（或直接跨接導線）。\n' +
      '3. 短路與熔斷：電流走捷徑避開燈泡（燈泡熄滅），瞬間急遽暴增的巨大短路電流觸發保險絲【💥 熔斷】，及時切斷全路保護電源！\n' +
      '4. 點擊「⚡ 驗證電路」完成評測（若需重新測試，點擊熔斷的保險絲即可更換新品）。',
    category: '第一單元：電路三要素與迴路觀念',
    defaultGridSize: 10,
    setup: (grid) => {
      const bat = new Tile('power', 'power_1_5v'); bat.rotation = 0; bat.isLocked = true; grid[4][2] = bat;
      const bulb = new Tile('load', 'lightbulb'); bulb.rotation = 0; bulb.isLocked = true; grid[4][6] = bulb;
      const fuse = new Tile('protection', 'fuse'); fuse.rotation = 1; fuse.isLocked = true; fuse.isBlown = false; grid[2][4] = fuse;
      const wRise = new Tile('wire', 'straight'); wRise.rotation = 0; grid[3][2] = wRise;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][2] = wTopL;
      const wTopM1 = new Tile('wire', 'straight'); wTopM1.rotation = 1; grid[2][3] = wTopM1;
      const wTopM3 = new Tile('wire', 'straight'); wTopM3.rotation = 1; grid[2][5] = wTopM3;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][6] = wTopR;
      const wTTop = new Tile('wire', 't'); wTTop.rotation = 3; grid[3][6] = wTTop;
      const wTBot = new Tile('wire', 't'); wTBot.rotation = 3; grid[5][6] = wTBot;
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[6][6] = wBotR;
      const wBotM3 = new Tile('wire', 'straight'); wBotM3.rotation = 1; grid[6][5] = wBotM3;
      const wBotM2 = new Tile('wire', 'straight'); wBotM2.rotation = 1; grid[6][4] = wBotM2;
      const wBotM1 = new Tile('wire', 'straight'); wBotM1.rotation = 1; grid[6][3] = wBotM1;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[6][2] = wBotL;
      const wBotDrop = new Tile('wire', 'straight'); wBotDrop.rotation = 0; grid[5][2] = wBotDrop;
      const wBypassTop = new Tile('wire', 'turn'); wBypassTop.rotation = 2; grid[3][7] = wBypassTop;
      const wBypassBot = new Tile('wire', 'turn'); wBypassBot.rotation = 3; grid[5][7] = wBypassBot;
      const sw = new Tile('switch', 'spst'); sw.rotation = 0; sw.isActive = false; grid[4][7] = sw;
    },
  },

  // 2-1
  {
    id: 'jh-2-1',
    title: '2-1 伏特計的正確使用（並聯）',
    desc: '💡 伏特計是用來測量電位差的儀器，內阻極大，必須與待測元件「並聯」跨接。\n' +
      '目前左側電池已與小燈泡組成封閉迴路正常發光。請使用「導線」將右側的伏特計跨接「並聯」在發光小燈泡兩端（正極接上方紅點、負極接下方藍點），觀察儀表指針偏轉與即時 1.50V 讀數！',
    category: '第二單元：電壓與電池的串並聯',
    defaultGridSize: 10,
    setup: (grid) => {
      // 1. 1.5V 電池（左側主電源）
      const bat = new Tile('power', 'power_1_5v');
      bat.rotation = 0;
      bat.isLocked = true;
      grid[4][2] = bat;

      // 2. 小燈泡（中間待測負載，正常發光）
      const bulb = new Tile('load', 'lightbulb');
      bulb.rotation = 0;
      bulb.isLocked = true;
      grid[4][5] = bulb;

      // 3. 主迴路導線：電池 -> 燈泡 -> 電池
      const wRise = new Tile('wire', 'straight'); wRise.rotation = 0; grid[3][2] = wRise;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][2] = wTopL; // 下 & 右
      const wTopM1 = new Tile('wire', 'straight'); wTopM1.rotation = 1; grid[2][3] = wTopM1;
      const wTopM2 = new Tile('wire', 'straight'); wTopM2.rotation = 1; grid[2][4] = wTopM2;
      const wTTop = new Tile('wire', 't'); wTTop.rotation = 0; grid[2][5] = wTTop; // 左、右、下
      const wDrop = new Tile('wire', 'straight'); wDrop.rotation = 0; grid[3][5] = wDrop;

      const wBotRise = new Tile('wire', 'straight'); wBotRise.rotation = 0; grid[5][5] = wBotRise;
      const wTBot = new Tile('wire', 't'); wTBot.rotation = 2; grid[6][5] = wTBot; // 左、右、上
      const wBotM2 = new Tile('wire', 'straight'); wBotM2.rotation = 1; grid[6][4] = wBotM2;
      const wBotM1 = new Tile('wire', 'straight'); wBotM1.rotation = 1; grid[6][3] = wBotM1;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[6][2] = wBotL; // 上 & 右
      const wBotDrop = new Tile('wire', 'straight'); wBotDrop.rotation = 0; grid[5][2] = wBotDrop;

      // 4. 伏特計（右側待並聯儀表）
      const vm = new Tile('meter', 'v');
      vm.rotation = 0;
      vm.isLocked = true;
      grid[4][8] = vm;
    },
  },

  // 2-2
  {
    id: 'jh-2-2',
    title: '2-2 電池串聯與極性方向（對照實驗）',
    desc: '💡 左側為【1.5V 單電池對照組】，小燈泡以標準亮度常亮。請在右側將兩顆 1.5V 電池「正極接負極」順向串聯後接至右側燈泡。接通後兩側燈泡並排對比，即可親眼目睹 3.0V 耀眼強光的顯著倍增！',
    category: '第二單元：電壓與電池的串並聯',
    defaultGridSize: 10,
    setup: (grid) => {
      // ===== 左側【對照組：單顆電池 1.5V】（完整預接並常亮發光） =====
      const batRef = new Tile('power', 'power_1_5v');
      batRef.rotation = 0;
      batRef.isLocked = true;
      grid[4][1] = batRef;

      const bulbRef = new Tile('load', 'lightbulb');
      bulbRef.rotation = 0;
      bulbRef.isLocked = true;
      grid[4][3] = bulbRef;

      // 左側迴路導線 (Cols 1..3, Rows 2..6)
      const wL_Rise = new Tile('wire', 'straight'); wL_Rise.rotation = 0; grid[3][1] = wL_Rise;
      const wL_TopL = new Tile('wire', 'turn'); wL_TopL.rotation = 1; grid[2][1] = wL_TopL;
      const wL_TopM = new Tile('wire', 'straight'); wL_TopM.rotation = 1; grid[2][2] = wL_TopM;
      const wL_TopR = new Tile('wire', 'turn'); wL_TopR.rotation = 2; grid[2][3] = wL_TopR;
      const wL_Drop = new Tile('wire', 'straight'); wL_Drop.rotation = 0; grid[3][3] = wL_Drop;

      const wL_BotDrop = new Tile('wire', 'straight'); wL_BotDrop.rotation = 0; grid[5][3] = wL_BotDrop;
      const wL_BotR = new Tile('wire', 'turn'); wL_BotR.rotation = 3; grid[6][3] = wL_BotR;
      const wL_BotM = new Tile('wire', 'straight'); wL_BotM.rotation = 1; grid[6][2] = wL_BotM;
      const wL_BotL = new Tile('wire', 'turn'); wL_BotL.rotation = 0; grid[6][1] = wL_BotL;
      const wL_BotRise = new Tile('wire', 'straight'); wL_BotRise.rotation = 0; grid[5][1] = wL_BotRise;

      // ===== 右側【實驗組：雙電池串聯 3.0V】（等待學生親手接線串聯） =====
      // 電池 1（上）
      const bat1 = new Tile('power', 'power_1_5v');
      bat1.rotation = 0;
      bat1.isLocked = true;
      grid[3][6] = bat1;

      // 電池 2（下）
      const bat2 = new Tile('power', 'power_1_5v');
      bat2.rotation = 0;
      bat2.isLocked = true;
      grid[5][6] = bat2;

      // 實驗組燈泡（右）
      const bulbTest = new Tile('load', 'lightbulb');
      bulbTest.rotation = 0;
      bulbTest.isLocked = true;
      grid[4][8] = bulbTest;
    },
  },

  // 2-3
  {
    id: 'jh-2-3',
    title: '2-3 電池並聯實驗（對照實驗）',
    desc: '💡 左側為【單電池供電基準】，燈泡以標準亮度常亮。\n右側已將兩顆 1.5V 電池「正極接正極、負極接負極」並聯。請在缺口處補上導線連接右側燈泡，接通後觀察兩側燈泡亮度完全相同（端電壓皆為 1.5V），但右側兩顆電池各自分攤 50% 電流，供電壽命加倍！',
    category: '第二單元：電壓與電池的串並聯',
    defaultGridSize: 10,
    setup: (grid) => {
      // ===== 左側【對照組：單顆電池 1.5V】（完整預接並常亮發光） =====
      const batRef = new Tile('power', 'power_1_5v');
      batRef.rotation = 0;
      batRef.isLocked = true;
      batRef.labels[4] = '單電池 100%';
      grid[4][1] = batRef;

      const bulbRef = new Tile('load', 'lightbulb');
      bulbRef.rotation = 0;
      bulbRef.isLocked = true;
      bulbRef.labels[4] = '基準 30mA';
      grid[4][3] = bulbRef;

      const wL1 = new Tile('wire', 'straight'); wL1.rotation = 0; grid[3][1] = wL1;
      const wL2 = new Tile('wire', 'turn'); wL2.rotation = 1; grid[2][1] = wL2;
      const wL3 = new Tile('wire', 'straight'); wL3.rotation = 1; grid[2][2] = wL3;
      const wL4 = new Tile('wire', 'turn'); wL4.rotation = 2; grid[2][3] = wL4;
      const wL5 = new Tile('wire', 'straight'); wL5.rotation = 0; grid[3][3] = wL5;

      const wL6 = new Tile('wire', 'straight'); wL6.rotation = 0; grid[5][3] = wL6;
      const wL7 = new Tile('wire', 'turn'); wL7.rotation = 3; grid[6][3] = wL7;
      const wL8 = new Tile('wire', 'straight'); wL8.rotation = 1; grid[6][2] = wL8;
      const wL9 = new Tile('wire', 'turn'); wL9.rotation = 0; grid[6][1] = wL9;
      const wL10 = new Tile('wire', 'straight'); wL10.rotation = 0; grid[5][1] = wL10;

      // ===== 右側【實驗組：雙電池並聯 1.5V】 =====
      const bat1 = new Tile('power', 'power_1_5v');
      bat1.rotation = 0;
      bat1.isLocked = true;
      bat1.labels[4] = '分攤50%';
      grid[4][5] = bat1;

      const bat2 = new Tile('power', 'power_1_5v');
      bat2.rotation = 0;
      bat2.isLocked = true;
      bat2.labels[4] = '分攤50%';
      grid[4][7] = bat2;

      const bulbTest = new Tile('load', 'lightbulb');
      bulbTest.rotation = 0;
      bulbTest.isLocked = true;
      bulbTest.labels[4] = '並聯燈泡';
      grid[4][9] = bulbTest;

      // 頂部正極並聯幹線
      const wR_T1 = new Tile('wire', 'straight'); wR_T1.rotation = 0; grid[3][5] = wR_T1;
      const wR_T2 = new Tile('wire', 'straight'); wR_T2.rotation = 0; grid[3][7] = wR_T2;
      const wR_TopL = new Tile('wire', 'turn'); wR_TopL.rotation = 1; grid[2][5] = wR_TopL;
      const wR_TopWire = new Tile('wire', 'straight'); wR_TopWire.rotation = 1; grid[2][6] = wR_TopWire;
      const wR_TopM = new Tile('wire', 't'); wR_TopM.rotation = 0; grid[2][7] = wR_TopM;
      const wR_TopR = new Tile('wire', 'straight'); wR_TopR.rotation = 1; grid[2][8] = wR_TopR;
      const wR_TopTurn = new Tile('wire', 'turn'); wR_TopTurn.rotation = 2; grid[2][9] = wR_TopTurn;

      // 底部負極並聯幹線
      const wR_B1 = new Tile('wire', 'straight'); wR_B1.rotation = 0; grid[5][5] = wR_B1;
      const wR_B2 = new Tile('wire', 'straight'); wR_B2.rotation = 0; grid[5][7] = wR_B2;
      const wR_BotL = new Tile('wire', 'turn'); wR_BotL.rotation = 0; grid[6][5] = wR_BotL;
      const wR_BotWire = new Tile('wire', 'straight'); wR_BotWire.rotation = 1; grid[6][6] = wR_BotWire;
      const wR_BotM = new Tile('wire', 't'); wR_BotM.rotation = 2; grid[6][7] = wR_BotM;
      const wR_BotR = new Tile('wire', 'straight'); wR_BotR.rotation = 1; grid[6][8] = wR_BotR;
      const wR_BotTurn = new Tile('wire', 'turn'); wR_BotTurn.rotation = 3; grid[6][9] = wR_BotTurn;
    },
  },

  // 3-1
  {
    id: 'jh-3-1',
    title: '3-1 安培計的正確使用（串聯）',
    desc: '💡 安培計內阻極小，用來測量電流流率。必須「串聯」於電阻或燈泡迴路中（嚴禁直接並聯電源兩端！）。接通後觀察安培計指針偏轉與即時 150mA (0.15A) 數位讀數！',
    category: '第三單元：電流與歐姆定律',
    defaultGridSize: 10,
    setup: (grid) => {
      const bat = new Tile('power', 'power_1_5v');
      bat.rotation = 0;
      bat.isLocked = true;
      grid[4][2] = bat;

      const am = new Tile('meter', 'a');
      am.rotation = 1;
      am.isLocked = true;
      grid[2][5] = am;

      const res = new Tile('resistor', 'standard');
      res.rotation = 0;
      res.value = 10;
      res.isLocked = true;
      grid[4][8] = res;
    },
  },

  // 3-2
  {
    id: 'jh-3-2',
    title: '3-2 歐姆定律實驗探討 (V = IR)',
    desc: '💡 目前單顆電池 (1.5V) 驅動 10Ω 電阻，安培計穩定顯示 150mA (0.15A)。現在請將下方的第二顆電池順向串聯進電路中（提升至 3.0V），親眼見證電流如何翻倍躍升至 300mA (0.30A)，完美驗證歐姆定律 V = IR！',
    category: '第三單元：電流與歐姆定律',
    defaultGridSize: 10,
    setup: (grid) => {
      const bat1 = new Tile('power', 'power_1_5v');
      bat1.rotation = 0;
      bat1.isLocked = true;
      bat1.labels[4] = '電池 1 (1.5V)';
      grid[3][2] = bat1;

      const bat2 = new Tile('power', 'power_1_5v');
      bat2.rotation = 0;
      bat2.isLocked = true;
      bat2.labels[4] = '電池 2 (待串聯)';
      grid[5][2] = bat2;

      const am = new Tile('meter', 'a');
      am.rotation = 1;
      am.isLocked = true;
      grid[2][5] = am;

      const res = new Tile('resistor', 'standard');
      res.rotation = 0;
      res.value = 10;
      res.isLocked = true;
      grid[4][8] = res;

      // 預接單電池迴路 (顯示 150mA 基準)
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][2] = wTopL;
      const wTopM1 = new Tile('wire', 'straight'); wTopM1.rotation = 1; grid[2][3] = wTopM1;
      const wTopM2 = new Tile('wire', 'straight'); wTopM2.rotation = 1; grid[2][4] = wTopM2;
      const wTopM3 = new Tile('wire', 'straight'); wTopM3.rotation = 1; grid[2][6] = wTopM3;
      const wTopM4 = new Tile('wire', 'straight'); wTopM4.rotation = 1; grid[2][7] = wTopM4;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][8] = wTopR;
      const wDrop = new Tile('wire', 'straight'); wDrop.rotation = 0; grid[3][8] = wDrop;

      const wBotDrop = new Tile('wire', 'straight'); wBotDrop.rotation = 0; grid[5][8] = wBotDrop;
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[6][8] = wBotR;
      const wBotM1 = new Tile('wire', 'straight'); wBotM1.rotation = 1; grid[6][7] = wBotM1;
      const wBotM2 = new Tile('wire', 'straight'); wBotM2.rotation = 1; grid[6][6] = wBotM2;
      const wBotM3 = new Tile('wire', 'straight'); wBotM3.rotation = 1; grid[6][5] = wBotM3;
      const wBotM4 = new Tile('wire', 'straight'); wBotM4.rotation = 1; grid[6][4] = wBotM4;

      // 預接單電池迴路旁路 (繞過電池 2，接回電池 1 負極以提供 150mA 基準)
      const wBypassB = new Tile('wire', 'turn'); wBypassB.rotation = 0; grid[6][3] = wBypassB; // 右 & 上
      const wBypassM = new Tile('wire', 'straight'); wBypassM.rotation = 0; grid[5][3] = wBypassM; // 下 & 上
      const wBypassT = new Tile('wire', 'turn'); wBypassT.rotation = 2; grid[4][3] = wBypassT; // 下 & 左
      const wBat1Neg = new Tile('wire', 'turn'); wBat1Neg.rotation = 0; grid[4][2] = wBat1Neg; // 右 & 上 (接至 bat1 [3][2] 底部負極)
    },
  },

  // 3-3
  {
    id: 'jh-3-3',
    title: '3-3 滑動變阻器調光器（一上一下接法）',
    desc: '💡 依理化實驗規範，滑動變阻器必須接【一上（C 端滑片）一下（A 端線圈）】，且啟動前滑片應置於電阻最大處以保護電路。\n' +
      '1. 請在缺口處補上導線，將 12V 電源、A 端、C 端、安培計與燈泡串聯成通路。\n' +
      '2. 接通後切換至「👆 互動」模式，將滑片【向左拖曳】以縮短電阻線長度（R ∝ L），將電流調至 180mA 以上使小燈泡爆發強光！',
    category: '第三單元：電流與歐姆定律',
    defaultGridSize: 10,
    setup: (grid) => {
      // 12V 直流電源 (y=4, x=1)
      const bat = new Tile('power', 'power_dc');
      bat.value = 12;
      bat.rotation = 0;
      bat.isLocked = true;
      grid[4][1] = bat;

      // 3格滑動變阻器：A端 (y=2, x=3)、C端滑片 (y=2, x=4)、B端 (y=2, x=5)
      const gid = 'rheo_jh_1';
      const rLeft = new Tile('resistor', 'var_left');
      rLeft.groupId = gid;
      rLeft.rotation = 0;
      rLeft.isLocked = true;
      rLeft.labels[4] = '滑動變阻器 (100Ω)';
      grid[2][3] = rLeft;

      const rMid = new Tile('resistor', 'var_mid');
      rMid.groupId = gid;
      rMid.rotation = 0;
      rMid.value = 100;
      rMid.extension = 0.85; // 初始位於高電阻端 (85Ω)，保護電路防爆衝
      rMid.isLocked = true;
      rMid.labels[4] = 'C端(上)';
      grid[2][4] = rMid;

      const rRight = new Tile('resistor', 'var_right');
      rRight.groupId = gid;
      rRight.rotation = 0;
      rRight.isLocked = true;
      rRight.labels[4] = 'B端(下)';
      grid[2][5] = rRight;

      // 安培計 (y=2, x=7) - 與 B 端 (x=5) 間隔一格空白，避免誤觸
      const am = new Tile('meter', 'a');
      am.rotation = 0; // Pin 0 Top (+), Pin 2 Bottom (-)
      am.isLocked = true;
      am.labels[4] = '電流錶';
      grid[2][7] = am;

      // 調光小燈泡 (y=4, x=7)
      const bulb = new Tile('load', 'lightbulb');
      bulb.rotation = 0;
      bulb.isLocked = true;
      bulb.labels[4] = '調光小燈泡';
      grid[4][7] = bulb;

      // ===== 電路預接部分 =====
      // 1. 電源(+) 到 A端前置線路 (缺 [2][2] 留給學生連接至 A端)
      const w1 = new Tile('wire', 'straight'); w1.rotation = 0; grid[3][1] = w1;
      const w2 = new Tile('wire', 'turn'); w2.rotation = 1; grid[2][1] = w2; // 右 & 下
      // grid[2][2] 為空！學生需在此放置水平導線連接至 A 端 (x=3)

      // 2. C端頂部滑片引出線路 (缺 [1][4] 留給學生連接至 C端)
      // grid[1][4] 為空！學生需在此放置轉彎導線 (rot 1: 下 & 右)
      const wC1 = new Tile('wire', 'straight'); wC1.rotation = 1; grid[1][5] = wC1;
      const wC2 = new Tile('wire', 'straight'); wC2.rotation = 1; grid[1][6] = wC2;
      const wC3 = new Tile('wire', 'turn'); wC3.rotation = 2; grid[1][7] = wC3; // 下 & 左，接至安培計頂部 Pin 0

      // 3. 安培計底部 -> 燈泡頂部
      const wMid = new Tile('wire', 'straight'); wMid.rotation = 0; grid[3][7] = wMid;

      // 4. 燈泡底部 -> 電源(-)
      const wB1 = new Tile('wire', 'turn'); wB1.rotation = 3; grid[5][7] = wB1; // 上 & 左
      const wB2 = new Tile('wire', 'straight'); wB2.rotation = 1; grid[5][6] = wB2;
      const wB3 = new Tile('wire', 'straight'); wB3.rotation = 1; grid[5][5] = wB3;
      const wB4 = new Tile('wire', 'straight'); wB4.rotation = 1; grid[5][4] = wB4;
      const wB5 = new Tile('wire', 'straight'); wB5.rotation = 1; grid[5][3] = wB5;
      const wB6 = new Tile('wire', 'straight'); wB6.rotation = 1; grid[5][2] = wB6;
      const wB7 = new Tile('wire', 'turn'); wB7.rotation = 0; grid[5][1] = wB7; // 上 & 右
      // 連回 bat [4][1] 底部 Pin 2
    },
  },

  // 4-1
  {
    id: 'jh-4-1',
    title: '4-1 燈泡串聯：分壓與變暗（對照實驗）',
    desc: '💡 左側為【12V 單燈全亮基準】。右側將兩顆相同規格燈泡串聯接上 12V 電源。兩側並排對比，即可直觀看見兩燈各分擔 6.0V (V = V1 + V2) 導致亮度顯著衰減為柔和暗光！',
    category: '第四單元：串聯與並聯電路大對決',
    defaultGridSize: 12,
    setup: (grid) => {
      // ===== 左側【對照組：12V 單燈全亮基準】 =====
      const batRef = new Tile('power', 'power_dc');
      batRef.value = 12;
      batRef.rotation = 0;
      batRef.isLocked = true;
      grid[5][1] = batRef;

      const bulbRef = new Tile('load', 'lightbulb');
      bulbRef.rotation = 0;
      bulbRef.isLocked = true;
      bulbRef.labels[4] = '基準 12V 全亮';
      grid[5][3] = bulbRef;

      const wL1 = new Tile('wire', 'straight'); wL1.rotation = 0; grid[4][1] = wL1;
      const wL2 = new Tile('wire', 'turn'); wL2.rotation = 1; grid[3][1] = wL2;
      const wL3 = new Tile('wire', 'straight'); wL3.rotation = 1; grid[3][2] = wL3;
      const wL4 = new Tile('wire', 'turn'); wL4.rotation = 2; grid[3][3] = wL4;
      const wL5 = new Tile('wire', 'straight'); wL5.rotation = 0; grid[4][3] = wL5;

      const wL6 = new Tile('wire', 'straight'); wL6.rotation = 0; grid[6][3] = wL6;
      const wL7 = new Tile('wire', 'turn'); wL7.rotation = 3; grid[7][3] = wL7;
      const wL8 = new Tile('wire', 'straight'); wL8.rotation = 1; grid[7][2] = wL8;
      const wL9 = new Tile('wire', 'turn'); wL9.rotation = 0; grid[7][1] = wL9;
      const wL10 = new Tile('wire', 'straight'); wL10.rotation = 0; grid[6][1] = wL10;

      // ===== 右側【實驗組：雙燈串聯各分 6.0V】（精簡 5x3 迴路，與左側等高對齊） =====
      const bat = new Tile('power', 'power_dc');
      bat.value = 12;
      bat.rotation = 0;
      bat.isLocked = true;
      grid[5][6] = bat;

      const bulb1 = new Tile('load', 'lightbulb');
      bulb1.rotation = 0;
      bulb1.isLocked = true;
      bulb1.labels[4] = '串聯燈 1';
      grid[4][8] = bulb1;

      const bulb2 = new Tile('load', 'lightbulb');
      bulb2.rotation = 0;
      bulb2.isLocked = true;
      bulb2.labels[4] = '串聯燈 2';
      grid[6][8] = bulb2;

      // 串聯迴路導線 (Cols 6..8, Rows 3..7)
      const wR_Rise = new Tile('wire', 'straight'); wR_Rise.rotation = 0; grid[4][6] = wR_Rise;
      const wR_TopL = new Tile('wire', 'turn'); wR_TopL.rotation = 1; grid[3][6] = wR_TopL; // 下 & 右
      const wR_TopM = new Tile('wire', 'straight'); wR_TopM.rotation = 1; grid[3][7] = wR_TopM;
      const wR_TopR = new Tile('wire', 'turn'); wR_TopR.rotation = 2; grid[3][8] = wR_TopR; // 左 & 下

      // 兩燈之間串聯導線
      const wR_Mid = new Tile('wire', 'straight'); wR_Mid.rotation = 0; grid[5][8] = wR_Mid;

      // 下方返回線路
      const wR_BotR = new Tile('wire', 'turn'); wR_BotR.rotation = 3; grid[7][8] = wR_BotR; // 上 & 左
      const wR_BotM = new Tile('wire', 'straight'); wR_BotM.rotation = 1; grid[7][7] = wR_BotM;
      const wR_BotL = new Tile('wire', 'turn'); wR_BotL.rotation = 0; grid[7][6] = wR_BotL; // 上 & 右
      const wR_BotRise = new Tile('wire', 'straight'); wR_BotRise.rotation = 0; grid[6][6] = wR_BotRise;
    },
  },

  // 4-2
  {
    id: 'jh-4-2',
    title: '4-2 燈泡並聯：等壓與獨立控制（家庭電路模擬）',
    desc: '💡 本關模擬家庭配電：客廳燈與房間燈並聯（雙獨立開關）。\n' +
      '1. 目前左側客廳燈（支路 1）已接通發光（12.0V 滿額全亮）。\n' +
      '2. 請在右側房間燈（支路 2）開關與燈泡之間的缺口處補上垂直導線，將房間燈並聯入電路。\n' +
      '3. 接通後觀察：並聯接入第二盞燈時，客廳燈亮度絲毫不受影響（仍為 12.0V），兩燈皆全亮！\n' +
      '4. 切換至「👆 互動」模式，嘗試關閉任一開關，觀察另一盞燈依然常亮，體會家用電路「並聯等壓、獨立控制」的原理！',
    category: '第四單元：串聯與並聯電路大對決',
    defaultGridSize: 12,
    setup: (grid) => {
      // 12V 直流電源 (y=5, x=1)
      const bat = new Tile('power', 'power_dc');
      bat.value = 12;
      bat.rotation = 0;
      bat.isLocked = true;
      bat.labels[4] = '12V 電源';
      grid[5][1] = bat;

      // ===== 上方正極母線 (Row 2, Cols 1..9) =====
      const wTopRise1 = new Tile('wire', 'straight'); wTopRise1.rotation = 0; grid[4][1] = wTopRise1;
      const wTopRise2 = new Tile('wire', 'straight'); wTopRise2.rotation = 0; grid[3][1] = wTopRise2;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][1] = wTopL; // 下 & 右
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[2][2] = wTop1;
      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][3] = wTop2;
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[2][4] = wTop3;
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[2][5] = wTopT1; // 支路 1 分流點 (右, 下, 左)
      const wTop4 = new Tile('wire', 'straight'); wTop4.rotation = 1; grid[2][6] = wTop4;
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[2][7] = wTop5;
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[2][8] = wTop6;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][9] = wTopR; // 支路 2 下降點 (下 & 左)

      // ===== 下方負極母線 (Row 8, Cols 1..9) =====
      const wBotDrop1 = new Tile('wire', 'straight'); wBotDrop1.rotation = 0; grid[6][1] = wBotDrop1;
      const wBotDrop2 = new Tile('wire', 'straight'); wBotDrop2.rotation = 0; grid[7][1] = wBotDrop2;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[8][1] = wBotL; // 上 & 右
      const wBot1 = new Tile('wire', 'straight'); wBot1.rotation = 1; grid[8][2] = wBot1;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[8][3] = wBot2;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[8][4] = wBot3;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[8][5] = wBotT1; // 支路 1 匯流點 (左, 上, 右)
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[8][6] = wBot4;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[8][7] = wBot5;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[8][8] = wBot6;
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[8][9] = wBotR; // 支路 2 匯流點 (上 & 左)

      // ===== 第一支路【客廳燈迴路】(Col 5, 預先接通常亮) =====
      const sw1 = new Tile('switch', 'spst');
      sw1.rotation = 0;
      sw1.isActive = true;
      sw1.isLocked = true;
      sw1.labels[4] = '客廳開關';
      grid[3][5] = sw1;

      const wBr1_mid = new Tile('wire', 'straight'); wBr1_mid.rotation = 0; grid[4][5] = wBr1_mid;

      const bulb1 = new Tile('load', 'lightbulb');
      bulb1.rotation = 0;
      bulb1.isLocked = true;
      bulb1.labels[4] = '客廳燈 (12V)';
      grid[5][5] = bulb1;

      const wBr1_bot1 = new Tile('wire', 'straight'); wBr1_bot1.rotation = 0; grid[6][5] = wBr1_bot1;
      const wBr1_bot2 = new Tile('wire', 'straight'); wBr1_bot2.rotation = 0; grid[7][5] = wBr1_bot2;

      // ===== 第二支路【房間燈迴路】(Col 9, 留有 [4][9] 缺口等待學生接線) =====
      const sw2 = new Tile('switch', 'spst');
      sw2.rotation = 0;
      sw2.isActive = true;
      sw2.isLocked = true;
      sw2.labels[4] = '房間開關';
      grid[3][9] = sw2;

      // grid[4][9] 為空！留給學生在此放置垂直導線 (straight, rot 0)

      const bulb2 = new Tile('load', 'lightbulb');
      bulb2.rotation = 0;
      bulb2.isLocked = true;
      bulb2.labels[4] = '房間燈 (12V)';
      grid[5][9] = bulb2;

      const wBr2_bot1 = new Tile('wire', 'straight'); wBr2_bot1.rotation = 0; grid[6][9] = wBr2_bot1;
      const wBr2_bot2 = new Tile('wire', 'straight'); wBr2_bot2.rotation = 0; grid[7][9] = wBr2_bot2;
    },
  },

  // 4-3
  {
    id: 'jh-4-3',
    title: '4-3 串聯電流相等 vs 並聯分流定律',
    desc: '💡 本關驗證並聯分流定律（克希荷夫電流定律：I_總 = I_1 + I_2）。\n' +
      '1. 目前只有支路 1 接通：支路 1 電流為 240mA，上方主幹線安培計亦顯示 240mA (I_總 = I_1)。\n' +
      '2. 請在右側支路 2 安培計與燈泡之間的缺口處補上垂直導線，將支路 2 並聯接通。\n' +
      '3. 接通後觀察：支路 2 流入 240mA 電流，而主幹線安培計即時翻倍跳升至 480mA！\n' +
      '4. 親眼驗證並聯分流公式：總幹線電流精確等於各支路電流之和 (480mA = 240mA + 240mA)！',
    category: '第四單元：串聯與並聯電路大對決',
    defaultGridSize: 12,
    setup: (grid) => {
      // 12V 直流電源 (y=5, x=1)
      const bat = new Tile('power', 'power_dc');
      bat.value = 12;
      bat.rotation = 0;
      bat.isLocked = true;
      bat.labels[4] = '12V 電源';
      grid[5][1] = bat;

      // ===== 上方正極母線 (Row 2, 串聯主幹線安培計) =====
      const wTopRise1 = new Tile('wire', 'straight'); wTopRise1.rotation = 0; grid[4][1] = wTopRise1;
      const wTopRise2 = new Tile('wire', 'straight'); wTopRise2.rotation = 0; grid[3][1] = wTopRise2;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][1] = wTopL; // 下 & 右
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[2][2] = wTop1;

      // 主幹線安培計 (y=2, x=3) - 測量總電流 I_總
      const amMain = new Tile('meter', 'a');
      amMain.rotation = 3; // 水平方向：左側 Pin 3 為紅(+)，右側 Pin 1 為藍(-)
      amMain.isLocked = true;
      amMain.labels[4] = '幹線電流';
      grid[2][3] = amMain;

      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][4] = wTop2;
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[2][5] = wTopT1; // 支路 1 分流點 (右, 下, 左)
      const wTop4 = new Tile('wire', 'straight'); wTop4.rotation = 1; grid[2][6] = wTop4;
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[2][7] = wTop5;
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[2][8] = wTop6;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][9] = wTopR; // 支路 2 下降點 (下 & 左)

      // ===== 下方負極母線 (Row 8, Cols 1..9) =====
      const wBotDrop1 = new Tile('wire', 'straight'); wBotDrop1.rotation = 0; grid[6][1] = wBotDrop1;
      const wBotDrop2 = new Tile('wire', 'straight'); wBotDrop2.rotation = 0; grid[7][1] = wBotDrop2;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[8][1] = wBotL; // 上 & 右
      const wBot1 = new Tile('wire', 'straight'); wBot1.rotation = 1; grid[8][2] = wBot1;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[8][3] = wBot2;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[8][4] = wBot3;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[8][5] = wBotT1; // 支路 1 匯流點 (左, 上, 右)
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[8][6] = wBot4;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[8][7] = wBot5;
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[8][8] = wBot6;
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[8][9] = wBotR; // 支路 2 匯流點 (上 & 左)

      // ===== 第一支路【支路 1 (50Ω / 240mA)】(Col 5, 預先接通常亮) =====
      const am1 = new Tile('meter', 'a');
      am1.rotation = 0; // 垂直：上方 Pin 0 為紅(+)，下方 Pin 2 為藍(-)
      am1.isLocked = true;
      am1.labels[4] = '支路 1';
      grid[3][5] = am1;

      const wBr1_mid = new Tile('wire', 'straight'); wBr1_mid.rotation = 0; grid[4][5] = wBr1_mid;

      const bulb1 = new Tile('load', 'lightbulb');
      bulb1.rotation = 0;
      bulb1.value = 50;
      bulb1.isLocked = true;
      bulb1.labels[4] = '燈泡 1 (50Ω)';
      grid[5][5] = bulb1;

      const wBr1_bot1 = new Tile('wire', 'straight'); wBr1_bot1.rotation = 0; grid[6][5] = wBr1_bot1;
      const wBr1_bot2 = new Tile('wire', 'straight'); wBr1_bot2.rotation = 0; grid[7][5] = wBr1_bot2;

      // ===== 第二支路【支路 2 (50Ω / 240mA)】(Col 9, 留有 [4][9] 缺口等待學生接線) =====
      const am2 = new Tile('meter', 'a');
      am2.rotation = 0; // 垂直：上方 Pin 0 為紅(+)，下方 Pin 2 為藍(-)
      am2.isLocked = true;
      am2.labels[4] = '支路 2';
      grid[3][9] = am2;

      // grid[4][9] 為空！留給學生在此放置垂直導線 (straight, rot 0)

      const bulb2 = new Tile('load', 'lightbulb');
      bulb2.rotation = 0;
      bulb2.value = 50;
      bulb2.isLocked = true;
      bulb2.labels[4] = '燈泡 2 (50Ω)';
      grid[5][9] = bulb2;

      const wBr2_bot1 = new Tile('wire', 'straight'); wBr2_bot1.rotation = 0; grid[6][9] = wBr2_bot1;
      const wBr2_bot2 = new Tile('wire', 'straight'); wBr2_bot2.rotation = 0; grid[7][9] = wBr2_bot2;
    },
  },

  // 5-1
  {
    id: 'jh-5-1',
    title: '5-1 電功率串並聯陷阱題 (10Ω vs 40Ω 對照)',
    desc: '💡 國中段考必考魔王題！左側為【串聯】：電流相同，大電阻 40Ω 消耗功率大 (P=I²R) 因而較亮 (2.3W)；右側為【並聯】：電壓相同，小電阻 10Ω 消耗功率極大 (P=V²/R) 因而爆亮 (14.4W)！左右並排，亮度瞬間顛倒！',
    category: '第五單元：電功率與家庭用電安全',
    defaultGridSize: 12,
    setup: (grid) => {
      // ===== 左側【串聯電路：40Ω 較亮】 =====
      const batL = new Tile('power', 'power_dc');
      batL.value = 12;
      batL.rotation = 0;
      batL.isLocked = true;
      grid[5][1] = batL;

      const bulbA_L = new Tile('load', 'lightbulb');
      bulbA_L.value = 10;
      bulbA_L.rotation = 0;
      bulbA_L.isLocked = true;
      bulbA_L.labels[4] = '10Ω (0.58W 微暗)';
      grid[4][4] = bulbA_L;

      const bulbB_L = new Tile('load', 'lightbulb');
      bulbB_L.value = 40;
      bulbB_L.rotation = 0;
      bulbB_L.isLocked = true;
      bulbB_L.labels[4] = '40Ω (2.3W 較亮!)';
      grid[7][4] = bulbB_L;

      // 串聯導線
      const wL1 = new Tile('wire', 'straight'); wL1.rotation = 0; grid[4][1] = wL1;
      const wL2 = new Tile('wire', 'turn'); wL2.rotation = 1; grid[3][1] = wL2;
      const wL3 = new Tile('wire', 'straight'); wL3.rotation = 1; grid[3][2] = wL3;
      const wL4 = new Tile('wire', 'straight'); wL4.rotation = 1; grid[3][3] = wL4;
      const wL5 = new Tile('wire', 'turn'); wL5.rotation = 2; grid[3][4] = wL5;

      const wL_Mid1 = new Tile('wire', 'straight'); wL_Mid1.rotation = 0; grid[5][4] = wL_Mid1;
      const wL_Mid2 = new Tile('wire', 'straight'); wL_Mid2.rotation = 0; grid[6][4] = wL_Mid2;

      const wL6 = new Tile('wire', 'straight'); wL6.rotation = 0; grid[8][4] = wL6;
      const wL7 = new Tile('wire', 'turn'); wL7.rotation = 3; grid[9][4] = wL7;
      const wL8 = new Tile('wire', 'straight'); wL8.rotation = 1; grid[9][3] = wL8;
      const wL9 = new Tile('wire', 'straight'); wL9.rotation = 1; grid[9][2] = wL9;
      const wL10 = new Tile('wire', 'turn'); wL10.rotation = 0; grid[9][1] = wL10;
      const wL11 = new Tile('wire', 'straight'); wL11.rotation = 0; grid[8][1] = wL11;
      const wL12 = new Tile('wire', 'straight'); wL12.rotation = 0; grid[7][1] = wL12;
      const wL13 = new Tile('wire', 'straight'); wL13.rotation = 0; grid[6][1] = wL13;

      // ===== 右側【並聯電路：10Ω 爆亮 (14.4W) vs 40Ω 較暗 (3.6W)】 =====
      const batR = new Tile('power', 'power_dc');
      batR.value = 12;
      batR.rotation = 0;
      batR.isLocked = true;
      batR.labels[4] = '12V 電源';
      grid[5][7] = batR;

      // 上方正極母線 (Row 2, Cols 7..11)
      const wR_TopRise1 = new Tile('wire', 'straight'); wR_TopRise1.rotation = 0; grid[4][7] = wR_TopRise1;
      const wR_TopRise2 = new Tile('wire', 'straight'); wR_TopRise2.rotation = 0; grid[3][7] = wR_TopRise2;
      const wR_TopL = new Tile('wire', 'turn'); wR_TopL.rotation = 1; grid[2][7] = wR_TopL; // 下 & 右
      const wR_Top1 = new Tile('wire', 'straight'); wR_Top1.rotation = 1; grid[2][8] = wR_Top1;
      const wR_TopT = new Tile('wire', 't'); wR_TopT.rotation = 0; grid[2][9] = wR_TopT; // 支路 A 分流點 (右, 下, 左)
      const wR_Top2 = new Tile('wire', 'straight'); wR_Top2.rotation = 1; grid[2][10] = wR_Top2;
      const wR_TopR = new Tile('wire', 'turn'); wR_TopR.rotation = 2; grid[2][11] = wR_TopR; // 支路 B 下降點 (下 & 左)

      // 下方負極母線 (Row 8, Cols 7..11)
      const wR_BotDrop1 = new Tile('wire', 'straight'); wR_BotDrop1.rotation = 0; grid[6][7] = wR_BotDrop1;
      const wR_BotDrop2 = new Tile('wire', 'straight'); wR_BotDrop2.rotation = 0; grid[7][7] = wR_BotDrop2;
      const wR_BotL = new Tile('wire', 'turn'); wR_BotL.rotation = 0; grid[8][7] = wR_BotL; // 上 & 右
      const wR_Bot1 = new Tile('wire', 'straight'); wR_Bot1.rotation = 1; grid[8][8] = wR_Bot1;
      const wR_BotT = new Tile('wire', 't'); wR_BotT.rotation = 2; grid[8][9] = wR_BotT; // 支路 A 匯流點 (左, 上, 右)
      const wR_Bot2 = new Tile('wire', 'straight'); wR_Bot2.rotation = 1; grid[8][10] = wR_Bot2;
      const wR_BotR = new Tile('wire', 'turn'); wR_BotR.rotation = 3; grid[8][11] = wR_BotR; // 支路 B 匯流點 (上 & 左)

      // 支路 A：10Ω 燈泡 (Col 9, 消耗 14.4W 爆亮!)
      const wR_A_top1 = new Tile('wire', 'straight'); wR_A_top1.rotation = 0; grid[3][9] = wR_A_top1;
      const wR_A_top2 = new Tile('wire', 'straight'); wR_A_top2.rotation = 0; grid[4][9] = wR_A_top2;

      const bulbA_R = new Tile('load', 'lightbulb');
      bulbA_R.value = 10;
      bulbA_R.rotation = 0;
      bulbA_R.isLocked = true;
      bulbA_R.labels[4] = '10Ω (14.4W 爆亮!)';
      grid[5][9] = bulbA_R;

      const wR_A_bot1 = new Tile('wire', 'straight'); wR_A_bot1.rotation = 0; grid[6][9] = wR_A_bot1;
      const wR_A_bot2 = new Tile('wire', 'straight'); wR_A_bot2.rotation = 0; grid[7][9] = wR_A_bot2;

      // 支路 B：40Ω 燈泡 (Col 11, 消耗 3.6W 較暗)
      const wR_B_top1 = new Tile('wire', 'straight'); wR_B_top1.rotation = 0; grid[3][11] = wR_B_top1;
      const wR_B_top2 = new Tile('wire', 'straight'); wR_B_top2.rotation = 0; grid[4][11] = wR_B_top2;

      const bulbB_R = new Tile('load', 'lightbulb');
      bulbB_R.value = 40;
      bulbB_R.rotation = 0;
      bulbB_R.isLocked = true;
      bulbB_R.labels[4] = '40Ω (3.6W 較暗)';
      grid[5][11] = bulbB_R;

      const wR_B_bot1 = new Tile('wire', 'straight'); wR_B_bot1.rotation = 0; grid[6][11] = wR_B_bot1;
      const wR_B_bot2 = new Tile('wire', 'straight'); wR_B_bot2.rotation = 0; grid[7][11] = wR_B_bot2;
    },
  },

  // 5-2
  {
    id: 'jh-5-2',
    title: '5-2 家庭電路過載跳脫保護 (NFB 15A)',
    desc: '💡 本關模擬家庭 110V 供電配線與 15A 無熔絲開關 (NFB) 過載跳脫機制。\n' +
      '1. 切換至「👆 互動」模式，先點擊閉合【吹風機開關】(12Ω)：電流 9.2A < 15A，在安全範圍內運轉。\n' +
      '2. 再點擊閉合【電鍋開關】(15Ω)：總電流暴增為 9.2A + 7.3A = 16.5A > 15A！\n' +
      '3. 親眼觀察 NFB 如何因總電流過載瞬間「💥 跳脫斷電」！電路立即切斷保護安全！\n' +
      '4. 關閉電鍋開關後，可再次點擊 NFB 復歸（Reset）開關，恢復供電！',
    category: '第五單元：電功率與家庭用電安全',
    defaultGridSize: 12,
    setup: (grid) => {
      // 110V 主電源 (y=5, x=1)
      const acPower = new Tile('power', 'ac');
      acPower.value = 110;
      acPower.rotation = 0;
      acPower.isLocked = true;
      acPower.labels[4] = '110V 電源';
      grid[5][1] = acPower;

      // ===== 上方火線母線 (Row 2, 串聯 NFB 15A) =====
      const wTopRise1 = new Tile('wire', 'straight'); wTopRise1.rotation = 0; grid[4][1] = wTopRise1;
      const wTopRise2 = new Tile('wire', 'straight'); wTopRise2.rotation = 0; grid[3][1] = wTopRise2;
      const wTopL = new Tile('wire', 'turn'); wTopL.rotation = 1; grid[2][1] = wTopL; // 下 & 右
      const wTop1 = new Tile('wire', 'straight'); wTop1.rotation = 1; grid[2][2] = wTop1;

      // NFB 15A 無熔絲開關 (y=2, x=3 水平) - 總幹線過載保護
      const mcb = new Tile('breaker', 'mcb');
      mcb.rotation = 1; // 水平方向
      mcb.value = 15; // 額定跳脫電流 15A
      mcb.isActive = true;
      mcb.isLocked = true;
      mcb.labels[4] = 'NFB 15A';
      grid[2][3] = mcb;

      const wTop2 = new Tile('wire', 'straight'); wTop2.rotation = 1; grid[2][4] = wTop2;
      const wTopT1 = new Tile('wire', 't'); wTopT1.rotation = 0; grid[2][5] = wTopT1; // 吹風機分流點
      const wTop3 = new Tile('wire', 'straight'); wTop3.rotation = 1; grid[2][6] = wTop3;
      const wTop4 = new Tile('wire', 'straight'); wTop4.rotation = 1; grid[2][7] = wTop4;
      const wTopT2 = new Tile('wire', 't'); wTopT2.rotation = 0; grid[2][8] = wTopT2; // 電鍋分流點
      const wTop5 = new Tile('wire', 'straight'); wTop5.rotation = 1; grid[2][9] = wTop5;
      const wTop6 = new Tile('wire', 'straight'); wTop6.rotation = 1; grid[2][10] = wTop6;
      const wTopR = new Tile('wire', 'turn'); wTopR.rotation = 2; grid[2][11] = wTopR; // 烤箱下降點

      // ===== 下方中性線母線 (Row 8, Cols 1..11) =====
      const wBotDrop1 = new Tile('wire', 'straight'); wBotDrop1.rotation = 0; grid[6][1] = wBotDrop1;
      const wBotDrop2 = new Tile('wire', 'straight'); wBotDrop2.rotation = 0; grid[7][1] = wBotDrop2;
      const wBotL = new Tile('wire', 'turn'); wBotL.rotation = 0; grid[8][1] = wBotL; // 上 & 右
      const wBot1 = new Tile('wire', 'straight'); wBot1.rotation = 1; grid[8][2] = wBot1;
      const wBot2 = new Tile('wire', 'straight'); wBot2.rotation = 1; grid[8][3] = wBot2;
      const wBot3 = new Tile('wire', 'straight'); wBot3.rotation = 1; grid[8][4] = wBot3;
      const wBotT1 = new Tile('wire', 't'); wBotT1.rotation = 2; grid[8][5] = wBotT1; // 吹風機匯流點
      const wBot4 = new Tile('wire', 'straight'); wBot4.rotation = 1; grid[8][6] = wBot4;
      const wBot5 = new Tile('wire', 'straight'); wBot5.rotation = 1; grid[8][7] = wBot5;
      const wBotT2 = new Tile('wire', 't'); wBotT2.rotation = 2; grid[8][8] = wBotT2; // 電鍋匯流點
      const wBot6 = new Tile('wire', 'straight'); wBot6.rotation = 1; grid[8][9] = wBot6;
      const wBot7 = new Tile('wire', 'straight'); wBot7.rotation = 1; grid[8][10] = wBot7;
      const wBotR = new Tile('wire', 'turn'); wBotR.rotation = 3; grid[8][11] = wBotR; // 烤箱匯流點

      // ===== 支路 1：吹風機 (1000W / 12Ω / 9.2A) (Col 5) =====
      const sw1 = new Tile('switch', 'spst');
      sw1.rotation = 0;
      sw1.isActive = false;
      sw1.isLocked = true;
      sw1.labels[4] = '吹風機開關';
      grid[3][5] = sw1;

      const wBr1_mid = new Tile('wire', 'straight'); wBr1_mid.rotation = 0; grid[4][5] = wBr1_mid;

      const res1 = new Tile('resistor', 'standard');
      res1.value = 12;
      res1.rotation = 0;
      res1.isLocked = true;
      res1.labels[4] = '吹風機 12Ω';
      grid[5][5] = res1;

      const wBr1_bot1 = new Tile('wire', 'straight'); wBr1_bot1.rotation = 0; grid[6][5] = wBr1_bot1;
      const wBr1_bot2 = new Tile('wire', 'straight'); wBr1_bot2.rotation = 0; grid[7][5] = wBr1_bot2;

      // ===== 支路 2：電鍋 (800W / 15Ω / 7.3A) (Col 8) =====
      const sw2 = new Tile('switch', 'spst');
      sw2.rotation = 0;
      sw2.isActive = false;
      sw2.isLocked = true;
      sw2.labels[4] = '電鍋開關';
      grid[3][8] = sw2;

      const wBr2_mid = new Tile('wire', 'straight'); wBr2_mid.rotation = 0; grid[4][8] = wBr2_mid;

      const res2 = new Tile('resistor', 'standard');
      res2.value = 15;
      res2.rotation = 0;
      res2.isLocked = true;
      res2.labels[4] = '電鍋 15Ω';
      grid[5][8] = res2;

      const wBr2_bot1 = new Tile('wire', 'straight'); wBr2_bot1.rotation = 0; grid[6][8] = wBr2_bot1;
      const wBr2_bot2 = new Tile('wire', 'straight'); wBr2_bot2.rotation = 0; grid[7][8] = wBr2_bot2;

      // ===== 支路 3：電烤箱 (1200W / 10Ω / 11A) (Col 11) =====
      const sw3 = new Tile('switch', 'spst');
      sw3.rotation = 0;
      sw3.isActive = false;
      sw3.isLocked = true;
      sw3.labels[4] = '烤箱開關';
      grid[3][11] = sw3;

      const wBr3_mid = new Tile('wire', 'straight'); wBr3_mid.rotation = 0; grid[4][11] = wBr3_mid;

      const res3 = new Tile('resistor', 'standard');
      res3.value = 10;
      res3.rotation = 0;
      res3.isLocked = true;
      res3.labels[4] = '電烤箱 10Ω';
      grid[5][11] = res3;

      const wBr3_bot1 = new Tile('wire', 'straight'); wBr3_bot1.rotation = 0; grid[6][11] = wBr3_bot1;
      const wBr3_bot2 = new Tile('wire', 'straight'); wBr3_bot2.rotation = 0; grid[7][11] = wBr3_bot2;
    },
  },
];
