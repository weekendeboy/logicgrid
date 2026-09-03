const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '            const t2 = grid[y]?.[x + 1];\n            const t3 = grid[y]?.[x + 2];\n            \n            t.isActive = coilOn;',
  `            t.isActive = coilOn;`
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
