const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `      } else if (t && t.type === 'switch' && t.subtype === 'sel13') {
        const st = ((t.state || 0) + 1) % 2;
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[mousePos.y][mousePos.x]) {
            next[mousePos.y][mousePos.x]!.state = st;
          }
          return next;
        });`;

const replacementStr = `      } else if (t && t.type === 'switch') {
        if (t.subtype === '4way_top' || t.subtype === '4way_bot') {
          const ns = (t.state || 0) === 0 ? 1 : 0;
          setGrid((prev) =>
            prev.map((row) =>
              row.map((c) => (c && c.groupId === t.groupId ? Object.assign(new Tile(), c, { state: ns }) : c))
            )
          );
        } else if (t.subtype === 'sel13') {
          const st = ((t.state || 0) + 1) % 2;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (next[mousePos.y][mousePos.x]) {
              next[mousePos.y][mousePos.x]!.state = st;
            }
            return next;
          });
        }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
