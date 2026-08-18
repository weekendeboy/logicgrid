const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const target1 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          const curr = next[my][mx];
          if (curr) {
            curr.isActive = true;
            if (curr.labels && curr.labels[4]) {
              const lbl = curr.labels[4];
              for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                  const ot = next[r][c];
                  if (
                    ot &&
                    (ot.type === 'btn' || (ot.type === 'logic' && ot.subtype === 'pushbtn') || (ot.type === 'switch' && (ot.subtype === '4way_top' || ot.subtype === '4way_bot'))) &&
                    ot.labels[4] === lbl
                  ) {
                    ot.isActive = true;
                  }
                }
              }
            }
          }
          return next;
        });
      }`;

const rep1 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const curr = prev[my][mx];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
              if (c && curr.groupId && c.groupId === curr.groupId) return Object.assign(new Tile(), c, { isActive: true });
              if (
                c && curr.labels && curr.labels[4] &&
                c.labels && c.labels[4] === curr.labels[4] &&
                (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
              ) {
                return Object.assign(new Tile(), c, { isActive: true });
              }
              return c;
            })
          );
        });
      }`;

content = content.replace(target1, rep1);

const target2 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          const curr = next[mousePos.y][mousePos.x];
          if (curr) {
            curr.isActive = true;
            if (curr.labels && curr.labels[4]) {
              const lbl = curr.labels[4];
              for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                  const ot = next[r][c];
                  if (
                    ot &&
                    (ot.type === 'btn' || (ot.type === 'logic' && ot.subtype === 'pushbtn') || (ot.type === 'switch' && (ot.subtype === '4way_top' || ot.subtype === '4way_bot'))) &&
                    ot.labels[4] === lbl
                  ) {
                    ot.isActive = true;
                  }
                }
              }
            }
          }
          return next;
        });
      }`;

const rep2 = `      if (t && (t.type === 'btn' || (t.type === 'logic' && t.subtype === 'pushbtn') || (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')))) {
        setGrid((prev) => {
          const curr = prev[mousePos.y][mousePos.x];
          if (!curr) return prev;
          return prev.map((row) =>
            row.map((c) => {
              if (c === curr) return Object.assign(new Tile(), c, { isActive: true });
              if (c && curr.groupId && c.groupId === curr.groupId) return Object.assign(new Tile(), c, { isActive: true });
              if (
                c && curr.labels && curr.labels[4] &&
                c.labels && c.labels[4] === curr.labels[4] &&
                (c.type === 'btn' || (c.type === 'logic' && c.subtype === 'pushbtn') || (c.type === 'switch' && (c.subtype === '4way_top' || c.subtype === '4way_bot')))
              ) {
                return Object.assign(new Tile(), c, { isActive: true });
              }
              return c;
            })
          );
        });
      }`;

content = content.replace(target2, rep2);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
