const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const importsToAdd = `
import classCU14 from './levels/class_c_u1_4.json';
import classCU15 from './levels/class_c_u1_5.json';
import classCU16 from './levels/class_c_u1_6.json';
import classCU21 from './levels/class_c_u2_1.json';
import classCU22 from './levels/class_c_u2_2.json';
import classCU24 from './levels/class_c_u2_4.json';
import classCU25 from './levels/class_c_u2_5.json';
import classCU26 from './levels/class_c_u2_6.json';
import classCU27 from './levels/class_c_u2_7.json';
`;

appContent = appContent.replace(
  "import classCU23 from './levels/class_c_u2_3.json';",
  "import classCU23 from './levels/class_c_u2_3.json';\n" + importsToAdd
);

// We need to add the blocks for these inside handleClearCanvas
// Let's create a regex to find where we can append

const loaders = [
  'class_c_u1_4', 'class_c_u1_5', 'class_c_u1_6',
  'class_c_u2_1', 'class_c_u2_2', 'class_c_u2_4', 'class_c_u2_5', 'class_c_u2_6', 'class_c_u2_7'
].map(id => {
  const varName = 'classC' + id.replace('class_c_', '').replace('_', '').toUpperCase(); // classCU14
  return `        } else if (level === '${id}' && ${varName} && ${varName}.grid) {
          for (let y = 0; y < Math.min(size, ${varName}.grid.length); y++) {
            for (let x = 0; x < Math.min(size, ${varName}.grid[y].length); x++) {
              if (${varName}.grid[y] && ${varName}.grid[y][x]) { 
                newGrid[y][x] = Object.assign(new Tile(), ${varName}.grid[y][x]);
              }
            }
          }
`;
}).join('');

appContent = appContent.replace(
  "} else if (level === 'class_c_u2_3'",
  loaders + "} else if (level === 'class_c_u2_3'"
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Patched App.tsx");
