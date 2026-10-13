/**
 * @license
 * Class C Industrial Wiring Exam (丙級工業配線/室內配線 第一單元 故障檢修) Diagnostic Specifications
 * Auto Studio Pro - Industrial Automation Simulation Platform
 * Aligned with Taiwan Ministry of Labor (勞動部勞動力發展署技能檢定中心) Class C Standards
 */

export interface ClassCOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ClassCQuestionData {
  id: string; // e.g. 'class_c_u1_1'
  unit: number; // 1: 故障檢修, 2: 配線術科
  questionNumber: number;
  title: string;
  circuitName: string;
  description: string;
  normalOperation: string[];
  faultSymptom: string;
  multimeterTips: string[];
  options: ClassCOption[];
  repairMethod: string;
  keyComponents: string[];
}

export const CLASS_C_EXAM_DATA: Record<string, ClassCQuestionData> = {
  class_c_u1_1: {
    id: 'class_c_u1_1',
    unit: 1,
    questionNumber: 1,
    title: '第一題：單相感應電動機順序起動控制',
    circuitName: '單相感應電動機順序起動控制電路',
    description: '檢修單相感應電動機順序起動控制電路。使用三用電表進行斷電阻抗或導通量測，找出電路中的故障點並修復。',
    normalOperation: [
      '1. 投入無熔絲開關 (MCB) 送入單相 AC 電源。',
      '2. 按下啟動按鈕 PB1，接觸器 MC1 吸合並自保持，馬達 M1 運轉。',
      '3. 在 MC1 運轉狀態下，按下按鈕 PB2，接觸器 MC2 才能吸合並自保持，馬達 M2 運轉（順序連鎖）。',
      '4. 若未啟動 M1 直接按 PB2，MC2 不得動作。',
      '5. 按下總停止按鈕 PB3，MC1 與 MC2 均釋放斷電，馬達停轉。',
      '6. 當任一馬達過載 (TH-RY) 跳脫時，全電路斷電停機並觸發警報。',
    ],
    faultSymptom: '投入電源後，按下啟動按鈕 PB1，接觸器 MC1 線圈完全無吸磁動作，指示燈不亮，馬達 M1 無法起動。',
    multimeterTips: [
      '切換三用電表至歐姆檔 (Ω) 或蜂鳴檔，進行斷電導通測試：',
      '測試點 1：量測控制電源保險絲 (Fuse) 上下端，確認保險絲未熔斷。',
      '測試點 2：量測積熱電驛 TH-RY 常閉接點 95-96，確認為 0Ω 導通。',
      '測試點 3：量測停止按鈕 PB3 常閉接點，確認常態下為 0Ω 導通。',
      '測試點 4：按住啟動按鈕 PB1，量測其常開接點 13-14 兩端阻抗，發現呈現無窮大 (∞Ω)，接點無法閉合！',
    ],
    options: [
      {
        id: 'A',
        text: 'TH-RY 積熱電驛常閉接點 95-96 燒毀斷路',
        isCorrect: false,
        explanation: '量測 TH-RY 95-96 端子呈現導通狀態 (0Ω)，過載保護元件未跳脫，非此故障。',
      },
      {
        id: 'B',
        text: 'PB1 啟動按鈕常開接點接觸不良（開路斷路）',
        isCorrect: true,
        explanation: '正確！按下 PB1 時，其常開接點兩端阻抗呈現 ∞Ω，控制電源無法送達 MC1 線圈，導致電路無法動作。',
      },
      {
        id: 'C',
        text: 'MC1 接觸器輔助常開接點 13-14 熔接短路',
        isCorrect: false,
        explanation: '若 13-14 熔接短路，則送電時 MC1 會直接激磁吸合而無須按 PB1，與現實現象相反。',
      },
      {
        id: 'D',
        text: '控制電路保險絲 Fuse 1 熔斷',
        isCorrect: false,
        explanation: '經電表量測 Fuse 兩端阻抗為 0Ω，保險絲完好無損。',
      },
    ],
    repairMethod: '更換損壞之 PB1 按鈕開關常開接點模組，或清理接點表面碳化髒污，確認按壓時導通阻抗小於 0.5Ω。',
    keyComponents: ['PB1', 'PB2', 'PB3', 'MC1', 'MC2', 'TH-RY'],
  },

  class_c_u1_2: {
    id: 'class_c_u1_2',
    unit: 1,
    questionNumber: 2,
    title: '第二題：自動台車分料系統控制電路',
    circuitName: '自動台車分料系統控制電路',
    description: '檢修自動台車分料系統控制電路。涵蓋極限開關行程控制、定時卸料計時器與自動折返往復運轉。',
    normalOperation: [
      '1. 按下啟動鈕 PB1，前進接觸器 MCF 吸合自保持，台車自起點右行。',
      '2. 到達卸料區碰撞極限開關 LS2，MCF 斷電停止，同時通電延遲計時器 T1 開始計時。',
      '3. T1 延遲 5 秒卸料完畢後，T1 瞬時常開接點閉合，激磁後退接觸器 MCR，台車自動返航。',
      '4. 返回起點碰撞極限開關 LS1，MCR 斷電，台車完全停於原點。',
    ],
    faultSymptom: '按下啟動鈕 PB1，台車前進到達 LS2 碰撞後停止並卸料，但計時器 T1 延時結束後，台車未自動返回起點。',
    multimeterTips: [
      '斷電後使用三用電表歐姆檔量測：',
      '測試點 1：手動撥動 LS2，量測 LS2 常閉接點（切斷 MCF）與常開接點（啟動 T1），確認皆正常動作。',
      '測試點 2：手動旋轉計時器測試或量測 T1 限時常開接點 (TON-NO)，發現計時到達後接點仍呈現斷路 (∞Ω)！',
      '測試點 3：量測 MCR 線圈兩端阻抗，確認線圈並未燒斷。',
    ],
    options: [
      {
        id: 'A',
        text: 'LS2 極限開關常開接點接觸不良無法閉合',
        isCorrect: false,
        explanation: '若 LS2 常開接點無法閉合，計時器 T1 便不會被通電計時，但現場 T1 確實完成了計時動作。',
      },
      {
        id: 'B',
        text: '計時器 T1 限時常開接點 (TON-NO) 接觸不良未導通',
        isCorrect: true,
        explanation: '正確！T1 限時常開接點氧化或簧片卡死，計時結束後無法導通送電至 MCR 線圈，使台車滯留於卸料點。',
      },
      {
        id: 'C',
        text: '前進接觸器 MCF 主接點熔接',
        isCorrect: false,
        explanation: '若主接點熔接，台車撞上 LS2 後不會停止，會持續向右衝撞，非目前現象。',
      },
      {
        id: 'D',
        text: '起點極限開關 LS1 常閉接點持續斷開',
        isCorrect: false,
        explanation: 'LS1 位於起點，不影響台車在卸料端向起點折返的啟動控制。',
      },
    ],
    repairMethod: '更換計時器 T1 底座或更換新品計時器本體，確認限時動作接點於設定時間到達後確實導通閉合。',
    keyComponents: ['PB1', 'MCF', 'MCR', 'LS1', 'LS2', 'T1'],
  },

  class_c_u1_3: {
    id: 'class_c_u1_3',
    unit: 1,
    questionNumber: 3,
    title: '第三題：三台輸送帶電動機順序運轉控制',
    circuitName: '三台輸送帶電動機順序運轉控制電路',
    description: '檢修三台輸送帶電動機之逆料流順序啟動與順料流順序停止電路。',
    normalOperation: [
      '1. 逆料流順序啟動：先啟動 3號輸送帶(M3)，再啟動 2號(M2)，最後才能啟動 1號(M1)。',
      '2. 任何一台前置輸送帶未啟動前，後續輸送帶不得啟動。',
      '3. 順料流順序停止：先停 1號(M1)，再停 2號(M2)，最後停 3號(M3)，確保皮帶無殘料。',
      '4. 任一馬達過載時，該馬達及其前段輸送帶必須連鎖停機。',
    ],
    faultSymptom: '按下 PB3 啟動 3號輸送帶 (MC3) 正常運轉，再按 PB2 啟動 2號輸送帶 (MC2) 亦正常運轉，但按下 1號輸送帶啟動按鈕 PB1 時，MC1 完全無法動作。',
    multimeterTips: [
      '測試點 1：量測 PB1 按鈕常開接點，按壓時正常導通 (0Ω)。',
      '測試點 2：量測 1號馬達過載保護 TH-RY1 95-96 接點，正常導通。',
      '測試點 3：量測 MC2 輔助常開接點（串接在 MC1 控制迴路之順序連鎖接點），發現 MC2 激磁時該接點兩端仍為開路 (∞Ω)！',
    ],
    options: [
      {
        id: 'A',
        text: 'MC2 輔助常開順序連鎖接點接觸不良斷路',
        isCorrect: true,
        explanation: '正確！MC2 之輔助 NO 接點負責解除 MC1 的順序互鎖，若其接觸不良，MC1 啟動迴路即處於永久斷路狀態。',
      },
      {
        id: 'B',
        text: 'MC3 主接點短路',
        isCorrect: false,
        explanation: 'MC3 主接點短路會造成電源過電流跳脫，與 1號輸送帶單獨無法啟動無關。',
      },
      {
        id: 'C',
        text: '1號輸送帶過載電驛 TH-RY1 誤動作跳脫',
        isCorrect: false,
        explanation: '電表量測 TH-RY1 95-96 阻抗為 0Ω，並未跳脫。',
      },
      {
        id: 'D',
        text: '總停止按鈕 PB_OFF 接觸不良',
        isCorrect: false,
        explanation: '若總停止按鈕接觸不良，MC3 與 MC2 也無法運轉。',
      },
    ],
    repairMethod: '檢修 MC2 接觸器之輔助接點組，更換不良之 NO 接點或鎖緊脫落之控制跨接線。',
    keyComponents: ['PB1', 'PB2', 'PB3', 'MC1', 'MC2', 'MC3', 'TH-RY1', 'TH-RY2', 'TH-RY3'],
  },

  class_c_u1_4: {
    id: 'class_c_u1_4',
    unit: 1,
    questionNumber: 4,
    title: '第四題：三相感應電動機之 Y-△降壓起動控制(一)',
    circuitName: '三相感應電動機之 Y-△降壓起動控制電路(一)',
    description: '檢修三相感應電動機經典星角降壓啟動電路。涵蓋主接觸器、星接接觸器、角接接觸器與雙重電氣互鎖。',
    normalOperation: [
      '1. 按下 PB1，主接觸器 MC1 與星接接觸器 MC2 同時吸合自保持，馬達以 Y 接法降壓啟動。',
      '2. 計時器 T1 同步開始通電計時（約 3~5 秒）。',
      '3. 設定時間到達後，T1-NC 接點斷開，MC2 釋放。',
      '4. 經微小死區延遲後，T1-NO 接點閉合，角接接觸器 MC3 吸合，馬達轉換為 △ 全壓運轉。',
      '5. MC2 與 MC3 具備常閉接點電氣互鎖，絕對禁止同時吸合。',
    ],
    faultSymptom: '按下 PB1 後，MC1 與 MC2 正常吸磁以 Y 接啟動，但計時時間到達後，MC2 釋放，MC3 卻未能吸磁動作，馬達失去動力減速停轉。',
    multimeterTips: [
      '測試點 1：量測計時器 T1 限時接點，計時到時 TON-NO 確實閉合。',
      '測試點 2：量測 MC3 線圈阻抗，約數百歐姆，線圈正常。',
      '測試點 3：量測串接在 MC3 線圈回路中的 MC2 電氣互鎖常閉接點 (NC 21-22)，當 MC2 釋放後，該接點兩端仍呈現無窮大 (∞Ω) 斷路！',
    ],
    options: [
      {
        id: 'A',
        text: '主接觸器 MC1 輔助常開自保持接點斷路',
        isCorrect: false,
        explanation: 'MC1 運轉正常且持續保持吸合，自保持接點並未損壞。',
      },
      {
        id: 'B',
        text: 'MC2 星接接觸器之互鎖常閉接點 (NC) 接觸不良斷路',
        isCorrect: true,
        explanation: '正確！MC2 釋放後，其常閉互鎖接點因機構卡滯或氧化未能復歸閉合，導致下游的 MC3 線圈無法通電。',
      },
      {
        id: 'C',
        text: '計時器 T1 線圈短路燒毀',
        isCorrect: false,
        explanation: '若 T1 線圈燒毀，T1 便無法計時切斷 MC2，與現實現象不符。',
      },
      {
        id: 'D',
        text: '馬達三相主電源欠相',
        isCorrect: false,
        explanation: '主電源欠相會導致馬達發出嗡嗡異音或 TH-RY 跳脫，不會阻止接觸器線圈吸合。',
      },
    ],
    repairMethod: '清潔並修復 MC2 常閉輔助接點，若接點彈簧疲乏則更換輔助接點模座，確保釋放時導通良好。',
    keyComponents: ['PB1', 'PB2', 'MC1', 'MC2', 'MC3', 'T1', 'TH-RY'],
  },

  class_c_u1_5: {
    id: 'class_c_u1_5',
    unit: 1,
    questionNumber: 5,
    title: '第五題：三相感應電動機之 Y-△降壓起動控制(二)',
    circuitName: '三相感應電動機之 Y-△降壓起動控制電路(二)',
    description: '檢修新型 Y-Δ 降壓啟動控制電路。側重於自保持迴路、瞬間切換火花抑制與過載聯鎖。',
    normalOperation: [
      '1. 按下啟動鈕 PB1，控制電路激磁並透過 MC1 輔助常開接點 13-14 完成自保持。',
      '2. 星接 MC2 激磁吸合，馬達 Y 接啟動。',
      '3. 定時器計時切換至角接 MC3 全壓運轉。',
      '4. 放開手動按鈕 PB1 後，電路應持續鎖定運轉，直到按 PB2 停止。',
    ],
    faultSymptom: '按下啟動鈕 PB1 時，MC1 與 MC2 正常吸磁動作；但手一放開按鈕 PB1，接觸器立即斷電跳脫釋放，完全無法維持運轉。',
    multimeterTips: [
      '測試點 1：手動按下 PB1，電表量測 PB1 接點兩端導通正常。',
      '測試點 2：手動按住 MC1 主動銜鐵使其吸合，量測並聯於 PB1 兩端之 MC1 輔助常開接點 13-14。',
      '量測結果：在 MC1 吸合狀態下，13-14 兩端阻抗依然為無窮大 (∞Ω)，確認自保持接點開路！',
    ],
    options: [
      {
        id: 'A',
        text: 'MC1 輔助常開自保持接點 (13-14) 斷路開路',
        isCorrect: true,
        explanation: '正確！放開啟動按鈕即停機是典型的自保持迴路失效現象，原因為並聯的 MC1 輔助常開接點未能導通。',
      },
      {
        id: 'B',
        text: '停止按鈕 PB2 常閉接點持續閉合',
        isCorrect: false,
        explanation: '停止按鈕常閉接點本來就應該在常態下保持閉合導通。',
      },
      {
        id: 'C',
        text: '星形接觸器 MC2 線圈斷線',
        isCorrect: false,
        explanation: '按住 PB1 時 MC2 有正常吸磁，證明線圈並無斷線。',
      },
      {
        id: 'D',
        text: '積熱電驛 TH-RY 跳脫',
        isCorrect: false,
        explanation: '若 TH-RY 跳脫，按住 PB1 時 MC1 根本無法吸磁。',
      },
    ],
    repairMethod: '檢查 MC1 輔助端子 13-14 的配線接頭是否鬆脫，重新緊固端子螺絲；若內部接點毀損則更換輔助接觸器模組。',
    keyComponents: ['PB1', 'PB2', 'MC1', 'MC2', 'MC3', 'TH-RY'],
  },

  class_c_u1_6: {
    id: 'class_c_u1_6',
    unit: 1,
    questionNumber: 6,
    title: '第六題：三相感應電動機順序啟閉控制',
    circuitName: '三相感應電動機順序啟閉控制電路',
    description: '檢修兩台三相感應電動機之順序啟動與順序停止連鎖電路。',
    normalOperation: [
      '1. 啟動順序：按 PB1 啟動 1號馬達 (MC1)；MC1 運轉後，按 PB3 才能啟動 2號馬達 (MC2)。',
      '2. 停止順序：按 PB4 必須先停止 2號馬達 (MC2)；MC2 停止後，按 PB2 才能停止 1號馬達 (MC1)。',
      '3. 若未停 M2 直接按 PB2，M1 不得停止（防止製程堵塞）。',
    ],
    faultSymptom: 'M1 與 M2 皆處於正常運轉中，操作員按下 2號馬達停止按鈕 PB4 時，MC2 接觸器毫無反應，無法單獨停止 2號馬達。',
    multimeterTips: [
      '測試點 1：手動按下 PB4，量測 PB4 常閉接點 (NC 11-12) 兩端阻抗。',
      '量測結果：按下 PB4 時，接點兩端仍呈現 0Ω 短路導通，接點無法切斷斷路！',
      '研判：按鈕開關內部機構彈簧斷裂卡死，或金屬觸點受大電流突波熔融沾黏。',
    ],
    options: [
      {
        id: 'A',
        text: 'MC1 輔助常閉接點開路',
        isCorrect: false,
        explanation: 'MC1 輔助接點開路會造成無法啟動，而非無法停止。',
      },
      {
        id: 'B',
        text: 'PB4 停止按鈕常閉接點熔黏卡死（無法斷開）',
        isCorrect: true,
        explanation: '正確！停止按鈕常閉接點熔黏短路，按壓時無法斷開控制迴路，致使自保持電源持續供電給 MC2 線圈。',
      },
      {
        id: 'C',
        text: '控制電源保險絲熔斷',
        isCorrect: false,
        explanation: '若保險絲熔斷，整個控制盤會全部停電，接觸器會立即跳脫。',
      },
      {
        id: 'D',
        text: 'TH-RY2 積熱電驛常閉接點斷開',
        isCorrect: false,
        explanation: '若 TH-RY2 斷開，MC2 會自動跳脫停止，與無法停機的現象相反。',
      },
    ],
    repairMethod: '拆卸 PB4 按鈕開關，更換全新的常閉 (NC) 接點模塊，並以三用電表確認未按時導通、按壓時確實斷開。',
    keyComponents: ['PB1', 'PB2', 'PB3', 'PB4', 'MC1', 'MC2', 'TH-RY1', 'TH-RY2'],
  },

  class_c_u1_7: {
    id: 'class_c_u1_7',
    unit: 1,
    questionNumber: 7,
    title: '第七題：往復式送料機自動控制電路',
    circuitName: '往復式送料機自動控制電路',
    description: '檢修往復式送料機控制電路。使用三相電源、正反轉接觸器及行程極限開關實現連續自動換向。',
    normalOperation: [
      '1. 按下啟動鈕 PB2，前進接觸器 MCF 吸合，送料機向右前進。',
      '2. 前進到底碰撞極限開關 LS1 時，MCF 斷電釋放，同時觸發反轉接觸器 MCR 吸合，送料機換向後退。',
      '3. 後退到底碰撞極限開關 LS2 時，MCR 斷電釋放，同時再次觸發 MCF 吸合，送料機換向前進。',
      '4. 如此周而復始自動往復運轉，按 PB1 總停止。',
    ],
    faultSymptom: '按下啟動鈕後，送料機前進碰觸極限開關 LS1 時立即停止前進，但未能自動換向轉為後退行駛，機構停擺。',
    multimeterTips: [
      '測試點 1：手動撥動 LS1，量測 LS1 常閉接點 (NC 11-12)，切斷 MCF 正常。',
      '測試點 2：手動撥動 LS1，量測 LS1 常開接點 (NO 13-14)，發現撥動時接點兩端仍呈現無窮大 (∞Ω)，接點未導通閉合！',
      '測試點 3：量測 MCR 線圈兩端及 MCR 互鎖接點，迴路均正常。',
    ],
    options: [
      {
        id: 'A',
        text: 'LS1 前進極限開關常開接點 (13-14) 斷路開路',
        isCorrect: true,
        explanation: '正確！極限開關 LS1 的常開接點負責接通後退接觸器 MCR 線圈，接點斷路導致換向信號無法送出。',
      },
      {
        id: 'B',
        text: '總停止按鈕 PB1 斷路',
        isCorrect: false,
        explanation: '若 PB1 斷路，送料機連初始前進動作都無法啟動。',
      },
      {
        id: 'C',
        text: 'MCR 反轉接觸器主接點短路',
        isCorrect: false,
        explanation: '主接點短路會在送電時造成嚴重的三相相間短路爆火花與斷路器跳脫。',
      },
      {
        id: 'D',
        text: 'LS2 後退極限開關常閉接點卡死',
        isCorrect: false,
        explanation: 'LS2 位於後退端，此時送料機在前進端，尚未觸及 LS2。',
      },
    ],
    repairMethod: '更換 LS1 極限開關之常開微動接點，並調整機械推桿撞擊行程，確保滾輪撞擊時接點行程足夠且可靠閉合。',
    keyComponents: ['PB1', 'PB2', 'MCF', 'MCR', 'LS1', 'LS2'],
  },
};

/**
 * Get Class C Question Data by level id
 */
export function getClassCQuestionData(levelId: string): ClassCQuestionData | undefined {
  return CLASS_C_EXAM_DATA[levelId];
}
