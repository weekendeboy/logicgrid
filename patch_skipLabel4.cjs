const fs = require('fs');
const content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const target1 = `                    t.subtype === 'mc_no_2' ||
                    t.subtype === 'mc_no_3' ||
                    t.subtype === 'ol_2p' ||
                    t.subtype === 'ol_3p' ||`;

const replaced = content.replace(target1, '');

if (content === replaced) {
  console.log('Failed to replace target1');
} else {
  fs.writeFileSync('src/components/CanvasWorkspace.tsx', replaced);
  console.log('Successfully patched CanvasWorkspace.tsx skipLabel4');
}
