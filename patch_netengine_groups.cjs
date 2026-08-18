const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const target2 = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;
        if (st === 1) {
          // Parallel: Left (3) connects to Right (1)
          groups = [[3, 1]];
        } else {
          // Cross: handled in buildNetState
          groups = [[3], [1]];
        }
      }`;

const rep2 = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        // Inter-tile connections are handled strictly in buildNetState to prevent shorting
        groups = [[3], [1]];
      }`;

content = content.replace(target2, rep2);

fs.writeFileSync('src/engine/NetEngine.ts', content);
