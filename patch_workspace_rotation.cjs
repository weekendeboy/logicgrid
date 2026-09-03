const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const targetStr = `      if (currentMode === 'plc' && t.type === 'plc' && t.subtype !== 'unit') {
        onShowAlert('⚠️ 階梯圖元件方向固定為水平，無法旋轉！');
        return;
      }`;

const replacementStr = `      if (currentMode === 'plc' && t.type === 'plc' && t.subtype !== 'unit') {
        onShowAlert('⚠️ 階梯圖元件方向固定為水平，無法旋轉！');
        return;
      }
      
      const horizontalOnly = ['3e_relay', 'converter'];
      if (horizontalOnly.includes(t.subtype)) {
        onShowAlert('⚠️ 此元件方向固定為水平，無法旋轉！');
        return;
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
