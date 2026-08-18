const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

content = content.replace(
  /if \(t && \(t\.type === 'btn' \|\| \(t\.type === 'logic' && t\.subtype === 'pushbtn'\)\)\) \{/g,
  "if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {"
);

content = content.replace(
  /\(ot\.type === 'btn' \|\| \(ot\.type === 'logic' && ot\.subtype === 'pushbtn'\)\) &&/g,
  "(ot.type === 'btn' || (ot.type === 'logic' && ot.subtype === 'pushbtn') || (ot.type === 'switch' && (ot.subtype === '4way_top' || ot.subtype === '4way_bot'))) &&"
);

const switchTarget = `      } else if (t && t.type === 'switch') {
        if (t.subtype === '4way_top' || t.subtype === '4way_bot') {
          const ns = (t.state || 0) === 0 ? 1 : 0;
          setGrid((prev) =>
            prev.map((row) =>
              row.map((c) => (c && c.groupId === t.groupId ? Object.assign(new Tile(), c, { state: ns }) : c))
            )
          );
        } else if (t.subtype === 'sel13') {`;
        
const switchRep = `      } else if (t && t.type === 'switch') {
        if (t.subtype === 'sel13') {`;
        
content = content.replace(switchTarget, switchRep);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
