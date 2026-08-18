const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const target1 = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = t.state || 0;`;

const rep1 = `      } else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {
        const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;`;

content = content.replace(target1, rep1);

const target2 = `        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = t.state || 0;`;

const rep2 = `        if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {
          const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;`;

content = content.replace(target2, rep2);

fs.writeFileSync('src/engine/NetEngine.ts', content);
