const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

// 1. Remove the old specific 3e_relay block and add to the big if
const oldIfBlock = `                  if (t.subtype === '3e_relay') {
                    const isLeft = activeGrid[y]?.[x - 1]?.groupId !== t.groupId;
                    const isRight = activeGrid[y]?.[x + 1]?.groupId !== t.groupId;
                    const isMiddle = !isLeft && !isRight;
                    if (!isMiddle) skipLabel4 = true;
                  }`;

code = code.replace(oldIfBlock, '');
code = code.replace("t.subtype === 'ol_3p' ||", "t.subtype === 'ol_3p' ||\n                    t.subtype === '3e_relay' ||");

// 2. Add label to the isMiddle rendering
const oldIsMiddle = `        } else if (isMiddle) {
          ctx.fillText('3E', 0, 0);
          ctx.fillText('V', 0, -10);
          ctx.fillText('C-', 0, 10);
        }`;

const newIsMiddle = `        } else if (isMiddle) {
          ctx.fillText('3E', 0, 0);
          ctx.fillText('V', 0, -10);
          ctx.fillText('C-', 0, 10);
          if (t.labels && t.labels[4]) {
            ctx.fillStyle = '#06b6d4'; // Cyan for label
            ctx.fillText(t.labels[4], 0, 32);
            ctx.fillStyle = '#f87171'; // Restore red for other things just in case
          }
        }`;

code = code.replace(oldIsMiddle, newIsMiddle);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
console.log("Patched 3e_relay successfully");
