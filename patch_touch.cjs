const fs = require('fs');

const file = 'src/components/CanvasWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find the start of handlePointerDown
const funcStart = code.indexOf('const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {');
const funcEnd = code.indexOf('const handlePointerUp = () => {');

if (funcStart === -1 || funcEnd === -1) {
  console.log("Could not find functions");
  process.exit(1);
}

let before = code.substring(0, funcStart);
let func = code.substring(funcStart, funcEnd);
let after = code.substring(funcEnd);

// Inside func, replace all mousePos.x and mousePos.y with mPos.x and mPos.y
func = func.replace(/mousePos\.x/g, 'mPos.x');
func = func.replace(/mousePos\.y/g, 'mPos.y');
// replace mousePosRaw with mPosRaw as well if used
func = func.replace(/mousePosRaw\.x/g, 'mPosRaw.x');
func = func.replace(/mousePosRaw\.y/g, 'mPosRaw.y');

// Replace the touch logic block
// Note: we need to replace the start of handlePointerDown up to the end of the touch handling block.
const touchBlockStartStr = `const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {`;
const rightClickStr = `    if (e.button === 2) return; // Right click handles rotation`;

const touchBlockStartIdx = func.indexOf(touchBlockStartStr);
const rightClickIdx = func.indexOf(rightClickStr);

if (touchBlockStartIdx !== -1 && rightClickIdx !== -1) {
    const newTouchBlock = `const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    let mPos = mousePos;
    let mPosRaw = mousePosRaw;

    if (e.pointerType === 'touch' || e.pointerType === 'mouse' || e.pointerType === 'pen') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const rawX = (e.clientX - rect.left) * scaleX;
        const rawY = (e.clientY - rect.top) * scaleY;
        const mx = Math.floor(rawX / TILE_SIZE);
        const my = Math.floor(rawY / TILE_SIZE);

        mPosRaw = { x: rawX, y: rawY };
        mPos = { x: mx, y: my };

        const isPlacementTool = 
          currentTool === 'place' || 
          currentTool === 'paste' || 
          currentTool === 'plc_a' ||
          currentTool === 'plc_b' ||
          currentTool === 'plc_p' ||
          currentTool === 'plc_n' ||
          currentTool === 'plc_pls' ||
          currentTool === 'plc_plf' ||
          currentTool === 'plc_out';

        if (isPlacementTool && (mousePos.x !== mx || mousePos.y !== my)) {
          setMousePosRaw({ x: rawX, y: rawY });
          setMousePos({ x: mx, y: my });
          return;
        }

        // For non-placement tools, we just use the updated mPos immediately
        // and also schedule a state update so it's correct for next render
        setMousePosRaw({ x: rawX, y: rawY });
        setMousePos({ x: mx, y: my });
      }
    }

`;
    func = func.substring(0, touchBlockStartIdx) + newTouchBlock + func.substring(rightClickIdx);
} else {
    console.log("Could not find touch block");
    process.exit(1);
}

fs.writeFileSync(file, before + func + after, 'utf8');
console.log("Patched successfully");
