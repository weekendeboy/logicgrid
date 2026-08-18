const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        drawPin(0, 16);
        drawPin(1, 16);
        drawPin(2, 16);

        // Add a visible body box
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-24, -24, 48, 48, 6);
        else ctx.rect(-24, -24, 48, 48);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Terminals
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -13, 6, 6); // Top
        ctx.fillRect(7, -3, 6, 6);  // Right
        ctx.fillRect(-3, 7, 6, 6);  // Bottom

        // Wires to terminals
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Top wire
        ctx.moveTo(0, -24);
        ctx.lineTo(0, -10);
        // Right wire
        ctx.moveTo(24, 0);
        ctx.lineTo(10, 0);
        // Bottom wire
        ctx.moveTo(0, 24);
        ctx.lineTo(0, 10);
        ctx.stroke();
        
        const st = t.state || 0;

        // Switch Arm
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 10); // Pivot
        if (st === 0) {
          ctx.lineTo(-6, -10); // Connects to top left
        } else {
          ctx.lineTo(10, 6); // Connects to right bottom
        }
        ctx.stroke();

        // Top terminal tick
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, -10);
        ctx.stroke();

        // Right terminal tick
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(10, 8);
        ctx.stroke();

        // Actuator Symbol (Selector Switch)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        const dashStartX = st === 0 ? -3 : 5;
        const dashStartY = st === 0 ? 0 : 8;
        ctx.moveTo(dashStartX, dashStartY);
        ctx.lineTo(-12, dashStartY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(-12, dashStartY - 6);
        ctx.lineTo(-18, dashStartY - 6);
        ctx.lineTo(-18, dashStartY + 6);
        ctx.lineTo(-24, dashStartY + 6);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.labels[4] || 'SW', 0, 36);`;

const replacementStr = `      } else if (t.type === 'switch' && t.subtype === 'sel13') {
        drawPin(0, 10);
        drawPin(1, 10);
        drawPin(2, 10);

        // Terminals matching RightSidebar SVG
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -23, 6, 6); // Top
        ctx.fillRect(17, -3, 6, 6);  // Right
        ctx.fillRect(-3, 17, 6, 6);  // Bottom

        // Wires to terminals
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Top wire
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -20);
        ctx.lineTo(-8, -20);
        // Right wire
        ctx.moveTo(30, 0);
        ctx.lineTo(20, 0);
        // Bottom wire
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 20);
        ctx.stroke();
        
        const st = t.state || 0;

        // Switch Arm
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); // Pivot
        if (st === 0) {
          ctx.lineTo(-8, -20); // Connects to top left
        } else {
          ctx.lineTo(20, 0); // Connects to right
        }
        ctx.stroke();

        // Actuator Dashed Line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        if (st === 0) {
          ctx.moveTo(-25, 0);
          ctx.lineTo(-8, 0);
        } else {
          ctx.moveTo(-15, 10);
          ctx.lineTo(10, 10);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Actuator Handle
        ctx.beginPath();
        if (st === 0) {
          ctx.moveTo(-25, -10);
          ctx.lineTo(-30, -10);
          ctx.lineTo(-30, 10);
          ctx.lineTo(-35, 10);
        } else {
          ctx.moveTo(-15, 0);
          ctx.lineTo(-20, 0);
          ctx.lineTo(-20, 20);
          ctx.lineTo(-25, 20);
        }
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.labels[4] || 'SW', 0, 36);`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
