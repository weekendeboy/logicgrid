const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const target2 = `const isNo = t.subtype === 'no' || t.subtype === 'toggle' || t.subtype === 'ton_no' || t.subtype === 'tof_no' || (t.type === 'btn' && (t.subtype === 'no' || t.subtype === 'toggle')) || t.subtype === 'mc_no_2' || t.subtype === 'mc_no_3';`;
const replace2 = `const isNo = t.subtype === 'no' || t.subtype === 'toggle' || t.subtype === 'ton_no' || t.subtype === 'tof_no' || (t.type === 'btn' && (t.subtype === 'no' || t.subtype === 'toggle')) || t.subtype === 'mc_no_2' || t.subtype === 'mc_no_3';`;

// Wait, the drawing is:
/*
          // Labels
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.save();
          ctx.rotate((-t.rotation * Math.PI) / 2);
          ctx.fillText(t.labels[4] || 'K1', 0, 36);
*/
// I can just change it to:
/*
          if (t.subtype !== 'mc_no_2' && t.subtype !== 'mc_no_3') {
             ctx.fillText(t.labels[4] || 'K1', 0, 36);
          }
*/
const target3 = `          ctx.fillText(t.labels[4] || 'K1', 0, 36);`;
const replace3 = `          if (t.subtype !== 'mc_no_2' && t.subtype !== 'mc_no_3') {
            ctx.fillText(t.labels[4] || 'K1', 0, 36);
          }`;

content = content.replace(target3, replace3);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log('Done patch_mc_no.cjs');
