const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const anchor = `      onSaveState();

      if (
        currentTool === 'plc_a' ||`;

const replacement = `      onSaveState();

      // [BEGIN] Group removal intercept
      let gidToRemove: string | null = null;
      if (grid[mousePos.y][mousePos.x] && grid[mousePos.y][mousePos.x]!.groupId) {
        gidToRemove = grid[mousePos.y][mousePos.x]!.groupId;
      }
      
      const isCellAvailable = (x: number, y: number) => {
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
        const t = grid[y][x];
        return !t || (gidToRemove && t.groupId === gidToRemove) || false;
      };

      const originalSetGrid = setGrid;
      const safeSetGrid = (updater: any) => {
         originalSetGrid((prev) => {
            let next = prev.map(r => [...r]);
            if (gidToRemove) {
               for (let y = 0; y < gridSize; y++) {
                 for (let x = 0; x < gridSize; x++) {
                   if (next[y][x] && next[y][x]!.groupId === gidToRemove) next[y][x] = null;
                 }
               }
            }
            if (typeof updater === 'function') {
                return updater(next);
            }
            return updater;
         });
      };
      // [END] Group removal intercept

      if (
        currentTool === 'plc_a' ||`;

code = code.replace(anchor, replacement);

// Now we need to replace all `setGrid(` with `safeSetGrid(` within this specific else if branch.
// The branch starts at `else if (\n      currentTool === 'place' ||` (around line 574) and ends at the end of handlePointerDown (around line 987).

// To be safe, we can just replace all `setGrid(` with `safeSetGrid(` between `// [BEGIN] Group removal intercept` and the end of `handlePointerDown`.
const parts = code.split('// [BEGIN] Group removal intercept');
if (parts.length === 2) {
    const afterStart = parts[1];
    // Find the end of handlePointerDown. We know it ends before `// Context Menu Rotation`
    const endAnchor = `  // Context Menu Rotation`;
    const subParts = afterStart.split(endAnchor);
    if (subParts.length === 2) {
        let insidePointerDown = subParts[0];
        
        // Replace setGrid with safeSetGrid
        insidePointerDown = insidePointerDown.replace(/setGrid\(/g, 'safeSetGrid(');
        
        // Now replace the empty checks `!grid[y][x]` with `isCellAvailable(x, y)`
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y\]\[mousePos\.x - 2\]/g, 'isCellAvailable(mousePos.x - 2, mousePos.y)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y\]\[mousePos\.x - 1\]/g, 'isCellAvailable(mousePos.x - 1, mousePos.y)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y\]\[mousePos\.x\]/g, 'isCellAvailable(mousePos.x, mousePos.y)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y\]\[mousePos\.x \+ 1\]/g, 'isCellAvailable(mousePos.x + 1, mousePos.y)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y\]\[mousePos\.x \+ 2\]/g, 'isCellAvailable(mousePos.x + 2, mousePos.y)');
        
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y \+ 1\]\[mousePos\.x\]/g, 'isCellAvailable(mousePos.x, mousePos.y + 1)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y - 1\]\[mousePos\.x\]/g, 'isCellAvailable(mousePos.x, mousePos.y - 1)');
        insidePointerDown = insidePointerDown.replace(/!grid\[mousePos\.y - 2\]\[mousePos\.x\]/g, 'isCellAvailable(mousePos.x, mousePos.y - 2)');

        // Note: the plc unit check uses a loop:
        /*
          for (let dy = 0; dy < 10; dy++) {
            for (let dx = 0; dx < 4; dx++) {
              if (grid[mousePos.y + dy][mousePos.x + dx]) {
        */
        insidePointerDown = insidePointerDown.replace(/if \(grid\[mousePos\.y \+ dy\]\[mousePos\.x \+ dx\]\)/g, 'if (!isCellAvailable(mousePos.x + dx, mousePos.y + dy))');

        code = parts[0] + '// [BEGIN] Group removal intercept' + insidePointerDown + endAnchor + subParts[1];
        fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
        console.log('Patch applied successfully');
    } else {
        console.log('Failed to find end anchor');
    }
} else {
    console.log('Failed to find start anchor');
}
