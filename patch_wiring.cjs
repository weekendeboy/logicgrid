const fs = require('fs');
let content = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

const target = `        if (t && t.type === 'wire') {
          if (t.subtype === 'l' || t.subtype === 'h') lNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'n' || t.subtype === 'g') nNets.add(netMap[y][x][(2 + t.rotation) % 4]);
        }`;

const replacement = `        if (t && t.type === 'wire') {
          if (t.subtype === 'l' || t.subtype === 'h') lNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'n' || t.subtype === 'g') nNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'plus') plus24VNets.add(netMap[y][x][(2 + t.rotation) % 4]);
          if (t.subtype === 'minus' || t.subtype === 'ground') zeroVNets.add(netMap[y][x][(2 + t.rotation) % 4]);
        }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/engine/WiringEngine.ts', content);
