const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.labels[4] || title, 0, -14);`;

const replacementStr = `          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.labels[4] || title, 0, t.subtype === 'flash_coil' ? -2 : -14);`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
