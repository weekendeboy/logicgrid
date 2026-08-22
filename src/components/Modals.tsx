/**
 * @license
 * Modals Component for Property Editing & Canvas Clear Confirmation
 */

import React, { useState, useEffect } from 'react';
import { ModalState } from '../types';
import { TriangleAlert } from 'lucide-react';

interface ModalsProps {
  modalState: ModalState;
  onCloseModal: () => void;
  onSaveValue: (val: number, color: string, labels: Record<number, string>) => void;
  isConfirmClearOpen: boolean;
  onCloseClearConfirm: () => void;
  onConfirmClearCanvas: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  modalState,
  onCloseModal,
  onSaveValue,
  isConfirmClearOpen,
  onCloseClearConfirm,
  onConfirmClearCanvas,
}) => {
  const { isOpen, mode, tile } = modalState;

  const [valInput, setValInput] = useState<number>(0);
  const [colorInput, setColorInput] = useState<string>('#fde047');
  const [labelsInput, setLabelsInput] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
  });

  useEffect(() => {
    if (tile) {
      setValInput(
        tile.value || (tile.type === 'power' || tile.subtype === 'clock' ? 1 : 100)
      );
      setColorInput(tile.color || '#fde047');
      setLabelsInput({
        0: tile.labels[0] || '',
        1: tile.labels[1] || '',
        2: tile.labels[2] || '',
        3: tile.labels[3] || '',
        4: tile.labels[4] || '',
      });
    }
  }, [tile, isOpen]);

  if (!isOpen && !isConfirmClearOpen) return null;

  const handleSave = () => {
    onSaveValue(valInput, colorInput, labelsInput);
  };

  const presetColors = ['#ef4444', '#10b981', '#3b82f6', '#fde047', '#ffffff'];

  return (
    <>
      {/* Property Modal */}
      {isOpen && tile && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-sm select-none">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-[90%] max-w-[420px] shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-white">
              {mode === 'value' &&
                (tile.type === 'power' && (tile.subtype === 'ac' || tile.subtype === 'power_ac')
                  ? '設定交流電 (AC)'
                  : tile.type === 'capacitor'
                  ? '設定電容值'
                  : (tile.type === 'resistor_var' || (tile.type === 'resistor' && (tile.subtype === 'var' || tile.subtype.startsWith('var_'))))
                  ? '設定滑動變阻器總電阻'
                  : tile.type === 'logic' && tile.subtype === 'clock'
                  ? '設定時脈產生器'
                  : '設定屬性')}
              {mode === 'color' && '設定指示燈顏色'}
              {mode === 'timer' && '設定計時器 (Timer)'}
              {mode === 'label' && '設定多重標籤 (Label)'}
            </h3>

            {(mode === 'value' || mode === 'timer') && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1.5">
                  {tile.type === 'power' && (tile.subtype === 'ac' || tile.subtype === 'power_ac')
                    ? '頻率 (Hz) [建議 0.1 ~ 5 之間]：'
                    : tile.type === 'capacitor'
                    ? '容量 (μF) [預設 10000]：'
                    : (tile.type === 'resistor_var' || (tile.type === 'resistor' && (tile.subtype === 'var' || tile.subtype.startsWith('var_'))))
                    ? '總電阻值 (Ω) [預設 100]：'
                    : tile.type === 'logic' && tile.subtype === 'clock'
                    ? '頻率 (Hz) [建議 0.5 ~ 10 之間]：'
                    : mode === 'timer'
                    ? (tile.subtype === 'counter_coil' ? '設定計數次數：' : '延遲時間 (毫秒 ms)：')
                    : '設定數值：'}
                </p>
                <input
                  type="number"
                  value={valInput}
                  onChange={(e) => setValInput(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
            )}

            {mode === 'color' && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-3">選擇指示燈標準顏色：</p>
                <div className="flex gap-4 justify-center mb-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${
                        colorInput === c
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c, boxShadow: colorInput === c ? `0 0 15px ${c}` : 'none' }}
                      onClick={() => setColorInput(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {(mode === 'label' || mode === 'timer') && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">
                  個別接點標註 (支援同時多重標註，會隨元件自旋)：
                </p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={labelsInput[0]}
                    onChange={(e) => setLabelsInput({ ...labelsInput, 0: e.target.value })}
                    className="p-2 bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg focus:border-blue-500"
                    placeholder="上 (Pin 1)"
                  />
                  <input
                    type="text"
                    value={labelsInput[1]}
                    onChange={(e) => setLabelsInput({ ...labelsInput, 1: e.target.value })}
                    className="p-2 bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg focus:border-blue-500"
                    placeholder="右 (Pin 2)"
                  />
                  <input
                    type="text"
                    value={labelsInput[3]}
                    onChange={(e) => setLabelsInput({ ...labelsInput, 3: e.target.value })}
                    className="p-2 bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg focus:border-blue-500"
                    placeholder="左 (Pin 4)"
                  />
                  <input
                    type="text"
                    value={labelsInput[2]}
                    onChange={(e) => setLabelsInput({ ...labelsInput, 2: e.target.value })}
                    className="p-2 bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg focus:border-blue-500"
                    placeholder="下 (Pin 3)"
                  />
                </div>
                <input
                  type="text"
                  value={labelsInput[4]}
                  onChange={(e) => setLabelsInput({ ...labelsInput, 4: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg focus:border-blue-500"
                  placeholder="中心標籤 (主名稱 / 連結目標)"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-xs transition-colors"
                onClick={onCloseModal}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-xs transition-colors shadow-lg shadow-blue-500/30"
                onClick={handleSave}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Canvas Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex justify-center items-center backdrop-blur-sm select-none">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-[90%] max-w-xs text-center shadow-2xl">
            <TriangleAlert className="w-12 h-12 text-rose-500 mx-auto mb-3 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <h3 className="text-lg font-bold text-white mb-2">警告：淨空全圖</h3>
            <p className="text-slate-300 text-xs mb-6">
              確定要刪除畫布上的所有元件嗎？<br />此動作將會清除目前的線路！
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition"
                onClick={onCloseClearConfirm}
              >
                取消
              </button>
              <button
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-rose-600/30"
                onClick={onConfirmClearCanvas}
              >
                確認淨空
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
