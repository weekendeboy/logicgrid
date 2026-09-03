const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const originalIf = `                if (
                  i === 4 &&
                  (t.type === 'plc' ||
                    t.type === 'terminal' ||
                    t.type === 'pneumatic' ||
                    t.type === 'switch' ||
                    t.type === 'load' ||
                    t.subtype === 'no' ||
                    t.subtype === 'toggle' ||
                    t.subtype === 'nc' ||
                    t.subtype === 'mc_no_2' ||
                    t.subtype === 'mc_no_3' ||
                    t.subtype === 'ol_2p' ||
                    t.subtype === 'ol_3p' ||
                    t.subtype === 'pls' ||
                    t.subtype === 'plf' ||
                    t.subtype === 'plc_a' ||
                    t.subtype === 'plc_b' ||
                    t.subtype === 'plc_p' ||
                    t.subtype === 'plc_n' ||
                    t.subtype === 'plc_pls' ||
                    t.subtype === 'plc_plf' ||
                    t.subtype === 'out' ||
                    t.subtype === 'con' ||
                    t.subtype === 'coil' ||
                    t.subtype === 'counter_coil' ||
                    t.subtype === 'ton' ||
                    t.subtype === 'tof' ||
                    t.subtype.startsWith('ton_') ||
                    t.subtype.startsWith('tof_') ||
                    t.subtype === 'flash_coil' ||
                    t.subtype === 'impulse_coil' ||
                    t.subtype === 'plc_out')
                ) {
                  continue;
                }`;

const newIf = `                let skipLabel4 = false;
                if (i === 4) {
                  if (t.type === 'plc' ||
                    t.type === 'terminal' ||
                    t.type === 'pneumatic' ||
                    t.type === 'switch' ||
                    t.type === 'load' ||
                    t.subtype === 'no' ||
                    t.subtype === 'toggle' ||
                    t.subtype === 'nc' ||
                    t.subtype === 'mc_no_2' ||
                    t.subtype === 'mc_no_3' ||
                    t.subtype === 'ol_2p' ||
                    t.subtype === 'ol_3p' ||
                    t.subtype === 'pls' ||
                    t.subtype === 'plf' ||
                    t.subtype === 'plc_a' ||
                    t.subtype === 'plc_b' ||
                    t.subtype === 'plc_p' ||
                    t.subtype === 'plc_n' ||
                    t.subtype === 'plc_pls' ||
                    t.subtype === 'plc_plf' ||
                    t.subtype === 'out' ||
                    t.subtype === 'con' ||
                    t.subtype === 'coil' ||
                    t.subtype === 'counter_coil' ||
                    t.subtype === 'ton' ||
                    t.subtype === 'tof' ||
                    t.subtype.startsWith('ton_') ||
                    t.subtype.startsWith('tof_') ||
                    t.subtype === 'flash_coil' ||
                    t.subtype === 'impulse_coil' ||
                    t.subtype === 'plc_out') {
                    skipLabel4 = true;
                  }
                  
                  if (t.subtype === '3e_relay') {
                    const isLeft = activeGrid[y]?.[x - 1]?.groupId !== t.groupId;
                    const isRight = activeGrid[y]?.[x + 1]?.groupId !== t.groupId;
                    const isMiddle = !isLeft && !isRight;
                    if (!isMiddle) skipLabel4 = true;
                  }
                }
                if (skipLabel4) continue;`;

if (code.includes(originalIf)) {
  code = code.replace(originalIf, newIf);
  fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find the original if statement!");
}
