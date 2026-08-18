const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target = `        if (t.subtype === '4way_top') {
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

          ctx.fillStyle = '#10b981'; // Emerald 500 for numbers
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('1', -5, 20);
          ctx.fillText('3', 15, 20);

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

          ctx.fillStyle = '#10b981'; // Emerald 500
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('2', -5, -17);
          ctx.fillText('4', 15, -17);

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
          
        }`;

const rep = `        if (t.subtype === '4way_top') {
          // Top tile: Pins at x=-20 and x=20
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-10, 0);
          ctx.moveTo(20, 0);
          ctx.lineTo(10, 0);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, -3, 6, 6);
          ctx.fillRect(7, -3, 6, 6);

          ctx.fillStyle = '#10b981'; // Emerald 500
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('1', -15, -8);
          ctx.fillText('3', 10, -8);

          // Switch arms: Draw from Top (y=0) to Bot (y=40)
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (st === 0) {
            // Cross: 1(-10, 0) to 4(10, 40) AND 3(10, 0) to 2(-10, 40)
            ctx.moveTo(-10, 0);
            ctx.lineTo(10, 40);
            ctx.moveTo(10, 0);
            ctx.lineTo(-10, 40);
          } else {
            // Parallel: 1(-10, 0) to 2(-10, 40) AND 3(10, 0) to 4(10, 40)
            ctx.moveTo(-10, 0);
            ctx.lineTo(-10, 40);
            ctx.moveTo(10, 0);
            ctx.lineTo(10, 40);
          }
          ctx.stroke();

          // Linkage indicator
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.setLineDash([4, 2]);
          if (st === 0) {
             ctx.moveTo(-25, 20);
             ctx.lineTo(0, 20);
          } else {
             ctx.moveTo(-25, 20);
             ctx.lineTo(-10, 20);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Button head
          ctx.beginPath();
          ctx.moveTo(-25, 10);
          ctx.lineTo(-30, 10);
          ctx.lineTo(-30, 30);
          ctx.lineTo(-25, 30);
          ctx.stroke();
        } else {
          // 4way_bot
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-10, 0);
          ctx.moveTo(20, 0);
          ctx.lineTo(10, 0);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-13, -3, 6, 6);
          ctx.fillRect(7, -3, 6, 6);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('2', -15, 12);
          ctx.fillText('4', 10, 12);
        }`;

content = content.replace(target, rep);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
