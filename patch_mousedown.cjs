const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target1 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn'))) {`;
const rep1 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {`;
content = content.replace(target1, rep1);

const target2 = `                  if (
                    ot &&
                    (ot.type === 'btn' || (ot.type === 'logic' && ot.subtype === 'pushbtn')) &&
                    ot.labels[4] === lbl
                  ) {`;
const rep2 = `                  if (
                    ot &&
                    (ot.type === 'btn' || (ot.type === 'logic' && ot.subtype === 'pushbtn') || (ot.type === 'switch' && (ot.subtype === '4way_top' || ot.subtype === '4way_bot'))) &&
                    ot.labels[4] === lbl
                  ) {`;
content = content.replace(target2, rep2);

const target3 = `      } else if (t && t.type === 'switch') {
        if (t.subtype === '4way_top' || t.subtype === '4way_bot') {
          const ns = (t.state || 0) === 0 ? 1 : 0;
          setGrid((prev) =>
            prev.map((row) =>
              row.map((c) => (c && c.groupId === t.groupId ? Object.assign(new Tile(), c, { state: ns }) : c))
            )
          );
        } else if (t.subtype === 'sel13') {`;
const rep3 = `      } else if (t && t.type === 'switch') {
        if (t.subtype === 'sel13') {`;
content = content.replace(target3, rep3);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
