const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const targetStr = `  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {`;

const replacementStr = `  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = grid[y][x];
      if (t && t.type === 'switch' && t.subtype === '4way_top') {
        const bot = y + 1 < h ? grid[y + 1][x] : null;
        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = t.state || 0;
          if (st === 0) {
            // Cross connection: Top-Left (3) to Bot-Right (1), Top-Right (1) to Bot-Left (3)
            ds.union(\`\${x},\${y},3\`, \`\${x},\${y+1},1\`);
            ds.union(\`\${x},\${y},1\`, \`\${x},\${y+1},3\`);
          }
        }
      }

      for (let d = 0; d < 4; d++) {`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/engine/NetEngine.ts', content);
