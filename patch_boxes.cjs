const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetBtnBox = `        // Add a visible body box
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-24, -24, 48, 48, 6);
        else ctx.rect(-24, -24, 48, 48);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();`;

// Replace all occurrences of this box
content = content.split(targetBtnBox).join('');
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
