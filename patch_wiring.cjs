const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

// Extract converter logic
const convRegex = /    const converterSequences: string\[\] = \[\];[\s\S]*?(?=    \/\/ Evaluate 3E Relays)/;
const convMatch = code.match(convRegex);
if (!convMatch) {
  console.log("Could not find converter logic!");
  process.exit(1);
}
const convCode = convMatch[0];
code = code.replace(convCode, '');

// Extract 3E Relay logic
const relayRegex = /    \/\/ Evaluate 3E Relays[\s\S]*?(?=    return \{)/;
const relayMatch = code.match(relayRegex);
if (!relayMatch) {
  console.log("Could not find 3e relay logic!");
  process.exit(1);
}
const relayCode = relayMatch[0];
code = code.replace(relayCode, '');

// Insert them just before isAirElecMixed
const insertPoint = /    let isAirElecMixed = false;/;
code = code.replace(insertPoint, convCode + '\n' + relayCode + '\n    let isAirElecMixed = false;');

fs.writeFileSync('src/engine/WiringEngine.ts', code);
console.log("Patched successfully");
