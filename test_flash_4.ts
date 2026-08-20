import { WiringEngine } from './src/engine/WiringEngine';
import { buildNetState } from './src/engine/NetEngine';
import { Tile } from './src/types';

const grid = Array(2).fill(null).map(() => Array(2).fill(null));

const pwr = new Tile('power', 'dc24');
grid[0][0] = pwr;

const coil = new Tile('relay', 'flash_coil');
coil.labels[4] = 'F1';
coil.value = 100; // 100ms for fast test
grid[0][1] = coil;

const no = new Tile('relay', 'no');
no.labels[4] = 'F1';
grid[1][0] = no;

const simulate = () => {
  const { netMap, netCount } = buildNetState(grid, 2, 2, 'wiring', { shorts: [], opens: [] });
  const netData = Array(netCount + 1).fill(0).map(() => ({ color: '', isHigh: false }));
  
  netMap[0][1][0] = netMap[0][0][0]; 
  netMap[0][1][2] = netMap[0][0][2]; 

  WiringEngine.simulate(grid, netMap, netData);
};

let lastNoState = grid[1][0].isActive;
let changes = 0;

const iv = setInterval(() => {
  simulate();
  if (grid[1][0].isActive !== lastNoState) {
    console.log(`Time: ${Date.now() % 10000} | Coil: ${grid[0][1].isActive} | NO: ${grid[1][0].isActive}`);
    lastNoState = grid[1][0].isActive;
    changes++;
  }
  if (changes > 10) {
    clearInterval(iv);
  }
}, 16); // 60fps
