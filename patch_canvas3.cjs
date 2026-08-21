const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target1 = `} else {
          drawPin(0, 16);
          drawPin(2, 16);`;

const repl1 = `} else {
          if (t.subtype === 'counter_coil') {
            drawPin(1, 16);
            drawPin(3, 16);
            drawPin(0, 16);
            
            ctx.fillStyle = '#be123c';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('R', 0, -18);
          } else {
            drawPin(0, 16);
            drawPin(2, 16);`;

content = content.replace(target1, repl1);

const target2 = `ctx.fillText('R', -20, 0);
          }

          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : '#d97706';`;

const repl2 = `ctx.fillText('R', -20, 0);
            }
          }

          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : (t.subtype === 'counter_coil' ? '#0891b2' : '#d97706');`;

content = content.replace(target2, repl2);

const target3 = `ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText(t.labels[4] || (t.subtype === 'impulse_coil' ? 'P' : 'K'), 0, 6);
          ctx.restore();
        }`;

const repl3 = `ctx.rotate((-t.rotation * Math.PI) / 2);
          const defaultLabel = t.subtype === 'impulse_coil' ? 'P' : (t.subtype === 'counter_coil' ? 'C' : 'K');
          ctx.fillText(t.labels[4] || defaultLabel, 0, t.subtype === 'counter_coil' ? -2 : 6);
          
          if (t.subtype === 'counter_coil') {
            const count = t.measureVal !== undefined ? t.measureVal : (t.value || 5);
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(count.toString(), 0, 12);
          }
          
          ctx.restore();
        }`;

content = content.replace(target3, repl3);

const initValueSearch = `const newT = new Tile(placementType, placementSubtype, (isTimerContact || isFlashCoil) ? 1000 : 0);`;
const initValueRepl = `const newT = new Tile(placementType, placementSubtype, (isTimerContact || isFlashCoil) ? 1000 : (isCounterCoil ? 5 : 0));`;
content = content.replace(initValueSearch, initValueRepl);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log("Patch 3 done!");
