const fs = require('fs');
const emptyGrid = Array(60).fill(Array(60).fill(null));
const data = { mode: "wiring", width: 60, height: 60, grid: emptyGrid };
const jsonStr = JSON.stringify(data);

const filesToCreate = [
  'class_c_u1_4', 'class_c_u1_5', 'class_c_u1_6',
  'class_c_u2_1', 'class_c_u2_2', 'class_c_u2_4', 'class_c_u2_5', 'class_c_u2_6', 'class_c_u2_7'
];

for (const name of filesToCreate) {
  const path = `src/levels/${name}.json`;
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, jsonStr);
    console.log(`Created ${path}`);
  }
}
