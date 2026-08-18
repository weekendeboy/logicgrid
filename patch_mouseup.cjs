const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target1 = `        row.map((c) =>
          c && (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn'))
            ? Object.assign(new Tile(), c, { isActive: false })
            : c
        )`;
const rep1 = `        row.map((c) =>
          c && (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
            ? Object.assign(new Tile(), c, { isActive: false })
            : c
        )`;

content = content.replace(target1, rep1);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
