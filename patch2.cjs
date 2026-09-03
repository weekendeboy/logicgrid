const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '                if (outPlus !== undefined) plus24VNets.add(outPlus);',
  '                if (outPlus !== undefined && outPlus > 0) plus24VNets.add(outPlus);'
);

code = code.replace(
  '                if (outMinus !== undefined) zeroVNets.add(outMinus);',
  '                if (outMinus !== undefined && outMinus > 0) zeroVNets.add(outMinus);'
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
