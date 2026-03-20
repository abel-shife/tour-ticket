import { getStats, getHistory } from '@/actions/ticket';
import { 
  Users, Ticket, Wallet, Activity, CheckCircle, Clock, Trash2, 
  Globe, ShieldAlert, Sparkles, TrendingUp, CreditCard 
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/actions/auth';
import LogoutButton from '@/components/LogoutButton';

async function clearAll() {
  'use server';
  try {
     await prisma.ticket.deleteMany();
     await prisma.verificationLog.deleteMany();
     revalidatePath('/admin');
  } catch (err) {
     console.error(err);
  }
}

const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string; value: string | number; icon: any; color: string; trend: string }) => (
  <div className="glass-card !p-8 md:!p-12 relative overflow-hidden group hover:scale-[1.02] flex flex-col justify-between h-[280px] md:h-[300px]">
    <div className={`absolute top-0 right-0 w-48 h-48 bg-${color}-500/5 blur-[80px] rounded-full`} />
    <div className={`absolute bottom-0 left-0 w-1 h-1/2 bg-gradient-to-t from-${color}-500 to-transparent opacity-40`} />
    
    <div className="flex justify-between items-start">
      <div className={`p-5 md:p-6 rounded-[2rem] bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
        <Icon className="w-7 h-7 md:w-8 md:h-8" />
      </div>
      <div className="text-right flex flex-col items-end">
         <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
         <div className="flex items-center gap-1.5 text-xs font-black text-rose-500">
            <TrendingUp size={12}/> {trend}
         </div>
      </div>
    </div>

    <div className="relative mt-auto">
      <p className="text-5xl md:text-6xl font-black tracking-tighter gradient-text leading-tight">{value}</p>
      <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-500 mt-2 uppercase tracking-wide">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Updated Live
      </div>
    </div>
  </div>
);

export default async function Admin() {
  await requireAuth('ADMIN');
  const stats = await getStats();
  const history = await getHistory();

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-4">
        <div className="space-y-4">
          <div className="flex gap-4 items-center mb-2">
             <div className="luxury-glass p-2 rounded-xl text-indigo-400 border border-white/5">
                <Globe size={18} />
             </div>
             <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Admin Panel</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter gradient-text leading-none">Dashboard</h1>
          <p className="text-slate-400 font-bold text-base md:text-xl max-w-xl opacity-80">Track ticket sales, visitors, and check-in activity.</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full lg:w-auto self-start">
          <LogoutButton />
          <form action={clearAll} className="w-full">
             <button 
               type="submit"
               className="w-full btn-luxury bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 px-8 py-3 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all"
             >
               <Trash2 size={18} /> Clear All Data
             </button>
          </form>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        <StatCard title="Total Tickets" value={stats.totalTickets} icon={Ticket} color="indigo" trend="All Time" />
        <StatCard title="Total Visitors" value={stats.totalTourists} icon={Users} color="rose" trend="All Time" />
        <StatCard title="Checked In" value={stats.verifiedCount} icon={CheckCircle} color="emerald" trend="Scanned" />
        <StatCard title="Revenue" value={`${stats.totalRevenue.toLocaleString()} ETB`} icon={Wallet} color="amber" trend="Total" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
        <div className="xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                 Check-in History <Activity size={24} className="text-indigo-400 animate-pulse" />
              </h2>
           </div>

           {/* DESKTOP TABLE VIEW */}
           <div className="hidden md:block glass-card !p-0 overflow-hidden relative border-white/5 shadow-2xl">
              <div className="overflow-x-auto text-xs md:text-sm">
                 <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                       <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          <th className="px-10 py-6">Ticket ID</th>
                          <th className="px-10 py-6">Visitor Name</th>
                          <th className="px-10 py-6 text-center">Result</th>
                          <th className="px-10 py-6 text-right">Time</th>
                       </tr>
                    </thead>
                    <tbody>
                       {history.length === 0 ? (
                          <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-800 font-black text-2xl uppercase tracking-tighter opacity-20">No data available</td></tr>
                       ) : (
                          history.map((log) => (
                             <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                                <td className="px-10 py-6 font-mono text-[11px] text-indigo-400 font-black opacity-80">{log.ticketId}</td>
                                <td className="px-10 py-6 font-bold">{log.guardianName || 'Unknown'}</td>
                                <td className="px-10 py-6 text-center">
                                   <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current ${
                                      log.status === 'VALID' ? 'text-emerald-500 bg-emerald-500/5' : 
                                      log.status === 'USED' ? 'text-amber-500 bg-amber-500/5' : 'text-rose-500 bg-rose-500/5'
                                   }`}>
                                      {log.status}
                                   </span>
                                </td>
                                <td className="px-10 py-6 text-right font-mono text-[11px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* MOBILE LIST VIEW */}
           <div className="md:hidden space-y-4">
              {history.length === 0 ? (
                 <div className="p-12 text-center opacity-30 text-slate-500">No recent scans</div>
              ) : (
                 history.map((log) => (
                   <div key={log.id} className="luxury-glass p-5 rounded-2xl flex justify-between items-center border border-white/5">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-white">{log.guardianName || 'Unknown'}</p>
                         <div className="flex items-center gap-2">
                            <p className="text-[9px] font-mono text-indigo-400 font-black opacity-70 tracking-widest uppercase">{log.ticketId.substring(0,8)}</p>
                            <span className="text-slate-800">•</span>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-current ${
                         log.status === 'VALID' ? 'text-emerald-500/60 bg-emerald-500/5' : 
                         log.status === 'USED' ? 'text-amber-500/60 bg-amber-500/5' : 'text-rose-500/60 bg-rose-500/5'
                      }`}>
                         {log.status}
                      </span>
                   </div>
                 ))
              )}
           </div>
        </div>

        {/* SIDE BAR / MOBILE CARDS */}
        <div className="xl:col-span-4 space-y-10">
           <div className="glass-card bg-indigo-600/95 p-10 text-white relative overflow-hidden flex flex-col justify-between h-[380px] md:h-[450px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full" />
              <div className="relative space-y-6">
                 <div className="flex gap-2 items-center mb-2">
                    <Sparkles size={20} className="text-indigo-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Export</p>
                 </div>
                 <h4 className="text-4xl font-black tracking-tighter leading-tight">Download Report</h4>
                 <p className="opacity-80 font-bold text-sm leading-relaxed">Get a summary of all visitor data and check-in statistics.</p>
              </div>
              <button className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-black text-lg hover:scale-[1.03] active:scale-95 transition-all shadow-2xl">
                 Download Report (.PDF)
              </button>
           </div>

           <div className="glass-card bg-rose-500/5 border-rose-500/20 p-8 space-y-4">
              <div className="flex items-center gap-4 text-rose-500">
                 <ShieldAlert size={20} />
                 <h4 className="text-lg font-black uppercase tracking-tight">Warning</h4>
              </div>
              <p className="text-xs text-slate-500 font-bold opacity-80 leading-relaxed">
                 Clearing data is permanent and cannot be undone. Only do this if you are sure.
              </p>
              <div className="inline-block p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 font-mono text-[9px] text-rose-300 font-black">
                 SESSION: ACTIVE
              </div>
           </div>
        </div>
      </div>
      
    </div>
  );
}
