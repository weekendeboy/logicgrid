const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const targetStr = `      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        const st = t.state || 0;
        if (st === 0) groups = [[2, 0]]; // Top
        else groups = [[2, 1]]; // Right
      } else if (t.type === 'protection' && t.subtype === 'fuse') {`;

const replacementStr = `      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        const st = t.state || 0;
        if (st === 0) groups = [[2, 0]]; // Top
        else groups = [[2, 1]]; // Right
      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = t.state || 0;
        if (st === 1) {
          // Parallel: Left (3) connects to Right (1)
          groups = [[3, 1]];
        } else {
          // Cross: handled in buildNetState
          groups = [[3], [1]];
        }
      } else if (t.type === 'protection' && t.subtype === 'fuse') {`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/engine/NetEngine.ts', content);
