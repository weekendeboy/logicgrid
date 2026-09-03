import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace gridSize with wiringGridSize, ladderGridSize
content = re.sub(r"const \[gridSize, setGridSize\] = useState<number>\(60\);", 
"""const [wiringGridSize, setWiringGridSize] = useState<number>(60);
  const [ladderGridSize, setLadderGridSize] = useState<number>(60);
  const activeGridSize = (currentMode === 'plc' && plcSubTab === 'ladder') ? ladderGridSize : wiringGridSize;""", content)

# History state type
# In App.tsx, the history state type might be defined somewhere.
content = content.replace("historyStackRef = useRef<{ grid: (Tile | null)[][]; ladderGrid: (Tile | null)[][]; faults: Faults }[]>([]);",
"historyStackRef = useRef<{ grid: (Tile | null)[][]; ladderGrid: (Tile | null)[][]; faults: Faults; wSize: number; lSize: number }[]>([]);")

content = content.replace("historyStackRef.current.push({ grid: gridCopy, ladderGrid: ladderGridCopy, faults: faultsCopy });",
"historyStackRef.current.push({ grid: gridCopy, ladderGrid: ladderGridCopy, faults: faultsCopy, wSize: wiringGridSize, lSize: ladderGridSize });")

# In saveState dependencies
content = content.replace("}, [grid, ladderGrid, faults]);", "}, [grid, ladderGrid, faults, wiringGridSize, ladderGridSize]);")

undo_replacement = """      setFaults(state.faults);
      if (state.wSize) setWiringGridSize(state.wSize);
      if (state.lSize) setLadderGridSize(state.lSize);
      showAlert('🔄 已復原上一步驟');"""
content = content.replace("""      setFaults(state.faults);
      showAlert('🔄 已復原上一步驟');""", undo_replacement)

# Array(gridSize) in handleUndo
content = content.replace("(state.ladderGrid || Array(gridSize)", "(state.ladderGrid || Array(ladderGridSize)")

# initial setGrid
# overrideGridSize || gridSize -> activeGridSize
content = content.replace("const size = overrideGridSize || gridSize;", "const size = overrideGridSize || activeGridSize;")

# reset clear canvas dependency
content = content.replace("[gridSize, logicLevel, currentMode]", "[activeGridSize, logicLevel, currentMode]")

# JSON export/import
content = content.replace("width: gridSize,", "width: activeGridSize,")
content = content.replace("height: gridSize,", "height: activeGridSize,")
content = content.replace("let minX = gridSize,", "let minX = activeGridSize,")
content = content.replace("minY = gridSize,", "minY = activeGridSize,")
content = content.replace("Math.min(gridSize, parsed.grid.length)", "Math.min(activeGridSize, parsed.grid.length)")
content = content.replace("Math.min(gridSize, parsed.grid[y].length)", "Math.min(activeGridSize, parsed.grid[y].length)")


# LeftSidebar
content = content.replace("gridSize={gridSize}", "gridSize={activeGridSize}")
content = content.replace("onChangeGridSize={setGridSize}", "onChangeGridSize={(s) => { if(currentMode==='plc' && plcSubTab==='ladder') setLadderGridSize(s); else setWiringGridSize(s); handleClearCanvas(true, currentMode, logicLevel, s); }}")

# In autowire
content = content.replace("gridSize,\n        gridSize", "activeGridSize,\n        activeGridSize")

with open('src/App.tsx', 'w') as f:
    f.write(content)

