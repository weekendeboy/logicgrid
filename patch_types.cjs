const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const regex = /'w-1-1' \| 'w-1-2' \| 'w-1-3'/;
const replacement = "'w-1-1' | 'w-1-2' | 'w-1-3' | 'w-1-4' |\n  'w-2-1' | 'w-2-2' | 'w-2-3' | 'w-2-4' |\n  'w-3-1' | 'w-3-2' | 'w-3-3' |\n  'w-4-1' | 'w-4-2' | 'w-4-3' | 'w-4-4' |\n  'w-5-1' | 'w-5-2'";

content = content.replace(regex, replacement);
fs.writeFileSync('src/types.ts', content);
console.log('done');
