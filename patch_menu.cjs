const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const wiringMenuStart = /\{\[\s*\{\s*title: '第一大類：工業配線基礎元件[\s\S]*?\n\s*\}\s*\]\.map/;
const newWiringMenu = `{[
              {
                title: '第一大類：基礎配線與接點邏輯 (Basic Wiring & Contacts)',
                levels: [
                  { id: 'w-1-1', title: '單元 1-1：點亮指示燈', desc: '將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。' },
                  { id: 'w-1-2', title: '單元 1-2：串聯與及邏輯', desc: '必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。' },
                  { id: 'w-1-3', title: '單元 1-3：並聯與或邏輯', desc: '兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。' },
                  { id: 'w-1-4', title: '單元 1-4：常閉接點 (NC) 應用', desc: '燈泡預設是亮的，按下按鈕 (NC) 後燈滅。' }
                ]
              },
              {
                title: '第二大類：電磁接觸器與記憶電路 (Magnetic Contactor & Self-Holding)',
                levels: [
                  { id: 'w-2-1', title: '單元 2-1：電磁接觸器 (MC) 基礎', desc: '用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。' },
                  { id: 'w-2-2', title: '單元 2-2：自保持電路 (Self-Holding)', desc: '按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。' },
                  { id: 'w-2-3', title: '單元 2-3：啟動與停止電路', desc: '在自保持電路中串入一個常閉按鈕 (NC) 作為「停止按鈕」，達成完整的 Start-Stop 控制。' },
                  { id: 'w-2-4', title: '單元 2-4：兩地控制 (Two-Place Control)', desc: '在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。' }
                ]
              },
              {
                title: '第三大類：互鎖與安全控制 (Interlock & Safety)',
                levels: [
                  { id: 'w-3-1', title: '單元 3-1：電氣互鎖 (Electrical Interlock)', desc: '兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。' },
                  { id: 'w-3-2', title: '單元 3-2：三相感應馬達正反轉', desc: '結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。' },
                  { id: 'w-3-3', title: '單元 3-3：順序啟動 (Sequential Start)', desc: '廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。' }
                ]
              },
              {
                title: '第四大類：時間控制與自動化 (Timers & Automation)',
                levels: [
                  { id: 'w-4-1', title: '單元 4-1：通電延遲 (ON-Delay)', desc: '按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。' },
                  { id: 'w-4-2', title: '單元 4-2：自動停止 (Auto-Stop)', desc: '馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。' },
                  { id: 'w-4-3', title: '單元 4-3：閃爍與交替控制 (Flasher)', desc: '利用計時器讓兩顆指示燈 (紅、綠) 交互閃爍。' },
                  { id: 'w-4-4', title: '單元 4-4：星角降壓啟動 (Y-Δ Starting)', desc: '大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。' }
                ]
              },
              {
                title: '第五大類：保護機制與故障排除 (Protection & Troubleshooting)',
                levels: [
                  { id: 'w-5-1', title: '單元 5-1：過載保護 (Thermal Overload)', desc: '將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。' },
                  { id: 'w-5-2', title: '單元 5-2：極限開關應用 (Limit Switch)', desc: '電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。' }
                ]
              }
            ].map`;
content = content.replace(wiringMenuStart, newWiringMenu);

const tutorialMappingStart = /\} else if \(logicLevel === 'w-1-1'\) \{[\s\S]*?\} else if \(logicLevel === 'w-1-3'\) \{[\s\S]*?\n\s*\}/;
const newTutorialMapping = `} else if (logicLevel === 'w-1-1') {
      tutorialTitle = 'w-1-1 點亮指示燈';
      tutorialDesc = '任務：將電源 (L, N) 接過常開按鈕 (NO) 點亮指示燈，學習基本迴路。';
    } else if (logicLevel === 'w-1-2') {
      tutorialTitle = 'w-1-2 串聯與及邏輯';
      tutorialDesc = '任務：必須「同時」按下兩個開關，指示燈才會亮，體驗硬體 AND 邏輯。';
    } else if (logicLevel === 'w-1-3') {
      tutorialTitle = 'w-1-3 並聯與或邏輯';
      tutorialDesc = '任務：兩個開關「任一」按下都能讓燈亮，體驗硬體 OR 邏輯。';
    } else if (logicLevel === 'w-1-4') {
      tutorialTitle = 'w-1-4 常閉接點 (NC) 應用';
      tutorialDesc = '任務：燈泡預設是亮的，按下按鈕 (NC) 後燈滅。';
    } else if (logicLevel === 'w-2-1') {
      tutorialTitle = 'w-2-1 電磁接觸器 (MC) 基礎';
      tutorialDesc = '任務：用按鈕控制 MC 的線圈 (A1, A2)，並透過 MC 的主接點帶動馬達旋轉。';
    } else if (logicLevel === 'w-2-2') {
      tutorialTitle = 'w-2-2 自保持電路 (Self-Holding)';
      tutorialDesc = '任務：按下啟動按鈕後放開，馬達必須繼續運轉。需要將 MC 的輔助常開接點與啟動按鈕並聯。';
    } else if (logicLevel === 'w-2-3') {
      tutorialTitle = 'w-2-3 啟動與停止電路';
      tutorialDesc = '任務：在自保持電路中串入一個常閉按鈕 (NC) 作為「停止按鈕」，達成完整的 Start-Stop 控制。';
    } else if (logicLevel === 'w-2-4') {
      tutorialTitle = 'w-2-4 兩地控制 (Two-Place Control)';
      tutorialDesc = '任務：在兩個不同的控制箱都能啟動與停止同一台馬達。啟動按鈕並聯、停止按鈕串聯。';
    } else if (logicLevel === 'w-3-1') {
      tutorialTitle = 'w-3-1 電氣互鎖 (Electrical Interlock)';
      tutorialDesc = '任務：兩個接觸器 MC1 和 MC2 絕對不能同時激磁。請利用對方的常閉接點 (NC) 互相切斷控制線。';
    } else if (logicLevel === 'w-3-2') {
      tutorialTitle = 'w-3-2 三相感應馬達正反轉';
      tutorialDesc = '任務：結合按鈕、互鎖與兩個 MC，控制三相馬達正轉 (FWD) 與反轉 (REV)，並確保按下反轉時不會因短路跳電。';
    } else if (logicLevel === 'w-3-3') {
      tutorialTitle = 'w-3-3 順序啟動 (Sequential Start)';
      tutorialDesc = '任務：廠房兩台抽風機，必須先啟動馬達 A，才能啟動馬達 B；若 A 停機，B 也要跟著停機。';
    } else if (logicLevel === 'w-4-1') {
      tutorialTitle = 'w-4-1 通電延遲 (ON-Delay)';
      tutorialDesc = '任務：按下啟動按鈕後，警報器先響 3 秒，馬達才開始運轉。';
    } else if (logicLevel === 'w-4-2') {
      tutorialTitle = 'w-4-2 自動停止 (Auto-Stop)';
      tutorialDesc = '任務：馬達啟動後，計時 5 秒鐘自動停止，無需人工按停止按鈕。';
    } else if (logicLevel === 'w-4-3') {
      tutorialTitle = 'w-4-3 閃爍與交替控制 (Flasher)';
      tutorialDesc = '任務：利用計時器讓兩顆指示燈 (紅、綠) 交互閃爍。';
    } else if (logicLevel === 'w-4-4') {
      tutorialTitle = 'w-4-4 星角降壓啟動 (Y-Δ Starting)';
      tutorialDesc = '任務：大型馬達啟動時先以 Y 接降低啟動電流，幾秒後透過 Timer 自動切換為 Δ 接全壓運轉。';
    } else if (logicLevel === 'w-5-1') {
      tutorialTitle = 'w-5-1 過載保護 (Thermal Overload)';
      tutorialDesc = '任務：將積熱電驛 (TH-RY) 串入電路。當馬達過載跳脫時，必須切斷控制電源並點亮「故障指示燈 (OL)」。';
    } else if (logicLevel === 'w-5-2') {
      tutorialTitle = 'w-5-2 極限開關應用 (Limit Switch)';
      tutorialDesc = '任務：電動捲門控制。按上樓按鈕，捲門上升；碰到頂部的極限開關時自動停止。';
    }`;
content = content.replace(tutorialMappingStart, newTutorialMapping);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log('done');
