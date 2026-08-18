const fs = require('fs');
let content = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

const psuSimTarget = `        if (t && t.type === 'power' && t.subtype === 'dc24') {
          plus24VNets.add(netMap[y][x][(0 + t.rotation) % 4]); // top
          zeroVNets.add(netMap[y][x][(2 + t.rotation) % 4]); // bottom
        }`;

const psuSimRep = psuSimTarget + `
        if (t && t.type === 'power' && t.subtype === 'psu_left') {
          const rightTile = x + 1 < grid[0].length ? grid[y][x + 1] : null;
          if (rightTile && rightTile.type === 'power' && rightTile.subtype === 'psu_right' && rightTile.groupId === t.groupId) {
            const lNet = netMap[y][x][(0 + t.rotation) % 4];
            const nNet = netMap[y][x + 1][(0 + rightTile.rotation) % 4];
            const isPowered = lNet > 0 && nNet > 0 && lNet !== nNet && lNets.has(lNet) && nNets.has(nNet);
            t.isPowered = isPowered;
            rightTile.isPowered = isPowered;
            if (isPowered) {
              const p24Net = netMap[y][x][(2 + t.rotation) % 4];
              const z0Net = netMap[y][x + 1][(2 + rightTile.rotation) % 4];
              if (p24Net > 0) plus24VNets.add(p24Net);
              if (z0Net > 0) zeroVNets.add(z0Net);
            }
          }
        }`;

content = content.replace(psuSimTarget, psuSimRep);
fs.writeFileSync('src/engine/WiringEngine.ts', content);
