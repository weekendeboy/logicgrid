const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const placeTarget = `      } else if (placementType === 'switch' && placementSubtype === '4way') {`;
const placeRep = `      } else if (placementType === 'power' && placementSubtype === 'psu') {
        if (
          mousePos.x + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y][mousePos.x + 1]
        ) {
          const gid = 'psu_' + Date.now();
          const left = new Tile('power', 'psu_left');
          left.groupId = gid;
          const right = new Tile('power', 'psu_right');
          right.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = left;
            next[mousePos.y][mousePos.x + 1] = right;
            return next;
          });
        }
` + placeTarget;

content = content.replace(placeTarget, placeRep);

const psuRenderCheckTarget = `      if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {`;
if (!content.includes(psuRenderCheckTarget)) {
  console.log("WAIT, PSU RENDER NOT FOUND.");
}

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
