/**
 * @license
 * Navbar Component for Auto Studio Pro
 */

import React from 'react';
import { AppMode } from '../types';
import { Cpu, Plug, GitBranch, Zap, Puzzle, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onSwitchMode }) => {
  return (
    <header className="h-[60px] bg-slate-950 border-b border-slate-800 flex items-center px-5 justify-between shadow-lg z-20 select-none">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Auto Studio Pro (HD)
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            三合一工業自動化模擬平台
          </p>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            currentMode === 'tutorial'
              ? 'bg-amber-700 text-white border-amber-400 shadow-md shadow-amber-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => onSwitchMode('tutorial')}
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>0. 教學模式</span>
        </button>

        <button
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            currentMode === 'electronic'
              ? 'bg-blue-700 text-white border-blue-400 shadow-md shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => onSwitchMode('electronic')}
        >
          <Plug className="w-4 h-4 text-blue-400" />
          <span>1. 基本電學</span>
        </button>

        <button
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            currentMode === 'logic'
              ? 'bg-blue-700 text-white border-blue-400 shadow-md shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => onSwitchMode('logic')}
        >
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span>2. 數位邏輯</span>
        </button>

        <button
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            currentMode === 'wiring'
              ? 'bg-blue-700 text-white border-blue-400 shadow-md shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => onSwitchMode('wiring')}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>3. 工業配線</span>
        </button>

        <button
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            currentMode === 'plc'
              ? 'bg-yellow-900/60 text-yellow-300 border-yellow-500 shadow-md shadow-yellow-600/20'
              : 'bg-slate-800/80 text-yellow-400 border-yellow-700/60 hover:bg-yellow-950/40'
          }`}
          onClick={() => onSwitchMode('plc')}
        >
          <Puzzle className="w-4 h-4 text-yellow-400" />
          <span>4. PLC 梯形圖</span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Engine: Unified NetEngine</span>
      </div>
    </header>
  );
};
