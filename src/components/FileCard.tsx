import React from 'react';
import { 
  File, 
  FileText, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Share2, 
  Star, 
  Eye,
  ShieldCheck,
  Calendar,
  HardDrive,
  FileVideo,
  Music,
  FileCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface FileCardProps {
  file: any;
  viewMode?: 'grid' | 'list';
  onDownload: (file: any) => void;
  onDelete: (file: any) => void;
  onShare: (file: any) => void;
  onToggleFavorite: (file: any) => void;
  onPreview: (file: any) => void;
}

const getFileIcon = (type: string, downloadURL?: string) => {
  if (type.startsWith('image/')) {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-none">
        <img 
          src={downloadURL} 
          alt="Preview" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
      </div>
    );
  }
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-400" />;
  if (type.startsWith('video/')) return <FileVideo className="w-5 h-5 text-purple-400" />;
  if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-amber-400" />;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <FileCode className="w-5 h-5 text-emerald-400" />;
  return <File className="w-5 h-5 text-zinc-400" />;
};

export default function FileCard({ 
  file, 
  viewMode = 'grid', 
  onDownload, 
  onDelete, 
  onShare, 
  onToggleFavorite, 
  onPreview 
}: FileCardProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center gap-4 p-3 bg-zinc-900/30 border border-zinc-900 rounded-none hover:bg-zinc-900/50 hover:border-zinc-800 transition-all cursor-pointer"
        onClick={() => onPreview(file)}
      >
        <div className="w-10 h-10 bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-900 shrink-0 overflow-hidden">
          {getFileIcon(file.type, file.downloadURL)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white truncate tracking-tight">{file.name}</h3>
          <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-0.5">
            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <div className="w-1 h-1 bg-zinc-800 rounded-none" />
            <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!file.isSharedItem && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(file); }}
                className={`p-2 rounded-none transition-colors ${file.isFavorite ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-600 hover:text-orange-500 hover:bg-zinc-900'}`}
              >
                <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare(file); }}
                className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-none transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(file); }}
                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {file.isSharedItem && (
             <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest px-2">Shared by {file.ownerEmail}</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bento-card p-5 relative flex flex-col gap-5 cursor-pointer bg-zinc-900/30 border-zinc-900 hover:border-zinc-800 rounded-none"
      onClick={() => onPreview(file)}
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-900 group-hover:border-orange-500/30 transition-colors overflow-hidden">
          {getFileIcon(file.type, file.downloadURL)}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!file.isSharedItem && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(file); }}
              className={`p-2 rounded-none transition-colors ${file.isFavorite ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-600 hover:text-orange-500 hover:bg-zinc-900'}`}
            >
              <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          
          <div className="relative group/menu">
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-none transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-zinc-900 rounded-none shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
              <div className="p-2 space-y-1">
                <button onClick={(e) => { e.stopPropagation(); onPreview(file); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none transition-colors">
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDownload(file); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
                {!file.isSharedItem && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onShare(file); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none transition-colors">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <div className="h-px bg-zinc-900 my-1" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete(file); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500/20 rounded-none transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                {file.isSharedItem && (
                  <>
                    <div className="h-px bg-zinc-900 my-1" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete(file); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-white hover:bg-orange-500/20 rounded-none transition-colors">
                      <Trash2 className="w-4 h-4" /> Remove Share
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-black text-white truncate group-hover:text-orange-500 transition-colors tracking-tight" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> {(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(file.createdAt), 'MMM d')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-900 rounded-none text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
        </div>
        {file.encryptionKeyHint && (
          <div className="px-2.5 py-1 bg-orange-500/5 border border-orange-500/20 rounded-none text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Encrypted
          </div>
        )}
      </div>
    </motion.div>
  );
}
