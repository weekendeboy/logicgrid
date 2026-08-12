const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const regex = /if \(\(currentMode === 'tutorial' \|\| currentMode === 'logic'\) && logicLevel\) \{/;
content = content.replace(regex, "if ((currentMode === 'tutorial' || currentMode === 'logic' || currentMode === 'wiring') && logicLevel) {");

const levelCheck = /\} else if \(logicLevel === '5-4'\) \{\s*tutorialTitle = '5-4 自動販賣機邏輯';\s*tutorialDesc = '投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。';\s*\}/;

const wiringLevels = `} else if (logicLevel === '5-4') {
      tutorialTitle = '5-4 自動販賣機邏輯';
      tutorialDesc = '投入兩個 1 元才能亮起「可購買」的燈，如果按下退幣則歸零。';
    } else if (logicLevel === 'w-1-1') {
      tutorialTitle = 'w-1-1 無熔絲開關 (MCB) 與負載';
      tutorialDesc = '任務：請將 24V 與 0V 接至斷路器，再從斷路器輸出接至指示燈，並開啟斷路器。';
    } else if (logicLevel === 'w-1-2') {
      tutorialTitle = 'w-1-2 按鈕開關 (Push Button)';
      tutorialDesc = '任務：使用常開 (NO) 按鈕控制一盞燈，按住亮放開滅。使用常閉 (NC) 按鈕控制另一盞燈，按住滅放開亮。';
    } else if (logicLevel === 'w-1-3') {
      tutorialTitle = 'w-1-3 電磁接觸器 (Magnetic Contactor)';
      tutorialDesc = '任務：使用 NO 按鈕控制 MC 的 A1-A2 線圈。當線圈通電時，MC 主接點閉合，使馬達運轉。';
    }`;

content = content.replace(levelCheck, wiringLevels);

// Also need to show the banner in wiring mode.
// Search for {(currentMode === 'tutorial' || currentMode === 'logic') && logicLevel && logicLevel !== 'sandbox' && (
content = content.replace(
  /\{\(currentMode === 'tutorial' \|\| currentMode === 'logic'\) && logicLevel && logicLevel !== 'sandbox' && \(/,
  "{(currentMode === 'tutorial' || currentMode === 'logic' || currentMode === 'wiring') && logicLevel && logicLevel !== 'sandbox' && logicLevel !== 'wiring-menu' && ("
);

fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log('done');
