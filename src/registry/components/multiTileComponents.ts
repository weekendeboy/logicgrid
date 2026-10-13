/**
 * @license
 * Multi-Tile Components for Auto Studio Pro
 */

import { Tile } from '../../types';
import { ComponentDefinition } from '../types';

export const multiTileComponents: ComponentDefinition[] = [
  // 1. PLC Unit (4x10)
  {
    type: 'plc',
    subtype: 'unit',
    name: 'PLC 主機',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (x + 3 >= gridSize || y + 9 >= gridSize) {
        return { canPlace: false, errorMsg: '空間不足，超出畫布邊界！' };
      }
      for (let dy = 0; dy < 10; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          if (!isCellAvailable(x + dx, y + dy)) {
            return { canPlace: false, errorMsg: '空間不足，PLC 主機需要 4x10 格連續空位！' };
          }
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'plc_' + Date.now();
      const tiles = [];
      for (let dy = 0; dy < 10; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const tile = new Tile('plc', 'unit');
          tile.groupId = gid;
          tile.dx = dx;
          tile.dy = dy;
          tiles.push({ x: x + dx, y: y + dy, tile });
        }
      }
      return tiles;
    },
    createGhostTiles: ({ x, y }) => {
      const tiles = [];
      for (let dy = 0; dy < 10; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const tile = new Tile('plc', 'unit');
          tile.dx = dx;
          tile.dy = dy;
          tiles.push({ x: x + dx, y: y + dy, tile });
        }
      }
      return tiles;
    },
  },

  // 2. Breaker MCB (2P)
  {
    type: 'breaker',
    subtype: 'mcb',
    name: '斷路器 2P',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1)) {
          return { canPlace: false, errorMsg: '空間不足，斷路器2P直向需要連續 2 格空位！' };
        }
      } else {
        if (x + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y)) {
          return { canPlace: false, errorMsg: '空間不足，斷路器2P橫向需要連續 2 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'brk_' + Date.now();
      const t1 = new Tile('breaker', 'mcb'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('breaker', 'mcb'); t2.groupId = gid; t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('breaker', 'mcb'); t1.rotation = rotation;
      const t2 = new Tile('breaker', 'mcb'); t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
  },

  // 3. Breaker 3P
  {
    type: 'breaker',
    subtype: '3p',
    name: '斷路器 3P',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1) || !isCellAvailable(x, y + 2)) {
          return { canPlace: false, errorMsg: '空間不足，斷路器3P需要直向連續 3 格空位！' };
        }
      } else {
        if (x + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y) || !isCellAvailable(x + 2, y)) {
          return { canPlace: false, errorMsg: '空間不足，斷路器3P需要橫向連續 3 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'brk_' + Date.now();
      const t1 = new Tile('breaker', '3p'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('breaker', '3p'); t2.groupId = gid; t2.rotation = rotation;
      const t3 = new Tile('breaker', '3p'); t3.groupId = gid; t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('breaker', '3p'); t1.rotation = rotation;
      const t2 = new Tile('breaker', '3p'); t2.rotation = rotation;
      const t3 = new Tile('breaker', '3p'); t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
  },

  // 4. Relay MC 2-pole NO
  {
    type: 'relay',
    subtype: 'mc_no_2',
    name: 'MC用2路A接點',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1)) {
          return { canPlace: false, errorMsg: '空間不足，MC用2路A接點需要直向連續 2 格空位！' };
        }
      } else {
        if (x + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y)) {
          return { canPlace: false, errorMsg: '空間不足，MC用2路A接點需要橫向連續 2 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'mc_' + Date.now();
      const t1 = new Tile('relay', 'mc_no_2'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('relay', 'mc_no_2'); t2.groupId = gid; t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('relay', 'mc_no_2'); t1.rotation = rotation;
      const t2 = new Tile('relay', 'mc_no_2'); t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
  },

  // 5. Relay MC 3-pole NO
  {
    type: 'relay',
    subtype: 'mc_no_3',
    name: 'MC用3路A接點',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1) || !isCellAvailable(x, y + 2)) {
          return { canPlace: false, errorMsg: '空間不足，MC用3路A接點需要直向連續 3 格空位！' };
        }
      } else {
        if (x + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y) || !isCellAvailable(x + 2, y)) {
          return { canPlace: false, errorMsg: '空間不足，MC用3路A接點需要橫向連續 3 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'mc_' + Date.now();
      const t1 = new Tile('relay', 'mc_no_3'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('relay', 'mc_no_3'); t2.groupId = gid; t2.rotation = rotation;
      const t3 = new Tile('relay', 'mc_no_3'); t3.groupId = gid; t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('relay', 'mc_no_3'); t1.rotation = rotation;
      const t2 = new Tile('relay', 'mc_no_3'); t2.rotation = rotation;
      const t3 = new Tile('relay', 'mc_no_3'); t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
  },

  // 6. Overload 2P
  {
    type: 'protection',
    subtype: 'ol_2p',
    name: '積熱電驛 2P',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1)) {
          return { canPlace: false, errorMsg: '空間不足，OL 2P需要直向連續 2 格空位！' };
        }
      } else {
        if (x + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y)) {
          return { canPlace: false, errorMsg: '空間不足，OL 2P需要橫向連續 2 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'ol_' + Date.now();
      const t1 = new Tile('protection', 'ol_2p'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('protection', 'ol_2p'); t2.groupId = gid; t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('protection', 'ol_2p'); t1.rotation = rotation;
      const t2 = new Tile('protection', 'ol_2p'); t2.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
      ];
    },
  },

  // 7. Overload 3P
  {
    type: 'protection',
    subtype: 'ol_3p',
    name: '積熱電驛 3P',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isVert = rot === 1 || rot === 3;
      if (isVert) {
        if (y + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1) || !isCellAvailable(x, y + 2)) {
          return { canPlace: false, errorMsg: '空間不足，OL 3P需要直向連續 3 格空位！' };
        }
      } else {
        if (x + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y) || !isCellAvailable(x + 2, y)) {
          return { canPlace: false, errorMsg: '空間不足，OL 3P需要橫向連續 3 格空位！' };
        }
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const gid = 'ol_' + Date.now();
      const t1 = new Tile('protection', 'ol_3p'); t1.groupId = gid; t1.rotation = rotation;
      const t2 = new Tile('protection', 'ol_3p'); t2.groupId = gid; t2.rotation = rotation;
      const t3 = new Tile('protection', 'ol_3p'); t3.groupId = gid; t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const isVert = rotation === 1 || rotation === 3;
      const t1 = new Tile('protection', 'ol_3p'); t1.rotation = rotation;
      const t2 = new Tile('protection', 'ol_3p'); t2.rotation = rotation;
      const t3 = new Tile('protection', 'ol_3p'); t3.rotation = rotation;
      return [
        { x, y, tile: t1 },
        { x: isVert ? x : x + 1, y: isVert ? y + 1 : y, tile: t2 },
        { x: isVert ? x : x + 2, y: isVert ? y + 2 : y, tile: t3 },
      ];
    },
  },

  // 8. 3E Relay
  {
    type: 'protection',
    subtype: '3e_relay',
    name: '3E Relay',
    isMultiTile: true,
    canRotate: () => ({ canRotate: false, errorMsg: '⚠️ 此元件方向固定為水平，無法旋轉！' }),
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (x + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y) || !isCellAvailable(x + 2, y)) {
        return { canPlace: false, errorMsg: '空間不足，3E Relay 需要橫向連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = '3erelay_' + Date.now();
      const t1 = new Tile('protection', '3e_relay'); t1.groupId = gid;
      const t2 = new Tile('protection', '3e_relay'); t2.groupId = gid;
      const t3 = new Tile('protection', '3e_relay'); t3.groupId = gid;
      return [
        { x, y, tile: t1 },
        { x: x + 1, y, tile: t2 },
        { x: x + 2, y, tile: t3 },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const gid = 'ghost';
      const t1 = new Tile('protection', '3e_relay'); t1.groupId = gid;
      const t2 = new Tile('protection', '3e_relay'); t2.groupId = gid;
      const t3 = new Tile('protection', '3e_relay'); t3.groupId = gid;
      return [
        { x, y, tile: t1 },
        { x: x + 1, y, tile: t2 },
        { x: x + 2, y, tile: t3 },
      ];
    },
  },

  // 9. Converter
  {
    type: 'protection',
    subtype: 'converter',
    name: 'CONVERTER',
    isMultiTile: true,
    canRotate: () => ({ canRotate: false, errorMsg: '⚠️ 此元件方向固定為水平，無法旋轉！' }),
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (
        x + 3 >= gridSize ||
        !isCellAvailable(x, y) ||
        !isCellAvailable(x + 1, y) ||
        !isCellAvailable(x + 2, y) ||
        !isCellAvailable(x + 3, y)
      ) {
        return { canPlace: false, errorMsg: '空間不足，CONVERTER 需要橫向連續 4 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'converter_' + Date.now();
      const t1 = new Tile('protection', 'converter'); t1.groupId = gid; t1.state = 0;
      const t2 = new Tile('protection', 'converter'); t2.groupId = gid; t2.state = 1;
      const t3 = new Tile('protection', 'converter'); t3.groupId = gid; t3.state = 2;
      const t4 = new Tile('protection', 'converter'); t4.groupId = gid; t4.state = 3;
      return [
        { x, y, tile: t1 },
        { x: x + 1, y, tile: t2 },
        { x: x + 2, y, tile: t3 },
        { x: x + 3, y, tile: t4 },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const gid = 'ghost';
      const t1 = new Tile('protection', 'converter'); t1.groupId = gid; t1.state = 0;
      const t2 = new Tile('protection', 'converter'); t2.groupId = gid; t2.state = 1;
      const t3 = new Tile('protection', 'converter'); t3.groupId = gid; t3.state = 2;
      const t4 = new Tile('protection', 'converter'); t4.groupId = gid; t4.state = 3;
      return [
        { x, y, tile: t1 },
        { x: x + 1, y, tile: t2 },
        { x: x + 2, y, tile: t3 },
        { x: x + 3, y, tile: t4 },
      ];
    },
  },

  // 10. Platform (moving platform)
  {
    type: 'platform',
    subtype: 'main',
    name: '移動平台',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, _gridSize, isCellAvailable) => {
      if (y < 2 || !isCellAvailable(x, y) || !isCellAvailable(x, y - 1) || !isCellAvailable(x, y - 2)) {
        return { canPlace: false, errorMsg: '空間不足，移動平台需要垂直連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'plat_' + Date.now();
      const bot = new Tile('platform', 'bot'); bot.groupId = gid; bot.extension = 0;
      const mid = new Tile('platform', 'mid'); mid.groupId = gid;
      const top = new Tile('platform', 'top'); top.groupId = gid;
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const bot = new Tile('platform', 'bot');
      const mid = new Tile('platform', 'mid');
      const top = new Tile('platform', 'top');
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
  },

  // 11. Pneumatic Cylinder (Double-Acting)
  {
    type: 'pneumatic',
    subtype: 'cylinder',
    name: '氣壓缸',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, _gridSize, isCellAvailable) => {
      if (y < 2 || !isCellAvailable(x, y) || !isCellAvailable(x, y - 1) || !isCellAvailable(x, y - 2)) {
        return { canPlace: false, errorMsg: '空間不足，氣壓缸需要垂直連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'cyl_' + Date.now();
      const bot = new Tile('pneumatic', 'cyl_bot'); bot.groupId = gid; bot.extension = 0;
      const mid = new Tile('pneumatic', 'cyl_mid'); mid.groupId = gid;
      const top = new Tile('pneumatic', 'cyl_top'); top.groupId = gid;
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const bot = new Tile('pneumatic', 'cyl_bot');
      const mid = new Tile('pneumatic', 'cyl_mid');
      const top = new Tile('pneumatic', 'cyl_top');
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
  },

  // 12. Pneumatic Cylinder (Single-Acting)
  {
    type: 'pneumatic',
    subtype: 'cylinder_single',
    name: '單動氣壓缸',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, _gridSize, isCellAvailable) => {
      if (y < 2 || !isCellAvailable(x, y) || !isCellAvailable(x, y - 1) || !isCellAvailable(x, y - 2)) {
        return { canPlace: false, errorMsg: '空間不足，單動氣壓缸需要垂直連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'cyl_s_' + Date.now();
      const bot = new Tile('pneumatic', 'cyl_single_bot'); bot.groupId = gid; bot.extension = 0;
      const mid = new Tile('pneumatic', 'cyl_single_mid'); mid.groupId = gid;
      const top = new Tile('pneumatic', 'cyl_single_top'); top.groupId = gid;
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const bot = new Tile('pneumatic', 'cyl_single_bot');
      const mid = new Tile('pneumatic', 'cyl_single_mid');
      const top = new Tile('pneumatic', 'cyl_single_top');
      return [
        { x, y, tile: bot },
        { x, y: y - 1, tile: mid },
        { x, y: y - 2, tile: top },
      ];
    },
  },

  // 13. Power 3-Phase
  {
    type: 'power',
    subtype: '3phase',
    name: '三相電源',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (x + 2 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y) || !isCellAvailable(x + 2, y)) {
        return { canPlace: false, errorMsg: '空間不足，三相電源需要橫向連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = '3phase_' + Date.now();
      const r = new Tile('power', '3phase_r'); r.groupId = gid;
      const s = new Tile('power', '3phase_s'); s.groupId = gid;
      const t = new Tile('power', '3phase_t'); t.groupId = gid;
      return [
        { x, y, tile: r },
        { x: x + 1, y, tile: s },
        { x: x + 2, y, tile: t },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const r = new Tile('power', '3phase_r');
      const s = new Tile('power', '3phase_s');
      const t = new Tile('power', '3phase_t');
      return [
        { x, y, tile: r },
        { x: x + 1, y, tile: s },
        { x: x + 2, y, tile: t },
      ];
    },
  },

  // 14. Power PSU
  {
    type: 'power',
    subtype: 'psu',
    name: '直流電源供應器',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (x + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x + 1, y)) {
        return { canPlace: false, errorMsg: '空間不足，PSU 需要橫向連續 2 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'psu_' + Date.now();
      const left = new Tile('power', 'psu_left'); left.groupId = gid;
      const right = new Tile('power', 'psu_right'); right.groupId = gid;
      return [
        { x, y, tile: left },
        { x: x + 1, y, tile: right },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const left = new Tile('power', 'psu_left');
      const right = new Tile('power', 'psu_right');
      return [
        { x, y, tile: left },
        { x: x + 1, y, tile: right },
      ];
    },
  },

  // 15. Switch 4-Way
  {
    type: 'switch',
    subtype: '4way',
    name: '四路開關',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (y + 1 >= gridSize || !isCellAvailable(x, y) || !isCellAvailable(x, y + 1)) {
        return { canPlace: false, errorMsg: '空間不足，四路開關需要垂直連續 2 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y }) => {
      const gid = 'sw4_' + Date.now();
      const top = new Tile('switch', '4way_top'); top.groupId = gid;
      const bot = new Tile('switch', '4way_bot'); bot.groupId = gid;
      return [
        { x, y, tile: top },
        { x, y: y + 1, tile: bot },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      const top = new Tile('switch', '4way_top');
      const bot = new Tile('switch', '4way_bot');
      return [
        { x, y, tile: top },
        { x, y: y + 1, tile: bot },
      ];
    },
  },

  // 16. Resistor Variable (Sliding Potentiometer)
  {
    type: 'resistor_var',
    subtype: 'var',
    name: '滑動變阻器',
    isMultiTile: true,
    validatePlacement: (x, y, rot, gridSize, isCellAvailable) => {
      const isHoriz = rot % 2 === 0;
      const canPlace = isHoriz
        ? x + 2 < gridSize && isCellAvailable(x, y) && isCellAvailable(x + 1, y) && isCellAvailable(x + 2, y)
        : y + 2 < gridSize && isCellAvailable(x, y) && isCellAvailable(x, y + 1) && isCellAvailable(x, y + 2);
      if (!canPlace) {
        return { canPlace: false, errorMsg: '空間不足，滑動變阻器需要連續 3 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, rotation }) => {
      const rot = rotation;
      const isHoriz = rot % 2 === 0;
      const gid = 'rvar_' + Date.now();
      const tLeft = new Tile('resistor_var', 'var_left', 100); tLeft.groupId = gid; tLeft.rotation = rot; tLeft.extension = 0.5;
      const tMid = new Tile('resistor_var', 'var_mid', 100); tMid.groupId = gid; tMid.rotation = rot; tMid.extension = 0.5;
      const tRight = new Tile('resistor_var', 'var_right', 100); tRight.groupId = gid; tRight.rotation = rot; tRight.extension = 0.5;

      if (isHoriz) {
        return rot === 0
          ? [{ x, y, tile: tLeft }, { x: x + 1, y, tile: tMid }, { x: x + 2, y, tile: tRight }]
          : [{ x, y, tile: tRight }, { x: x + 1, y, tile: tMid }, { x: x + 2, y, tile: tLeft }];
      } else {
        return rot === 1
          ? [{ x, y, tile: tLeft }, { x, y: y + 1, tile: tMid }, { x, y: y + 2, tile: tRight }]
          : [{ x, y, tile: tRight }, { x, y: y + 1, tile: tMid }, { x, y: y + 2, tile: tLeft }];
      }
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const rot = rotation;
      const isHoriz = rot % 2 === 0;
      const tLeft = new Tile('resistor_var', 'var_left', 100); tLeft.rotation = rot; tLeft.extension = 0.5;
      const tMid = new Tile('resistor_var', 'var_mid', 100); tMid.rotation = rot; tMid.extension = 0.5;
      const tRight = new Tile('resistor_var', 'var_right', 100); tRight.rotation = rot; tRight.extension = 0.5;

      if (isHoriz) {
        return rot === 0
          ? [{ x, y, tile: tLeft }, { x: x + 1, y, tile: tMid }, { x: x + 2, y, tile: tRight }]
          : [{ x, y, tile: tRight }, { x: x + 1, y, tile: tMid }, { x: x + 2, y, tile: tLeft }];
      } else {
        return rot === 1
          ? [{ x, y, tile: tLeft }, { x, y: y + 1, tile: tMid }, { x, y: y + 2, tile: tRight }]
          : [{ x, y, tile: tRight }, { x, y: y + 1, tile: tMid }, { x, y: y + 2, tile: tLeft }];
      }
    },
  },
];
