const fs = require('fs');
let code = fs.readFileSync('src/engine/WiringEngine.ts', 'utf8');

code = code.replace(
  '            const p1 = netMap[y]?.[x]?.[0];\n            const p2 = netMap[y]?.[x + 1]?.[0];\n            const p3 = netMap[y]?.[x + 2]?.[0];\n            \n            // C+ and C- are on pins 2 of left and middle tiles\n            const cPlus = netMap[y]?.[x]?.[2];\n            const cMinus = netMap[y]?.[x + 1]?.[2];',
  `            const t2 = grid[y]?.[x + 1];
            const t3 = grid[y]?.[x + 2];
            const r1 = t.rotation || 0;
            const r2 = t2?.rotation || 0;
            const r3 = t3?.rotation || 0;

            const p1 = netMap[y]?.[x]?.[(0 + r1) % 4];
            const p2 = netMap[y]?.[x + 1]?.[(0 + r2) % 4];
            const p3 = netMap[y]?.[x + 2]?.[(0 + r3) % 4];
            
            // C+ and C- are on pins 2 of left and middle tiles
            const cPlus = netMap[y]?.[x]?.[(2 + r1) % 4];
            const cMinus = netMap[y]?.[x + 1]?.[(2 + r2) % 4];`
);

code = code.replace(
  '            const isPowerOk = ((hasL && hasN) || hasPhaseToPhase) && !shortedNets.has(cPlus) && !shortedNets.has(cMinus) && !isAirElecMixed;',
  '            const isPowerOk = ((hasL && hasN) || hasPhaseToPhase) && cPlus > 0 && cMinus > 0 && !shortedNets.has(cPlus) && !shortedNets.has(cMinus) && !isAirElecMixed;'
);

code = code.replace(
  '            const t2 = grid[y]?.[x + 1];\n            const t3 = grid[y]?.[x + 2];\n\n            t.isActive = coilOn;',
  '            t.isActive = coilOn;'
);

fs.writeFileSync('src/engine/WiringEngine.ts', code);
