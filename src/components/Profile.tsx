import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Calendar, Clock, HardDrive, 
  Image as ImageIcon, FileText, File, Activity, 
  Upload, Share2, Shield, Key, Smartphone, ChevronRight 
} from 'lucide-react';

interface ProfileProps {
  user: any;
  files: any[];
  setActiveTab: (tab: string) => void;
  setIsUploadOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Profile({ user, files, setActiveTab, setIsUploadOpen, onLogout }: ProfileProps) {
  // Calculate Storage
  const totalStorage = 50 * 1024 * 1024 * 1024; // 50 GB
  const usedStorage = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const usedPercentage = Math.min((usedStorage / totalStorage) * 100, 100);

  // File type breakdown
  const imageFiles = files.filter(f => f.type?.startsWith('image/'));
  const pdfFiles = files.filter(f => f.type?.includes('pdf'));
  const otherFiles = files.filter(f => !f.type?.startsWith('image/') && !f.type?.includes('pdf'));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const recentActivity = files
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">
        <span onClick={() => setActiveTab('dashboard')} className="hover:text-white cursor-pointer transition-colors">My Drive</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-orange-500">Profile Dashboard</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* User Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-zinc-900 p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
            <div className="flex flex-col items-center text-center mt-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4 text-3xl font-black text-white border-4 border-[#0a0a0a]">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-4 right-0 bg-zinc-800 p-2 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors">
                  <Upload className="w-3 h-3 text-white" />
                </button>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{user?.displayName || 'Vault User'}</h2>
              <p className="text-zinc-500 font-bold text-sm tracking-widest mt-1">{user?.email}</p>
              
              <div className="w-full h-px bg-zinc-900 my-6" />
              
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Joined</span>
                  <span className="text-zinc-300">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Last Login</span>
                  <span className="text-zinc-300">{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-zinc-900 p-6"
          >
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setIsUploadOpen(true)} className="w-full flex items-center gap-3 p-3 bg-zinc-900/50 hover:bg-orange-500/10 hover:text-orange-500 text-zinc-400 transition-all border border-zinc-900 hover:border-orange-500/30 group">
                <Upload className="w-4 h-4 text-zinc-500 group-hover:text-orange-500" />
                <span className="text-sm font-bold">Upload New File</span>
              </button>
              <button onClick={() => setActiveTab('dashboard')} className="w-full flex items-center gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 transition-all border border-zinc-900">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold">Go to My Drive</span>
              </button>
              <button onClick={() => setActiveTab('shared')} className="w-full flex items-center gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 transition-all border border-zinc-900">
                <Share2 className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold">View Shared Files</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Storage Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#0a0a0a] border border-zinc-900 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Storage Overview</h3>
              <span className="text-xs font-black text-orange-500 bg-orange-500/10 px-3 py-1">{formatSize(usedStorage)} / 50 GB</span>
            </div>

            <div className="h-4 bg-zinc-900 w-full overflow-hidden flex mb-6">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(usedPercentage, 1)}%` }} className="h-full bg-orange-500" />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-zinc-900 pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Images</span>
                </div>
                <span className="text-lg font-black text-white">{imageFiles.length} <span className="text-xs text-zinc-600">files</span></span>
              </div>
              <div className="flex flex-col gap-2 border-l border-zinc-900 pl-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">PDFs</span>
                </div>
                <span className="text-lg font-black text-white">{pdfFiles.length} <span className="text-xs text-zinc-600">files</span></span>
              </div>
              <div className="flex flex-col gap-2 border-l border-zinc-900 pl-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <File className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Others</span>
                </div>
                <span className="text-lg font-black text-white">{otherFiles.length} <span className="text-xs text-zinc-600">files</span></span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-[#0a0a0a] border border-zinc-900 p-6"
            >
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Security
              </h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-zinc-900">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-bold text-zinc-300">Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>
                <div className="w-full flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-900">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-zinc-500" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-zinc-300">Two-Factor Auth (2FA)</span>
                      <span className="text-[10px] text-zinc-600 font-bold">Enhance account security</span>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-[#0a0a0a] border border-zinc-900 p-6 flex flex-col"
            >
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Recent Uploads
              </h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {recentActivity.map((file, i) => (
                    <div key={file.id || i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center shrink-0">
                          <File className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-white truncate">{file.name}</p>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase">{new Date(file.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-black shrink-0">{formatSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm font-bold">
                  No recent activity
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
