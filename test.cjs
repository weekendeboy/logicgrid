const fs = require('fs');

let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');
const target = `                    t.subtype === 'plc_pls' ||
                    t.subtype === 'plc_plf' ||
                    t.subtype === 'out' ||
                    t.subtype === 'plc_out')
                ) {`;
console.log(content.includes(target));
