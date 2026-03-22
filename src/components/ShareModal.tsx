import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, Calendar, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ShareModalProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ file, isOpen, onClose }: ShareModalProps) {
  const [accessType, setAccessType] = useState<'public' | 'private'>('public');
  const [expiry, setExpiry] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await addDoc(collection(db, 'shares'), {
        fileId: file.id,
        ownerId: file.ownerId,
        shareToken,
        accessType,
        createdAt: new Date().toISOString()
      });

      const link = `${window.location.origin}/share/${shareToken}`;
      setShareLink(link);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'shares');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-none flex items-center justify-center border border-orange-500/20">
                <Share2 className="text-orange-500 w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Share File</h2>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Access Control</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAccessType('public')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-none border transition-all ${
                    accessType === 'public' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-zinc-900/30 border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">Public Link</span>
                </button>
                <button
                  onClick={() => setAccessType('private')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-none border transition-all ${
                    accessType === 'private' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900/30 border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <Lock className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">Private Access</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
                {accessType === 'public' ? 'Anyone with the link can view and download' : 'Only specific authorized users can access'}
              </p>
            </div>

            {shareLink ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Shareable Link</label>
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#050505] border border-zinc-900 rounded-none px-4 py-4 text-sm text-zinc-400 truncate font-bold">
                    {shareLink}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-4 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10"
                  >
                    {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={generateLink}
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white font-black uppercase tracking-widest rounded-none hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </button>
            )}
          </div>

          <div className="p-8 bg-[#050505] border-t border-zinc-900 flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-900">
              <LinkIcon className="text-zinc-600 w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-relaxed">
              Links are encrypted and secure. Public links can be viewed by anyone with the URL.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { Share2 } from 'lucide-react';
