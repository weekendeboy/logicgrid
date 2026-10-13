/**
 * @license
 * Unified Component Registry for Auto Studio Pro
 */

import { Tile, AppMode } from '../types';
import { getShortedPinGroups } from '../engine/NetEngine';
import {
  ComponentDefinition,
  PlacementContext,
  PlacedTileInfo,
  ValidationResult,
} from './types';
import { multiTileComponents } from './components/multiTileComponents';
import { relayComponents } from './components/relayComponents';
import { pneumaticComponents } from './components/pneumaticComponents';
import { plcComponents } from './components/plcComponents';
import {
  createStandardTile,
  createStandardGhostTile,
} from './components/standardComponents';

const registryMap = new Map<string, ComponentDefinition>();

function getComponentKey(type: string, subtype: string): string {
  return `${type}::${subtype}`;
}

[
  ...multiTileComponents,
  ...relayComponents,
  ...pneumaticComponents,
  ...plcComponents,
].forEach((comp) => {
  registryMap.set(getComponentKey(comp.type, comp.subtype), comp);
});

export const ComponentRegistry = {
  /**
   * Get component definition
   */
  getComponent(type: string, subtype: string): ComponentDefinition | undefined {
    return registryMap.get(getComponentKey(type, subtype));
  },

  /**
   * Validate if component can be placed at given position
   */
  validatePlacement(
    type: string,
    subtype: string,
    x: number,
    y: number,
    rotation: number,
    gridSize: number,
    isCellAvailable: (x: number, y: number) => boolean
  ): ValidationResult {
    const comp = registryMap.get(getComponentKey(type, subtype));
    if (comp && comp.validatePlacement) {
      return comp.validatePlacement(x, y, rotation, gridSize, isCellAvailable);
    }
    // Default single cell bounds check
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return { canPlace: false, errorMsg: '超出邊界！' };
    }
    return { canPlace: true };
  },

  /**
   * Create tiles to be placed on the canvas
   */
  createPlacementTiles(
    type: string,
    subtype: string,
    context: PlacementContext
  ): PlacedTileInfo[] {
    // 1. Tool shortcuts mapping for PLC
    if (type === 'plc_a') return this.createPlacementTiles('plc', 'no', context);
    if (type === 'plc_b') return this.createPlacementTiles('plc', 'nc', context);
    if (type === 'plc_p' || type === 'plc_pls') return this.createPlacementTiles('plc', 'pls', context);
    if (type === 'plc_n' || type === 'plc_plf') return this.createPlacementTiles('plc', 'plf', context);
    if (type === 'plc_out') return this.createPlacementTiles('plc', 'out', context);

    // 2. Check registered components
    const comp = registryMap.get(getComponentKey(type, subtype));
    if (comp && comp.createTiles) {
      return comp.createTiles(context);
    }

    // 3. Dynamic relay/timer contact handler
    if (
      type === 'relay' &&
      (subtype === 'coil' ||
        subtype === 'no' ||
        subtype === 'nc' ||
        subtype === 'con' ||
        subtype.startsWith('ton_') ||
        subtype.startsWith('tof_') ||
        subtype === 'flash_coil' ||
        subtype === 'impulse_coil' ||
        subtype === 'counter_coil')
    ) {
      const isTimerContact = subtype.startsWith('ton_') || subtype.startsWith('tof_');
      const isFlashCoil = subtype === 'flash_coil';
      const isImpulseCoil = subtype === 'impulse_coil';
      const isCounterCoil = subtype === 'counter_coil';

      let prefix = 'K';
      if (isTimerContact) prefix = 'T';
      if (isFlashCoil) prefix = 'F';
      if (isImpulseCoil) prefix = 'P';
      if (isCounterCoil) prefix = 'C';

      let maxNum = 0;
      if (context.grid) {
        for (const r of context.grid) {
          for (const c of r) {
            if (
              c &&
              c.type === 'relay' &&
              c.labels[4] &&
              c.labels[4].match(new RegExp(`^${prefix}\\d+$`))
            ) {
              maxNum = Math.max(maxNum, parseInt(c.labels[4].substring(1)));
            }
          }
        }
      }

      let initValue = isTimerContact || isFlashCoil ? 1000 : 0;
      if (isCounterCoil) initValue = 5;

      const newT = new Tile(type, subtype, initValue);
      newT.rotation = context.rotation;
      newT.labels[4] = prefix + (maxNum + 1);
      if (isCounterCoil) newT.measureVal = initValue;

      return [{ x: context.x, y: context.y, tile: newT }];
    }

    // 4. Fallback to standard single tile
    return createStandardTile(type, subtype, context);
  },

  /**
   * Create ghost tiles for cursor preview
   */
  createGhostTiles(
    type: string,
    subtype: string,
    context: PlacementContext
  ): PlacedTileInfo[] {
    // 1. Tool shortcuts mapping for PLC
    if (type === 'plc_a') return this.createGhostTiles('plc', 'no', context);
    if (type === 'plc_b') return this.createGhostTiles('plc', 'nc', context);
    if (type === 'plc_p' || type === 'plc_pls') return this.createGhostTiles('plc', 'pls', context);
    if (type === 'plc_n' || type === 'plc_plf') return this.createGhostTiles('plc', 'plf', context);
    if (type === 'plc_out') return this.createGhostTiles('plc', 'out', context);

    // 2. Check registered components
    const comp = registryMap.get(getComponentKey(type, subtype));
    if (comp && comp.createGhostTiles) {
      return comp.createGhostTiles(context);
    }

    // 3. Fallback to standard single ghost tile
    return createStandardGhostTile(type, subtype, context);
  },

  /**
   * Check if a tile can be rotated
   */
  checkCanRotate(tile: Tile, mode: AppMode): { canRotate: boolean; errorMsg?: string } {
    if (tile.isLocked) {
      return { canRotate: false, errorMsg: '此教學元件已被鎖定，無法旋轉！' };
    }

    if (mode === 'plc' && tile.type === 'plc' && tile.subtype !== 'unit') {
      return { canRotate: false, errorMsg: '⚠️ 階梯圖元件方向固定為水平，無法旋轉！' };
    }

    const horizontalOnly = ['3e_relay', 'converter'];
    if (horizontalOnly.includes(tile.subtype)) {
      return { canRotate: false, errorMsg: '⚠️ 此元件方向固定為水平，無法旋轉！' };
    }

    const comp = registryMap.get(getComponentKey(tile.type, tile.subtype));
    if (comp && comp.canRotate) {
      return comp.canRotate(mode);
    }

    return { canRotate: true };
  },

  /**
   * Get shorted pin groups for a given tile and mode
   */
  getShortedPinGroups(tile: Tile | null, mode: AppMode): number[][] {
    return getShortedPinGroups(tile, mode);
  },
};
