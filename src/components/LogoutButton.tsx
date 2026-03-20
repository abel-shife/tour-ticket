'use client';

import { logout } from '@/actions/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    // Clear localStorage session on logout
    localStorage.removeItem('staff_session');
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 text-xs font-black uppercase tracking-widest transition-all"
    >
      <LogOut size={14} /> Log Out
    </button>
  );
}
