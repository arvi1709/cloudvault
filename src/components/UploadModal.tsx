import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { encryptFile, fileToBase64, generateKey } from '../lib/crypto';
import { supabase } from '../lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB limit for demo
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!auth.currentUser || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const fileId = Math.random().toString(36).substring(2, 15);
        const encryptionKey = generateKey();
        
        // Update progress manually since Supabase js v2 doesn't have an onProgress handler directly
        setProgress(prev => ({ ...prev, [file.name]: 20 }));
        
        // 1. Convert to Base64 and Encrypt
        const base64 = await fileToBase64(file);
        const encryptedData = encryptFile(base64, encryptionKey);
        
        setProgress(prev => ({ ...prev, [file.name]: 50 }));

        // 2. Upload to Supabase Storage (Encrypted Blob)
        const storagePath = `files/${auth.currentUser.uid}/${fileId}`;
        const blob = new Blob([encryptedData], { type: 'text/plain' });
        
        const { error: uploadError } = await supabase.storage
          .from('vault-files')
          .upload(storagePath, blob, {
            contentType: 'text/plain',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload to Supabase failed: ${uploadError.message}`);
        }

        setProgress(prev => ({ ...prev, [file.name]: 80 }));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vault-files')
          .getPublicUrl(storagePath);
              
        // 3. Save Metadata to Firestore
        try {
          await addDoc(collection(db, 'files'), {
            name: file.name,
            type: file.type,
            size: file.size,
            ownerId: auth.currentUser?.uid,
            storagePath: storagePath,
            downloadURL: publicUrl,
            encryptionKeyHint: encryptionKey, // In a real app, this would be handled more securely
            isFavorite: false,
            isTrashed: false,
            createdAt: new Date().toISOString()
          });
          setProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, 'files');
          throw fsErr;
        }
      }
      
      onSuccess();
      onClose();
      setFiles([]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-none flex items-center justify-center border border-orange-500/20">
                <Upload className="text-orange-500 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Upload Files</h2>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Securely encrypt and store your data</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {!uploading && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-none p-6 sm:p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group relative overflow-hidden ${
                  isDragActive ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 hover:bg-zinc-900/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 rounded-none flex items-center justify-center transition-all duration-500 ${
                  isDragActive ? 'bg-orange-500 text-white scale-110' : 'bg-zinc-900 text-zinc-600 group-hover:scale-110 group-hover:text-orange-500'
                }`}>
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center relative z-10">
                  <p className="text-lg font-black text-white tracking-tight">Drag & drop files here</p>
                  <p className="text-zinc-600 text-sm font-black uppercase tracking-widest mt-2">or click to <span className="text-orange-500">browse files</span></p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-black mt-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AES-256 Client-Side Encryption
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-[80px]" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px]" />
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Queue ({files.length})</h4>
                  {!uploading && (
                    <button onClick={() => setFiles([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
                  )}
                </div>
                {files.map((file, index) => (
                  <div key={index} className="bg-zinc-900/50 border border-zinc-900 rounded-none p-4 flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-900 group-hover:border-orange-500/30 transition-colors">
                      <File className="text-zinc-600 w-5 h-5 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate tracking-tight">{file.name}</p>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {uploading ? (
                      <div className="w-24">
                        <div className="h-1.5 w-full bg-zinc-900 rounded-none overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress[file.name] || 0}%` }}
                            className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                          />
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => removeFile(index)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-none flex items-center gap-3 text-red-500 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-zinc-900 bg-[#050505] flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2.5 rounded-none text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="px-8 py-2.5 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-none hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Securing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Upload Now
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
