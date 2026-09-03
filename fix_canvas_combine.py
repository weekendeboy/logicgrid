import re
with open('src/components/CanvasWorkspace.tsx', 'r') as f:
    content = f.read()

replacement = """      if (currentMode === 'plc' && ladderGrid) {
        const lw = ladderGrid[0]?.length || 60;
        const ww = grid[0]?.length || 60;
        const maxH = Math.max(ladderGrid.length, grid.length);
        
        evalGrid = Array(maxH).fill(null).map((_, y) => {
          const lRow = ladderGrid[y] || Array(lw).fill(null);
          const wRow = grid[y] || Array(ww).fill(null);
          return [...lRow, ...wRow];
        });
        evalW = lw + ww;
      }"""

content = re.sub(r"      if \(currentMode === 'plc' && ladderGrid\) \{[\s\S]*?evalW = gridSize \* 2;\n      \}", replacement, content)

# we also need to fix netMap splitting:
netmap_replacement = """      if (currentMode === 'plc' && ladderGrid) {
        const lw = ladderGrid[0]?.length || 60;
        if (isLadder) {
          netMap = evalNetMap.map(row => row.slice(0, lw));
        } else {
          netMap = evalNetMap.map(row => row.slice(lw));
        }
      }"""
content = re.sub(r"      if \(currentMode === 'plc' && ladderGrid\) \{\n        if \(isLadder\) \{\n          netMap = evalNetMap\.map\(row => row\.slice\(0, gridSize\)\);\n        \} else \{\n          netMap = evalNetMap\.map\(row => row\.slice\(gridSize, gridSize \* 2\)\);\n        \}\n      \}", netmap_replacement, content)


with open('src/components/CanvasWorkspace.tsx', 'w') as f:
    f.write(content)
