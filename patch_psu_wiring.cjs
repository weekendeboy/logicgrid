const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf-8');

const anchor = `        if (t && t.type === 'power' && t.subtype === 'psu_left') {
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

const replacement = `        if (t && t.type === 'power' && t.subtype === 'psu_left') {
          let rx = x, ry = y;
          if (t.rotation === 0) rx = x + 1;
          else if (t.rotation === 1) ry = y + 1;
          else if (t.rotation === 2) rx = x - 1;
          else if (t.rotation === 3) ry = y - 1;
          const rightTile = (ry >= 0 && ry < grid.length && rx >= 0 && rx < grid[0].length) ? grid[ry][rx] : null;
          if (rightTile && rightTile.type === 'power' && rightTile.subtype === 'psu_right' && rightTile.groupId === t.groupId) {
            const lNet = netMap[y][x][(0 + t.rotation) % 4];
            const nNet = netMap[ry][rx][(0 + rightTile.rotation) % 4];
            const isPowered = lNet > 0 && nNet > 0 && lNet !== nNet && lNets.has(lNet) && nNets.has(nNet);
            t.isPowered = isPowered;
            rightTile.isPowered = isPowered;
            if (isPowered) {
              const p24Net = netMap[y][x][(2 + t.rotation) % 4];
              const z0Net = netMap[ry][rx][(2 + rightTile.rotation) % 4];
              if (p24Net > 0) plus24VNets.add(p24Net);
              if (z0Net > 0) zeroVNets.add(z0Net);
            }
          }
        }`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
    fs.writeFileSync('src/engine/WiringEngine.ts', code);
    console.log('Patch applied successfully');
} else {
    console.log('Failed to find anchor');
}
