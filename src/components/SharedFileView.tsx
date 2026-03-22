import React, { useEffect, useState } from 'react';
import { doc, getDocs, collection, query, where, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { decryptFile } from '../lib/crypto';
import { Download, File as FileIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SharedFileView({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        // 1. Find the share token in the 'shares' collection
        const sharesRef = collection(db, 'shares');
        const q = query(sharesRef, where('shareToken', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('This shared link does not exist or has been removed.');
          setLoading(false);
          return;
        }

        const shareDoc = querySnapshot.docs[0].data();

        // Check expiry if exists
        if (shareDoc.expiryDate && new Date(shareDoc.expiryDate) < new Date()) {
          setError('This shared link has expired.');
          setLoading(false);
          return;
        }

        // 2. Fetch the file metadata from 'files' collection
        const fileRef = doc(db, 'files', shareDoc.fileId);
        const fileSnap = await getDoc(fileRef);

        if (!fileSnap.exists()) {
          setError('The original file has been deleted by the owner.');
          setLoading(false);
          return;
        }

        setFileData(fileSnap.data());
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the shared file.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [token]);

  const handleDownload = async () => {
    if (!fileData || !fileData.downloadURL) return;
    setDownloading(true);

    try {
      // Fetch the encrypted file from Supabase
      const response = await fetch(fileData.downloadURL);
      const encryptedText = await response.text();

      // Decrypt using the encryptionKeyHint stored in Firestore
      const decryptedBase64 = decryptFile(encryptedText, fileData.encryptionKeyHint);

      // Trigger download
      const a = document.createElement('a');
      a.href = decryptedBase64;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download or decrypt the file.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Locating Secure File...</p>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">Access Denied</h1>
        <p className="text-zinc-500 font-bold max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-orange-500/10 mx-auto rounded-none flex items-center justify-center border border-orange-500/20 mb-6">
          <FileIcon className="text-orange-500 w-10 h-10" />
        </div>
        
        <h1 className="text-xl font-black text-white tracking-tight mb-2 truncate" title={fileData.name}>
          {fileData.name}
        </h1>
        
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">
          {(fileData.size / 1024 / 1024).toFixed(2)} MB • Securely Encrypted
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 bg-orange-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Decrypting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download File
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}