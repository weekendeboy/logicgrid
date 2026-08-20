import { WiringEngine } from './src/engine/WiringEngine';
import { buildNetState } from './src/engine/NetEngine';
import { Tile } from './src/types';

const grid = Array(3).fill(null).map(() => Array(2).fill(null));

const pwr = new Tile('power', 'dc24');
pwr.rotation = 0;
grid[0][0] = pwr;

const coil = new Tile('relay', 'flash_coil');
coil.labels[4] = 'F1';
coil.value = 500;
grid[0][1] = coil;

const no = new Tile('relay', 'no');
no.labels[4] = 'F1';
grid[1][0] = no;

const load = new Tile('load', 'lamp');
grid[2][0] = load;

for (let i = 0; i < 5; i++) {
  const { netMap, netCount } = buildNetState(grid, 2, 3, 'wiring', { shorts: [], opens: [] });
  const netData = Array(netCount + 1).fill(0).map(() => ({ color: '', isHigh: false }));
  
  netMap[0][1][0] = netMap[0][0][0]; // L to coil
  netMap[0][1][2] = netMap[0][0][2]; // N to coil
  
  netMap[1][0][0] = netMap[0][0][0]; // L to NO contact pin 0
  netMap[2][0][0] = netMap[1][0][2]; // NO contact pin 2 to Load pin 0
  netMap[2][0][2] = netMap[0][0][2]; // N to Load pin 2

  WiringEngine.simulate(grid, netMap, netData);
  console.log(`Tick ${i} | Coil: ${grid[0][1].isActive} | NO: ${grid[1][0].isActive} | Load powered: ${grid[2][0].isPowered}`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
}
