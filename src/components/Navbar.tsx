/**
 * @license
 * Navbar Component for Auto Studio Pro
 */

import React from 'react';
import { AppMode } from '../types';
import { Cpu, Plug, GitBranch, Zap, Puzzle, GraduationCap, Menu, Wrench, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onSwitchMode, onToggleLeftSidebar, onToggleRightSidebar, isDarkMode, onToggleTheme }) => {
  return (
    <header className="w-full max-w-full h-auto min-h-[60px] py-2 md:py-0 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-center px-3 md:px-5 justify-between shadow-lg z-20 select-none gap-3 md:gap-0">
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            className="xl:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            onClick={onToggleLeftSidebar}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20 shrink-0 hidden sm:block">
            <Cpu className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 truncate">
              Auto Studio Pro (HD)
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              三合一工業自動化模擬平台
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="切換桌布主題"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Engine: Unified</span>
          </div>
          <button 
            className="xl:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            onClick={onToggleRightSidebar}
          >
            <Wrench className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar snap-x">
        <button
          className={`shrink-0 snap-start flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
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
          className={`shrink-0 snap-start flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
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
          className={`shrink-0 snap-start flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
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
          className={`shrink-0 snap-start flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
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
          className={`shrink-0 snap-start flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
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
    </header>
  );
};
