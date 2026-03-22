import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Filter, 
  Shield, 
  Cloud, 
  HardDrive, 
  Star, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Pin,
  FolderOpen,
  ChevronRight,
  ShieldCheck,
  X,
  Download,
  Share2,
  Eye,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import FileCard from './FileCard';
import UploadModal from './UploadModal';
import FilePreview from './FilePreview';
import ShareModal from './ShareModal';
import Profile from './Profile';
import Settings from './Settings';

interface DashboardProps {
  activeTab: string;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
}

export default function Dashboard({ activeTab, isUploadOpen, setIsUploadOpen }: DashboardProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  
  // States for encrypted tab
  const [isPinEntered, setIsPinEntered] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    let q = query(collection(db, 'files'), where('ownerId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFiles(filesData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'files');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayFiles = useMemo(() => {
    let filtered = files;
    
    if (activeTab === 'dashboard') {
      filtered = files.filter(f => !f.isTrashed);
    } else if (activeTab === 'favorites') {
      filtered = files.filter(f => f.isFavorite && !f.isTrashed);
    } else if (activeTab === 'trash') {
      filtered = files.filter(f => f.isTrashed);
    } else if (activeTab === 'recent') {
      filtered = files.filter(f => !f.isTrashed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    } else if (activeTab === 'encrypted') {
      filtered = files.filter(f => f.encryptionKeyHint && !f.isTrashed);
    } else {
      filtered = files.filter(f => !f.isTrashed);
    }

    if (sizeFilter !== 'all') {
      filtered = filtered.filter(file => {
        const sizeMB = file.size / 1024 / 1024;
        if (sizeFilter === 'small') return sizeMB < 1;
        if (sizeFilter === 'medium') return sizeMB >= 1 && sizeMB <= 10;
        if (sizeFilter === 'large') return sizeMB > 10;
        return true;
      });
    }

    return filtered;
  }, [files, activeTab, sizeFilter]);

  const pinnedFiles = useMemo(() => files.filter(f => f.isFavorite && !f.isTrashed), [files]);
  const recentFiles = useMemo(() => files.filter(f => !f.isTrashed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8), [files]);

  const handleToggleFavorite = async (file: any) => {
    try {
      await updateDoc(doc(db, 'files', file.id), { isFavorite: !file.isFavorite });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `files/${file.id}`);
    }
  };

  const handleDelete = async (file: any) => {
    try {
      if (file.isTrashed) {
        await deleteDoc(doc(db, 'files', file.id));
      } else {
        await updateDoc(doc(db, 'files', file.id), { isTrashed: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `files/${file.id}`);
    }
  };

  const handleBulkDelete = async () => {
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      const file = files.find(f => f.id === id);
      if (file?.isTrashed) {
        batch.delete(doc(db, 'files', id));
      } else {
        batch.update(doc(db, 'files', id), { isTrashed: true });
      }
    });
    await batch.commit();
    setSelectedIds(new Set());
  };

  const handleDownload = async (file: any) => {
    try {
      if (!file.downloadURL) {
         console.error("No download URL found");
         return;
      }

      // 1. Fetch the encrypted file from Supabase
      const response = await fetch(file.downloadURL);
      const encryptedData = await response.text();

      // 2. Decrypt the data using the key stored in Firestore
      // Note: We need to import decryptFile from lib/crypto
      const { decryptFile } = await import('../lib/crypto');
      const decryptedBase64 = decryptFile(encryptedData, file.encryptionKeyHint);
      
      if (!decryptedBase64) {
         throw new Error("Decryption failed. The data might be corrupted or the key is wrong.");
      }

      // 3. Trigger download of the decrypted file
      const a = document.createElement('a');
      a.href = decryptedBase64; // The decrypted data is already a base64 data URL
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error downloading or decrypting file:", error);
      alert("Failed to download or decrypt the file.");
    }
  };

  const handlePreview = (file: any) => {
    setSelectedFile(file);
    setShowDetails(true);
  };

  const handleShare = (file: any) => {
    setSelectedFile(file);
    setIsShareOpen(true);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const stats = [
    { label: 'Storage', value: '37.5 GB / 50 GB', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Files', value: files.length, icon: HardDrive, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Security', value: 'AES-256', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative w-64 h-64 mb-8">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-zinc-900 border border-zinc-900 rounded-none shadow-2xl rotate-[30deg] skew-y-[-15deg] flex items-center justify-center"
        >
          <FolderOpen className="w-24 h-24 text-zinc-800" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/4 left-1/4 w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-none shadow-xl rotate-[30deg] skew-y-[-15deg] flex items-center justify-center"
        >
          <Plus className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
      <h3 className="text-2xl font-black text-white mb-2">Your vault is empty</h3>
      <p className="text-zinc-500 max-w-xs mx-auto">
        Start securing your digital assets by uploading your first file.
      </p>
      <button 
        onClick={() => setIsUploadOpen(true)}
        className="mt-8 bg-orange-500 text-white font-black px-8 py-3 rounded-none hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        Upload Now
      </button>
    </motion.div>
  );

  const PinScreen = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-800 shadow-xl mb-8">
        <Shield className="w-10 h-10 text-orange-500" />
      </div>
      <h3 className="text-3xl font-black text-white mb-2">Encrypted Vault</h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-8 font-bold">
        Enter your 4-digit security PIN to access your highly sensitive encrypted files. (Demo: Use 1234)
      </p>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (pinCode === '1234') {
          setIsPinEntered(true);
          setPinError(false);
        } else {
          setPinError(true);
          setPinCode('');
        }
      }} className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {/* Visual dots or input for PIN */}
          <input
            type="password"
            maxLength={4}
            value={pinCode}
            onChange={(e) => {
              setPinCode(e.target.value);
              setPinError(false);
            }}
            placeholder="••••"
            className="w-48 text-center tracking-[1em] bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-white font-bold py-4 rounded-none transition-all"
            autoFocus
          />
        </div>
        {pinError && <p className="text-red-500 text-sm font-bold animate-pulse">Incorrect PIN. Try 1234.</p>}
        <button 
          type="submit"
          className="mt-4 bg-orange-500 text-white font-black px-8 py-3 rounded-none hover:bg-orange-600 transition-all active:scale-95 w-48"
        >
          Unlock
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden bg-black">
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-10 w-full">
          {/* Breadcrumbs */}
          {activeTab !== 'settings' && activeTab !== 'profile' && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              <span className="hover:text-white cursor-pointer transition-colors">My Drive</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-orange-500">{activeTab === 'dashboard' ? 'All Files' : activeTab}</span>
            </div>
          )}

          {activeTab === 'settings' ? (
            <Settings />
          ) : activeTab === 'profile' ? (
            <Profile 
              user={auth.currentUser} 
              files={files} 
              setActiveTab={(tab: string) => {}} 
              setIsUploadOpen={setIsUploadOpen} 
              onLogout={() => auth.signOut()} 
            />
          ) : activeTab === 'encrypted' && !isPinEntered ? (
            <PinScreen />
          ) : (
            <>
              {/* Bento Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bento-card p-6 flex items-center gap-6"
                  >
                    <div className={`w-12 h-12 ${stat.bg} rounded-none flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-black text-white mt-0.5">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Access Section (Only on Dashboard) */}
              {activeTab === 'dashboard' && recentFiles.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-widest">Quick Access</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentFiles.slice(0, 4).map(file => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        onToggleFavorite={handleToggleFavorite}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Main File List Section */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-orange-500" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                      {activeTab === 'dashboard' ? 'All Files' : 
                       activeTab === 'favorites' ? 'Starred' : 
                       activeTab === 'trash' ? 'Trash' : 
                       activeTab === 'recent' ? 'Recent Files' :
                       activeTab === 'encrypted' ? 'Encrypted Vault' : 'Files'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-900 rounded-none px-3 py-1.5"
                      >
                        <span className="text-[10px] font-black text-orange-500">{selectedIds.size} selected</span>
                        <button onClick={handleBulkDelete} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-none transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                    
                    <div className="flex bg-zinc-900/50 p-1 rounded-none border border-zinc-900">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-none transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-none transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <Filter className="w-4 h-4 text-zinc-600 mr-2 shrink-0" />
                  {['all', 'small', 'medium', 'large'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSizeFilter(filter as any)}
                      className={`px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all border ${
                        sizeFilter === filter 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-zinc-900/50 border-zinc-900 text-zinc-600 hover:text-white hover:border-zinc-800'
                      }`}
                    >
                      {filter === 'all' ? 'All Sizes' : filter}
                    </button>
                  ))}
                </div>

                {/* Files Grid */}
                <div className="relative min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                          <p className="text-zinc-600 text-sm font-bold tracking-tight">Synchronizing vault...</p>
                        </div>
                      </div>
                    ) : displayFiles.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                        {displayFiles.map((file) => (
                          <div key={file.id} className="relative group/card">
                            <button
                              onClick={() => toggleSelect(file.id)}
                              className={`absolute top-3 left-3 z-10 p-1 rounded-none transition-all opacity-0 group-hover/card:opacity-100 ${
                                selectedIds.has(file.id) ? 'bg-orange-500 text-white opacity-100' : 'bg-zinc-900/80 text-zinc-600 hover:text-white'
                              }`}
                            >
                              {selectedIds.has(file.id) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <FileCard
                              file={file}
                              viewMode={viewMode}
                              onDownload={handleDownload}
                              onDelete={handleDelete}
                              onShare={handleShare}
                              onToggleFavorite={handleToggleFavorite}
                              onPreview={handlePreview}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Security Footer */}
              <div className="flex items-center justify-center gap-4 py-12">
                <div className="h-px flex-1 bg-zinc-900" />
                <div className="flex items-center gap-3 px-6 py-2 bg-zinc-900/30 border border-zinc-900 rounded-none text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  End-to-End Encrypted Storage Protocol
                </div>
                <div className="h-px flex-1 bg-zinc-900" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel: File Details */}
      <AnimatePresence>
        {showDetails && selectedFile && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 bg-[#050505] border-l border-zinc-900 backdrop-blur-xl p-8 overflow-y-auto hidden xl:block z-30"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-white tracking-tight">Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-zinc-900 rounded-none text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="aspect-square bg-zinc-900/50 rounded-none border border-zinc-900 flex items-center justify-center overflow-hidden group relative">
                {selectedFile.type.startsWith('image/') ? (
                  <img src={selectedFile.downloadURL} alt={selectedFile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <File className="w-16 h-16 text-zinc-800" />
                )}
                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black gap-2"
                >
                  <Eye className="w-5 h-5" /> Open Preview
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-white break-all leading-tight">{selectedFile.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-none border border-orange-500/20">
                    {selectedFile.type.split('/')[1]?.toUpperCase()}
                  </span>
                  {selectedFile.encryptionKeyHint && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-none border border-purple-500/20 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> Encrypted
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-8 border-t border-zinc-900">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Size</span>
                  <span className="text-sm font-bold text-zinc-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Created</span>
                  <span className="text-sm font-bold text-zinc-400">{format(new Date(selectedFile.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Owner</span>
                  <span className="text-sm font-bold text-zinc-400">You</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => handleDownload(selectedFile)}
                  className="flex-1 bg-orange-500 text-white font-black py-3 rounded-none hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button 
                  onClick={() => handleShare(selectedFile)}
                  className="p-3 bg-zinc-900 text-white rounded-none hover:bg-zinc-800 transition-all border border-zinc-800"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setIsUploadOpen(false)}
      />
      
      <FilePreview
        file={selectedFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
      />

      <ShareModal
        file={selectedFile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
