const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const anchor = `      if (t.subtype === '3phase_r' || t.subtype === '3phase_s' || t.subtype === '3phase_t') {
        drawPin(2, 10); // Connection pin at bottom

        if (t.subtype === '3phase_r') {
          // Draw the main unified box
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-20, -20, 200, 40);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.strokeRect(-20, -20, 200, 40);

          // Lines for connection
          ctx.beginPath();
          ctx.moveTo(0, 20); ctx.lineTo(0, 40);
          ctx.stroke();

          // R label
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('R', 0, 0);
        } else if (t.subtype === '3phase_s') {
          ctx.beginPath();
          ctx.moveTo(0, 20); ctx.lineTo(0, 40);
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', 0, 0);
        } else if (t.subtype === '3phase_t') {
          ctx.beginPath();
          ctx.moveTo(0, 20); ctx.lineTo(0, 40);
          ctx.stroke();
          ctx.fillStyle = '#3b82f6';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('T', 0, 0);
        }
      } else if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {`;

const replacement = `      if (t.subtype === '3phase_r' || t.subtype === '3phase_s' || t.subtype === '3phase_t') {
        drawPin(2, 10); // Connection pin at bottom

        if (t.subtype === '3phase_r') {
          // Draw the main unified box
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-20, -20, 200, 40);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.strokeRect(-20, -20, 200, 40);

          // Lines for connection
          ctx.beginPath();
          ctx.moveTo(0, 20); ctx.lineTo(0, 40);
          ctx.stroke();

          // R label
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText('R', 0, 0);
          ctx.restore();
          
          // S label (drawn by R)
          ctx.fillStyle = '#f59e0b';
          ctx.save();
          ctx.translate(80, 0);
          ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText('S', 0, 0);
          ctx.restore();

          // T label (drawn by R)
          ctx.fillStyle = '#3b82f6';
          ctx.save();
          ctx.translate(160, 0);
          ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText('T', 0, 0);
          ctx.restore();
        } else {
          // 3phase_s and 3phase_t only draw their connecting pins
          ctx.beginPath();
          ctx.moveTo(0, 20); ctx.lineTo(0, 40);
          ctx.stroke();
        }
      } else if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
    fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
    console.log('Patch applied successfully');
} else {
    console.log('Failed to find anchor');
}
