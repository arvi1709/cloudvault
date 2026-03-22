import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Plus, Command, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { auth } from '../lib/firebase';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onUploadClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export default function TopBar({ searchQuery, setSearchQuery, onUploadClick, onProfileClick, onSettingsClick }: TopBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = auth.currentUser;

  return (
    <header className="h-20 bg-[#000000]/80 backdrop-blur-xl border-b border-zinc-900 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-orange-500' : 'text-zinc-600'}`}>
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search files, folders, or shared content..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/30 border border-zinc-900 rounded-none py-2.5 pl-11 pr-12 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 bg-zinc-900/50 border border-zinc-800 rounded-none">
            <Command className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] font-black text-zinc-600">K</span>
          </div>

          {/* Search Suggestions (Mock) */}
          {isFocused && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-zinc-900 rounded-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <p className="px-3 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-wider">Recent Searches</p>
                <button className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 rounded-none transition-colors">
                  Project_Proposal_Final.pdf
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 rounded-none transition-colors">
                  Design_System_v2.fig
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-8">
        <button
          onClick={onUploadClick}
          className="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-5 py-2.5 rounded-none transition-all shadow-lg shadow-orange-500/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Upload
        </button>
        
        <div className="h-8 w-px bg-zinc-900 mx-2" />

        <button className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none transition-all relative group">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-none border-2 border-[#000000] group-hover:scale-110 transition-transform"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 bg-zinc-900/30 border border-zinc-900 rounded-none hover:bg-zinc-900 transition-all"
          >
            <div className="w-8 h-8 rounded-none bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-xs">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-morphism rounded-none shadow-2xl border border-zinc-800/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-zinc-800/50">
                <p className="text-sm font-black text-white truncate">{user?.displayName || 'User'}</p>
                <p className="text-[10px] font-bold text-zinc-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { onProfileClick(); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-none transition-all"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button 
                  onClick={() => { onSettingsClick(); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-none transition-all"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <div className="h-px bg-zinc-800/50 my-1" />
                <button 
                  onClick={() => auth.signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:text-white hover:bg-red-500/10 rounded-none transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
