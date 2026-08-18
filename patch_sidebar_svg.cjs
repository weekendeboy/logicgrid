const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

const targetSVG1 = `<svg width="40" height="60" viewBox="0 0 80 120" className="wire-svg shrink-0">
                      <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                      <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                      <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                      <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />`;

const repSVG1 = `<svg width="40" height="60" viewBox="0 0 80 120" className="wire-svg shrink-0">
                      <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                      <text x="28" y="24" fill="#10b981" fontSize="16" fontWeight="bold">1</text>
                      <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                      <text x="68" y="24" fill="#10b981" fontSize="16" fontWeight="bold">3</text>
                      <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                      <text x="28" y="104" fill="#10b981" fontSize="16" fontWeight="bold">2</text>
                      <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      
                      <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />
                      <text x="68" y="104" fill="#10b981" fontSize="16" fontWeight="bold">4</text>`;

content = content.split(targetSVG1).join(repSVG1);

const targetSVG2 = `<svg width="40" height="60" viewBox="0 0 80 120" className="wire-svg shrink-0">
                  {/* Top Left 1 */}
                  <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                  <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Top Right 3 */}
                  <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                  <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Left 2 */}
                  <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                  <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Right 4 */}
                  <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />`;

const repSVG2 = `<svg width="40" height="60" viewBox="0 0 80 120" className="wire-svg shrink-0">
                  {/* Top Left 1 */}
                  <rect x="17" y="17" width="6" height="6" fill="#94a3b8" />
                  <text x="28" y="24" fill="#10b981" fontSize="16" fontWeight="bold">1</text>
                  <path d="M 20 10 L 20 20 L 30 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Top Right 3 */}
                  <rect x="57" y="17" width="6" height="6" fill="#94a3b8" />
                  <text x="68" y="24" fill="#10b981" fontSize="16" fontWeight="bold">3</text>
                  <path d="M 60 10 L 60 20 L 50 40" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Left 2 */}
                  <rect x="17" y="97" width="6" height="6" fill="#94a3b8" />
                  <text x="28" y="104" fill="#10b981" fontSize="16" fontWeight="bold">2</text>
                  <path d="M 20 110 L 20 100 L 30 80" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  
                  {/* Bot Right 4 */}
                  <rect x="57" y="97" width="6" height="6" fill="#94a3b8" />
                  <text x="68" y="104" fill="#10b981" fontSize="16" fontWeight="bold">4</text>`;

content = content.split(targetSVG2).join(repSVG2);
fs.writeFileSync('src/components/RightSidebar.tsx', content);
