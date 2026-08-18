const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const target1 = `        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;
          if (st === 0) {
            // Cross connection: Top-Left (3) to Bot-Right (1), Top-Right (1) to Bot-Left (3)
            ds.union(\`\${x},\${y},3\`, \`\${x},\${y+1},1\`);
            ds.union(\`\${x},\${y},1\`, \`\${x},\${y+1},3\`);
          }
        }`;

const rep1 = `        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;
          if (st === 0) {
            // Cross connection: Top-Left (3) to Bot-Right (1), Top-Right (1) to Bot-Left (3)
            // But user says: 1(Top-Left) to 4(Bot-Right), 2(Bot-Left) to 3(Top-Right)
            ds.union(\`\${x},\${y},3\`, \`\${x},\${y+1},1\`);
            ds.union(\`\${x},\${y},1\`, \`\${x},\${y+1},3\`);
          } else {
            // Parallel connection: Top-Left (3) to Bot-Left (3), Top-Right (1) to Bot-Right (1)
            ds.union(\`\${x},\${y},3\`, \`\${x},\${y+1},3\`);
            ds.union(\`\${x},\${y},1\`, \`\${x},\${y+1},1\`);
          }
        }`;

content = content.replace(target1, rep1);

fs.writeFileSync('src/engine/NetEngine.ts', content);
