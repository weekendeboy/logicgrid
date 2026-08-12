const fs = require('fs');

const files = [
  'src/engine/ElectronicEngine.ts',
  'src/engine/LogicEngine.ts',
  'src/engine/WiringEngine.ts',
  'src/engine/NetEngine.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('if (!grid || grid.length === 0 || !grid[0]) return')) return;
  
  if (file.includes('ElectronicEngine')) {
    content = content.replace(
      '  ): { vVal: number; aVal: number; wVal: number; oscVal: number | null } {',
      '  ): { vVal: number; aVal: number; wVal: number; oscVal: number | null } {\n    if (!grid || grid.length === 0 || !grid[0]) return { vVal: 0, aVal: 0, wVal: 0, oscVal: null };'
    );
  } else if (file.includes('LogicEngine')) {
    content = content.replace(
      '    netData: NetData[]\n  ) {',
      '    netData: NetData[]\n  ) {\n    if (!grid || grid.length === 0 || !grid[0]) return;'
    );
  } else if (file.includes('WiringEngine')) {
    content = content.replace(
      '    setAirElecShortFlag?: (val: boolean) => void\n  ) {',
      '    setAirElecShortFlag?: (val: boolean) => void\n  ) {\n    if (!grid || grid.length === 0 || !grid[0]) return;'
    );
  } else if (file.includes('NetEngine')) {
    content = content.replace(
      'export function computeNets(grid: (Tile | null)[][], mode: AppMode): NetEngineState {',
      'export function computeNets(grid: (Tile | null)[][], mode: AppMode): NetEngineState {\n  if (!grid || grid.length === 0 || !grid[0]) return { powerSources: [], logicNets: [], plcLNet: null, plcNNet: null };'
    );
  }
  
  fs.writeFileSync(file, content);
});
