const fs = require('fs');

let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

// The issue was I missed a closing brace when I replaced the block.
// The original `if (isNc)` had `} else if (isNc) { ... }`
// The replacement had `} if (isNc) { ... }` which is fine, but I replaced `ctx.stroke();` at the end with `ctx.stroke(); ... }` which is NOT fine.

// Let's replace the block I added with the properly closed one.

content = content.replace(/};\n};\n$/, '};\n'); // Undo last bad fix

const badEnd = `        if (isNc) {
          // NC contact
          ctx.beginPath();
          if (isTon || isTof) {
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 4);
            ctx.lineTo(isClosed ? 0 : 10, -15);
          } else {
            ctx.moveTo(0, 12);
            ctx.lineTo(isClosed ? 0 : 10, -12);
          }
          ctx.stroke();
          
          // The horizontal green line
          if (!isActuated) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 0);
            ctx.stroke();
          }
        }`;

// The problem might be the start. The original started with `} else if (isNc) {`
// The block I replaced was `        } else if (isNc) {` up to `ctx.stroke();`
// Which was missing the closing bracket of `if (isNc)`.
// By appending `}`, I unbalanced it by +1 closing bracket.

const correctEnd = `        if (isNc) {
          // NC contact
          ctx.beginPath();
          if (isTon || isTof) {
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 4);
            ctx.lineTo(isClosed ? 0 : 10, -15);
          } else {
            ctx.moveTo(0, 12);
            ctx.lineTo(isClosed ? 0 : 10, -12);
          }
          ctx.stroke();
          
          // The horizontal green line
          if (!isActuated) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 0);
            ctx.stroke();
          }
        `; // Note: NO trailing brace here!

content = content.replace(badEnd, correctEnd);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log("Patched successfully");
