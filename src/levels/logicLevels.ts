/**
 * @license
 * Digital Logic Levels (Chapter 2) for Auto Studio Pro
 */

import { Tile } from '../types';
import { LevelDefinition, LevelMenuCategory } from './types';

export const logicMenuCategories: LevelMenuCategory[] = [
  {
    title: '第一大類：數位訊號與基礎邏輯閘 (Basic Logic Gates)',
    levels: [
      { id: '1-1', title: '單元 1-1：數位世界 (0 與 1)', desc: '介紹「高電位 (Power)」與「低電位/斷路」，用開關點亮 LED。' },
      { id: '1-2', title: '單元 1-2：緩衝與反相 (Buffer & NOT)', desc: '介紹 NOT 閘。任務：開關按下時燈滅，放開時燈亮。' },
      { id: '1-3', title: '單元 1-3：及閘 (AND Gate)', desc: '任務：必須「同時」按下兩個開關，金庫的門（LED）才會打開。' },
      { id: '1-4', title: '單元 1-4：或閘 (OR Gate)', desc: '任務：走廊兩端「任何一個」開關按下，走廊燈都會亮。' },
      { id: '1-5', title: '單元 1-5：反及閘與反或閘 (NAND & NOR)', desc: '結合 NOT 的概念。' },
      { id: '1-6', title: '單元 1-6：互斥或閘 (XOR Gate)', desc: '任務：樓梯間的雙切開關（兩個開關狀態不同時燈亮，相同時燈滅）。' },
      { id: '1-7', title: '單元 1-7：NAND/NOR 化身反相器', desc: '任務：將 NAND 或 NOR 閘的兩個輸入接在一起，使其表現出與 NOT 閘相同的功能。' },
    ],
  },
  {
    title: '第二大類：組合邏輯應用 (Combinational Logic)',
    levels: [
      { id: '2-1', title: '單元 2-1：萬用閘挑戰 (Universal Gates)', desc: '任務：只給你 NAND 閘，請你組合出一個 AND 閘的功能。' },
      { id: '2-2', title: '單元 2-2：多重輸入', desc: '任務：利用兩個 2-input AND 閘，拼湊出一個 3-input AND 閘。' },
      { id: '2-3', title: '單元 2-3：多工器 (Multiplexer / MUX)', desc: '任務：實作一個選擇器。用一個開關決定，LED 要顯示 A 訊號還是 B 訊號。' },
      { id: '2-4', title: '單元 2-4：解碼器 (Decoder)', desc: '任務：將兩條線的訊號 (00, 01, 10, 11) 轉換成四顆獨立的 LED 控制。' },
      { id: '2-5', title: '單元 2-5：多數決電路 (Majority Vote)', desc: '任務：三個評審按下圈選，只要有兩票（含）以上，就算通過（燈亮）。' },
      { id: '2-6', title: '單元 2-6：德摩根定律實習 (De Morgan)', desc: '任務：驗證 NOT(A·B) 等效於 (NOT A) + (NOT B)，用 NOT 與 OR 做出 NAND 功能。' },
      { id: '2-7', title: '單元 2-7：卡諾圖化簡挑戰 (K-Map)', desc: '任務：給定複雜布林式，經卡諾圖化簡後使用最少閘數實現等效電路。' },
    ],
  },
  {
    title: '第三大類：電腦計算的基礎 (Arithmetic Circuits)',
    levels: [
      { id: '3-1', title: '單元 3-1：半加器 (Half Adder)', desc: '任務：將兩個輸入 (A, B) 相加，輸出「總和 (Sum)」與「進位 (Carry)」。(使用 XOR 和 AND)。' },
      { id: '3-2', title: '單元 3-2：全加器 (Full Adder)', desc: '任務：加入前一個位元的進位 (Carry-in)，完成三個位元的相加。' },
      { id: '3-3', title: '單元 3-3：二位元加法機', desc: '任務：將兩個全加器串聯，達成 2-bit + 2-bit 的加法。' },
      { id: '3-4', title: '單元 3-4：數值比較器 (Comparator)', desc: '任務：判斷 A 和 B 兩個輸入，實作出「A > B」與「A = B」的亮燈邏輯。' },
      { id: '3-5', title: '單元 3-5：加減法運算器 (Adder/Subtractor)', desc: '任務：利用 XOR 作為受控反相器與二補數概念，用 Mode 開關切換 A+B 與 A-B。' },
    ],
  },
  {
    title: '第四大類：記憶與循序邏輯 (Sequential Logic)',
    levels: [
      { id: '4-1', title: '單元 4-1：回饋與無窮迴圈 (Feedback Loop)', desc: '任務：將 NOT 閘的輸出接回輸入，觀察訊號震盪 (Oscillation) 或是利用 Clock 產生脈衝。' },
      { id: '4-2', title: '單元 4-2：SR 閂鎖器 (SR Latch)', desc: '任務：用兩個 NOR 閘交叉連接，做出一個有「設定(Set)」和「重置(Reset)」功能的記憶單元。' },
      { id: '4-3', title: '單元 4-3：D 型閂鎖器 (D Latch)', desc: '任務：加入 Enable 腳位，決定什麼時候才把資料存進去。' },
      { id: '4-4', title: '單元 4-4：D 型正反器 (D Flip-Flop)', desc: '介紹邊緣觸發（Edge-triggered）。' },
      { id: '4-5', title: '單元 4-5：T 型正反器 (T Flip-Flop)', desc: '任務：實作 Toggle 功能，按一下燈亮，再按一下燈滅（狀態切換）。' },
    ],
  },
  {
    title: '第五大類：高階應用與狀態機 (Advanced Projects)',
    levels: [
      { id: '5-1', title: '單元 5-1：移位暫存器 (Shift Register)', desc: '任務：讓一排 LED 像跑馬燈一樣，隨著 Clock 把亮光往旁邊傳遞。' },
      { id: '5-2', title: '單元 5-2：非同步計數器 (Ripple Counter)', desc: '任務：利用 T Flip-Flop 串聯，做出可以數 0 到 3 (二進位 00 到 11) 的計數器。' },
      { id: '5-3', title: '單元 5-3：密碼鎖電路 (Digital Lock)', desc: '任務：必須「依序」按下 A、B 兩個按鈕，最後按下 Enter 才能開鎖；按錯則重置。' },
      { id: '5-4', title: '單元 5-4：自動販賣機邏輯', desc: '任務：投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。' },
      { id: '5-5', title: '單元 5-5：七段顯示器計數專題 (7-Segment)', desc: '任務：將計數信號連接至 BCD 七段顯示器，觀察數字 0~3 循序亮起！' },
    ],
  },
];

export const logicLevels: LevelDefinition[] = [
  {
    id: '1-1',
    title: '1-1 數位世界 (0 與 1)',
    desc: '請使用「直線導線」將高電位 (Power) 開關連接到 LED，並切換互動模式按下開關。',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw = new Tile('logic', 'power', 100);
      sw.rotation = 1;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 1;
      grid[3][4] = sw;
      grid[6][4] = led;
    },
  },
  {
    id: '1-2',
    title: '1-2 緩衝與反相 (Buffer & NOT)',
    desc: 'NOT 閘會將訊號反轉 (1 變 0，0 變 1)。請將線路接上，觀察開關對燈泡的相反效果。',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 1;
      const notGate = new Tile('gate', 'not');
      notGate.rotation = 1;
      const led1 = new Tile('logic', 'led', 0);
      led1.rotation = 1;
      grid[2][3] = sw1;
      grid[4][3] = notGate;
      grid[6][3] = led1;

      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      const bufferGate = new Tile('gate', 'buffer');
      bufferGate.rotation = 1;
      const led2 = new Tile('logic', 'led', 0);
      led2.rotation = 1;
      grid[2][5] = sw2;
      grid[4][5] = bufferGate;
      grid[6][5] = led2;
    },
  },
  {
    id: '1-3',
    title: '1-3 及閘 (AND Gate)',
    desc: 'AND 閘需要所有輸入都是 1 才會輸出 1。請將兩個開關都接上 AND 閘，再接上燈泡。',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      const andGate = new Tile('gate', 'and');
      andGate.rotation = 1;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 1;
      grid[2][3] = sw1;
      grid[2][5] = sw2;
      grid[4][4] = andGate;
      grid[6][4] = led;
    },
  },
  {
    id: '1-4',
    title: '1-4 或閘 (OR Gate)',
    desc: 'OR 閘只要有任何一個輸入是 1 就會輸出 1。試著將兩個開關接上 OR 閘，觀察燈泡變化。',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      const orGate = new Tile('gate', 'or');
      orGate.rotation = 1;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 1;
      grid[2][3] = sw1;
      grid[2][5] = sw2;
      grid[4][4] = orGate;
      grid[6][4] = led;
    },
  },
  {
    id: '1-5',
    title: '1-5 反及閘與反或閘 (NAND & NOR)',
    desc: 'NAND = NOT(AND)，NOR = NOT(OR)。請分別將兩組開關接上，觀察它們的行為是否和 AND/OR 剛好相反。',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      const nandGate = new Tile('gate', 'nand');
      nandGate.rotation = 1;
      const led1 = new Tile('logic', 'led', 0);
      led1.rotation = 1;
      grid[2][2] = sw1;
      grid[2][4] = sw2;
      grid[4][3] = nandGate;
      grid[6][3] = led1;

      const sw3 = new Tile('logic', 'power', 100);
      sw3.rotation = 1;
      const sw4 = new Tile('logic', 'power', 100);
      sw4.rotation = 1;
      const norGate = new Tile('gate', 'nor');
      norGate.rotation = 1;
      const led2 = new Tile('logic', 'led', 0);
      led2.rotation = 1;
      grid[2][6] = sw3;
      grid[2][8] = sw4;
      grid[4][7] = norGate;
      grid[6][7] = led2;
    },
  },
  {
    id: '1-6',
    title: '1-6 互斥或閘 (XOR Gate)',
    desc: 'XOR 閘在兩個輸入不同 (一個0, 一個1) 時才會輸出 1。請將開關接上並觀察樓梯燈的邏輯！',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      const xorGate = new Tile('gate', 'xor');
      xorGate.rotation = 1;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 1;
      grid[2][3] = sw1;
      grid[2][5] = sw2;
      grid[4][4] = xorGate;
      grid[6][4] = led;
    },
  },
  {
    id: '1-7',
    title: '1-7 NAND/NOR 化身反相器',
    desc: '任務：請只放置「1個開關」與「1個 LED」，並將 NAND 或 NOR 閘的兩個輸入端都接在一起，使其功能等同於 NOT 閘。',
    defaultGridSize: 10,
    setup: () => {},
  },
  {
    id: '2-1',
    title: '2-1 萬用閘挑戰 (Universal Gates)',
    desc: '只使用 NAND 閘，請你組合出一個 AND 閘的功能。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1;
      const led = new Tile('logic', 'led', 0); led.rotation = 1;
      grid[2][4] = sw1; grid[2][6] = sw2; grid[8][5] = led;
    },
  },
  {
    id: '2-2',
    title: '2-2 多重輸入',
    desc: '利用兩個 2-input AND 閘，拼湊出一個 3-input AND 閘。只有當三個開關都按下時，LED 才會亮。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'C';
      const led = new Tile('logic', 'led', 0); led.rotation = 1;
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = sw3; grid[8][6] = led;
    },
  },
  {
    id: '2-3',
    title: '2-3 多工器 (Multiplexer / MUX)',
    desc: '實作一個選擇器。用一個開關決定，LED 要顯示 A 訊號還是 B 訊號。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const swS = new Tile('logic', 'power', 100); swS.rotation = 1; swS.labels[4] = 'Sel';
      const led = new Tile('logic', 'led', 0); led.rotation = 1;
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = swS; grid[10][6] = led;
    },
  },
  {
    id: '2-4',
    title: '2-4 解碼器 (Decoder)',
    desc: '將兩條線的訊號 (00, 01, 10, 11) 轉換成四顆獨立的 LED 控制。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A1';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'A0';
      const led0 = new Tile('logic', 'led', 0); led0.rotation = 1; led0.labels[0] = 'Y0';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Y1';
      const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Y2';
      const led3 = new Tile('logic', 'led', 0); led3.rotation = 1; led3.labels[0] = 'Y3';
      grid[2][5] = sw1; grid[2][7] = sw2;
      grid[10][3] = led0; grid[10][5] = led1; grid[10][7] = led2; grid[10][9] = led3;
    },
  },
  {
    id: '2-5',
    title: '2-5 多數決電路 (Majority Vote)',
    desc: '三個評審按下圈選，只要有兩票（含）以上，就算通過（燈亮）。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1;
      const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1;
      const led = new Tile('logic', 'led', 0); led.rotation = 1;
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = sw3; grid[10][6] = led;
    },
  },
  {
    id: '3-1',
    title: '3-1 半加器 (Half Adder)',
    desc: '將兩個輸入 (A, B) 相加，輸出「總和 (Sum)」與「進位 (Carry)」。(提示：使用 XOR 和 AND)。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const ledS = new Tile('logic', 'led', 0); ledS.rotation = 1; ledS.labels[0] = 'S';
      const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'C';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][5] = ledS; grid[10][7] = ledC;
    },
  },
  {
    id: '3-2',
    title: '3-2 全加器 (Full Adder)',
    desc: '加入前一個位元的進位 (Carry-in)，完成三個位元的相加。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'Cin';
      const ledS = new Tile('logic', 'led', 0); ledS.rotation = 1; ledS.labels[0] = 'S';
      const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'Cout';
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = sw3; grid[10][5] = ledS; grid[10][7] = ledC;
    },
  },
  {
    id: '3-3',
    title: '3-3 二位元加法機',
    desc: '將兩個全加器串聯，達成 2-bit + 2-bit 的加法。',
    defaultGridSize: 15,
    setup: (grid) => {
      const swA1 = new Tile('logic', 'power', 100); swA1.rotation = 1; swA1.labels[4] = 'A1';
      const swA0 = new Tile('logic', 'power', 100); swA0.rotation = 1; swA0.labels[4] = 'A0';
      const swB1 = new Tile('logic', 'power', 100); swB1.rotation = 1; swB1.labels[4] = 'B1';
      const swB0 = new Tile('logic', 'power', 100); swB0.rotation = 1; swB0.labels[4] = 'B0';
      const ledS1 = new Tile('logic', 'led', 0); ledS1.rotation = 1; ledS1.labels[0] = 'S1';
      const ledS0 = new Tile('logic', 'led', 0); ledS0.rotation = 1; ledS0.labels[0] = 'S0';
      const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'Cout';
      grid[2][3] = swA1; grid[2][5] = swA0; grid[2][7] = swB1; grid[2][9] = swB0;
      grid[10][4] = ledC; grid[10][6] = ledS1; grid[10][8] = ledS0;
    },
  },
  {
    id: '3-4',
    title: '3-4 數值比較器 (Comparator)',
    desc: '判斷 A 和 B 兩個輸入，實作出「A > B」與「A = B」的亮燈邏輯。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'A>B';
      const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'A=B';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][5] = led1; grid[10][7] = led2;
    },
  },
  {
    id: '4-1',
    title: '4-1 回饋與無窮迴圈 (Feedback Loop)',
    desc: '將 NOT 閘的輸出接回輸入，觀察訊號震盪 (Oscillation) 或是利用 Clock 產生脈衝。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1;
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1;
      grid[2][5] = sw1; grid[10][5] = led1;
    },
  },
  {
    id: '4-2',
    title: '4-2 SR 閂鎖器 (SR Latch)',
    desc: '用兩個 NOR 閘交叉連接，做出一個有「設定(Set)」和「重置(Reset)」功能的記憶單元。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'S';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'R';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
      const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Q\'';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][5] = led1; grid[10][7] = led2;
    },
  },
  {
    id: '4-3',
    title: '4-3 D 型閂鎖器 (D Latch)',
    desc: '加入 Enable 腳位，決定什麼時候才把資料存進去。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'D';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'En';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][6] = led1;
    },
  },
  {
    id: '4-4',
    title: '4-4 D 型正反器 (D Flip-Flop)',
    desc: 'D Flip-Flop 是邊緣觸發（Edge-triggered）的記憶體單元，請觀察它和 Latch 的差異。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'D';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][6] = led1;
    },
  },
  {
    id: '4-5',
    title: '4-5 T 型正反器 (T Flip-Flop)',
    desc: '實作 Toggle 功能，按一下燈亮，再按一下燈滅（狀態切換）。',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'T';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Q';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][6] = led1;
    },
  },
  {
    id: '5-1',
    title: '5-1 移位暫存器 (Shift Register)',
    desc: '讓一排 LED 像跑馬燈一樣，隨著 Clock 把亮光往旁邊傳遞。',
    defaultGridSize: 20,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'In';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'CLK';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'LED1';
      const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'LED2';
      const led3 = new Tile('logic', 'led', 0); led3.rotation = 1; led3.labels[0] = 'LED3';
      const led4 = new Tile('logic', 'led', 0); led4.rotation = 1; led4.labels[0] = 'LED4';
      grid[2][6] = sw1; grid[2][8] = sw2;
      grid[12][5] = led1; grid[12][7] = led2; grid[12][9] = led3; grid[12][11] = led4;
    },
  },
  {
    id: '5-2',
    title: '5-2 非同步計數器 (Ripple Counter)',
    desc: '利用 T Flip-Flop 串聯，做出可以數 0 到 3 (二進位 00 到 11) 的計數器。',
    defaultGridSize: 20,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'CLK';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Bit0';
      const led2 = new Tile('logic', 'led', 0); led2.rotation = 1; led2.labels[0] = 'Bit1';
      grid[2][5] = sw1; grid[12][5] = led1; grid[12][7] = led2;
    },
  },
  {
    id: '5-3',
    title: '5-3 密碼鎖電路 (Digital Lock)',
    desc: '必須「依序」按下 A、B 兩個按鈕，最後按下 Enter 才能開鎖；按錯則重置。',
    defaultGridSize: 20,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'Enter';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = 'Unlock';
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = sw3; grid[12][6] = led1;
    },
  },
  {
    id: '5-4',
    title: '5-4 自動販賣機邏輯',
    desc: '投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。',
    defaultGridSize: 20,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = '1元';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = '退幣';
      const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = '可購買';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[12][6] = led1;
    },
  },
  {
    id: '2-6',
    title: '2-6 德摩根定律實習 (De Morgan)',
    desc: '驗證德摩根定律：NOT(A · B) 等效於 (NOT A) + (NOT B)。請只使用 NOT 閘與 OR 閘，實現與 NAND 閘完全相同的真值表！',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const led = new Tile('logic', 'led', 0); led.rotation = 1; led.labels[0] = 'Y';
      grid[2][5] = sw1; grid[2][7] = sw2; grid[10][6] = led;
    },
  },
  {
    id: '2-7',
    title: '2-7 卡諾圖化簡挑戰 (K-Map)',
    desc: '給定布林式 Y = A\'B\'C + A\'BC + AB\'C + ABC。請在草稿紙上畫卡諾圖化簡，並用最簡線路達成相同邏輯（提示：化簡結果只需將某個訊號直通）！',
    defaultGridSize: 15,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = 'A';
      const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = 'B';
      const sw3 = new Tile('logic', 'power', 100); sw3.rotation = 1; sw3.labels[4] = 'C';
      const led = new Tile('logic', 'led', 0); led.rotation = 1; led.labels[0] = 'Y';
      grid[2][4] = sw1; grid[2][6] = sw2; grid[2][8] = sw3; grid[10][6] = led;
    },
  },
  {
    id: '3-5',
    title: '3-5 加減法運算器 (Adder/Subtractor)',
    desc: '結合 XOR 閘作為受控反相器與二補數概念。當 Mode=0 輸出加法 A+B (S, Cout)；當 Mode=1 輸出減法 A-B (Diff, Borrow)！',
    defaultGridSize: 15,
    setup: (grid) => {
      const swM = new Tile('logic', 'power', 100); swM.rotation = 1; swM.labels[4] = 'Mode';
      const swA = new Tile('logic', 'power', 100); swA.rotation = 1; swA.labels[4] = 'A';
      const swB = new Tile('logic', 'power', 100); swB.rotation = 1; swB.labels[4] = 'B';
      const ledS = new Tile('logic', 'led', 0); ledS.rotation = 1; ledS.labels[0] = 'S/D';
      const ledC = new Tile('logic', 'led', 0); ledC.rotation = 1; ledC.labels[0] = 'C/B';
      grid[2][4] = swM; grid[2][6] = swA; grid[2][8] = swB;
      grid[10][5] = ledS; grid[10][7] = ledC;
    },
  },
  {
    id: '5-5',
    title: '5-5 七段顯示器計數專題 (7-Segment)',
    desc: '使用時脈開關與計數器（或側邊欄 T-FF），將 2 位元計數輸出連接至七段顯示器，觀察數字 0 -> 1 -> 2 -> 3 循環跳動！',
    defaultGridSize: 20,
    setup: (grid) => {
      const clk = new Tile('logic', 'power', 100); clk.rotation = 1; clk.labels[4] = 'CLK';
      const seg7 = new Tile('logic', 'seg7', 0); seg7.rotation = 0;
      grid[3][5] = clk;
      grid[10][10] = seg7;
    },
  },
];
