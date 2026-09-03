const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '    const shortedNets = new Set([',
  `    lNets.delete(0);
    nNets.delete(0);
    plus24VNets.delete(0);
    zeroVNets.delete(0);
    airNets.delete(0);
    rNets.delete(0);
    sNets.delete(0);
    tNets.delete(0);

    const shortedNets = new Set([`
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
