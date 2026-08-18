const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `                    t.subtype === 'coil' ||
                    t.subtype.startsWith('ton_') ||
                    t.subtype.startsWith('tof_') ||
                    t.subtype === 'plc_out')`;

const replacementStr = `                    t.subtype === 'coil' ||
                    t.subtype.startsWith('ton_') ||
                    t.subtype.startsWith('tof_') ||
                    t.subtype === 'flash_coil' ||
                    t.subtype === 'impulse_coil' ||
                    t.subtype === 'plc_out')`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
