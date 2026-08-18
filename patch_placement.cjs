const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const ghostTargetStr = `          } else if (pType === 'breaker' && pSubtype === 'mcb') {
            const t1 = new Tile('breaker', 'mcb');
            const t2 = new Tile('breaker', 'mcb');`;

const ghostReplacementStr = `          } else if (pType === 'switch' && pSubtype === '4way') {
            const top = new Tile('switch', '4way_top');
            const bot = new Tile('switch', '4way_bot');
            ghostTiles.push({ x: mousePos.x, y: mousePos.y, tile: top });
            ghostTiles.push({ x: mousePos.x, y: mousePos.y + 1, tile: bot });
          } else if (pType === 'breaker' && pSubtype === 'mcb') {
            const t1 = new Tile('breaker', 'mcb');
            const t2 = new Tile('breaker', 'mcb');`;

content = content.replace(ghostTargetStr, ghostReplacementStr);

const placementTargetStr = `      } else if (placementType === 'breaker' && placementSubtype === 'mcb') {
        if (
          mousePos.x + 1 < gridSize &&`;

const placementReplacementStr = `      } else if (placementType === 'switch' && placementSubtype === '4way') {
        if (
          mousePos.y + 1 < gridSize &&
          !grid[mousePos.y][mousePos.x] &&
          !grid[mousePos.y + 1][mousePos.x]
        ) {
          const gid = 'sw4_' + Date.now();
          const top = new Tile('switch', '4way_top');
          top.groupId = gid;
          const bot = new Tile('switch', '4way_bot');
          bot.groupId = gid;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[mousePos.y][mousePos.x] = top;
            next[mousePos.y + 1][mousePos.x] = bot;
            return next;
          });
        }
      } else if (placementType === 'breaker' && placementSubtype === 'mcb') {
        if (
          mousePos.x + 1 < gridSize &&`;

content = content.replace(placementTargetStr, placementReplacementStr);

const toggleTargetStr = `      } else if (t && t.type === 'switch') {
        let ns = (t.state || 0) + 1;
        if (t.subtype === 'sel13' && ns > 1) ns = 0;
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[py][px] = Object.assign(new Tile(), next[py][px], { state: ns });
          return next;
        });
      } else if (t && t.type === 'pneumatic' && t.subtype === 'valve_52') {`;

const toggleReplacementStr = `      } else if (t && t.type === 'switch') {
        if (t.subtype === '4way_top' || t.subtype === '4way_bot') {
          const ns = (t.state || 0) === 0 ? 1 : 0;
          setGrid((prev) =>
            prev.map((row) =>
              row.map((c) => (c && c.groupId === t.groupId ? Object.assign(new Tile(), c, { state: ns }) : c))
            )
          );
        } else {
          let ns = (t.state || 0) + 1;
          if (t.subtype === 'sel13' && ns > 1) ns = 0;
          setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[py][px] = Object.assign(new Tile(), next[py][px], { state: ns });
            return next;
          });
        }
      } else if (t && t.type === 'pneumatic' && t.subtype === 'valve_52') {`;

content = content.replace(toggleTargetStr, toggleReplacementStr);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
