import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Globe, Cpu, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path if needed
import { getAuth } from "firebase/auth";


export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserIfNotExists = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "User",
        createdAt: new Date()
      });
  
      console.log("User created in Firestore");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let userCredential;
  
      if (isLogin) {
        userCredential = await signInWithEmail(email, password);
      } else {
        userCredential = await signUpWithEmail(email, password);
      }
  
      const user = userCredential.user;
  
      await createUserIfNotExists(user);
  
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
  
      await createUserIfNotExists(user);
  
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10 pb-12">
        {/* Left Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-500 rounded-none flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Lock className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">VaultShare</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-zinc-500 text-lg font-medium">
              {isLogin ? 'Sign in to access your secure files' : 'Sign up to start sharing files securely'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-none py-3 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-none py-3 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center gap-3 bg-orange-500 text-white font-black py-3 rounded-none hover:bg-orange-600 transition-all active:scale-[0.98] shadow-xl shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs font-bold uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-3 rounded-none hover:bg-zinc-800 transition-all active:scale-[0.98] border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>

            <p className="text-center text-sm font-bold text-zinc-500 pt-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }} 
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </form>
        </motion.div>

        {/* Right Side: Visual Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative hidden lg:flex flex-col items-center justify-center text-center"
        >
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* Isometric Stack of Files */}
            <div className="relative">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.4
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-zinc-900 border border-zinc-800 rounded-none shadow-2xl flex items-center justify-center rotate-[30deg] skew-y-[-15deg]"
                  style={{ 
                    marginTop: `${i * -20}px`,
                    marginLeft: `${i * 10}px`,
                    zIndex: 10 - i
                  }}
                >
                  <LayoutGrid className="text-zinc-700 w-12 h-12" />
                </motion.div>
              ))}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <h2 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter mb-4">
                Secure File <br /> Storage
              </h2>
              <p className="text-zinc-500 text-base font-bold max-w-xs leading-relaxed">
                Military-grade encryption. Lightning-fast uploads. Share with confidence.
              </p>
            </div>

            {/* Radiant Background Lines */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-[140%] h-[140%] border-[0.5px] border-orange-500 rounded-full blur-sm" />
              <div className="absolute w-[180%] h-[180%] border-[0.5px] border-zinc-800 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 text-zinc-700 text-[9px] font-black uppercase tracking-[0.5em]">
        <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Global Network</span>
        <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Edge Processing</span>
        <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Quantum Ready</span>
      </div>
    </div>
  );
}
