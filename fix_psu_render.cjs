const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target = `    } else if (t.type === 'power') {
      if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {
        drawPin(0, 10);
        drawPin(2, 10);
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        
        ctx.fillStyle = '#06b6d4'; // Cyan for labels
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (t.subtype === 'psu_left') {
          // Left half of PSU box
          ctx.strokeRect(-16, -16, 36, 32);
          ctx.beginPath();
          ctx.moveTo(-16, 16);
          ctx.lineTo(20, 0);
          ctx.stroke();
          
          ctx.fillText('L', -5, -24);
          ctx.fillText('+', -5, 24);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('~', -2, -4);
        } else {
          // Right half of PSU box
          ctx.strokeRect(-20, -16, 36, 32);
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(16, -16);
          ctx.stroke();
          
          ctx.fillText('N', 5, -24);
          ctx.fillText('-', 5, 24);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('=', -2, 6);
        }
      } else if (t.subtype === 'dc24') {`;

const rep = `    } else if (t.type === 'power') {
      if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {
        drawPin(0, 10);
        drawPin(2, 10);
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;

        if (t.subtype === 'psu_left') {
          // Left tile: draws the entire unified box
          ctx.beginPath();
          ctx.moveTo(0, -40); ctx.lineTo(0, -20);
          ctx.moveTo(0, 40); ctx.lineTo(0, 20);
          ctx.stroke();
          
          ctx.fillStyle = '#1e293b'; // Solid dark background for the box
          ctx.fillRect(-20, -20, 120, 40);
          ctx.strokeRect(-20, -20, 120, 40);
          
          // Diagonal line in the middle
          ctx.beginPath();
          ctx.moveTo(20, 20);
          ctx.lineTo(60, -20);
          ctx.stroke();
          
          // Labels
          ctx.fillStyle = '#06b6d4'; // Cyan for labels
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.fillText('L', -10, -10);
          ctx.fillText('+', -10, 10);
          
          ctx.fillText('N', 90, -10);
          ctx.fillText('-', 90, 10);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('~', 30, -5);
          ctx.fillText('=', 50, 7);
        } else {
          // Right tile: only draws the pins and connecting wires
          ctx.beginPath();
          ctx.moveTo(0, -40); ctx.lineTo(0, -20);
          ctx.moveTo(0, 40); ctx.lineTo(0, 20);
          ctx.stroke();
        }
      } else if (t.subtype === 'dc24') {`;

content = content.replace(target, rep);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
