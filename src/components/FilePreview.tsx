import React, { useState, useEffect } from 'react';
import { X, Download, Shield, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { decryptFile } from '../lib/crypto';

interface FilePreviewProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: any) => void;
}

export default function FilePreview({ file, isOpen, onClose, onDownload }: FilePreviewProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      handleDecrypt();
    } else {
      setDecryptedContent(null);
      setError(null);
    }
  }, [isOpen, file]);

  const handleDecrypt = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(file.downloadURL);
      const encryptedText = await response.text();
      const decrypted = decryptFile(encryptedText, file.encryptionKeyHint);
      setDecryptedContent(decrypted);
    } catch (err) {
      console.error('Decryption failed:', err);
      setError('Failed to decrypt file. The key might be invalid or the file is corrupted.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !file) return null;

  const isImage = file.type.includes('image');
  const isPDF = file.type.includes('pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-none flex items-center justify-center border border-orange-500/20">
                <Shield className="text-orange-500 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight truncate max-w-xs md:max-w-md">{file.name}</h2>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Secure Preview Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onDownload(file)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={onClose} className="p-2.5 text-zinc-600 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-12 flex items-center justify-center bg-[#050505]">
            {loading ? (
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-zinc-600 text-sm font-black uppercase tracking-[0.2em] animate-pulse">Decrypting secure content...</p>
              </div>
            ) : error ? (
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-500/10 rounded-none flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-red-500 w-10 h-10" />
                </div>
                <h3 className="text-white font-black text-xl mb-3 tracking-tight">Decryption Error</h3>
                <p className="text-zinc-600 text-sm font-bold leading-relaxed">{error}</p>
              </div>
            ) : decryptedContent ? (
              <div className="w-full h-full flex items-center justify-center">
                {isImage ? (
                  <img
                    src={decryptedContent}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain rounded-none shadow-2xl border border-zinc-900"
                    referrerPolicy="no-referrer"
                  />
                ) : isPDF ? (
                  <iframe
                    src={decryptedContent}
                    className="w-full h-full rounded-none border border-zinc-900 bg-zinc-900/10"
                    title={file.name}
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-zinc-900 rounded-none flex items-center justify-center mx-auto mb-8 border border-zinc-900">
                      <Shield className="text-orange-500 w-12 h-12" />
                    </div>
                    <h3 className="text-white font-black text-2xl mb-3 tracking-tight">Secure File</h3>
                    <p className="text-zinc-600 max-w-xs mx-auto text-sm font-bold leading-relaxed">
                      This file is encrypted. Preview is available for supported formats (Images, PDFs).
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          <div className="p-6 border-t border-zinc-900 bg-zinc-900/50 flex items-center justify-center gap-12 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> End-to-End Encrypted</span>
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Zero Knowledge Storage</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
