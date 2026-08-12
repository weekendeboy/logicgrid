const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update return for wiring-menu
content = content.replace(
  /if \(levelId === 'tutorial-menu'\) \{/,
  "if (levelId === 'tutorial-menu' || levelId === 'wiring-menu') {"
);

// Add sizing for wiring levels
content = content.replace(
  /if \(levelId\.startsWith\('5-'\)\) sz = 20;/,
  "if (levelId.startsWith('5-')) sz = 20;\n      if (levelId.startsWith('w-')) sz = 15;"
);

// Add wiring defaults
const wiringDefaults = `        } else if (level === 'w-1-1') {
          const mcb = new Tile('breaker', 'mcb'); mcb.rotation = 0; mcb.isLocked = true;
          const ind = new Tile('output', 'indicator'); ind.rotation = 0; ind.isLocked = true;
          newGrid[5][10] = mcb; newGrid[8][10] = ind;
        } else if (level === 'w-1-2') {
          const noBtn = new Tile('switch', 'push_no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const ncBtn = new Tile('switch', 'push_nc'); ncBtn.rotation = 0; ncBtn.isLocked = true;
          const ind1 = new Tile('output', 'indicator'); ind1.rotation = 0; ind1.isLocked = true; ind1.labels[4] = 'L1';
          const ind2 = new Tile('output', 'indicator'); ind2.rotation = 0; ind2.isLocked = true; ind2.labels[4] = 'L2';
          newGrid[4][8] = noBtn; newGrid[7][8] = ind1;
          newGrid[4][12] = ncBtn; newGrid[7][12] = ind2;
        } else if (level === 'w-1-3') {
          const noBtn = new Tile('switch', 'push_no'); noBtn.rotation = 0; noBtn.isLocked = true;
          const mc = new Tile('mc', 'main'); mc.rotation = 0; mc.isLocked = true;
          const motor = new Tile('output', 'motor'); motor.rotation = 0; motor.isLocked = true;
          newGrid[4][6] = noBtn; newGrid[4][10] = mc; newGrid[8][10] = motor;
        }
      }
`;

content = content.replace(
  /\} else if \(level === '5-4'\) \{[\s\S]*?\}\n      \}\n/,
  "} else if (level === '5-4') {\n          const sw1 = new Tile('logic', 'power', 100); sw1.rotation = 1; sw1.labels[4] = '1元';\n          const sw2 = new Tile('logic', 'power', 100); sw2.rotation = 1; sw2.labels[4] = '退幣';\n          const led1 = new Tile('logic', 'led', 0); led1.rotation = 1; led1.labels[0] = '可購買';\n          newGrid[2][5] = sw1; newGrid[2][7] = sw2; newGrid[12][6] = led1;\n" + wiringDefaults
);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
