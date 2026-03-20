'use client';

import { login } from '@/actions/auth';
import { useState, useEffect } from 'react';
import { ShieldCheck, User, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Auto-redirect if already logged in (localStorage check)
  useEffect(() => {
    const saved = localStorage.getItem('staff_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session?.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/verify');
        }
        return;
      } catch {
        localStorage.removeItem('staff_session');
      }
    }
    setChecking(false);
  }, [router]);

  // Save to localStorage before form submits (read values from form)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Server redirects on success. Before that, save session to localStorage.
      try {
        const sessionRes = await fetch('/api/me');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          localStorage.setItem('staff_session', JSON.stringify(session));
        }
      } catch { /* ignore */ }
    }
  };

  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-[1.5rem] border border-indigo-500/20 text-indigo-400 mb-2">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter gradient-text uppercase">Staff Login</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 space-y-8 relative overflow-hidden group border-white/5 bg-white/[0.02]">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 flex justify-between">
              Username
            </label>
            <div className="relative">
              <input
                name="username"
                required
                placeholder="Enter username"
                className="input-luxury !py-4 pl-12 font-mono text-sm tracking-widest border-white/5"
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-luxury !py-4 pl-12 font-mono text-sm border-white/5"
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black text-rose-500 uppercase tracking-widest text-center bg-rose-500/5 border border-rose-500/20 rounded-xl p-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-luxury bg-white text-black !py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LogIn size={16} /> Login</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
