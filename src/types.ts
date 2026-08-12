/**
 * @license
 * Auto Studio Pro - Industrial Automation Simulation Platform
 */

export type AppMode = 'tutorial' | 'electronic' | 'logic' | 'wiring' | 'plc';

export type ToolType = 
  | 'interact'
  | 'select'
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
  '2-1' | '2-2' | '2-3' | '2-4' | '2-5' |
  '3-1' | '3-2' | '3-3' | '3-4' |
  '4-1' | '4-2' | '4-3' | '4-4' | '4-5' |
  '5-1' | '5-2' | '5-3' | '5-4' |
  'w-1-1' | 'w-1-2' | 'w-1-3' | 'w-1-4' |
  'w-2-1' | 'w-2-2' | 'w-2-3' | 'w-2-4' |
  'w-3-1' | 'w-3-2' | 'w-3-3' |
  'w-4-1' | 'w-4-2' | 'w-4-3' | 'w-4-4' |
  'w-5-1' | 'w-5-2';

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
    this.measureVal = 0;
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
