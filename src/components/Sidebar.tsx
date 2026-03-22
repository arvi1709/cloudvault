import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Share2, 
  Settings, 
  Trash2, 
  Star, 
  LogOut, 
  User,
  Folder,
  Clock,
  Shield,
  Pin,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'My Drive', icon: Folder },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'shared', label: 'Shared', icon: Share2 },
  { id: 'encrypted', label: 'Encrypted Files', icon: Shield },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  return (
    <div className="w-[280px] bg-[#000000] border-r border-zinc-900 flex flex-col h-screen sticky top-0 z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-500 rounded-none flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Lock className="text-white w-5 h-5" />
        </div>
        <h1 className="text-lg font-black text-white tracking-tighter">VaultShare</h1>
      </div>

      <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-none transition-all duration-200 group relative",
                  activeTab === item.id
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-transform duration-200",
                  activeTab === item.id ? "text-orange-500" : "text-zinc-600 group-hover:text-white"
                )} />
                <span className="font-bold text-sm">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 w-1 h-4 bg-orange-500 rounded-none"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">System</p>
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-none transition-all duration-200 group",
                  activeTab === item.id
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-[18px] h-[18px]",
                  activeTab === item.id ? "text-orange-500" : "text-zinc-600 group-hover:text-white"
                )} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Storage Widget */}
        <div className="px-4">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-none p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500">Storage</span>
              <span className="text-[10px] font-black text-orange-500">75% Used</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-none overflow-hidden mb-3">
              <div className="h-full bg-orange-500 w-[75%] rounded-none shadow-[0_0_10px_rgba(255,87,0,0.3)]" />
            </div>
            <p className="text-[10px] font-medium text-zinc-600 leading-relaxed">
              Using 37.5 GB of 50 GB. Upgrade for more space.
            </p>
            <button className="w-full mt-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black rounded-none transition-colors uppercase tracking-widest">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-none overflow-hidden border border-zinc-800 bg-zinc-900">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="text-zinc-500 w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.displayName || 'User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
