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

const w1 = new Tile('wire', 'straight'); w1.rotation = 1; grid[0][1].isPowered = true;
// wait, easier to just test if grid[2][0].isPowered becomes true!

let isNoActive = false;

for (let i = 0; i < 5; i++) {
  grid[1][0].isActive = isNoActive;
  
  const { netMap, netCount } = buildNetState(grid, 2, 3, 'wiring', { shorts: [], opens: [] });
  const netData = Array(netCount + 1).fill(0).map(() => ({ color: '', isHigh: false }));
  
  // manually connect
  // wait, to test `isPowered` we must use lNets / nNets.
  // Instead of manual, let's just observe.
  console.log(`Tick ${i} isNoActive: ${isNoActive} -> group count ${netCount}`);
  
  isNoActive = !isNoActive;
}
