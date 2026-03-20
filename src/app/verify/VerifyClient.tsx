'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Search, User, Users, Calendar, Clock, MapPin, ShieldCheck, ShieldX, ScanLine, XCircle, MoreVertical, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyTicket } from '@/actions/ticket';
import { Html5QrcodeScanner } from 'html5-qrcode';
import LogoutButton from '@/components/LogoutButton';

export default function Verify({ session }: { session: any }) {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 15, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      }, false);

      scanner.render((decodedText) => {
        handleVerification(decodedText);
        scanner.clear();
        setIsScanning(false);
      }, () => {});
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const handleVerification = async (id: string) => {
    setLoading(true);
    const res = await verifyTicket(id, `${session.name} (${session.role})`);
    setLoading(false);
    setResult(res);
    setTicketId('');
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'VALID': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: ShieldCheck, label: 'Access Granted' };
      case 'USED': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: Clock, label: 'Already Scanned' };
      default: return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: XCircle, label: 'Invalid Ticket' };
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="flex gap-2 items-center text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-400">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Welcome: {session.name}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter gradient-text">Ticket Verification</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsScanning(!isScanning)} 
            className={`btn-luxury border w-full md:w-auto !py-4 rounded-3xl ${isScanning ? 'bg-rose-500 border-rose-600 shadow-rose-500/20' : 'bg-primary border-primary shadow-xl shadow-primary/30'}`}
          >
            {isScanning ? (
               <><XCircle size={18}/> Stop Scanning</>
            ) : (
               <><Camera size={18}/> Start Scanner</>
            )}
          </button>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 md:gap-8">
        {/* Verification Logic Column */}
        <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8 order-1">
          <div className="glass-card shadow-indigo-500/5 hover:shadow-indigo-500/10 p-6 md:p-8">
             <h3 className="text-xl font-black mb-6 flex items-center justify-between uppercase tracking-tight">
                Manual Search <Search size={20} className="text-slate-500" />
             </h3>
             <form onSubmit={(e) => { e.preventDefault(); handleVerification(ticketId); }} className="space-y-4">
                <input 
                  className="input-luxury !py-4 md:!py-5 tracking-widest font-mono text-center md:text-left" 
                  placeholder="Enter Ticket ID" 
                  value={ticketId}
                  onChange={e => setTicketId(e.target.value.toUpperCase())}
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-luxury bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold !py-4 rounded-3xl"
                >
                  {loading ? 'Searching...' : 'Search Ticket'}
                </button>
             </form>

             {isScanning && (
               <div className="mt-8 rounded-[2.5rem] overflow-hidden relative shadow-2xl border-4 border-indigo-500/20">
                  <div className="absolute inset-0 pointer-events-none z-10">
                     <div className="w-full h-1 bg-indigo-500/50 absolute top-0 animate-[scan_2.5s_linear_infinite]" />
                  </div>
                  <div id="reader" className="w-full bg-black !border-none" />
               </div>
             )}
          </div>

          <div className="hidden lg:flex glass-card bg-indigo-500/5 p-6 space-y-4 flex-col">
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-indigo-300">Staff Info</h4>
                <div className="w-2 h-2 rounded-full bg-indigo-500 scale-125" />
             </div>
             {[
               { l: 'Scanner ID', v: 'MOBILE-DEVICE-01' },
               { l: 'Role', v: session.role },
               { l: 'Time', v: new Date().toLocaleTimeString() }
             ].map((s,i) => (
                <div key={i} className="flex justify-between text-[10px] border-b border-white/5 pb-2">
                   <span className="text-slate-500 uppercase font-bold tracking-widest">{s.l}</span>
                   <span className="font-mono text-slate-300 font-black">{s.v}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Results Column */}
        <div className="xl:col-span-8 order-2">
           <AnimatePresence mode="wait">
             {!result ? (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="h-full min-h-[350px] md:min-h-[500px] glass-card flex flex-col items-center justify-center text-center border-dashed border-2 opacity-30"
               >
                 <ScanLine className="mb-6 text-indigo-500 stroke-[1px] w-20 h-20 md:w-28 md:h-28" />
                 <h3 className="text-2xl md:text-3xl font-black text-slate-700 tracking-tight">READY TO SCAN</h3>
                 <p className="max-w-xs text-slate-800 font-bold text-[10px] uppercase tracking-widest mt-3 leading-loose">Align the QR code within the scanner box</p>
               </motion.div>
             ) : (
               <motion.div 
                 key={result.status}
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 className="p-6 md:p-10 luxury-glass rounded-[2.5rem] md:rounded-[3rem] space-y-8 md:space-y-12 h-full flex flex-col"
               >
                 {(() => {
                    const style = getStatusStyle(result.status);
                    const StatusIcon = style.icon;
                    return (
                      <>
                        <div className={`p-6 md:p-8 rounded-3xl border ${style.border} ${style.bg} flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl`}>
                           <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border ${style.border} bg-black/40 flex items-center justify-center ${style.text} shadow-inner`}>
                              <StatusIcon className="w-8 h-8 md:w-12 md:h-12 animate-pulse" />
                           </div>
                           <div className="text-center md:text-left">
                              <h2 className={`text-4xl md:text-5xl font-black tracking-tight uppercase ${style.text}`}>{style.label}</h2>
                              <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Ticket Validated Securely</p>
                           </div>
                        </div>

                        {result.ticket ? (
                          <div className="flex-1 space-y-6 md:grid md:grid-cols-2 lg:gap-10 md:space-y-0">
                            <div className="space-y-6">
                               <div className="bg-slate-950/40 p-8 md:p-10 rounded-3xl border border-white/5 shadow-inner">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Visitor Profile</p>
                                  <div className="flex items-center gap-4 md:gap-6">
                                     <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-xl md:text-2xl font-black uppercase">
                                        {result.ticket.guardianName[0]}
                                     </div>
                                     <div>
                                        <p className="text-2xl md:text-3xl font-black tracking-tight">{result.ticket.guardianName}</p>
                                        <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mt-1">
                                           <ShieldCheck size={12}/> VALID PASS
                                        </p>
                                     </div>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4 md:gap-6">
                                  <div className="bg-white/5 p-5 md:p-6 rounded-3xl border border-white/5">
                                     <Users size={18} className="text-indigo-400 mb-3" />
                                     <p className="text-xl md:text-2xl font-bold">{result.ticket.groupSize}</p>
                                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">People</p>
                                  </div>
                                  <div className="bg-white/5 p-5 md:p-6 rounded-3xl border border-white/5">
                                     <MapPin size={18} className="text-rose-400 mb-3" />
                                     <p className="text-xl md:text-2xl font-bold">Entrance A</p>
                                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Sector</p>
                                  </div>
                               </div>
                            </div>

                            <div className="luxury-glass p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-fit gap-8">
                               <div className="space-y-4 md:space-y-6">
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Scan Details</p>
                                  {[
                                    { i: <Calendar size={14}/>, l: 'Created', v: new Date(result.ticket.createdAt).toLocaleDateString() },
                                    { i: <Clock size={14}/>, l: 'Time Scanned', v: result.ticket.scannedAt ? new Date(result.ticket.scannedAt).toLocaleTimeString() : 'Current' },
                                    { i: <CreditCard size={14}/>, l: 'Payment', v: result.ticket.paymentMethod },
                                    { i: <User size={14}/>, l: 'Staff', v: session.name }
                                  ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[10px] md:text-xs border-b border-white/5 pb-2 font-bold uppercase tracking-widest">
                                       <div className="flex items-center gap-2 text-slate-500">
                                          {item.i} <span>{item.l}</span>
                                       </div>
                                       <span className="text-white opacity-80">{item.v}</span>
                                    </div>
                                  ))}
                               </div>
                               <div className="bg-white/5 p-3 rounded-2xl flex justify-center items-center shadow-inner">
                                  <p className="font-mono text-[10px] text-indigo-500 font-black tracking-widest">{result.ticket.serialNumber}</p>
                                </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-rose-500/5 rounded-3xl border border-rose-500/10 text-center">
                             <ShieldX className="w-16 h-16 md:w-20 md:h-20 text-rose-500 mb-4" />
                             <h4 className="text-2xl font-black text-rose-500 mb-2 uppercase tracking-tight">Invalid Ticket</h4>
                             <p className="max-w-xs text-rose-600 font-bold opacity-60 text-xs">This ticket code was not found or has been revoked. Please check the serial number.</p>
                          </div>
                        )}
                      </>
                    );
                 })()}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
