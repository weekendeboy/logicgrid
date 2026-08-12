/**
 * @license
 * LeftSidebar Component for Auto Studio Pro
 */

import React, { useRef } from 'react';
import { AppMode, SubMode, LogicLevelId } from '../types';
import {
  Settings,
  Download,
  FolderOpen,
  FilePlus,
  Image,
  FlaskConical,
  GraduationCap,
  ShieldAlert,
  HelpCircle,
  Puzzle,
} from 'lucide-react';

interface LeftSidebarProps {
  currentMode: AppMode;
  gridSize: number;
  zoom: number;
  subMode: SubMode;
  logicLevel: LogicLevelId;
  onChangeGridSize: (size: number) => void;
  onChangeZoom: (zoom: number) => void;
  onSetSubMode: (mode: SubMode) => void;
  onLoadLogicLevel: (level: LogicLevelId) => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>, isInsert: boolean) => void;
  onExportPNG: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentMode,
  gridSize,
  zoom,
  subMode,
  logicLevel,
  onChangeGridSize,
  onChangeZoom,
  onSetSubMode,
  onLoadLogicLevel,
  onExportJSON,
  onImportJSON,
  onExportPNG,
}) => {
  const fileLoadRef = useRef<HTMLInputElement>(null);
  const fileInsertRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto z-10 select-none shrink-0">
      {/* Project & Canvas Settings */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>專案與畫布設定</span>
        </div>

        <label className="text-xs text-slate-400 mb-1 block">棋盤大小 (Grid Size)</label>
        <select
          value={gridSize}
          onChange={(e) => onChangeGridSize(parseInt(e.target.value))}
          className="w-full p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg mb-3 focus:outline-none focus:border-blue-500 text-xs"
        >
          <option value={10}>10 x 10</option>
          <option value={20}>20 x 20</option>
          <option value={30}>30 x 30</option>
          <option value={40}>40 x 40</option>
          <option value={50}>50 x 50</option>
          <option value={60}>60 x 60</option>
        </select>

        <label className="text-xs text-slate-400 mb-1 block">畫面縮放 (Zoom)</label>
        <select
          value={zoom}
          onChange={(e) => onChangeZoom(parseFloat(e.target.value))}
          className="w-full p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg mb-4 focus:outline-none focus:border-blue-500 text-xs"
        >
          <option value={0.25}>25% (微縮全景)</option>
          <option value={0.5}>50% (半景俯視)</option>
          <option value={0.75}>75% (適中視野)</option>
          <option value={1.0}>100% (標準尺寸)</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs py-2 px-2 rounded-lg font-semibold shadow transition-colors"
            onClick={onExportJSON}
          >
            <Download className="w-3.5 h-3.5" />
            <span>儲存</span>
          </button>
          <button
            className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs py-2 px-2 rounded-lg font-semibold shadow transition-colors"
            onClick={() => fileLoadRef.current?.click()}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>讀取</span>
          </button>
          <button
            className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-2 px-2 rounded-lg font-semibold shadow transition-colors"
            onClick={() => fileInsertRef.current?.click()}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>插入</span>
          </button>
          <button
            className="flex items-center justify-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs py-2 px-2 rounded-lg font-semibold shadow transition-colors"
            onClick={onExportPNG}
          >
            <Image className="w-3.5 h-3.5" />
            <span>截圖</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileLoadRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={(e) => onImportJSON(e, false)}
        />
        <input
          type="file"
          ref={fileInsertRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={(e) => onImportJSON(e, true)}
        />
      </div>

      {/* Chapter 1: Basic Electronic */}
      {currentMode === 'electronic' && (
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            第一章：基本電學實習
          </div>
          <button className="w-full text-left p-2.5 bg-blue-800 border border-blue-500 rounded-lg text-xs font-semibold text-white shadow flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>高解析沙盒模式</span>
          </button>
        </div>
      )}

      {/* Chapter 0: Tutorial */}
      {currentMode === 'tutorial' && (
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>0. 教學模式</span>
          </div>
          <div className="space-y-1.5">
            <button
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                logicLevel === '0-1'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onLoadLogicLevel('0-1')}
            >
              0-1 直線接線
            </button>
            <button
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                logicLevel === '0-2'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onLoadLogicLevel('0-2')}
            >
              0-2 轉彎接線
            </button>
            <button
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                logicLevel === '0-3'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onLoadLogicLevel('0-3')}
            >
              0-3 並聯電路
            </button>
            <button
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                logicLevel === '0-4'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onLoadLogicLevel('0-4')}
            >
              0-4 交錯獨立
            </button>
          </div>
        </div>
      )}

      {/* Chapter 2: Digital Logic */}
      {currentMode === 'logic' && (
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            第二章：數位邏輯
          </div>
          <button
            className={`w-full text-left p-2.5 mb-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
              logicLevel === 'sandbox'
                ? 'bg-blue-800 border-blue-500 text-white shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => onLoadLogicLevel('sandbox')}
          >
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>高解析沙盒模式</span>
          </button>

          <button
            className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
              logicLevel !== 'sandbox'
                ? 'bg-amber-800 border-amber-500 text-white shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => onLoadLogicLevel('tutorial-menu')}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>教學關卡</span>
          </button>
        </div>
      )}

      {/* Chapter 3: Industrial Wiring */}
      {currentMode === 'wiring' && (
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            第三章：工業配線
          </div>
          <div className="space-y-2">
            <button
              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
                logicLevel === 'sandbox' && subMode === 'sandbox'
                  ? 'bg-blue-800 border-blue-500 text-white shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => {
                onLoadLogicLevel('sandbox');
                onSetSubMode('sandbox');
              }}
            >
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span>高解析沙盒模式</span>
            </button>
            <button
              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
                logicLevel !== 'sandbox'
                  ? 'bg-amber-800 border-amber-500 text-white shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onLoadLogicLevel('wiring-menu')}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>教學關卡</span>
            </button>

            <button
              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
                subMode === 'debug'
                  ? 'bg-rose-900/80 border-rose-500 text-white shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onSetSubMode('debug')}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>實戰除錯模式 (導線不變色)</span>
            </button>
          </div>
        </div>
      )}

      {/* Chapter 4: PLC Ladder */}
      {currentMode === 'plc' && (
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Puzzle className="w-4 h-4 text-yellow-400" />
            <span>第四章：PLC 梯形圖</span>
          </div>
          <button className="w-full text-left p-2.5 bg-yellow-950/60 border border-yellow-600/80 rounded-lg text-xs font-semibold text-yellow-200 shadow flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-yellow-400" />
            <span>軟硬體整合沙盒</span>
          </button>
        </div>
      )}

      {/* Operation Guide */}
      <div className="p-4 flex-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>操作指南</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed space-y-1.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          <p>• 按下邏輯按鈕放開即彈回</p>
          <p>• 保險絲短路會燒毀，點擊更換</p>
          <p>• 點擊燈泡可開啟調色盤變色</p>
          <p>• 馬達 L/N 反接會產生逆轉</p>
          <p>• 氣壓缸推桿會物理觸發前方按鈕</p>
          <p>
            • 按 <kbd className="bg-slate-800 px-1 rounded text-white border border-slate-700">R</kbd> 旋轉，
            <kbd className="bg-slate-800 px-1 rounded text-white border border-slate-700">Del</kbd> 刪除
          </p>
          <p>
            • 支援 <kbd className="bg-slate-800 px-1 rounded text-white border border-slate-700">Ctrl+Z</kbd> 復原上一步
          </p>
        </div>
      </div>
    </aside>
  );
};
