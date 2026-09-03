const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '                if (outPlus !== undefined && outPlus > 0) plus24VNets.add(outPlus);',
  '                if (outPlus !== undefined && outPlus > 0) plus24VNets.add(outPlus);\n                console.log("Converter outPlus:", outPlus, "outMinus:", outMinus);'
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
