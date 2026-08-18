const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `      } else if (t.type === 'switch' && t.subtype === 'sel13') {`;

const replacementStr = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = t.state || 0;
        drawPin(1, 10);
        drawPin(3, 10);
        
        if (t.subtype === '4way_top') {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(-10, 0);
          ctx.lineTo(-10, 20);
          ctx.moveTo(30, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(10, 20);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, 17, 6, 6);
          ctx.fillRect(7, 17, 6, 6);

          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          if (st === 0) {
            ctx.moveTo(0, 40);
            ctx.lineTo(10, 20);
            ctx.moveTo(0, 40);
            ctx.lineTo(-10, 20);
          } else {
            ctx.moveTo(-10, 40);
            ctx.lineTo(-10, 20);
            ctx.moveTo(10, 40);
            ctx.lineTo(10, 20);
          }
          ctx.stroke();

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.setLineDash([4, 2]);
          if (st === 0) {
             ctx.moveTo(-25, 40);
             ctx.lineTo(0, 40);
          } else {
             ctx.moveTo(-15, 40);
             ctx.lineTo(-10, 40);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.beginPath();
          if (st === 0) {
             ctx.moveTo(-25, 30);
             ctx.lineTo(-30, 30);
             ctx.lineTo(-30, 50);
             ctx.lineTo(-25, 50);
          } else {
             ctx.moveTo(-15, 30);
             ctx.lineTo(-20, 30);
             ctx.lineTo(-20, 50);
             ctx.lineTo(-15, 50);
          }
          ctx.stroke();
          
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || 'SW', 0, -20);
        } else {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(-10, 0);
          ctx.lineTo(-10, -20);
          ctx.moveTo(30, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(10, -20);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, -23, 6, 6);
          ctx.fillRect(7, -23, 6, 6);

          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          if (st === 0) {
            ctx.moveTo(-10, -20);
            ctx.lineTo(0, -40);
            ctx.moveTo(10, -20);
            ctx.lineTo(0, -40);
          } else {
            ctx.moveTo(-10, -20);
            ctx.lineTo(-10, -40);
            ctx.moveTo(10, -20);
            ctx.lineTo(10, -40);
          }
          ctx.stroke();
          
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t.labels[4] || '4-WAY', 0, 36);
        }
      } else if (t.type === 'switch' && t.subtype === 'sel13') {`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
