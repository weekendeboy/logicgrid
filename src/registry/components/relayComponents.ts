/**
 * @license
 * Relay, Timer, Counter, Terminal, and Button Components for Auto Studio Pro
 */

import { Tile } from '../../types';
import { ComponentDefinition } from '../types';

export const relayComponents: ComponentDefinition[] = [
  // Relays, Timers, Counters
  {
    type: 'relay',
    subtype: 'coil',
    name: '電磁線圈',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const row of grid) {
          for (const c of row) {
            if (c && c.type === 'relay' && c.labels[4] && c.labels[4].match(/^K\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const tile = new Tile('relay', 'coil', 0);
      tile.rotation = rotation;
      tile.labels[4] = 'K' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('relay', 'coil', 0);
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },
  {
    type: 'relay',
    subtype: 'no',
    name: '繼電器常開接點',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const row of grid) {
          for (const c of row) {
            if (c && c.type === 'relay' && c.labels[4] && c.labels[4].match(/^K\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const tile = new Tile('relay', 'no', 0);
      tile.rotation = rotation;
      tile.labels[4] = 'K' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('relay', 'no', 0);
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },
  {
    type: 'relay',
    subtype: 'nc',
    name: '繼電器常閉接點',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const row of grid) {
          for (const c of row) {
            if (c && c.type === 'relay' && c.labels[4] && c.labels[4].match(/^K\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const tile = new Tile('relay', 'nc', 0);
      tile.rotation = rotation;
      tile.labels[4] = 'K' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('relay', 'nc', 0);
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },
  {
    type: 'relay',
    subtype: 'con',
    name: '繼電器轉換接點',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const row of grid) {
          for (const c of row) {
            if (c && c.type === 'relay' && c.labels[4] && c.labels[4].match(/^K\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }
      const tile = new Tile('relay', 'con', 0);
      tile.rotation = rotation;
      tile.labels[4] = 'K' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('relay', 'con', 0);
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },

  // Terminal Block
  {
    type: 'terminal',
    subtype: 'block',
    name: '端子台',
    createTiles: ({ x, y, rotation, grid }) => {
      let maxNum = 0;
      if (grid) {
        for (const row of grid) {
          for (const c of row) {
            if (c && c.type === 'terminal' && c.labels[4] && c.labels[4].match(/^TB\d+$/)) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(2)));
            }
          }
        }
      }
      const tile = new Tile('terminal', 'block');
      tile.rotation = rotation;
      tile.labels[4] = 'TB' + (maxNum + 1);
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('terminal', 'block');
      tile.rotation = rotation;
      return [{ x, y, tile }];
    },
  },

  // Buttons
  {
    type: 'btn',
    subtype: 'no',
    name: '常開按鈕',
    createTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'no', 100);
      tile.rotation = rotation;
      tile.labels[1] = '13';
      tile.labels[2] = '14';
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'no');
      tile.rotation = rotation;
      tile.labels[1] = '13';
      tile.labels[2] = '14';
      return [{ x, y, tile }];
    },
  },
  {
    type: 'btn',
    subtype: 'nc',
    name: '常閉按鈕',
    createTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'nc', 100);
      tile.rotation = rotation;
      tile.labels[1] = '11';
      tile.labels[2] = '12';
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'nc');
      tile.rotation = rotation;
      tile.labels[1] = '11';
      tile.labels[2] = '12';
      return [{ x, y, tile }];
    },
  },
  {
    type: 'btn',
    subtype: 'toggle',
    name: '切換按鈕',
    createTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'toggle', 100);
      tile.rotation = rotation;
      tile.labels[1] = '13';
      tile.labels[2] = '14';
      return [{ x, y, tile }];
    },
    createGhostTiles: ({ x, y, rotation }) => {
      const tile = new Tile('btn', 'toggle');
      tile.rotation = rotation;
      tile.labels[1] = '13';
      tile.labels[2] = '14';
      return [{ x, y, tile }];
    },
  },
];
