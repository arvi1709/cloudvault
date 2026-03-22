import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import SharedFileView from './components/SharedFileView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    // If opening a shared link, grab the token from the URL and clear it so it doesn't stay in the bar
    if (window.location.pathname.startsWith('/share/')) {
      const token = window.location.pathname.split('/share/')[1];
      if (token) {
        setShareToken(token);
      }
      window.history.replaceState({}, '', '/');
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-none"
        />
      </div>
    );
  }

  if (!user) {
    if (shareToken) {
      return <SharedFileView token={shareToken} currentUser={null} />;
    }
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-500">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onUploadClick={() => setIsUploadOpen(true)} 
          onProfileClick={() => setActiveTab('profile')}
          onSettingsClick={() => setActiveTab('settings')}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard 
                activeTab={activeTab} 
                isUploadOpen={isUploadOpen}
                setIsUploadOpen={setIsUploadOpen}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Shared Link Popup for Authenticated Users */}
      {shareToken && (
        <SharedFileView 
          token={shareToken} 
          onClose={() => setShareToken(null)} 
          currentUser={user} 
        />
      )}

      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}} />
    </div>
  );
}
