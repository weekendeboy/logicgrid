const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const sparkCode = `        if (t.isActive) {
           ctx.fillStyle = '#ef4444';
           ctx.font = '24px Arial';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.fillText('💥', 10, -10);
        }`;

code = code.replace(sparkCode, '');

// Also fix the OL1 text label bug for converter just in case
code = code.replace(`ctx.fillText(t.labels?.[4] || 'OL1', 0, 32);\n      } else if (t.type === 'protection' && t.subtype === 'fuse') {`, `if (posIndex === 1) ctx.fillText(t.labels?.[4] || 'CON', 0, 32);\n      } else if (t.type === 'protection' && t.subtype === 'fuse') {`);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
