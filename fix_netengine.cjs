const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const target = `      } else if (
        t.subtype === 'coil' ||
        t.type === 'motor' ||
        t.type === 'load'
      ) {
        groups = [[0], [2]];
      } else if (t.type === 'pneumatic') {`;

const rep = `      } else if (
        t.subtype === 'coil' ||
        t.type === 'motor' ||
        t.type === 'load' ||
        t.type === 'power'
      ) {
        groups = [[0], [2]];
      } else if (t.type === 'pneumatic') {`;

content = content.replace(target, rep);
fs.writeFileSync('src/engine/NetEngine.ts', content);
