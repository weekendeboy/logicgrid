import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# find plcSubTab declaration
plc_match = re.search(r"  const \[plcSubTab, setPlcSubTab\] = useState<'wiring' \| 'ladder'>\('wiring'\);\n", content)
if plc_match:
    plc_decl = plc_match.group(0)
    # remove it from original location
    content = content.replace(plc_decl, "")
    # put it before activeGridSize
    content = content.replace("  const activeGridSize = ", plc_decl + "  const activeGridSize = ")

with open('src/App.tsx', 'w') as f:
    f.write(content)
