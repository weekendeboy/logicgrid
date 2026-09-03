const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

const convRegex = /    const converterSequences: string\[\] = \[\];[\s\S]*?(?=    \/\/ Evaluate 3E Relays)/;
const convMatch = code.match(convRegex);
if (!convMatch) {
  console.log("Could not find converter logic!");
  process.exit(1);
}
const convCode = convMatch[0];
code = code.replace(convCode, '');

const insertPoint = /    let isAirElecMixed = false;/;
code = code.replace(insertPoint, convCode + '\n    let isAirElecMixed = false;');

fs.writeFileSync('src/engine/WiringEngine.ts', code);
console.log("Patched successfully");
