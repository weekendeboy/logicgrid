/**
 * @license
 * Pneumatic Components for Auto Studio Pro
 */

import { Tile } from '../../types';
import { ComponentDefinition } from '../types';

export const pneumaticComponents: ComponentDefinition[] = [
  // Valve Coil
  {
    type: 'pneumatic',
    subtype: 'valve_coil',
    name: '電磁閥線圈',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const r of grid) {
          for (const c of r) {
            if (c && c.type === 'pneumatic' && c.labels[4] && c.labels[4].match(/^V\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const tile = new Tile('pneumatic', 'valve_coil', 100);
      tile.rotation = rotation;
      tile.labels[4] = 'V' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('pneumatic', 'valve_coil', 100);
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },

  // 5/2 Way Valve (Single Solenoid with Spring Return)
  {
    type: 'pneumatic',
    subtype: 'valve_52',
    name: '5/2向單動電磁閥',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (
        x - 2 < 0 ||
        x + 2 >= gridSize ||
        !isCellAvailable(x - 2, y) ||
        !isCellAvailable(x - 1, y) ||
        !isCellAvailable(x, y) ||
        !isCellAvailable(x + 1, y) ||
        !isCellAvailable(x + 2, y)
      ) {
        return { canPlace: false, errorMsg: '空間不足，5/2向電磁閥需要橫向連續 5 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, grid }) => {
      let maxV = 0;
      if (grid) {
        for (const r of grid) {
          for (const c of r) {
            if (
              c &&
              c.type === 'pneumatic' &&
              (c.subtype === 'valve_coil' || c.subtype === 'valve_52' || c.subtype === 'valve_52_coil' || c.subtype === 'valve_52_double') &&
              c.labels[4] &&
              c.labels[4].match(/^V\d+$/)
            ) {
              maxV = Math.max(maxV, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const label = 'V' + Math.max(1, maxV);
      const gid = 'v52_' + Date.now();

      const t1 = new Tile('pneumatic', 'valve_52_spring'); t1.groupId = gid;
      const t2 = new Tile('pneumatic', 'valve_52_a_r'); t2.groupId = gid;
      const t3 = new Tile('pneumatic', 'valve_52'); t3.groupId = gid; t3.labels[4] = label;
      const t4 = new Tile('pneumatic', 'valve_52_b_s'); t4.groupId = gid;
      const t5 = new Tile('pneumatic', 'valve_52_coil'); t5.groupId = gid; t5.labels[4] = label;

      return [
        { x: x - 2, y, tile: t1 },
        { x: x - 1, y, tile: t2 },
        { x, y, tile: t3 },
        { x: x + 1, y, tile: t4 },
        { x: x + 2, y, tile: t5 },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      return [
        { x: x - 2, y, tile: new Tile('pneumatic', 'valve_52_spring') },
        { x: x - 1, y, tile: new Tile('pneumatic', 'valve_52_a_r') },
        { x, y, tile: new Tile('pneumatic', 'valve_52') },
        { x: x + 1, y, tile: new Tile('pneumatic', 'valve_52_b_s') },
        { x: x + 2, y, tile: new Tile('pneumatic', 'valve_52_coil') },
      ];
    },
  },

  // 5/2 Way Valve (Double Solenoid)
  {
    type: 'pneumatic',
    subtype: 'valve_52_double',
    name: '5/2向雙動電磁閥',
    isMultiTile: true,
    validatePlacement: (x, y, _rot, gridSize, isCellAvailable) => {
      if (
        x - 2 < 0 ||
        x + 2 >= gridSize ||
        !isCellAvailable(x - 2, y) ||
        !isCellAvailable(x - 1, y) ||
        !isCellAvailable(x, y) ||
        !isCellAvailable(x + 1, y) ||
        !isCellAvailable(x + 2, y)
      ) {
        return { canPlace: false, errorMsg: '空間不足，5/2向雙動電磁閥需要橫向連續 5 格空位！' };
      }
      return { canPlace: true };
    },
    createTiles: ({ x, y, grid }) => {
      let maxV = 0;
      if (grid) {
        for (const r of grid) {
          for (const c of r) {
            if (
              c &&
              c.type === 'pneumatic' &&
              (c.subtype === 'valve_coil' || c.subtype === 'valve_52' || c.subtype === 'valve_52_coil' || c.subtype === 'valve_52_double') &&
              c.labels[4] &&
              c.labels[4].match(/^V\d+$/)
            ) {
              maxV = Math.max(maxV, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const label = 'V' + Math.max(1, maxV);
      const gid = 'v52_' + Date.now();

      const t1 = new Tile('pneumatic', 'valve_52_coil_left'); t1.groupId = gid; t1.labels[4] = label + 'L';
      const t2 = new Tile('pneumatic', 'valve_52_a_r'); t2.groupId = gid;
      const t3 = new Tile('pneumatic', 'valve_52_double'); t3.groupId = gid; t3.labels[4] = label;
      const t4 = new Tile('pneumatic', 'valve_52_b_s'); t4.groupId = gid;
      const t5 = new Tile('pneumatic', 'valve_52_coil'); t5.groupId = gid; t5.labels[4] = label + 'R';

      return [
        { x: x - 2, y, tile: t1 },
        { x: x - 1, y, tile: t2 },
        { x, y, tile: t3 },
        { x: x + 1, y, tile: t4 },
        { x: x + 2, y, tile: t5 },
      ];
    },
    createGhostTiles: ({ x, y }) => {
      return [
        { x: x - 2, y, tile: new Tile('pneumatic', 'valve_52_coil_left') },
        { x: x - 1, y, tile: new Tile('pneumatic', 'valve_52_a_r') },
        { x, y, tile: new Tile('pneumatic', 'valve_52_double') },
        { x: x + 1, y, tile: new Tile('pneumatic', 'valve_52_b_s') },
        { x: x + 2, y, tile: new Tile('pneumatic', 'valve_52_coil') },
      ];
    },
  },
];
