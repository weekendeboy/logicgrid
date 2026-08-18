const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

content = content.replace(
  /\} else if \(t\.type === 'switch' && \(t\.subtype === '4way_top' \|\| t\.subtype === '4way_bot'\)\) \{\s*const st = t\.state \|\| 0;/g,
  "} else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {\n        const isActuated = t.isActive || t.isPhysicallyPushed;\n        const st = isActuated ? 1 : 0;"
);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
