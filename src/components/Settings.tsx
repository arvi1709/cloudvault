import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, HardDrive, Share2, Palette, Bell, Monitor, Trash2, Key, 
  Lock, Globe, Cloud, Zap, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('security');
  
  // States for toggles
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoDeleteTrash, setAutoDeleteTrash] = useState(false);

  const sections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'encryption', label: 'Vault Encryption', icon: Lock },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'sharing', label: 'Sharing', icon: Share2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 min-h-[70vh]">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
          <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-orange-500">{sections.find(s => s.id === activeSection)?.label}</span>
        </div>

        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all font-bold text-sm ${
              activeSection === section.id 
                ? 'bg-[#0a0a0a] border-l-2 border-orange-500 text-orange-500' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50 border-l-2 border-transparent'
            }`}
          >
            <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-orange-500' : 'text-zinc-600'}`} />
            {section.label}
          </button>
        ))}
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 bg-[#0a0a0a] border border-zinc-900 p-8 relative overflow-hidden min-h-[500px]">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 relative z-10"
          >
            
            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Security Settings</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div className="w-full">
                      <h4 className="text-sm font-bold text-white mb-3">Change Account Password</h4>
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const target = e.target as typeof e.target & {
                            newPassword: { value: string };
                          };
                          const newPassword = target.newPassword.value;
                          if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
                          try {
                            const { auth } = await import('../lib/firebase');
                            const { updatePassword } = await import('firebase/auth');
                            if (auth.currentUser) {
                              await updatePassword(auth.currentUser, newPassword);
                              alert("Password successfully updated!");
                              target.newPassword.value = '';
                            }
                          } catch (error: any) {
                            if (error.code === 'auth/requires-recent-login') {
                              alert("Please log out and log back in to change your password for security reasons.");
                            } else {
                              alert("Error updating password: " + error.message);
                            }
                          }
                        }}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <input 
                          type="password" 
                          name="newPassword" 
                          placeholder="Enter new password" 
                          required
                          minLength={6}
                          className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" 
                        />
                        <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors whitespace-nowrap">
                          Update
                        </button>
                      </form>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-3">Requires recent login</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Auto Logout</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sign out after 30 minutes of inactivity</p>
                    </div>
                    <button 
                      onClick={() => setAutoLogout(!autoLogout)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${autoLogout ? 'bg-orange-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoLogout ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Active Sessions</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage devices currently logged in</p>
                    </div>
                    <button className="px-4 py-2 border border-zinc-700 text-white text-xs font-bold hover:bg-zinc-800 transition-colors">View Devices</button>
                  </div>
                </div>
              </>
            )}

            {/* ENCRYPTION VAULT SECTION (Special Requirement) */}
            {activeSection === 'encryption' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Vault Encryption</h2>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">All files are encrypted before upload</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      CloudVault uses client-side AES-256 encryption. Your files are encrypted on your device before they ever reach our servers.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Enable Encryption by Default</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Encrypt all standard uploads automatically</p>
                    </div>
                    <button 
                      onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${encryptionEnabled ? 'bg-orange-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${encryptionEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-6 border border-zinc-900 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <div>
                      <h4 className="text-base font-black text-white">Change Encrypted Folder PIN</h4>
                      <p className="text-xs font-bold text-zinc-500 mt-1">Requires your main account password to modify.</p>
                    </div>
                    
                    <div className="space-y-3 pt-2 max-w-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Login Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">New 4-Digit PIN</label>
                        <input type="password" placeholder="1234" maxLength={4} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors tracking-widest" />
                      </div>
                      <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-colors mt-2 flex items-center justify-center gap-2">
                        <Key className="w-4 h-4" /> Save New PIN
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STORAGE SECTION */}
            {activeSection === 'storage' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <HardDrive className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Storage Management</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-zinc-900/30 border border-zinc-900 text-center">
                    <Cloud className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white mb-2">37.5 GB <span className="text-sm text-zinc-500">of 50 GB Used</span></h3>
                    <div className="w-full max-w-md mx-auto h-2 bg-zinc-800 mt-6 overflow-hidden">
                      <div className="h-full bg-orange-500 w-[75%]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Default Upload Location</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Current: My Drive / Uploads</p>
                    </div>
                    <button className="px-4 py-2 border border-zinc-700 text-white text-xs font-bold hover:bg-zinc-800 transition-colors">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Local Cache</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">1.2 GB used for offline preview</p>
                    </div>
                    <button className="px-4 py-2 text-orange-500 border border-orange-500/30 hover:bg-orange-500/10 text-xs font-bold transition-colors">Clear Cache</button>
                  </div>
                </div>
              </>
            )}

            {/* SHARING SECTION */}
            {activeSection === 'sharing' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Share2 className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Sharing Preferences</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Default Share Link Expiry</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm p-3 focus:outline-none focus:border-orange-500">
                      <option>7 Days (Recommended)</option>
                      <option>24 Hours</option>
                      <option>30 Days</option>
                      <option>Never Expire</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Allow Public Downloads</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Viewers can download shared files</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-orange-500 relative transition-colors">
                      <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full transition-all" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* APPEARANCE SECTION */}
            {activeSection === 'appearance' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Palette className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Appearance</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Dark Theme</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Use dark mode interface</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-orange-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Accent Color</label>
                    <div className="flex gap-4">
                      {['bg-orange-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'].map((color, i) => (
                        <div key={i} className={`w-10 h-10 ${color} rounded-full cursor-pointer flex items-center justify-center border-4 border-[#0a0a0a] ring-2 ring-zinc-800 hover:ring-white transition-all`}>
                          {i === 0 && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-zinc-900">
                    <h4 className="text-sm font-bold text-white">Email Notifications</h4>
                    <button onClick={() => setEmailAlerts(!emailAlerts)} className={`w-12 h-6 rounded-full relative ${emailAlerts ? 'bg-orange-500' : 'bg-zinc-800'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full ${emailAlerts ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-zinc-900 opacity-50">
                    <h4 className="text-sm font-bold text-white">Upload Success Alerts (In-App)</h4>
                    <button className="w-12 h-6 rounded-full bg-orange-500 relative cursor-not-allowed">
                      <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-zinc-900 opacity-50">
                    <h4 className="text-sm font-bold text-white">Shared File Accessed Alerts</h4>
                    <button className="w-12 h-6 rounded-full bg-orange-500 relative cursor-not-allowed">
                      <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SYSTEM SECTION */}
            {activeSection === 'system' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Monitor className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">System Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Language</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm p-3 focus:outline-none focus:border-orange-500">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400">Default File Sorting</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm p-3 focus:outline-none focus:border-orange-500">
                      <option>Date Added (Newest First)</option>
                      <option>File Name (A-Z)</option>
                      <option>File Size (Largest First)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TRASH SECTION */}
            {activeSection === 'trash' && (
              <>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Trash2 className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Trash Management</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-900">
                    <div>
                      <h4 className="text-sm font-bold text-white">Auto-Empty Trash</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Delete items permanently after 30 days</p>
                    </div>
                    <button 
                      onClick={() => setAutoDeleteTrash(!autoDeleteTrash)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${autoDeleteTrash ? 'bg-orange-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoDeleteTrash ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-red-500/10 border border-red-500/20">
                    <h4 className="text-sm font-bold text-red-500 mb-2">Danger Zone</h4>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors">Empty Trash Now</button>
                  </div>
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
