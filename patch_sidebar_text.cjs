const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');
content = content.replace(/四路開關 \(4-way\)/g, '四路按鈕開關');
fs.writeFileSync('src/components/RightSidebar.tsx', content);
