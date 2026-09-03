const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '    if (shortedNets.size > 0) {\n      console.log("SHORTED NETS:", shortedNets);\n      console.log("rNets:", rNets, "sNets:", sNets, "tNets:", tNets, "lNets:", lNets, "nNets:", nNets);\n    }',
  `    if (shortedNets.size > 0) {
      console.log("SHORTED NETS:", shortedNets);
      console.log("rNets:", rNets, "sNets:", sNets, "tNets:", tNets, "lNets:", lNets, "nNets:", nNets, "plus24VNets:", plus24VNets, "zeroVNets:", zeroVNets);
      
      const ln = [...lNets].filter((x) => nNets.has(x));
      const pz = [...plus24VNets].filter((x) => zeroVNets.has(x));
      const rs = [...rNets].filter((x) => sNets.has(x) || tNets.has(x));
      const sr = [...sNets].filter((x) => rNets.has(x) || tNets.has(x));
      const tr = [...tNets].filter((x) => rNets.has(x) || sNets.has(x));
      
      console.log("Short sources:", {ln, pz, rs, sr, tr});
    }`
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
