const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const searchPlacement = `        const newT = new Tile(placementType, placementSubtype, (isTimerContact || isFlashCoil) ? 1000 : 0);
        newT.rotation = placementRotation;`;

const replacePlacement = `        let initValue = (isTimerContact || isFlashCoil) ? 1000 : 0;
        if (isCounterCoil) initValue = 5;
        const newT = new Tile(placementType, placementSubtype, initValue);
        newT.rotation = placementRotation;`;

content = content.replace(searchPlacement, replacePlacement);

const searchDraw = `          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = color;
          ctx.fillText(displayStr, 0, 15);
          ctx.restore();
        } else {
          drawPin(0, 16);
          drawPin(2, 16);

          if (t.subtype === 'impulse_coil') {
            drawPin(3, 16);
            
            // Draw an 'R' label near the reset pin
            ctx.fillStyle = '#be123c';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('R', -20, 0);
          }

          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.save();
          ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText(t.labels[4] || (t.subtype === 'impulse_coil' ? 'P' : 'K'), 0, 6);
          ctx.restore();
        }`;

const replaceDraw = `          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = color;
          ctx.fillText(displayStr, 0, 15);
          ctx.restore();
        } else {
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
            drawPin(2, 16);

            if (t.subtype === 'impulse_coil') {
              drawPin(3, 16);
              
              // Draw an 'R' label near the reset pin
              ctx.fillStyle = '#be123c';
              ctx.font = '10px monospace';
              ctx.textAlign = 'right';
              ctx.textBaseline = 'middle';
              ctx.fillText('R', -20, 0);
            }
          }

          ctx.fillStyle = t.subtype === 'impulse_coil' ? '#be123c' : (t.subtype === 'counter_coil' ? '#0891b2' : '#d97706');
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.save();
          ctx.rotate((-t.rotation * Math.PI) / 2);
          const defaultLabel = t.subtype === 'impulse_coil' ? 'P' : (t.subtype === 'counter_coil' ? 'C' : 'K');
          ctx.fillText(t.labels[4] || defaultLabel, 0, t.subtype === 'counter_coil' ? 2 : 6);
          
          if (t.subtype === 'counter_coil') {
            const count = t.measureVal !== undefined ? t.measureVal : (t.value || 0);
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(count.toString(), 0, 16);
          }
          
          ctx.restore();
        }`;

content = content.replace(searchDraw, replaceDraw);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log("Fix canvas done.");
