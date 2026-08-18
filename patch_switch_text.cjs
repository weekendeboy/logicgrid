const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr1 = `          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || 'SW', 0, -20);`;
          
const targetStr2 = `          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || '4-WAY', 0, 36);`;

content = content.replace(targetStr1, '');
content = content.replace(targetStr2, '');
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
