const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

content = content.replace(
  /\} else if \(t\.type === 'switch' && \(t\.subtype === '4way_top' \|\| t\.subtype === '4way_bot'\)\) \{\s*const st = t\.state \|\| 0;/g,
  "} else if (t.type === 'switch' && (t.subtype === '4way_top' || t.subtype === '4way_bot')) {\n        const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;"
);

content = content.replace(
  /if \(bot && bot\.type === 'switch' && bot\.subtype === '4way_bot' && t\.groupId === bot\.groupId\) \{\s*const st = t\.state \|\| 0;/g,
  "if (bot && bot.type === 'switch' && bot.subtype === '4way_bot' && t.groupId === bot.groupId) {\n          const st = (t.isActive || t.isPhysicallyPushed) ? 1 : 0;"
);

fs.writeFileSync('src/engine/NetEngine.ts', content);
