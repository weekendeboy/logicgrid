const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

// 1. Add psu ghost tile placement
const psuGhostTarget = `          } else if (pType === 'switch' && pSubtype === '4way') {
            const top = new Tile('switch', '4way_top');
            const bot = new Tile('switch', '4way_bot');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: top });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y + 1, tile: bot });`;
const psuGhostRep = `          } else if (pType === 'power' && pSubtype === 'psu') {
            const left = new Tile('power', 'psu_left');
            const right = new Tile('power', 'psu_right');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: left });
            ghostTiles.push({ x: mousePos.x + 1, y: mousePos.y, tile: right });
` + psuGhostTarget;
content = content.replace(psuGhostTarget, psuGhostRep);

// 2. Add psu actual placement
const psuPlaceTarget = `        } else if (
          pType === 'switch' &&
          pSubtype === '4way' &&
          mousePos.y + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y + 1][mousePos.x]
        ) {`;
const psuPlaceRep = `        } else if (
          pType === 'power' &&
          pSubtype === 'psu' &&
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
          return;
` + psuPlaceTarget;
content = content.replace(psuPlaceTarget, psuPlaceRep);

// 3. Add psu rendering
const psuRenderTarget = `    } else if (t.type === 'power') {
      if (t.subtype === 'dc24') {`;
const psuRenderRep = `    } else if (t.type === 'power') {
      if (t.subtype === 'psu_left' || t.subtype === 'psu_right') {
        drawPin(0, 10);
        drawPin(2, 10);
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        
        ctx.fillStyle = '#06b6d4'; // Cyan for labels
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (t.subtype === 'psu_left') {
          // Left half of PSU box
          ctx.strokeRect(-16, -16, 36, 32);
          ctx.beginPath();
          ctx.moveTo(-16, 16);
          ctx.lineTo(20, 0);
          ctx.stroke();
          
          ctx.fillText('L', -5, -24);
          ctx.fillText('+', -5, 24);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('~', -2, -4);
        } else {
          // Right half of PSU box
          ctx.strokeRect(-20, -16, 36, 32);
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(16, -16);
          ctx.stroke();
          
          ctx.fillText('N', 5, -24);
          ctx.fillText('-', 5, 24);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 18px Arial';
          ctx.fillText('=', -2, 6);
        }
      } else if (t.subtype === 'dc24') {`;
content = content.replace(psuRenderTarget, psuRenderRep);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
