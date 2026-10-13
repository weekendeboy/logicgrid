/**
 * @license
 * Standard Single-Tile Components for Auto Studio Pro
 */

import { Tile } from '../../types';
import { ComponentDefinition, PlacementContext, PlacedTileInfo } from '../types';

export function getDefaultValue(type: string, subtype: string): number {
  if (type === 'power' && (subtype === 'ac' || subtype === 'power_ac')) return 1;
  if (type === 'power' && (subtype === 'power_real' || subtype === 'battery_real')) return 1.5;
  if (type === 'power') return 12;
  if (type === 'capacitor') return 10000;
  if (type === 'inductor') return 100; // 100mH
  if (type === 'diode') return 0.7;
  if (type === 'logic' && subtype === 'clock') return 1;
  if (subtype === 'counter_coil') return 5;
  return 100;
}

export function createStandardTile(type: string, subtype: string, context: PlacementContext): PlacedTileInfo[] {
  const dVal = getDefaultValue(type, subtype);
  const tile = new Tile(type, subtype, dVal);
  if (subtype === 'counter_coil') tile.measureVal = dVal;
  tile.rotation = context.rotation;

  if (type === 'power' && (subtype === 'power_real' || subtype === 'battery_real')) {
    tile.internalR = 1.0;
    tile.labels[4] = '1.5V (r=1Ω)';
  } else if (type === 'diode') {
    tile.labels[4] = '1N4007';
  } else if (type === 'inductor') {
    tile.labels[4] = '100mH';
  } else if (type === 'meter' && subtype === 'g') {
    tile.labels[4] = '檢流計 G';
  } else if (type === 'btn' && (subtype === 'no' || subtype === 'toggle')) {
    tile.labels[1] = '13';
    tile.labels[2] = '14';
  } else if (type === 'btn' && subtype === 'nc') {
    tile.labels[1] = '11';
    tile.labels[2] = '12';
  }

  return [{ x: context.x, y: context.y, tile }];
}

export function createStandardGhostTile(type: string, subtype: string, context: PlacementContext): PlacedTileInfo[] {
  const tile = new Tile(type, subtype);
  tile.rotation = context.rotation;

  if (type === 'power' && (subtype === 'power_real' || subtype === 'battery_real')) {
    tile.internalR = 1.0;
    tile.labels[4] = '1.5V (r=1Ω)';
  } else if (type === 'diode') {
    tile.labels[4] = '1N4007';
  } else if (type === 'inductor') {
    tile.labels[4] = '100mH';
  } else if (type === 'meter' && subtype === 'g') {
    tile.labels[4] = '檢流計 G';
  } else if (type === 'btn' && (subtype === 'no' || subtype === 'toggle')) {
    tile.labels[1] = '13';
    tile.labels[2] = '14';
  } else if (type === 'btn' && subtype === 'nc') {
    tile.labels[1] = '11';
    tile.labels[2] = '12';
  }

  return [{ x: context.x, y: context.y, tile }];
}

export const standardComponents: ComponentDefinition[] = [];
