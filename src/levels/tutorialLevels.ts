/**
 * @license
 * Tutorial Levels (Chapter 0) for Auto Studio Pro
 */

import { Tile } from '../types';
import { LevelDefinition } from './types';

export const tutorialLevels: LevelDefinition[] = [
  {
    id: '0-1',
    title: '0-1 基礎接線 (直線)',
    desc: '請從右側選擇「直線導線」，放在開關與燈泡中間。接著切換至「👆 互動」按下開關！',
    category: '0. 教學模式',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw = new Tile('logic', 'power', 100);
      sw.rotation = 1;
      sw.isLocked = true;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 1;
      led.isLocked = true;
      grid[3][4] = sw;
      grid[5][4] = led;
    },
  },
  {
    id: '0-2',
    title: '0-2 轉彎接線',
    desc: '請使用「L型轉角」，連接開關與燈泡。放上後可按【R鍵】或滑鼠右鍵旋轉。',
    category: '0. 教學模式',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw = new Tile('logic', 'power', 100);
      sw.rotation = 0;
      sw.isLocked = true;
      const led = new Tile('logic', 'led', 0);
      led.rotation = 3;
      led.isLocked = true;
      grid[5][4] = sw;
      grid[4][5] = led;
    },
  },
  {
    id: '0-3',
    title: '0-3 並聯電路 (T型)',
    desc: '請使用「T型三通」，讓一個開關同時點亮兩個燈泡！',
    category: '0. 教學模式',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw = new Tile('logic', 'power', 100);
      sw.rotation = 0;
      sw.isLocked = true;
      const led1 = new Tile('logic', 'led', 0);
      led1.rotation = 3;
      led1.isLocked = true;
      const led2 = new Tile('logic', 'led', 0);
      led2.rotation = 1;
      led2.isLocked = true;
      grid[4][3] = sw;
      grid[3][4] = led1;
      grid[5][4] = led2;
    },
  },
  {
    id: '0-4',
    title: '0-4 交錯獨立 (天橋)',
    desc: '請使用「絕緣天橋」，讓上下開關控制上下燈，左右開關控制左右燈，不可互相干擾！',
    category: '0. 教學模式',
    defaultGridSize: 10,
    setup: (grid) => {
      const sw1 = new Tile('logic', 'power', 100);
      sw1.rotation = 0;
      sw1.isLocked = true;
      sw1.labels[4] = 'A';
      const led1 = new Tile('logic', 'led', 0);
      led1.rotation = 0;
      led1.isLocked = true;
      led1.labels[4] = 'A';
      grid[4][2] = sw1;
      grid[4][6] = led1;

      const sw2 = new Tile('logic', 'power', 100);
      sw2.rotation = 1;
      sw2.isLocked = true;
      sw2.labels[4] = 'B';
      const led2 = new Tile('logic', 'led', 0);
      led2.rotation = 1;
      led2.isLocked = true;
      led2.labels[4] = 'B';
      grid[2][4] = sw2;
      grid[6][4] = led2;
    },
  },
];
