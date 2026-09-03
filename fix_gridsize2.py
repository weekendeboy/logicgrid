import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace setGridSize(newGridSize); in handleChangeAppMode
content = content.replace("setGridSize(newGridSize);", "setWiringGridSize(newGridSize);\n    setLadderGridSize(newGridSize);")

# Replace handleChangeGridSize body
pattern = r"  // Change Grid Size\n  const handleChangeGridSize = \(newSize: number\) => \{[\s\S]*?  // Zoom Controls"
replacement = """  // Change Grid Size
  const handleChangeGridSize = (newSize: number) => {
    if (currentMode === 'plc' && plcSubTab === 'ladder') {
      setLadderGridSize(newSize);
      setLadderGrid((prev) => {
        const next = Array(newSize).fill(null).map(() => Array(newSize).fill(null));
        for (let y = 0; y < Math.min(prev.length, newSize); y++) {
          for (let x = 0; x < Math.min(prev[0].length, newSize); x++) {
            next[y][x] = prev[y][x];
          }
        }
        return next;
      });
    } else {
      setWiringGridSize(newSize);
      setGrid((prev) => {
        const next = Array(newSize).fill(null).map(() => Array(newSize).fill(null));
        for (let y = 0; y < Math.min(prev.length, newSize); y++) {
          for (let x = 0; x < Math.min(prev[0].length, newSize); x++) {
            next[y][x] = prev[y][x];
          }
        }
        return next;
      });
    }
    if (!isLeftPinned) {
      setIsLeftSidebarOpen(false);
    }
  };

  // Zoom Controls"""
if re.search(r"  // Change Grid Size\n  const handleChangeGridSize", content):
    content = re.sub(pattern, replacement, content)
    print("Replaced handleChangeGridSize!")
else:
    print("Could not find handleChangeGridSize")

with open('src/App.tsx', 'w') as f:
    f.write(content)
