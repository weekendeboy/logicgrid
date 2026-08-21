const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target = `            ctx.fillText('R', -20, 0);
          }
          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : '#d97706';`;

const repl = `            ctx.fillText('R', -20, 0);
          }
          }
          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : (t.subtype === 'counter_coil' ? '#0891b2' : '#d97706');`;

content = content.replace(target, repl);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log("Patch 4 done!");
