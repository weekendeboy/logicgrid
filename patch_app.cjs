const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\} else if \(level === 'w-1-3'\) \{[\s\S]*?\}\n      \}\n/;

const replacement = `} else if (level === 'w-1-3') {
          const noBtn = new Tile('switch', 'push_no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const mc = new Tile('mc', 'main'); mc.rotation = 0; mc.isLocked = true;
          const motor = new Tile('output', 'motor'); motor.rotation = 0; motor.isLocked = true;
          newGrid[4][6] = noBtn; newGrid[4][10] = mc; newGrid[8][10] = motor;
        } else if (level.startsWith('w-')) {
          // Placeholder for the rest of wiring levels
          const mcb1 = new Tile('breaker', 'mcb'); mcb1.rotation = 0; mcb1.isLocked = true;
          const mcb2 = new Tile('breaker', 'mcb'); mcb2.rotation = 0; mcb2.isLocked = true;
          newGrid[5][9] = mcb1; newGrid[5][10] = mcb2;
        }
      }
`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('done');
