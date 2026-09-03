const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf-8');

const targetLoop = `      // Render Labels
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const t = activeGrid[y]?.[x];
          if (t && t.labels) {
            const cx = x * TILE_SIZE + TILE_SIZE / 2;
            const cy = y * TILE_SIZE + TILE_SIZE / 2;

            for (let i = 0; i <= 4; i++) {
              const labelText = t.labels[i];`;

const replacementLoop = `      // Render Labels
      const processedGroupsForLabel4 = new Set<string>();

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const t = activeGrid[y]?.[x];
          if (t && t.labels) {
            let baseCx = x * TILE_SIZE + TILE_SIZE / 2;
            let baseCy = y * TILE_SIZE + TILE_SIZE / 2;

            for (let i = 0; i <= 4; i++) {
              const labelText = t.labels[i];
              let cx = baseCx;
              let cy = baseCy;

              if (i === 4 && t.groupId) {
                if (processedGroupsForLabel4.has(t.groupId)) {
                  continue;
                }
                processedGroupsForLabel4.add(t.groupId);

                let minX = x, maxX = x, minY = y, maxY = y;
                for (let gy = 0; gy < gridSize; gy++) {
                  for (let gx = 0; gx < gridSize; gx++) {
                    if (activeGrid[gy]?.[gx]?.groupId === t.groupId) {
                      minX = Math.min(minX, gx);
                      maxX = Math.max(maxX, gx);
                      minY = Math.min(minY, gy);
                      maxY = Math.max(maxY, gy);
                    }
                  }
                }
                cx = ((minX + maxX) / 2) * TILE_SIZE + TILE_SIZE / 2;
                cy = ((minY + maxY) / 2) * TILE_SIZE + TILE_SIZE / 2;
              }`;

if (content.includes(targetLoop)) {
  content = content.replace(targetLoop, replacementLoop);
  fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
  console.log('Successfully patched global label centering!');
} else {
  console.log('Target loop not found!');
}
