const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStrTop = `          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, 17, 6, 6);
          ctx.fillRect(7, 17, 6, 6);`;

const repStrTop = targetStrTop + `
          ctx.fillStyle = '#10b981'; // Emerald 500 for numbers
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('1', -5, 20);
          ctx.fillText('3', 15, 20);`;

content = content.replace(targetStrTop, repStrTop);

const targetStrBot = `          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, -23, 6, 6);
          ctx.fillRect(7, -23, 6, 6);`;

const repStrBot = targetStrBot + `
          ctx.fillStyle = '#10b981'; // Emerald 500
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('2', -5, -17);
          ctx.fillText('4', 15, -17);`;

content = content.replace(targetStrBot, repStrBot);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
