'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Moon, Sun, Bell, Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-sky-200 to-sky-400 bg-clip-text text-transparent">
              AGENT & BROKER PORTAL
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
              ระบบบริหารจัดการตัวแทนและนายหน้าประกันภัย
            </p>
          </div>
        </Link>

        {/* Right Tools: Branch, Notifications, Theme, User */}
        <div className="flex items-center space-x-4">
          {/* Branch Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium">{currentUser.branchName}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-sky-400 hover:bg-slate-800 transition-colors"
            title="สลับโหมดมืด/สว่าง"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-sky-400 hover:bg-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          </button>

          {/* Active Profile Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-500/20">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-100">{currentUser.fullName}</p>
              <p className="text-[10px] text-sky-400 font-medium">{currentUser.roleDisplayName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
