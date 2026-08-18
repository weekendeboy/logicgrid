const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = t.state || 0;`;

const repStr = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const isActuated = t.isActive || t.isPhysicallyPushed;
        const st = isActuated ? 1 : 0;`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
