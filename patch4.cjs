const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const mcb = new Tile\('breaker', 'mcb'\); mcb\.rotation = 0; mcb\.isLocked = true;\n          const ind = new Tile\('output', 'indicator'\); ind\.rotation = 0; ind\.isLocked = true;\n          newGrid\[5\]\[10\] = mcb; newGrid\[8\]\[10\] = ind;/;

const replacement = `const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
          const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
          const ind = new Tile('output', 'indicator'); ind.rotation = 0; ind.isLocked = true;
          newGrid[5][9] = mcb1; newGrid[5][10] = mcb2; newGrid[8][9] = ind;`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('done');
