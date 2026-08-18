const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

const targetStr = `                  <button
                    className={\`\${isPlacementSelected('switch_sel13') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5 col-span-2\`}
                    onClick={() => onSetPlacement('switch_sel13')}
                  >
                    <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                      <rect x="37" y="17" width="6" height="6" fill="#94a3b8" />
                      <rect x="57" y="37" width="6" height="6" fill="#94a3b8" />
                      <rect x="37" y="57" width="6" height="6" fill="#94a3b8" />
                      <path d="M 40 10 L 40 20 L 32 20 M 70 40 L 60 40 M 40 70 L 40 60" fill="none" stroke="#64748b" strokeWidth="3" />
                      <path d="M 40 60 L 32 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 15 40 L 32 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M 15 30 L 10 30 L 10 50 L 5 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    選擇開關 (1進2出)
                  </button>`;

const replacementStr = targetStr + `
                  <button
                    className={\`\${isPlacementSelected('switch_4way') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 col-span-2\`}
                    onClick={() => onSetPlacement('switch_4way')}
                  >
                    <svg width="40" height="60" viewBox="0 0 80 120" className="wire-svg shrink-0">
                      <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                      <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                      <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                      <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />
                      <path d="M 60 110 L 60 100 L 50 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                      <path d="M 30 80 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 50 80 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                      <path d="M 40 60 L 15 60" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M 15 50 L 10 50 L 10 70 L 5 70" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    四路開關 (4-way)
                  </button>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/RightSidebar.tsx', content);
