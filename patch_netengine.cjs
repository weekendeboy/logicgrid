const fs = require('fs');
let content = fs.readFileSync('src/engine/NetEngine.ts', 'utf8');

const target = `    else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g') groups = [[2]];`;

const replacement = `    else if (t.subtype === 'l' || t.subtype === 'n' || t.subtype === 'h' || t.subtype === 'g' || t.subtype === 'plus' || t.subtype === 'minus' || t.subtype === 'ground') groups = [[2]];`;

content = content.replace(target, replacement);
fs.writeFileSync('src/engine/NetEngine.ts', content);
