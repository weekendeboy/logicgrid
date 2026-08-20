import { WiringEngine } from './src/engine/WiringEngine';
import { buildNetState } from './src/engine/NetEngine';
import { Tile } from './src/types';

const grid = Array(2).fill(null).map(() => Array(2).fill(null));
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

for (let i = 0; i < 5; i++) {
  const { netMap, netCount } = buildNetState(grid, 2, 2, 'wiring', { shorts: [], opens: [] });
  const netData = Array(netCount + 1).fill(0).map(() => ({ color: '', isHigh: false }));
  
  netMap[0][1][0] = netMap[0][0][0]; 
  netMap[0][1][2] = netMap[0][0][2]; 

  WiringEngine.simulate(grid, netMap, netData);
  console.log(`Tick ${i}`);
  console.log('Coil isActive:', grid[0][1].isActive);
  console.log('NO isActive:', grid[1][0].isActive);
  
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
}
