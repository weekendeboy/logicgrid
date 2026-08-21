const fs = require('fs');
let code = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const anchor = `  const getSelectionBounds = useCallback(() => {
    return {
      minX: Math.min(selectStart.x, selectEnd.x),
      maxX: Math.max(selectStart.x, selectEnd.x),
      minY: Math.min(selectStart.y, selectEnd.y),
      maxY: Math.max(selectStart.y, selectEnd.y),
    };
  }, [selectStart, selectEnd]);`;

const replacement = `  const getSelectionBounds = useCallback(() => {
    let minX = Math.min(selectStart.x, selectEnd.x);
    let maxX = Math.max(selectStart.x, selectEnd.x);
    let minY = Math.min(selectStart.y, selectEnd.y);
    let maxY = Math.max(selectStart.y, selectEnd.y);

    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let y = minY; y <= Math.min(maxY, gridSize - 1); y++) {
        for (let x = minX; x <= Math.min(maxX, gridSize - 1); x++) {
          const t = grid[y]?.[x];
          if (t && t.groupId) {
            for (let gy = 0; gy < gridSize; gy++) {
              for (let gx = 0; gx < gridSize; gx++) {
                if (grid[gy]?.[gx]?.groupId === t.groupId) {
                  if (gx < minX) { minX = gx; expanded = true; }
                  if (gx > maxX) { maxX = gx; expanded = true; }
                  if (gy < minY) { minY = gy; expanded = true; }
                  if (gy > maxY) { maxY = gy; expanded = true; }
                }
              }
            }
          }
        }
      }
    }

    return { minX, maxX, minY, maxY };
  }, [selectStart, selectEnd, grid, gridSize]);`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
    fs.writeFileSync('src/components/CanvasWorkspace.tsx', code);
    console.log('Patch applied successfully');
} else {
    console.log('Failed to find anchor');
}
