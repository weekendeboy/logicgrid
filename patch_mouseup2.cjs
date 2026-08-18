const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

content = content.replace(
  /c && \(c\.type === 'btn' \|\| \(c\.type === 'logic' && c\.subtype === 'pushbtn'\)\)/g,
  "c && (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))"
);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
