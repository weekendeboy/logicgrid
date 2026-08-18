const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');
content = content.replace(/[\ \t]*\/\/ Add a visible body box\s*ctx\.fillStyle = '#1e293b';\s*ctx\.beginPath\(\);\s*if \(ctx\.roundRect\) ctx\.roundRect\(-24, -24, 48, 48, 6\);\s*else ctx\.rect\(-24, -24, 48, 48\);\s*ctx\.fill\(\);\s*ctx\.strokeStyle = '#334155';\s*ctx\.lineWidth = 2;\s*ctx\.stroke\(\);/g, '');
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
