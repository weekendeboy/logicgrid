/**
 * @license
 * Class C Industrial Wiring Exam Levels for Auto Studio Pro
 */

import { Tile } from '../types';
import { LevelDefinition } from './types';

import classCU11 from './class_c_u1_1.json';
import classCU12 from './class_c_u1_2.json';
import classCU13 from './class_c_u1_3.json';
import classCU14 from './class_c_u1_4.json';
import classCU15 from './class_c_u1_5.json';
import classCU16 from './class_c_u1_6.json';
import classCU17 from './class_c_u1_7.json';

import classCU21 from './class_c_u2_1.json';
import classCU22 from './class_c_u2_2.json';
import classCU23 from './class_c_u2_3.json';
import classCU24 from './class_c_u2_4.json';
import classCU25 from './class_c_u2_5.json';
import classCU26 from './class_c_u2_6.json';
import classCU27 from './class_c_u2_7.json';

function createJsonLevel(
  id: any,
  title: string,
  desc: string,
  category: string,
  jsonData: any
): LevelDefinition {
  return {
    id,
    title,
    desc,
    category,
    defaultGridSize: 60,
    jsonGrid: jsonData?.grid,
    setup: (grid, size) => {
      if (!jsonData || !jsonData.grid) return;
      const jGrid = jsonData.grid;
      const maxY = Math.min(size, jGrid.length);
      for (let y = 0; y < maxY; y++) {
        if (!jGrid[y]) continue;
        const maxX = Math.min(size, jGrid[y].length);
        for (let x = 0; x < maxX; x++) {
          if (jGrid[y][x]) {
            grid[y][x] = Object.assign(new Tile(), jGrid[y][x]);
          }
        }
      }
    },
  };
}

export const classCLevels: LevelDefinition[] = [
  // 第一單元：故障檢修
  createJsonLevel('class_c_u1_1', '第一題 單相感應電動機順序起動控制', '任務：檢修單相感應電動機順序起動控制電路。', '第一單元：故障檢修', classCU11),
  createJsonLevel('class_c_u1_2', '第二題 自動台車分料系統控制電路', '任務：檢修自動台車分料系統控制電路。', '第一單元：故障檢修', classCU12),
  createJsonLevel('class_c_u1_3', '第三題 三台輸送帶電動機順序運轉控制', '任務：檢修三台輸送帶電動機順序運轉控制電路。', '第一單元：故障檢修', classCU13),
  createJsonLevel('class_c_u1_4', '第四題 三相感應電動機之 Y-△降壓起動控制(一)', '任務：檢修三相感應電動機之 Y-△降壓起動控制(一)電路。', '第一單元：故障檢修', classCU14),
  createJsonLevel('class_c_u1_5', '第五題 三相感應電動機之 Y-△降壓起動控制(二)', '任務：檢修三相感應電動機之 Y-△降壓起動控制(二)電路。', '第一單元：故障檢修', classCU15),
  createJsonLevel('class_c_u1_6', '第六題 三相感應電動機順序啟閉控制', '任務：檢修三相感應電動機順序啟閉控制電路。', '第一單元：故障檢修', classCU16),
  createJsonLevel('class_c_u1_7', '第七題 往復式送料機自動控制電路', '任務：檢修往復式送料機自動控制電路，使用三相電源、接觸器及極限開關進行控制。', '第一單元：故障檢修', classCU17),

  // 第二單元：配線術科
  createJsonLevel('class_c_u2_1', '第一題 單相感應電動機正反轉控制', '任務：配線並檢視單相感應電動機正反轉控制電路。', '第二單元：配線術科', classCU21),
  createJsonLevel('class_c_u2_2', '第二題 乾燥桶控制電路', '任務：配線並檢視乾燥桶控制電路。', '第二單元：配線術科', classCU22),
  createJsonLevel('class_c_u2_3', '第三題 三台輸送帶電動機順序運轉控制', '任務：配線並檢視三台輸送帶電動機順序運轉控制電路。', '第二單元：配線術科', classCU23),
  createJsonLevel('class_c_u2_4', '第四題 二台輸送帶電動機順序運轉控制', '任務：配線並檢視二台輸送帶電動機順序運轉控制電路。', '第二單元：配線術科', classCU24),
  createJsonLevel('class_c_u2_5', '第五題 二台抽水機交替運轉控制', '任務：配線並檢視二台抽水機交替運轉控制電路。', '第二單元：配線術科', classCU25),
  createJsonLevel('class_c_u2_6', '第六題 三相感應電動機 Y-Δ降壓起動控制', '任務：配線並檢視三相感應電動機 Y-Δ降壓起動控制電路。', '第二單元：配線術科', classCU26),
  createJsonLevel('class_c_u2_7', '第七題 三相感應電動機正反轉控制及盤箱裝置', '任務：配線並檢視三相感應電動機正反轉控制及盤箱裝置電路。', '第二單元：配線術科', classCU27),
];
