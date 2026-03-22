import React, { useEffect, useState } from 'react';
import { doc, getDocs, collection, query, where, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { decryptFile } from '../lib/crypto';
import { Download, File as FileIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';

export default function SharedFileView({ token, onClose, currentUser }: { token: string, onClose?: () => void, currentUser?: User | null }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
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

        const fileRef = doc(db, 'files', shareDoc.fileId);
        const fileSnap = await getDoc(fileRef);

        if (!fileSnap.exists()) {
          setError('The original file has been deleted by the owner.');
          setLoading(false);
          return;
        }

        const data = fileSnap.data();
        const ownerEmail = shareDoc.ownerEmail || 'Unknown User';

        setFileData({ ...data, ownerEmail });

        // If the user is logged in, and this link isn't their own file, add it to their 'shared_files'
        if (currentUser && currentUser.uid !== shareDoc.ownerId) {
          const sharedQ = query(
            collection(db, 'shared_files'),
            where('receiverId', '==', currentUser.uid),
            where('fileId', '==', shareDoc.fileId)
          );
          const sharedSnap = await getDocs(sharedQ);

          if (sharedSnap.empty) {
            await addDoc(collection(db, 'shared_files'), {
              receiverId: currentUser.uid,
              receiverEmail: currentUser.email,
              ownerId: shareDoc.ownerId,
              ownerEmail: ownerEmail,
              fileId: shareDoc.fileId,
              fileData: data,
              sharedAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the shared file.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [token, currentUser]);

  const handleDownload = async () => {
    if (!fileData || !fileData.downloadURL) return;
    setDownloading(true);

    try {
      const response = await fetch(fileData.downloadURL);
      const encryptedText = await response.text();

      const decryptedBase64 = decryptFile(encryptedText, fileData.encryptionKeyHint);

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

  const modalContainerClasses = onClose 
    ? "fixed inset-0 z-50 flex items-center justify-center p-4" 
    : "min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4";

  if (loading) {
    return (
      <div className={modalContainerClasses}>
        {onClose && <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />}
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Locating Secure File...</p>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className={modalContainerClasses}>
        {onClose && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
        )}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 text-center rounded-none"
        >
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">Access Denied</h1>
          <p className="text-zinc-500 font-bold max-w-md mx-auto">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className={modalContainerClasses}>
        {onClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
        )}
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl p-8 text-center"
        >
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-20 h-20 bg-orange-500/10 mx-auto rounded-none flex items-center justify-center border border-orange-500/20 mb-6">
            <FileIcon className="text-orange-500 w-10 h-10" />
          </div>
          
          <h1 className="text-xl font-black text-white tracking-tight mb-2 truncate" title={fileData.name}>
            {fileData.name}
          </h1>
          
          <div className="flex flex-col gap-1 mb-8">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {(fileData.size / 1024 / 1024).toFixed(2)} MB • Securely Encrypted
            </p>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 inline-block px-3 py-1 mx-auto border border-orange-500/20">
              Shared by {fileData.ownerEmail}
            </p>
          </div>

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
    </AnimatePresence>
  );
}