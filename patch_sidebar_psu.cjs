const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

const psuSidebarTarget = `                  <button
                    className={\`\${isPlacementSelected('power_dc24') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5\`}
                    onClick={() => onSetPlacement('power_dc24')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <circle cx="40" cy="40" r="15" fill="none" stroke="#10b981" strokeWidth="4" />
                      <text x="40" y="48" fill="#10b981" fontSize="18" fontFamily="Arial" textAnchor="middle" fontWeight="bold">24V</text>
                    </svg>
                    24V 電源
                  </button>`;

const psuSidebarRep = psuSidebarTarget + `
                  <button
                    className={\`\${isPlacementSelected('power_psu') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5\`}
                    onClick={() => onSetPlacement('power_psu')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="20" y="20" width="40" height="40" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 20 60 L 60 20" fill="none" stroke="#64748b" strokeWidth="3" />
                      <text x="30" y="35" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">~</text>
                      <text x="50" y="55" fill="#94a3b8" fontSize="20" fontFamily="Arial" textAnchor="middle" fontWeight="bold">=</text>
                      <text x="30" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">L</text>
                      <text x="50" y="15" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                      <text x="30" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                      <text x="50" y="75" fill="#06b6d4" fontSize="14" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                    </svg>
                    電源供應器
                  </button>`;

content = content.replace(psuSidebarTarget, psuSidebarRep);
fs.writeFileSync('src/components/RightSidebar.tsx', content);
