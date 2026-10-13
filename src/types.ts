/**
 * @license
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

export type AppMode = 'tutorial' | 'electronic' | 'logic' | 'wiring' | 'plc';

export type ToolType = 
  | 'interact'
  | 'select'
  | 'move'
  | 'label'
  | 'multimeter'
  | 'autowire'
  | 'paste'
  | 'place'
  | 'fault-open'
  | 'fault-short'
  | 'plc_a'
  | 'plc_b'
  | 'plc_p'
  | 'plc_n'
  | 'plc_pls'
  | 'plc_plf'
  | 'plc_out'
  | 'plc_wire';

export type SubMode = 'sandbox' | 'debug';

export type LogicLevelId = 'sandbox' | '0-1' | '0-2' | '0-3' | '0-4' | 'tutorial-menu' | 'wiring-menu' | 
  '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7' |
  '2-1' | '2-2' | '2-3' | '2-4' | '2-5' | '2-6' | '2-7' |
  '3-1' | '3-2' | '3-3' | '3-4' | '3-5' |
  '4-1' | '4-2' | '4-3' | '4-4' | '4-5' |
  '5-1' | '5-2' | '5-3' | '5-4' | '5-5' |
  'w-1-1' | 'w-1-2' | 'w-1-3' | 'w-1-4' | 'w-1-5' |
  'w-2-1' | 'w-2-2' | 'w-2-3' | 'w-2-4' | 'w-2-5' |
  'w-3-1' | 'w-3-2' | 'w-3-3' | 'w-3-4' |
  'w-4-1' | 'w-4-2' | 'w-4-3' | 'w-4-4' |
  'w-5-1' | 'w-5-2' |
  'wiring-puzzle-menu' |
  'wp-1-1' | 'wp-1-2' | 'wp-1-3' | 'wp-1-4' | 'wp-1-5' |
  'wp-2-1' | 'wp-2-2' | 'wp-2-3' | 'wp-2-4' | 'wp-2-5' |
  'wp-3-1' | 'wp-3-2' | 'wp-3-3' | 'wp-3-4' | 'wp-3-5' |
  'wp-4-1' | 'wp-4-2' | 'wp-4-3' | 'wp-4-4' | 'wp-4-5' |
  'wp-5-1' | 'wp-5-2' | 'wp-5-3' | 'wp-5-4' | 'wp-5-5' |
  'logic-puzzle-menu' |
  'lp-1-1' | 'lp-1-2' | 'lp-1-3' | 'lp-1-4' | 'lp-1-5' |
  'lp-2-1' | 'lp-2-2' | 'lp-2-3' | 'lp-2-4' | 'lp-2-5' |
  'lp-3-1' | 'lp-3-2' | 'lp-3-3' | 'lp-3-4' | 'lp-3-5' |
  'lp-4-1' | 'lp-4-2' | 'lp-4-3' | 'lp-4-4' | 'lp-4-5' |
  'lp-5-1' | 'lp-5-2' | 'lp-5-3' | 'lp-5-4' | 'lp-5-5' |
  'class_c_u1_1' | 'class_c_u1_2' | 'class_c_u1_3' | 'class_c_u1_4' | 'class_c_u1_5' | 'class_c_u1_6' | 'class_c_u1_7' |
  'class_c_u2_1' | 'class_c_u2_2' | 'class_c_u2_3' | 'class_c_u2_4' | 'class_c_u2_5' | 'class_c_u2_6' | 'class_c_u2_7' |
  'jh-menu' |
  'jh-1-1' | 'jh-1-2' | 'jh-1-3' | 'jh-1-4' |
  'jh-2-1' | 'jh-2-2' | 'jh-2-3' |
  'jh-3-1' | 'jh-3-2' | 'jh-3-3' |
  'jh-4-1' | 'jh-4-2' | 'jh-4-3' |
  'jh-5-1' | 'jh-5-2' |
  'sh-menu' |
  'sh-1-1' | 'sh-1-2' | 'sh-1-3' |
  'sh-2-1' | 'sh-2-2' | 'sh-2-3' |
  'sh-3-1' | 'sh-3-2' | 'sh-3-3' |
  'sh-4-1' | 'sh-4-2' | 'sh-4-3' |
  'sh-5-1' | 'sh-5-2' | 'sh-5-3';

export interface PinLabels {
  0?: string; // Top / Pin 1
  1?: string; // Right / Pin 2
  2?: string; // Bottom / Pin 3
  3?: string; // Left / Pin 4
  4?: string; // Center / Target link name
  [key: number]: string | undefined;
}

export class Tile {
  type: string;
  subtype: string;
  rotation: number;
  value: number;
  labels: PinLabels;
  groupId: string | null;
  state: number;

  isActive: boolean;
  isBlown: boolean;
  measureVal: number;
  isPoweredAt: number | null;
  timerOutput: boolean;

  color: string;
  isPowered: boolean;
  motorDir: number;
  rotationAngle: number;

  isPhysicallyPushed: boolean;
  extension: number;
  isLocked: boolean;

  // Gate/Logic specific
  outState?: boolean;
  currentA?: number;
  lastVdiff?: number;
  powerW?: number;
  vDrop?: number;
  internalR?: number; // Battery internal resistance r (Ohms)

  // Roman display pins
  pinStateV?: boolean;
  pinStateI_R?: boolean;
  pinStateI_B?: boolean;
  pinStateI_L?: boolean;

  // PLC tile specific
  dx?: number;
  dy?: number;
  isReset?: boolean;
  inputsActive?: boolean[];
  outputsActive?: boolean[];
  prevSignal?: boolean;

  constructor(type: string = '', subtype: string = '', value: number = 0) {
    this.type = type;
    this.subtype = subtype;
    this.rotation = 0;
    this.value = value;

    this.labels = { 0: '', 1: '', 2: '', 3: '', 4: '' };
    this.groupId = null;
    this.state = 0;

    this.isActive = false;
    this.isBlown = false;
    this.measureVal = subtype === 'counter_coil' ? (value || 5) : 0;
    this.isPoweredAt = null;
    this.timerOutput = false;

    this.color = '#fde047';
    this.isPowered = false;
    this.motorDir = 0;
    this.rotationAngle = 0;

    this.isPhysicallyPushed = false;
    this.extension = 0;
    this.isLocked = false;
  }
}

export interface NodePin {
  x: number;
  y: number;
  pin: number;
}

export interface Faults {
  opens: string[]; // "x,y,pin"
  shorts: [string, string][]; // [ "x1,y1,p1", "x2,y2,p2" ]
}

export interface NetData {
  color: string;
  isHigh: boolean;
  v?: number;
}

export interface NetState {
  netMap: number[][][]; // [y][x][pin] -> netId
  netData: NetData[];
}

export interface SelectionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ClipboardData {
  w: number;
  h: number;
  data: (Tile | null)[][];
}

export interface ModalState {
  isOpen: boolean;
  mode: 'value' | 'color' | 'timer' | 'label';
  tile: Tile | null;
  tilePos?: { x: number; y: number };
}

export interface Waypoint {
  x: number;
  y: number;
}
