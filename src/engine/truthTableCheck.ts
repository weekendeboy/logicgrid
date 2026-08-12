import { Tile, NetData } from '../types';
import { buildNetState } from '../engine/NetEngine';
import { LogicEngine } from '../engine/LogicEngine';

export function verifyLogicCircuit(
  grid: (Tile | null)[][],
  gridSize: number,
  levelId: string
): { success: boolean; message: string } {
  // Find all inputs (power/pushbtn) and outputs (led)
  const inputs: { x: number; y: number }[] = [];
  const outputs: { x: number; y: number }[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const t = grid[y][x];
      if (t && t.type === 'logic') {
        if (t.subtype === 'power' || t.subtype === 'pushbtn') {
          inputs.push({ x, y });
        } else if (t.subtype === 'led') {
          outputs.push({ x, y });
        }
      }
    }
  }

  // Helper to test a permutation
  const simulateState = (inputStates: boolean[]) => {
    // Clone grid deeply
    const testGrid = grid.map(row => 
      row.map(cell => cell ? Object.assign(new Tile(), cell) : null)
    );

    // Apply inputs
    for (let i = 0; i < inputs.length; i++) {
      const p = inputs[i];
      testGrid[p.y][p.x]!.isActive = inputStates[i];
    }

    const { netMap, netCount } = buildNetState(testGrid, gridSize, gridSize, 'logic', { opens: [], shorts: [] });
    const netData = Array(netCount + 1).fill(0).map(() => ({ color: '#4a5568', isHigh: false }));

    LogicEngine.simulate(testGrid, netMap, netData);

    return outputs.map(p => !!testGrid[p.y][p.x]?.isPowered);
  };

  // Define expected tables
  // Map of levelId to checking logic
  const matchTable = (reqIn: number, reqOut: number, evaluator: (ins: boolean[]) => boolean[]) => {
    if (inputs.length !== reqIn || outputs.length !== reqOut) {
      return { success: false, message: `需要 ${reqIn} 個輸入 (開關) 與 ${reqOut} 個輸出 (LED)。目前有 ${inputs.length} 個輸入與 ${outputs.length} 個輸出。` };
    }

    const numPerms = 1 << reqIn;
    // Because inputs order on canvas is arbitrary, we must test all permutations of mapping actual inputs to expected inputs
    // For n<=4, we can generate all permutations of indices 0..n-1
    const getPermutations = (n: number) => {
      const result: number[][] = [];
      const permute = (arr: number[], m: number[] = []) => {
        if (arr.length === 0) result.push(m);
        else {
          for (let i = 0; i < arr.length; i++) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr, m.concat(next));
          }
        }
      }
      permute(Array.from({length: n}, (_, i) => i));
      return result;
    };

    const inputMappings = getPermutations(reqIn);
    const outputMappings = getPermutations(reqOut);

    // We only need ONE mapping that satisfies all states
    for (const inMap of inputMappings) {
      for (const outMap of outputMappings) {
        let allMatch = true;
        for (let i = 0; i < numPerms; i++) {
          const inState = [];
          for (let j = 0; j < reqIn; j++) {
            inState.push(!!((i >> j) & 1));
          }
          
          // Reorder inState according to inMap
          const actualInState = [];
          for(let j=0; j<reqIn; j++) actualInState[inMap[j]] = inState[j];
          
          const actualOutState = simulateState(actualInState);
          
          // Reorder actualOutState according to outMap
          const testOutState = [];
          for(let j=0; j<reqOut; j++) testOutState[outMap[j]] = actualOutState[j];
          
          const expectedOutState = evaluator(inState);
          for(let j=0; j<reqOut; j++) {
            if (testOutState[j] !== expectedOutState[j]) {
              allMatch = false;
              break;
            }
          }
          if (!allMatch) break;
        }
        if (allMatch) return { success: true, message: '🎉 恭喜通關！真值表驗證正確。' };
      }
    }
    return { success: false, message: '電路邏輯與目標不符，請重新檢查接線。' };
  };

  if (levelId === '1-1') return matchTable(1, 1, (ins) => [ins[0]]);
  if (levelId === '1-2') return matchTable(1, 1, (ins) => [!ins[0]]);
  if (levelId === '1-3') return matchTable(2, 1, (ins) => [ins[0] && ins[1]]);
  if (levelId === '1-4') return matchTable(2, 1, (ins) => [ins[0] || ins[1]]);
  if (levelId === '1-5') {
    const isNAND = matchTable(2, 1, (ins) => [!(ins[0] && ins[1])]);
    if (isNAND.success) return isNAND;
    const isNOR = matchTable(2, 1, (ins) => [!(ins[0] || ins[1])]);
    if (isNOR.success) return isNOR;
    return isNAND;
  }
  if (levelId === '1-6') return matchTable(2, 1, (ins) => [ins[0] !== ins[1]]);
  if (levelId === '1-7') return matchTable(1, 1, (ins) => [!ins[0]]);
  if (levelId === '2-1') return matchTable(2, 1, (ins) => [ins[0] && ins[1]]);
  if (levelId === '2-2') return matchTable(3, 1, (ins) => [ins[0] && ins[1] && ins[2]]);
  if (levelId === '2-3') return matchTable(3, 1, (ins) => [(ins[0] && ins[1]) || (!ins[0] && ins[2])]);
  if (levelId === '2-4') return matchTable(2, 4, (ins) => [
      !ins[0] && !ins[1],
      !ins[0] && ins[1],
      ins[0] && !ins[1],
      ins[0] && ins[1]
  ]);
  if (levelId === '2-5') return matchTable(3, 1, (ins) => [(ins[0] && ins[1]) || (ins[1] && ins[2]) || (ins[0] && ins[2])]);
  if (levelId === '3-1') return matchTable(2, 2, (ins) => [ins[0] !== ins[1], ins[0] && ins[1]]);
  if (levelId === '3-2') return matchTable(3, 2, (ins) => {
      const sum1 = ins[0] !== ins[1];
      const carry1 = ins[0] && ins[1];
      const sum2 = sum1 !== ins[2];
      const carry2 = sum1 && ins[2];
      return [sum2, carry1 || carry2];
  });
  if (levelId === '3-4') return matchTable(2, 2, (ins) => [ins[0] > ins[1], ins[0] === ins[1]]);

  return { success: false, message: '此關卡暫不支援自動真值表驗證。' };
}
