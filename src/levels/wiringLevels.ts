/**
 * @license
 * Industrial Wiring Levels (Chapter 3) for Auto Studio Pro
 */

import { Tile } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';

export const wiringMenuCategories: LevelMenuCategory[] = [
  {
    title: '第一大類：基礎配線與接點邏輯 (Basic Wiring & Contacts)',
    levels: [
      { id: 'w-1-1', title: '單元 1-1：點亮指示燈', desc: '將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。' },
      { id: 'w-1-2', title: '單元 1-2：串聯與及邏輯', desc: '必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。' },
      { id: 'w-1-3', title: '單元 1-3：並聯與或邏輯', desc: '兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。' },
      { id: 'w-1-4', title: '單元 1-4：常閉接點 (NC) 應用', desc: '燈泡預設是亮的，按下按鈕 (NC) 後燈滅。' },
      { id: 'w-1-5', title: '單元 1-5：複合接點與同態邏輯 (XNOR)', desc: '將 PB1、PB2 的常開 (NO) 串聯與常閉 (NC) 串聯並聯，體驗兩開關狀態一致時燈才點亮的同態控制！' },
    ],
  },
  {
    title: '第二大類：電磁接觸器與記憶電路 (Magnetic Contactor & Self-Holding)',
    levels: [
      { id: 'w-2-1', title: '單元 2-1：電磁接觸器 (MC) 基礎', desc: '用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。' },
      { id: 'w-2-2', title: '單元 2-2：繼電器 C 接點應用（雙燈切換）', desc: '利用繼電器 C 接點 (COM, NO, NC) 控制兩盞指示燈，體驗未激磁常閉亮、激磁切換常開亮的交互控制！' },
      { id: 'w-2-3', title: '單元 2-3：自保持電路 (Self-Holding)', desc: '按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。' },
      { id: 'w-2-4', title: '單元 2-4：三種停止接法安全比較（正常／無法停止／同時啟動）', desc: '深入說明自保持電路中停止按鈕的三種接法後果：1. 正常開關（停止優先） 2. 無法關閉（停止失效） 3. 如果同時按下還是會啟動（啟動優先）。' },
      { id: 'w-2-5', title: '單元 2-5：兩地控制 (Two-Place Control)', desc: '在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。' },
    ],
  },
  {
    title: '第三大類：互鎖與安全控制 (Interlock & Safety)',
    levels: [
      { id: 'w-3-1', title: '單元 3-1：電氣互鎖 (Electrical Interlock)', desc: '兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。' },
      { id: 'w-3-2', title: '單元 3-2：後動作優先互鎖電路（免按停止直接切換）', desc: '任務：深入掌握後動作優先（後按優先）互鎖原理。常閉接點 (NC) 串接於對方的自保持支路，運轉中直接按另一組啟動鈕即可無縫切換，免先按停止鈕！' },
      { id: 'w-3-3', title: '單元 3-3：三相感應馬達正反轉', desc: '結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。' },
      { id: 'w-3-4', title: '單元 3-4：順序啟動 (Sequential Start)', desc: '廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。' },
    ],
  },
  {
    title: '第四大類：時間控制與自動化 (Timers & Automation)',
    levels: [
      { id: 'w-4-1', title: '單元 4-1：通電延遲 (ON-Delay)', desc: '按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。' },
      { id: 'w-4-2', title: '單元 4-2：自動停止 (Auto-Stop)', desc: '馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。' },
      { id: 'w-4-3', title: '單元 4-3：閃爍與交替控制 (Flasher)', desc: '利用計時器讓兩顆指示燈 (紅、綠) 交互閃爍。' },
      { id: 'w-4-4', title: '單元 4-4：星角降壓啟動 (Y-Δ Starting)', desc: '大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。' },
    ],
  },
  {
    title: '第五大類：保護機制與故障排除 (Protection & Troubleshooting)',
    levels: [
      { id: 'w-5-1', title: '單元 5-1：過載保護 (Thermal Overload)', desc: '將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。' },
      { id: 'w-5-2', title: '單元 5-2：極限開關應用 (Limit Switch)', desc: '電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。' },
    ],
  },
  {
    title: '工業配線丙級：故障檢修 (Troubleshooting)',
    levels: [
      { id: 'class_c_u1_1', title: '第一題：單相感應電動機順序起動控制', desc: '檢修單相感應電動機順序起動控制電路。' },
      { id: 'class_c_u1_2', title: '第二題：自動台車分料系統控制電路', desc: '檢修自動台車分料系統控制電路。' },
      { id: 'class_c_u1_7', title: '第七題：往復式送料機自動控制電路', desc: '檢修往復式送料機自動控制電路，使用三相電源、接觸器及極限開關進行控制。' },
    ],
  },
];

export const wiringLevels: LevelDefinition[] = [
  {
    id: 'w-1-1',
    title: 'w-1-1 點亮指示燈',
    desc: '任務：將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const noBtn = new Tile('btn', 'no'); noBtn.rotation = 0; noBtn.isLocked = true;
      const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
      grid[1][4] = wireL;
      grid[3][4] = noBtn;
      grid[5][4] = light;
      grid[7][4] = wireN;
    },
  },
  {
    id: 'w-1-2',
    title: 'w-1-2 串聯與及邏輯',
    desc: '任務：必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 0; noBtn1.isLocked = true;
      const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 0; noBtn2.isLocked = true;
      const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
      grid[0][4] = wireL;
      grid[2][4] = noBtn1;
      grid[4][4] = noBtn2;
      grid[6][4] = light;
      grid[8][4] = wireN;
    },
  },
  {
    id: 'w-1-3',
    title: 'w-1-3 並聯與或邏輯',
    desc: '任務：兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 0; noBtn1.isLocked = true;
      const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 0; noBtn2.isLocked = true;
      const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
      grid[1][4] = wireL;
      grid[3][3] = noBtn1;
      grid[3][5] = noBtn2;
      grid[5][4] = light;
      grid[7][4] = wireN;
    },
  },
  {
    id: 'w-1-4',
    title: 'w-1-4 常閉接點 (NC) 應用',
    desc: '任務：燈泡預設是亮的，按下按鈕 (NC) 後燈滅。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const ncBtn = new Tile('btn', 'nc'); ncBtn.rotation = 0; ncBtn.isLocked = true;
      const light = new Tile('load', 'lightbulb'); light.rotation = 0; light.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 2; wireN.isLocked = true;
      grid[1][4] = wireL;
      grid[3][4] = ncBtn;
      grid[5][4] = light;
      grid[7][4] = wireN;
    },
  },
  {
    id: 'w-1-5',
    title: 'w-1-5 複合接點與同態邏輯 (XNOR)',
    desc: '任務：將 PB1、PB2 的常開接點 (NO) 串聯作為上支路，常閉接點 (NC) 串聯作為下支路並聯。體驗只有兩按鈕「狀態一致（都不按或同時按下）」時指示燈才會點亮的同態 (XNOR) 控制！',
    category: '第一大類：基礎配線與接點邏輯',
    defaultGridSize: 10,
    setup: (grid) => {
      // Row 2: L and N Power
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true; grid[2][1] = wireL;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true; grid[2][9] = wireN;

      // Row 3: Top Branch (NO Series) & Lightbulb
      const w3_1 = new Tile('wire', 'turn'); w3_1.rotation = 0; grid[3][1] = w3_1;
      const w3_2 = new Tile('wire', 't'); w3_2.rotation = 0; grid[3][2] = w3_2;
      const pb1_no = new Tile('btn', 'toggle'); pb1_no.rotation = 1; pb1_no.isLocked = true;
      pb1_no.labels = { 1: '13', 2: '14', 4: 'PB1' }; grid[3][3] = pb1_no;
      const w3_4 = new Tile('wire', 'straight'); w3_4.rotation = 1; grid[3][4] = w3_4;
      const pb2_no = new Tile('btn', 'toggle'); pb2_no.rotation = 1; pb2_no.isLocked = true;
      pb2_no.labels = { 1: '13', 2: '14', 4: 'PB2' }; grid[3][5] = pb2_no;
      const w3_6 = new Tile('wire', 't'); w3_6.rotation = 0; grid[3][6] = w3_6;
      const light = new Tile('load', 'lightbulb'); light.rotation = 1; light.isLocked = true; grid[3][7] = light;
      const w3_8 = new Tile('wire', 'straight'); w3_8.rotation = 1; grid[3][8] = w3_8;
      const w3_9 = new Tile('wire', 'turn'); w3_9.rotation = 3; grid[3][9] = w3_9;

      // Row 4: Vertical Drops
      const w4_2 = new Tile('wire', 'straight'); w4_2.rotation = 0; grid[4][2] = w4_2;
      const w4_6 = new Tile('wire', 'straight'); w4_6.rotation = 0; grid[4][6] = w4_6;

      // Row 5: Bottom Branch (NC Series)
      const w5_2 = new Tile('wire', 'turn'); w5_2.rotation = 0; grid[5][2] = w5_2;
      const pb1_nc = new Tile('relay', 'nc'); pb1_nc.rotation = 1; pb1_nc.isLocked = true;
      pb1_nc.labels = { 4: 'PB1' }; grid[5][3] = pb1_nc;
      const w5_4 = new Tile('wire', 'straight'); w5_4.rotation = 1; grid[5][4] = w5_4;
      const pb2_nc = new Tile('relay', 'nc'); pb2_nc.rotation = 1; pb2_nc.isLocked = true;
      pb2_nc.labels = { 4: 'PB2' }; grid[5][5] = pb2_nc;
      const w5_6 = new Tile('wire', 'turn'); w5_6.rotation = 3; grid[5][6] = w5_6;
    },
  },
  {
    id: 'w-2-1',
    title: 'w-2-1 電磁接觸器 (MC) 基礎',
    desc: '任務：用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
      const noBtn = new Tile('btn', 'no'); noBtn.rotation = 1; noBtn.isLocked = true;
      const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;
      const relayNo = new Tile('relay', 'no'); relayNo.rotation = 1; relayNo.isLocked = true; relayNo.labels[4] = 'K1';
      const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

      grid[3][1] = wireL;
      grid[3][3] = noBtn;
      grid[3][5] = coil;
      grid[3][7] = wireN;

      grid[5][3] = relayNo;
      grid[5][5] = motor;
    },
  },
  {
    id: 'w-2-2',
    title: 'w-2-2 繼電器 C 接點應用（雙燈切換）',
    desc: '任務：上方 AC 控制迴路以按鈕 PB1 控制電驛 K1；下方 DC 迴路利用 K1 的 C 接點 (COM, NO, NC) 控制兩盞指示燈。平時燈 2 亮，按壓 PB1 激磁後切換為燈 1 亮！',
    category: '第二大類：電磁接觸器與記憶電路',
    defaultGridSize: 10,
    setup: (grid) => {
      // Row 2: AC Control Loop (L -> PB1 -> K1 Coil -> N)
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true; grid[2][1] = wireL;
      const w2_2 = new Tile('wire', 'straight'); w2_2.rotation = 1; grid[2][2] = w2_2;
      const pb1 = new Tile('btn', 'no'); pb1.rotation = 1; pb1.isLocked = true;
      pb1.labels = { 1: '13', 2: '14', 4: 'PB1' }; grid[2][3] = pb1;
      const w2_4 = new Tile('wire', 'straight'); w2_4.rotation = 1; grid[2][4] = w2_4;
      const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true;
      coil.labels = { 4: 'K1' }; grid[2][5] = coil;
      const w2_6 = new Tile('wire', 'straight'); w2_6.rotation = 1; grid[2][6] = w2_6;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true; grid[2][7] = wireN;

      // Row 4: NO Branch to Lamp 1
      const w4_3 = new Tile('wire', 'turn'); w4_3.rotation = 1; grid[4][3] = w4_3;
      const w4_4 = new Tile('wire', 'straight'); w4_4.rotation = 1; grid[4][4] = w4_4;
      const light1 = new Tile('load', 'lightbulb'); light1.rotation = 1; light1.isLocked = true;
      light1.labels = { 4: '運轉燈(NO)' }; grid[4][5] = light1;
      const w4_6 = new Tile('wire', 'turn'); w4_6.rotation = 2; grid[4][6] = w4_6;

      // Row 5: DC Indication Loop (+24V -> K1 CON -> NC/NO -> Lamps -> 0V)
      const wirePlus = new Tile('wire', 'plus'); wirePlus.rotation = 3; wirePlus.isLocked = true; grid[5][1] = wirePlus;
      const w5_2 = new Tile('wire', 'straight'); w5_2.rotation = 1; grid[5][2] = w5_2;
      const relayCon = new Tile('relay', 'con'); relayCon.rotation = 3; relayCon.isLocked = true;
      relayCon.labels = { 4: 'K1' }; grid[5][3] = relayCon;
      const w5_4 = new Tile('wire', 'straight'); w5_4.rotation = 1; grid[5][4] = w5_4;
      const light2 = new Tile('load', 'lightbulb'); light2.rotation = 1; light2.isLocked = true;
      light2.labels = { 4: '待機燈(NC)' }; grid[5][5] = light2;
      const w5_6 = new Tile('wire', 't'); w5_6.rotation = 2; grid[5][6] = w5_6;
      const wireMinus = new Tile('wire', 'minus'); wireMinus.rotation = 1; wireMinus.isLocked = true; grid[5][7] = wireMinus;
    },
  },
  {
    id: 'w-2-3',
    title: 'w-2-3 自保持電路 (Self-Holding)',
    desc: '任務：按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
      const noBtn = new Tile('btn', 'no'); noBtn.rotation = 1; noBtn.isLocked = true;
      noBtn.labels[3] = '14'; noBtn.labels[1] = '13'; noBtn.labels[4] = 'BTN';
      const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;

      const relayNo1 = new Tile('relay', 'no'); relayNo1.rotation = 1; relayNo1.isLocked = true; relayNo1.labels[4] = 'K1';
      const relayNo2 = new Tile('relay', 'no'); relayNo2.rotation = 1; relayNo2.isLocked = true; relayNo2.labels[4] = 'K1';
      const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

      grid[1][1] = wireL;
      grid[1][3] = noBtn;
      grid[1][5] = coil;
      grid[1][7] = wireN;

      grid[3][3] = relayNo1;

      grid[5][3] = relayNo2;
      grid[5][5] = motor;
    },
  },
  {
    id: 'w-2-4',
    title: 'w-2-4 三種停止接法安全比較（正常／無法停止／同時啟動）',
    desc: '任務：深入探討自保持電路中「停止按鈕 (NC)」接在不同位置所產生的三種重大後果：\n1. 正常開關（停止優先）：標準安全接法，任何時候按停止皆切斷。\n2. 無法關閉（嚴重錯誤）：停止接於啟動支路，自保持後電源旁路，完全無法停止！\n3. 同時按下仍啟動（啟動優先）：停止接於自保持支路，兩者同時按下時仍會通電運轉。',
    category: '第二大類：電磁接觸器與記憶電路',
    defaultGridSize: 10,
    setup: (grid) => {
      const tilesData: [number, number, string, string, number, Record<number, string>?][] = [
        // 迴路一：正常開關 (停止優先 / 標準安全接法)
        [0, 0, 'wire', 'l', 3],
        [1, 0, 'wire', 'straight', 1],
        [2, 0, 'btn', 'nc', 1, { 1: '11', 3: '12', 4: 'PB1' }],
        [3, 0, 'wire', 't', 0],
        [4, 0, 'btn', 'no', 1, { 1: '13', 3: '14', 4: 'PB2' }],
        [5, 0, 'wire', 't', 0],
        [6, 0, 'relay', 'coil', 1, { 4: 'K1' }],
        [7, 0, 'wire', 'straight', 1],
        [8, 0, 'wire', 'n', 1],

        [3, 1, 'wire', 'turn', 0],
        [4, 1, 'relay', 'no', 1, { 4: 'K1' }],
        [5, 1, 'wire', 'turn', 3],

        // 迴路二：無法關閉 (停止失效 / 嚴重接錯)
        [0, 3, 'wire', 'l', 3],
        [1, 3, 'wire', 't', 0],
        [2, 3, 'btn', 'nc', 1, { 1: '11', 3: '12', 4: 'PB3' }],
        [3, 3, 'wire', 'straight', 1],
        [4, 3, 'btn', 'no', 1, { 1: '13', 3: '14', 4: 'PB4' }],
        [5, 3, 'wire', 't', 0],
        [6, 3, 'relay', 'coil', 1, { 4: 'K2' }],
        [7, 3, 'wire', 'straight', 1],
        [8, 3, 'wire', 'n', 1],

        [1, 4, 'wire', 'turn', 0],
        [2, 4, 'wire', 'straight', 1],
        [3, 4, 'wire', 'straight', 1],
        [4, 4, 'relay', 'no', 1, { 4: 'K2' }],
        [5, 4, 'wire', 'turn', 3],

        // 迴路三：同時按下還是會啟動 (啟動優先 / 次佳接法)
        [0, 6, 'wire', 'l', 3],
        [1, 6, 'wire', 't', 0],
        [2, 6, 'wire', 'straight', 1],
        [3, 6, 'wire', 'straight', 1],
        [4, 6, 'btn', 'no', 1, { 1: '13', 3: '14', 4: 'PB6' }],
        [5, 6, 'wire', 't', 0],
        [6, 6, 'relay', 'coil', 1, { 4: 'K3' }],
        [7, 6, 'wire', 'straight', 1],
        [8, 6, 'wire', 'n', 1],

        [1, 7, 'wire', 'turn', 0],
        [2, 7, 'btn', 'nc', 1, { 1: '11', 3: '12', 4: 'PB5' }],
        [3, 7, 'wire', 'straight', 1],
        [4, 7, 'relay', 'no', 1, { 4: 'K3' }],
        [5, 7, 'wire', 'turn', 3],
      ];

      for (const [x, y, type, subtype, rotation, labels] of tilesData) {
        const t = new Tile(type, subtype);
        t.rotation = rotation;
        t.isLocked = false;
        if (labels) {
          t.labels = { ...labels };
        }
        grid[y][x] = t;
      }
    },
  },
  {
    id: 'w-2-5',
    title: 'w-2-5 兩地控制 (Two-Place Control)',
    desc: '任務：在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
      const ncBtn1 = new Tile('btn', 'nc'); ncBtn1.rotation = 1; ncBtn1.isLocked = true;
      ncBtn1.labels[3] = '12'; ncBtn1.labels[1] = '11';
      const noBtn1 = new Tile('btn', 'no'); noBtn1.rotation = 1; noBtn1.isLocked = true;
      noBtn1.labels[3] = '14'; noBtn1.labels[1] = '13'; noBtn1.labels[4] = 'BTN';
      const coil = new Tile('relay', 'coil'); coil.rotation = 1; coil.isLocked = true; coil.labels[4] = 'K1';
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;

      const ncBtn2 = new Tile('btn', 'nc'); ncBtn2.rotation = 1; ncBtn2.isLocked = true;
      ncBtn2.labels[3] = '12'; ncBtn2.labels[1] = '11';
      const noBtn2 = new Tile('btn', 'no'); noBtn2.rotation = 1; noBtn2.isLocked = true;
      noBtn2.labels[3] = '14'; noBtn2.labels[1] = '13'; noBtn2.labels[4] = 'BTN';

      const relayNo1 = new Tile('relay', 'no'); relayNo1.rotation = 1; relayNo1.isLocked = true; relayNo1.labels[4] = 'K1';
      const relayNo2 = new Tile('relay', 'no'); relayNo2.rotation = 1; relayNo2.isLocked = true; relayNo2.labels[4] = 'K1';
      const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;

      grid[1][0] = wireL;
      grid[1][2] = ncBtn1;
      grid[1][4] = noBtn1;
      grid[1][6] = coil;
      grid[1][8] = wireN;

      grid[3][2] = ncBtn2;
      grid[3][4] = noBtn2;

      grid[5][4] = relayNo1;

      grid[7][4] = relayNo2;
      grid[7][6] = motor;
    },
  },
  {
    id: 'w-3-1',
    title: 'w-3-1 電氣互鎖 (Electrical Interlock)',
    desc: '任務：兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

      const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
      const relayNcK2 = new Tile('relay', 'nc'); relayNcK2.rotation = 1; relayNcK2.isLocked = true; relayNcK2.labels[4] = 'K2';
      const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.isLocked = true; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
      const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';

      const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.isLocked = true; relayNoK1.labels[4] = 'K1';

      const relayNcK1 = new Tile('relay', 'nc'); relayNcK1.rotation = 1; relayNcK1.isLocked = true; relayNcK1.labels[4] = 'K1';
      const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.isLocked = true; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
      const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.isLocked = true; coilK2.labels[4] = 'K2';

      const relayNoK2 = new Tile('relay', 'no'); relayNoK2.rotation = 1; relayNoK2.isLocked = true; relayNoK2.labels[4] = 'K2';

      grid[0][0] = wireL;
      grid[0][8] = wireN;

      grid[1][1] = btnNc;
      grid[1][3] = relayNcK2;
      grid[1][5] = btnNo1;
      grid[1][7] = coilK1;

      grid[3][5] = relayNoK1;

      grid[5][3] = relayNcK1;
      grid[5][5] = btnNo2;
      grid[5][7] = coilK2;

      grid[7][5] = relayNoK2;
    },
  },
  {
    id: 'w-3-2',
    title: 'w-3-2 後動作優先互鎖電路（免按停止直接切換）',
    desc: '任務：掌握後動作優先（後按優先）互鎖原理。常閉接點 (NC) 串接於對方的自保持支路，運轉中直接按下另一組啟動按鈕即可無縫切換，無需先按停止按鈕！',
    category: '第三大類：互鎖與安全控制',
    defaultGridSize: 10,
    setup: (grid) => {
      const tilesData: [number, number, string, string, number, Record<number, string>?][] = [
        // 電源端
        [0, 0, 'wire', 'l', 0],
        [8, 0, 'wire', 'n', 0],

        // 迴路一 (K1 控制迴路：PB1 啟動、PB2 停止、K1 線圈)
        [0, 1, 'wire', 't', 3],
        [1, 1, 'btn', 'no', 1, { 1: '13', 2: '14', 4: 'PB1' }],
        [2, 1, 'wire', 'straight', 1],
        [3, 1, 'wire', 'straight', 1],
        [4, 1, 'wire', 't', 0],
        [5, 1, 'btn', 'nc', 1, { 1: '11', 2: '12', 4: 'PB2' }],
        [6, 1, 'wire', 'straight', 1],
        [7, 1, 'relay', 'coil', 1, { 4: 'K1' }],
        [8, 1, 'wire', 't', 1],

        // 迴路一自保持支路 (K1 NO + K2 NC 互鎖接點)
        [0, 2, 'wire', 't', 3],
        [1, 2, 'relay', 'no', 1, { 4: 'K1' }],
        [2, 2, 'wire', 'straight', 1],
        [3, 2, 'relay', 'nc', 1, { 4: 'K2' }],
        [4, 2, 'wire', 'turn', 3],
        [8, 2, 'wire', 'straight', 0],

        // 垂直導線
        [0, 3, 'wire', 'straight', 0],
        [8, 3, 'wire', 'straight', 0],

        // 迴路二 (K2 控制迴路：PB3 啟動、PB4 停止、K2 線圈)
        [0, 4, 'wire', 't', 3],
        [1, 4, 'btn', 'no', 1, { 1: '13', 2: '14', 4: 'PB3' }],
        [2, 4, 'wire', 'straight', 1],
        [3, 4, 'wire', 'straight', 1],
        [4, 4, 'wire', 't', 0],
        [5, 4, 'btn', 'nc', 1, { 1: '11', 2: '12', 4: 'PB4' }],
        [6, 4, 'wire', 'straight', 1],
        [7, 4, 'relay', 'coil', 1, { 4: 'K2' }],
        [8, 4, 'wire', 'turn', 3],

        // 迴路二自保持支路 (K2 NO + K1 NC 互鎖接點)
        [0, 5, 'wire', 'turn', 0],
        [1, 5, 'relay', 'no', 1, { 4: 'K2' }],
        [2, 5, 'wire', 'straight', 1],
        [3, 5, 'relay', 'nc', 1, { 4: 'K1' }],
        [4, 5, 'wire', 'turn', 3],
      ];

      for (const [x, y, type, subtype, rotation, labels] of tilesData) {
        const t = new Tile(type, subtype);
        t.rotation = rotation;
        t.isLocked = false;
        if (labels) {
          t.labels = { ...labels };
        }
        grid[y][x] = t;
      }
    },
  },
  {
    id: 'w-3-3',
    title: 'w-3-3 三相感應馬達正反轉',
    desc: '任務：結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

      const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
      const relayNcK2 = new Tile('relay', 'nc'); relayNcK2.rotation = 1; relayNcK2.isLocked = true; relayNcK2.labels[4] = 'K2';
      const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
      const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.labels[4] = 'K1';

      const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.labels[4] = 'K1';

      const relayNcK1 = new Tile('relay', 'nc'); relayNcK1.rotation = 1; relayNcK1.labels[4] = 'K1';
      const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
      const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.labels[4] = 'K2';

      const relayNoK2 = new Tile('relay', 'no'); relayNoK2.rotation = 1; relayNoK2.labels[4] = 'K2';

      const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.labels[4] = 'K1';
      const relayNcK1_2 = new Tile('relay', 'nc'); relayNcK1_2.rotation = 1; relayNcK1_2.labels[4] = 'K1';

      const motor = new Tile('motor', 'motor'); motor.rotation = 0; motor.rotationAngle = 80;

      const relayNoK2_2 = new Tile('relay', 'no'); relayNoK2_2.rotation = 1; relayNoK2_2.labels[4] = 'K2';
      const relayNcK2_2 = new Tile('relay', 'nc'); relayNcK2_2.rotation = 1; relayNcK2_2.labels[4] = 'K2';

      grid[0][0] = wireL;
      grid[0][8] = wireN;

      grid[1][1] = btnNc;
      grid[1][3] = relayNcK2;
      grid[1][5] = btnNo1;
      grid[1][7] = coilK1;

      grid[2][5] = relayNoK1;

      grid[3][3] = relayNcK1;
      grid[3][5] = btnNo2;
      grid[3][7] = coilK2;

      grid[4][5] = relayNoK2;

      grid[6][3] = relayNoK1_2;
      grid[6][7] = relayNcK1_2;

      grid[7][5] = motor;

      grid[8][3] = relayNoK2_2;
      grid[8][7] = relayNcK2_2;
    },
  },
  {
    id: 'w-3-4',
    title: 'w-3-4 順序啟動 (Sequential Start)',
    desc: '任務：廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

      const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
      const btnNo1 = new Tile('btn', 'no'); btnNo1.rotation = 1; btnNo1.labels[1] = '13'; btnNo1.labels[2] = '14';
      const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.labels[4] = 'K1';

      const relayNoK1_1 = new Tile('relay', 'no'); relayNoK1_1.rotation = 1; relayNoK1_1.labels[4] = 'K1';

      const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.labels[4] = 'K1';
      const btnNo2 = new Tile('btn', 'no'); btnNo2.rotation = 1; btnNo2.labels[1] = '13'; btnNo2.labels[2] = '14';
      const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 3; coilK2.labels[4] = 'K2';

      const relayNoK2_1 = new Tile('relay', 'no'); relayNoK2_1.rotation = 1; relayNoK2_1.labels[4] = 'K2';

      const relayNoK1_3 = new Tile('relay', 'no'); relayNoK1_3.rotation = 1; relayNoK1_3.labels[4] = 'K1';
      const motor1 = new Tile('motor', 'motor'); motor1.rotation = 1;

      const relayNoK2_2 = new Tile('relay', 'no'); relayNoK2_2.rotation = 1; relayNoK2_2.labels[4] = 'K2';
      const motor2 = new Tile('motor', 'motor'); motor2.rotation = 1;

      grid[0][0] = wireL;
      grid[0][8] = wireN;

      grid[1][1] = btnNc;
      grid[1][5] = btnNo1;
      grid[1][7] = coilK1;

      grid[2][5] = relayNoK1_1;

      grid[3][3] = relayNoK1_2;
      grid[3][5] = btnNo2;
      grid[3][7] = coilK2;

      grid[4][5] = relayNoK2_1;

      grid[6][5] = relayNoK1_3;
      grid[6][7] = motor1;

      grid[8][5] = relayNoK2_2;
      grid[8][7] = motor2;
    },
  },
  {
    id: 'w-4-1',
    title: 'w-4-1 通電延遲 (ON-Delay)',
    desc: '任務：按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。',
    defaultGridSize: 10,
    setup: (grid) => {
      grid[0][0] = new Tile('wire', 'l'); grid[0][0].rotation = 0;
      grid[0][8] = new Tile('wire', 'n'); grid[0][8].rotation = 0;
      
      grid[1][0] = new Tile('wire', 't'); grid[1][0].rotation = 3;
      grid[1][1] = new Tile('btn', 'nc'); grid[1][1].rotation = 1; grid[1][1].labels[1] = '11'; grid[1][1].labels[2] = '12';
      grid[1][2] = new Tile('wire', 't'); grid[1][2].rotation = 0;
      grid[1][3] = new Tile('btn', 'no'); grid[1][3].rotation = 1; grid[1][3].labels[1] = '13'; grid[1][3].labels[2] = '14';
      grid[1][4] = new Tile('wire', 't'); grid[1][4].rotation = 0;
      grid[1][5] = new Tile('wire', 'straight'); grid[1][5].rotation = 1;
      grid[1][6] = new Tile('wire', 'straight'); grid[1][6].rotation = 1;
      grid[1][7] = new Tile('relay', 'coil'); grid[1][7].rotation = 1; grid[1][7].labels[4] = 'T1';
      grid[1][8] = new Tile('wire', 't'); grid[1][8].rotation = 1;

      grid[2][0] = new Tile('wire', 'straight'); grid[2][0].rotation = 0;
      grid[2][2] = new Tile('wire', 'straight'); grid[2][2].rotation = 2;
      grid[2][4] = new Tile('wire', 'straight'); grid[2][4].rotation = 2;
      grid[2][8] = new Tile('wire', 'straight'); grid[2][8].rotation = 0;

      grid[3][0] = new Tile('wire', 'straight'); grid[3][0].rotation = 0;
      grid[3][2] = new Tile('wire', 'turn'); grid[3][2].rotation = 0;
      grid[3][3] = new Tile('relay', 'no'); grid[3][3].rotation = 1; grid[3][3].labels[4] = 'T1';
      grid[3][4] = new Tile('wire', 't'); grid[3][4].rotation = 2;
      grid[3][5] = new Tile('wire', 'straight'); grid[3][5].rotation = 1;
      grid[3][6] = new Tile('wire', 'straight'); grid[3][6].rotation = 1;
      grid[3][7] = new Tile('relay', 'flash_coil'); grid[3][7].rotation = 1; grid[3][7].value = 1000; grid[3][7].labels[4] = 'F1';
      grid[3][8] = new Tile('wire', 't'); grid[3][8].rotation = 1;

      grid[4][0] = new Tile('wire', 'straight'); grid[4][0].rotation = 0;
      grid[4][8] = new Tile('wire', 'straight'); grid[4][8].rotation = 0;

      grid[5][0] = new Tile('wire', 't'); grid[5][0].rotation = 3;
      grid[5][1] = new Tile('relay', 'ton_nc'); grid[5][1].rotation = 1; grid[5][1].value = 3000; grid[5][1].labels[4] = 'T1';
      grid[5][2] = new Tile('wire', 'straight'); grid[5][2].rotation = 1;
      grid[5][3] = new Tile('relay', 'no'); grid[5][3].rotation = 1; grid[5][3].labels[4] = 'F1';
      grid[5][4] = new Tile('wire', 'straight'); grid[5][4].rotation = 1;
      grid[5][5] = new Tile('wire', 'straight'); grid[5][5].rotation = 1;
      grid[5][6] = new Tile('wire', 'straight'); grid[5][6].rotation = 1;
      grid[5][7] = new Tile('load', 'lightbulb'); grid[5][7].rotation = 1;
      grid[5][8] = new Tile('wire', 't'); grid[5][8].rotation = 1;

      grid[6][0] = new Tile('wire', 'straight'); grid[6][0].rotation = 0;
      grid[6][8] = new Tile('wire', 'straight'); grid[6][8].rotation = 0;

      grid[7][0] = new Tile('wire', 'turn'); grid[7][0].rotation = 0;
      grid[7][1] = new Tile('relay', 'ton_no'); grid[7][1].rotation = 1; grid[7][1].value = 3000; grid[7][1].labels[4] = 'T1';
      grid[7][2] = new Tile('wire', 'straight'); grid[7][2].rotation = 1;
      grid[7][3] = new Tile('wire', 'straight'); grid[7][3].rotation = 1;
      grid[7][4] = new Tile('wire', 'straight'); grid[7][4].rotation = 1;
      grid[7][5] = new Tile('wire', 'straight'); grid[7][5].rotation = 1;
      grid[7][6] = new Tile('wire', 'straight'); grid[7][6].rotation = 1;
      grid[7][7] = new Tile('motor', ''); grid[7][7].rotation = 1;
      grid[7][8] = new Tile('wire', 'turn'); grid[7][8].rotation = 3;
    },
  },
  {
    id: 'w-4-2',
    title: 'w-4-2 自動停止 (Auto-Stop)',
    desc: '任務：馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。',
    defaultGridSize: 10,
    setup: (grid) => {
      grid[0][0] = new Tile('wire', 'l'); grid[0][0].rotation = 0;
      grid[0][8] = new Tile('wire', 'n'); grid[0][8].rotation = 0;

      grid[1][0] = new Tile('wire', 't'); grid[1][0].rotation = 3;
      grid[1][1] = new Tile('btn', 'nc'); grid[1][1].rotation = 1; grid[1][1].labels[1] = '11'; grid[1][1].labels[2] = '12';
      grid[1][2] = new Tile('wire', 'straight'); grid[1][2].rotation = 1;
      grid[1][3] = new Tile('relay', 'ton_nc'); grid[1][3].rotation = 1; grid[1][3].value = 5000; grid[1][3].labels[4] = 'T1';
      grid[1][4] = new Tile('wire', 't'); grid[1][4].rotation = 0;
      grid[1][5] = new Tile('btn', 'no'); grid[1][5].rotation = 1; grid[1][5].labels[1] = '13'; grid[1][5].labels[2] = '14';
      grid[1][6] = new Tile('wire', 't'); grid[1][6].rotation = 0;
      grid[1][7] = new Tile('relay', 'coil'); grid[1][7].rotation = 1; grid[1][7].labels[4] = 'T1';
      grid[1][8] = new Tile('wire', 't'); grid[1][8].rotation = 1;

      grid[2][0] = new Tile('wire', 'straight'); grid[2][0].rotation = 0;
      grid[2][4] = new Tile('wire', 'straight'); grid[2][4].rotation = 2;
      grid[2][6] = new Tile('wire', 'straight'); grid[2][6].rotation = 2;
      grid[2][8] = new Tile('wire', 'straight'); grid[2][8].rotation = 0;

      grid[3][0] = new Tile('wire', 'straight'); grid[3][0].rotation = 0;
      grid[3][4] = new Tile('wire', 'turn'); grid[3][4].rotation = 0;
      grid[3][5] = new Tile('relay', 'no'); grid[3][5].rotation = 1; grid[3][5].labels[4] = 'T1';
      grid[3][6] = new Tile('wire', 'turn'); grid[3][6].rotation = 3;
      grid[3][8] = new Tile('wire', 'straight'); grid[3][8].rotation = 0;

      grid[4][0] = new Tile('wire', 'straight'); grid[4][0].rotation = 0;
      grid[4][8] = new Tile('wire', 'straight'); grid[4][8].rotation = 0;

      grid[5][0] = new Tile('wire', 'turn'); grid[5][0].rotation = 0;
      grid[5][1] = new Tile('relay', 'no'); grid[5][1].rotation = 1; grid[5][1].labels[4] = 'T1';
      grid[5][2] = new Tile('wire', 'straight'); grid[5][2].rotation = 1;
      grid[5][3] = new Tile('wire', 'straight'); grid[5][3].rotation = 1;
      grid[5][4] = new Tile('wire', 'straight'); grid[5][4].rotation = 1;
      grid[5][5] = new Tile('wire', 'straight'); grid[5][5].rotation = 1;
      grid[5][6] = new Tile('wire', 'straight'); grid[5][6].rotation = 1;
      grid[5][7] = new Tile('motor', ''); grid[5][7].rotation = 1;
      grid[5][8] = new Tile('wire', 'turn'); grid[5][8].rotation = 3;
    },
  },
  {
    id: 'w-4-3',
    title: 'w-4-3 閃爍與交替控制 (Flasher)',
    desc: '任務：利用閃爍繼電器 (F1) 或雙 Timer，控制紅 (PL1) 與綠 (PL2) 兩顆指示燈交互閃爍。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

      // Master start/stop with self-holding K1
      const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
      const btnNo = new Tile('btn', 'no'); btnNo.rotation = 1; btnNo.isLocked = true; btnNo.labels[1] = '13'; btnNo.labels[2] = '14';
      const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';
      const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.isLocked = true; relayNoK1.labels[4] = 'K1';

      // Flasher coil F1 driven by K1
      const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.isLocked = true; relayNoK1_2.labels[4] = 'K1';
      const flashCoil = new Tile('relay', 'flash_coil', 1000); flashCoil.rotation = 1; flashCoil.isLocked = true; flashCoil.labels[4] = 'F1';

      // Output Branches: PL1 (Red Light) via F1 NC contact, PL2 (Green Light) via F1 NO contact
      const contactF1_nc = new Tile('relay', 'nc'); contactF1_nc.rotation = 1; contactF1_nc.isLocked = true; contactF1_nc.labels[4] = 'F1';
      const lightRed = new Tile('load', 'lightbulb'); lightRed.rotation = 1; lightRed.isLocked = true; lightRed.labels[4] = 'PL1';

      const contactF1_no = new Tile('relay', 'no'); contactF1_no.rotation = 1; contactF1_no.isLocked = true; contactF1_no.labels[4] = 'F1';
      const lightGreen = new Tile('load', 'lightbulb'); lightGreen.rotation = 1; lightGreen.isLocked = true; lightGreen.labels[4] = 'PL2';

      grid[0][0] = wireL;
      grid[0][8] = wireN;

      grid[1][1] = btnNc;
      grid[1][3] = btnNo;
      grid[1][7] = coilK1;

      grid[2][3] = relayNoK1;

      grid[3][3] = relayNoK1_2;
      grid[3][7] = flashCoil;

      grid[5][3] = contactF1_nc;
      grid[5][7] = lightRed;

      grid[7][3] = contactF1_no;
      grid[7][7] = lightGreen;
    },
  },
  {
    id: 'w-4-4',
    title: 'w-4-4 星角降壓啟動 (Y-Δ Starting)',
    desc: '任務：大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 0; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 0; wireN.isLocked = true;

      // Master start/stop with self-holding MC1 (K1)
      const btnNc = new Tile('btn', 'nc'); btnNc.rotation = 1; btnNc.isLocked = true; btnNc.labels[1] = '11'; btnNc.labels[2] = '12';
      const btnNo = new Tile('btn', 'no'); btnNo.rotation = 1; btnNo.isLocked = true; btnNo.labels[1] = '13'; btnNo.labels[2] = '14';
      const coilK1 = new Tile('relay', 'coil'); coilK1.rotation = 1; coilK1.isLocked = true; coilK1.labels[4] = 'K1';
      const relayNoK1 = new Tile('relay', 'no'); relayNoK1.rotation = 1; relayNoK1.isLocked = true; relayNoK1.labels[4] = 'K1';

      // Timer T1 (3000ms) driven by K1
      const relayNoK1_2 = new Tile('relay', 'no'); relayNoK1_2.rotation = 1; relayNoK1_2.isLocked = true; relayNoK1_2.labels[4] = 'K1';
      const timerT1 = new Tile('relay', 'coil', 3000); timerT1.rotation = 1; timerT1.isLocked = true; timerT1.labels[4] = 'T1';

      // Star Branch (MC-Y, K2): via TON-NC T1 and Interlock NC K3
      const tonNcT1 = new Tile('relay', 'ton_nc', 3000); tonNcT1.rotation = 1; tonNcT1.isLocked = true; tonNcT1.labels[4] = 'T1';
      const relayNcK3 = new Tile('relay', 'nc'); relayNcK3.rotation = 1; relayNcK3.isLocked = true; relayNcK3.labels[4] = 'K3';
      const coilK2 = new Tile('relay', 'coil'); coilK2.rotation = 1; coilK2.isLocked = true; coilK2.labels[4] = 'K2';

      // Delta Branch (MC-Δ, K3): via TON-NO T1 and Interlock NC K2
      const tonNoT1 = new Tile('relay', 'ton_no', 3000); tonNoT1.rotation = 1; tonNoT1.isLocked = true; tonNoT1.labels[4] = 'T1';
      const relayNcK2 = new Tile('relay', 'nc'); relayNcK2.rotation = 1; relayNcK2.isLocked = true; relayNcK2.labels[4] = 'K2';
      const coilK3 = new Tile('relay', 'coil'); coilK3.rotation = 1; coilK3.isLocked = true; coilK3.labels[4] = 'K3';

      // Motor & Main contact
      const relayNoK1_3 = new Tile('relay', 'no'); relayNoK1_3.rotation = 1; relayNoK1_3.isLocked = true; relayNoK1_3.labels[4] = 'K1';
      const motor = new Tile('motor', 'motor'); motor.rotation = 0; motor.isLocked = true;

      grid[0][0] = wireL;
      grid[0][8] = wireN;

      grid[1][1] = btnNc;
      grid[1][3] = btnNo;
      grid[1][7] = coilK1;

      grid[2][3] = relayNoK1;

      grid[3][3] = relayNoK1_2;
      grid[3][7] = timerT1;

      grid[5][2] = tonNcT1;
      grid[5][4] = relayNcK3;
      grid[5][7] = coilK2;

      grid[7][2] = tonNoT1;
      grid[7][4] = relayNcK2;
      grid[7][7] = coilK3;

      grid[9][3] = relayNoK1_3;
      grid[9][7] = motor;
    },
  },
  {
    id: 'w-5-1',
    title: 'w-5-1 過載保護 (Thermal Overload)',
    desc: '任務：將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;

      // TH-RY 95-96 常閉接點
      const relayNcTHRY = new Tile('relay', 'nc'); relayNcTHRY.rotation = 1; relayNcTHRY.isLocked = true;
      relayNcTHRY.labels[1] = '95'; relayNcTHRY.labels[3] = '96'; relayNcTHRY.labels[4] = 'TH-RY';

      // 停止按鈕 PB_OFF (NC)
      const btnStop = new Tile('btn', 'nc'); btnStop.rotation = 1; btnStop.isLocked = true;
      btnStop.labels[1] = '1'; btnStop.labels[3] = '2'; btnStop.labels[4] = 'OFF';

      // 啟動按鈕 PB_ON (NO)
      const btnStart = new Tile('btn', 'no'); btnStart.rotation = 1; btnStart.isLocked = true;
      btnStart.labels[1] = '3'; btnStart.labels[3] = '4'; btnStart.labels[4] = 'ON';

      // 接觸器線圈 MC1
      const coilMC1 = new Tile('relay', 'coil'); coilMC1.rotation = 1; coilMC1.isLocked = true;
      coilMC1.labels[4] = 'MC1';

      // 自保持常開輔助接點 (MC1 NO)
      const relayNoMC1 = new Tile('relay', 'no'); relayNoMC1.rotation = 1; relayNoMC1.isLocked = true;
      relayNoMC1.labels[1] = '13'; relayNoMC1.labels[3] = '14'; relayNoMC1.labels[4] = 'MC1';

      // TH-RY 97-98 常開接點
      const relayNoTHRY = new Tile('relay', 'no'); relayNoTHRY.rotation = 1; relayNoTHRY.isLocked = true;
      relayNoTHRY.labels[1] = '97'; relayNoTHRY.labels[3] = '98'; relayNoTHRY.labels[4] = 'TH-RY';

      // 過載指示燈 (OL Yellow Lamp)
      const lampOL = new Tile('load', 'lightbulb'); lampOL.rotation = 1; lampOL.isLocked = true;
      lampOL.labels[4] = 'OL';

      // 主電路：MC1 主接點 + TH-RY 加熱元件 + 馬達
      const relayNoMC1_Main = new Tile('relay', 'no'); relayNoMC1_Main.rotation = 1; relayNoMC1_Main.isLocked = true;
      relayNoMC1_Main.labels[4] = 'MC1';

      const thryHeater = new Tile('protection', 'ol_2p'); thryHeater.rotation = 1; thryHeater.isLocked = true;
      thryHeater.labels[4] = 'TH-RY';

      const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;
      motor.labels[4] = 'M1';

      // 排列於 10x10 格子
      grid[1][0] = wireL;
      grid[1][1] = relayNcTHRY;
      grid[1][2] = btnStop;
      grid[1][4] = btnStart;
      grid[1][6] = coilMC1;
      grid[1][8] = wireN;

      grid[3][4] = relayNoMC1;

      grid[5][4] = relayNoTHRY;
      grid[5][6] = lampOL;

      grid[7][2] = relayNoMC1_Main;
      grid[7][4] = thryHeater;
      grid[7][6] = motor;
    },
  },
  {
    id: 'w-5-2',
    title: 'w-5-2 極限開關應用 (Limit Switch)',
    desc: '任務：電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。',
    defaultGridSize: 10,
    setup: (grid) => {
      const wireL = new Tile('wire', 'l'); wireL.rotation = 3; wireL.isLocked = true;
      const wireN = new Tile('wire', 'n'); wireN.rotation = 1; wireN.isLocked = true;

      // 停止按鈕 PB_OFF (NC)
      const btnStop = new Tile('btn', 'nc'); btnStop.rotation = 1; btnStop.isLocked = true;
      btnStop.labels[1] = '1'; btnStop.labels[3] = '2'; btnStop.labels[4] = 'OFF';

      // 上升按鈕 PB_UP (NO)
      const btnUp = new Tile('btn', 'no'); btnUp.rotation = 1; btnUp.isLocked = true;
      btnUp.labels[1] = '3'; btnUp.labels[3] = '4'; btnUp.labels[4] = 'UP';

      // 上限極限開關 LS1 (NC 接點)
      const ls1 = new Tile('btn', 'nc'); ls1.rotation = 1; ls1.isLocked = true;
      ls1.labels[1] = '11'; ls1.labels[3] = '12'; ls1.labels[4] = 'LS1';

      // 上升接觸器線圈 MC1
      const coilMC1 = new Tile('relay', 'coil'); coilMC1.rotation = 1; coilMC1.isLocked = true;
      coilMC1.labels[4] = 'MC1';

      // 自保持常開輔助接點 (MC1 NO)
      const relayNoMC1 = new Tile('relay', 'no'); relayNoMC1.rotation = 1; relayNoMC1.isLocked = true;
      relayNoMC1.labels[1] = '13'; relayNoMC1.labels[3] = '14'; relayNoMC1.labels[4] = 'MC1';

      // 主電路：MC1 主接點 + 馬達
      const relayNoMC1_Main = new Tile('relay', 'no'); relayNoMC1_Main.rotation = 1; relayNoMC1_Main.isLocked = true;
      relayNoMC1_Main.labels[4] = 'MC1';

      const motor = new Tile('motor', 'motor'); motor.rotation = 1; motor.isLocked = true;
      motor.labels[4] = 'M1';

      // 排列於 10x10 格子
      grid[1][0] = wireL;
      grid[1][1] = btnStop;
      grid[1][3] = btnUp;
      grid[1][5] = ls1;
      grid[1][7] = coilMC1;
      grid[1][9] = wireN;

      grid[3][3] = relayNoMC1;

      grid[5][3] = relayNoMC1_Main;
      grid[5][7] = motor;
    },
  },
];
