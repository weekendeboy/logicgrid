const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

const target = `                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                </svg>
                N相(零線)
              </button>`;

const replacement = `                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  <text x="40" y="48" fill="#3b82f6" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">N</text>
                </svg>
                N相(零線)
              </button>
              <button
                className={\`\${isPlacementSelected('wire_plus') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5\`}
                onClick={() => onSetPlacement('wire_plus')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#f97316" strokeWidth="4" />
                  <text x="40" y="48" fill="#f97316" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">+</text>
                </svg>
                +24V (正極)
              </button>
              <button
                className={\`\${isPlacementSelected('wire_minus') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5\`}
                onClick={() => onSetPlacement('wire_minus')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <circle cx="40" cy="40" r="15" fill="none" stroke="#6366f1" strokeWidth="4" />
                  <text x="40" y="48" fill="#6366f1" fontSize="24" fontFamily="Arial" textAnchor="middle" fontWeight="bold">-</text>
                </svg>
                0V (負極)
              </button>
              <button
                className={\`\${isPlacementSelected('wire_ground') ? 'bg-blue-600/30 border-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'} p-2  rounded-lg text-xs text-slate-200 flex items-center gap-1.5\`}
                onClick={() => onSetPlacement('wire_ground')}
              >
                <svg width="40" height="40" viewBox="0 0 80 80" className="wire-svg shrink-0">
                  <rect x="36" y="16" width="8" height="8" fill="#94a3b8" />
                  <path d="M 40 24 L 40 50 M 20 50 L 60 50 M 30 60 L 50 60 M 36 70 L 44 70" fill="none" stroke="#94a3b8" strokeWidth="4" />
                </svg>
                接地線
              </button>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/RightSidebar.tsx', content);
