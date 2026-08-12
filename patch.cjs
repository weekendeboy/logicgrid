const fs = require('fs');
let content = fs.readFileSync('src/components/CanvasWorkspace.tsx', 'utf8');

const logicMenuRegex = /\{\s*currentMode === 'logic' && logicLevel === 'tutorial-menu' \? \([\s\S]*?(?=\{\/\* Tutorial Banner \*\/)/;

const wiringMenuTemplate = `
      {currentMode === 'wiring' && logicLevel === 'wiring-menu' ? (
        <div className="min-w-full min-h-full w-max h-max p-8 flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col gap-10 pb-20 mt-10">
            {[
              {
                title: '第一大類：工業配線基礎元件 (Basic Wiring Components)',
                levels: [
                  { id: 'w-1-1', title: '單元 1-1：無熔絲開關 (MCB) 與負載', desc: '認識電源、斷路器，並嘗試接亮一顆工業指示燈。' },
                  { id: 'w-1-2', title: '單元 1-2：按鈕開關 (Push Button)', desc: '學習使用 NO (常開) 與 NC (常閉) 按鈕控制電路。' },
                  { id: 'w-1-3', title: '單元 1-3：電磁接觸器 (Magnetic Contactor)', desc: '學習使用電磁接觸器 (MC) 的線圈與主接點，完成馬達的直接啟動。' }
                ]
              }
            ].map((category, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-amber-400 border-b border-slate-700 pb-3 mb-4">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.levels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => onLoadLogicLevel(level.id as LogicLevelId)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-md group"
                    >
                      <h3 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300 mb-2">
                        {level.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {level.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentMode === 'logic' && logicLevel === 'tutorial-menu' ? (
`;

content = content.replace(/\{\s*currentMode === 'logic' && logicLevel === 'tutorial-menu' \? \(/, wiringMenuTemplate);
fs.writeFileSync('src/components/CanvasWorkspace.tsx', content);
console.log('done');
