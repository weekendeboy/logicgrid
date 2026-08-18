const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target = `      } else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g') {
        const isHigh = t.subtype === 'l' || t.subtype === 'h';
        const labelText = t.subtype === 'h' ? 'H' : t.subtype === 'g' ? 'G' : t.subtype.toUpperCase();
        line(0, 0, 0, 40, c[2]);

        ctx.fillStyle = isHigh ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(labelText, 0, -2);
      }`;

const replacement = `      } else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g' || t.subtype === 'plus' || t.subtype === 'minus' || t.subtype === 'ground') {
        line(0, 0, 0, 40, c[2]);

        if (t.subtype === 'ground') {
          ctx.strokeStyle = c[2] || '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, -10);
          ctx.moveTo(-12, -10); ctx.lineTo(12, -10);
          ctx.moveTo(-8, -16); ctx.lineTo(8, -16);
          ctx.moveTo(-4, -22); ctx.lineTo(4, -22);
          ctx.stroke();
          
          ctx.fillStyle = c[2] || '#94a3b8';
          ctx.fillRect(-3, -3, 6, 6);
        } else {
          const isHigh = t.subtype === 'l' || t.subtype === 'h' || t.subtype === 'plus';
          const isOrange = t.subtype === 'plus';
          const isIndigo = t.subtype === 'minus';
          
          let labelText = t.subtype.toUpperCase();
          if (t.subtype === 'h') labelText = 'H';
          if (t.subtype === 'g') labelText = 'G';
          if (t.subtype === 'plus') labelText = '+';
          if (t.subtype === 'minus') labelText = '-';
          
          let bgColor = isHigh ? '#ef4444' : '#3b82f6';
          if (isOrange) bgColor = '#f97316';
          if (isIndigo) bgColor = '#6366f1';

          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.arc(0, -6, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(labelText, 0, -2);
        }
      }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
