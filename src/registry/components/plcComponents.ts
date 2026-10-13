/**
 * @license
 * PLC Ladder Components for Auto Studio Pro
 */

import { Tile } from '../../types';
import { ComponentDefinition } from '../types';

function createPlcLadderComponent(subtype: string, name: string): ComponentDefinition {
  return {
    type: 'plc',
    subtype,
    name,
    canRotate: (mode) => {
      if (mode === 'plc') {
        return { canRotate: false, errorMsg: '⚠️ 階梯圖元件方向固定為水平，無法旋轉！' };
      }
      return { canRotate: true };
    },
    createTiles: ({ x, y }) => {
      const tile = new Tile('plc', subtype);
      tile.labels[4] = '';
      tile.rotation = 0;
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y }) => {
      const tile = new Tile('plc', subtype);
      tile.labels[4] = '';
      tile.rotation = 0;
      return [{ x, y, tile }];
    },
  };
}

export const plcComponents: ComponentDefinition[] = [
  createPlcLadderComponent('no', '常開接點 (A接點)'),
  createPlcLadderComponent('nc', '常閉接點 (B接點)'),
  createPlcLadderComponent('pls', '正緣觸發 (P接點)'),
  createPlcLadderComponent('plf', '負緣觸發 (N接點)'),
  createPlcLadderComponent('out', '輸出線圈 (OUT)'),
];
