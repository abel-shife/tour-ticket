'use client';

import { useState, useRef } from 'react';
import { Users, ShieldCheck, Download, X, Phone, Calendar, Zap, Ticket, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTicket } from '@/actions/ticket';
import { QRCodeCanvas } from 'qrcode.react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    groupSize: 1,
    method: 'E-birr',
    phone: '',
    visitTime: '',
    isNow: true
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const ticketCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketCardRef.current || !ticket) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ticketCardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `TourPass-${ticket.serialNumber}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createTicket({
      guardianName: formData.name,
      groupSize: formData.groupSize,
      paymentMethod: formData.method,
      phoneNumber: formData.phone,
      visitingDate: formData.isNow ? new Date().toISOString() : formData.visitTime,
      isImmediate: formData.isNow
    });
    setLoading(false);
    if (res.success) setTicket(res.ticket);
  };

  const total = formData.groupSize * 500;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700">

      {/* Left Column: Form */}
      <div className="lg:col-span-7 space-y-8 md:space-y-10 order-2 lg:order-1">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-black tracking-wider uppercase">
            <Ticket size={12} /> Official Ticket Registration
          </div>
          <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tighter leading-none">
            Book Your <br /> Visit
          </h1>
          <p className="text-base md:text-xl text-slate-400 max-w-lg leading-relaxed">Secure your pass for the tour. Simply fill out your details and pay through your mobile banking choice.</p>
        </header>

        <form onSubmit={handleSubmit} className="glass-card space-y-6 md:space-y-8 p-6 md:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Name of Guardian</label>
              <input
                required
                className="input-luxury !py-4"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Mobile Phone Number</label>
              <div className="relative">
                <input
                  required
                  className="input-luxury !py-4 pl-12"
                  placeholder="09..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>
          </div>

          {/* VISITING TIME SECTION */}
          <div className="space-y-4">
            <label className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest pl-1">When are you visiting?</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isNow: true })}
                className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-3xl font-black text-sm uppercase transition-all shadow-xl ${formData.isNow
                  ? 'bg-indigo-500 text-white shadow-indigo-500/30 scale-[1.02]'
                  : 'bg-slate-900 text-slate-500 border border-white/5 opacity-60 hover:opacity-100'
                  }`}
              >
                <Zap size={20} className={formData.isNow ? 'animate-pulse' : ''} />
                Book For Now
              </button>

              <div className="flex-1 relative">
                <input
                  type="datetime-local"
                  required={!formData.isNow}
                  className={`input-luxury !py-5 pl-12 transition-all ${!formData.isNow
                    ? 'border-indigo-400/50 bg-indigo-500/5 ring-1 ring-indigo-500/20'
                    : 'opacity-40 grayscale'
                    }`}
                  value={formData.visitTime}
                  disabled={formData.isNow}
                  onChange={e => setFormData({ ...formData, visitTime: e.target.value, isNow: false })}
                />
                <Calendar size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${!formData.isNow ? 'text-indigo-400' : 'text-slate-600'}`} />
              </div>
            </div>
          </div>

          {/* Live cost banner — always visible on mobile */}
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <Users size={16} className="text-indigo-400" />
              <span className="text-sm font-black text-slate-300">{formData.groupSize} {formData.groupSize === 1 ? 'Person' : 'People'}</span>
              <span className="text-slate-600 text-xs">× 500 ETB</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black gradient-text">{total.toLocaleString()}</span>
              <span className="text-xs font-black text-slate-500 ml-1">ETB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase pl-1 tracking-widest">Team Size</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  className="input-luxury pr-12 !py-4"
                  value={formData.groupSize}
                  onChange={e => setFormData({ ...formData, groupSize: parseInt(e.target.value) || 1 })}
                />
                <Users size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase pl-1 tracking-widest">Select Payment</label>
              <div className="flex gap-4">
                {['E-birr', 'CBE'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, method: m })}
                    className={`flex-1 btn-luxury border !py-3 font-bold ${formData.method === m
                      ? 'bg-primary border-primary text-white scale-105'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 p-5 rounded-3xl font-black text-lg md:text-xl flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 mt-4 transition-all"
          >
            {loading ? 'Processing...' : <>Pay Now & Get Ticket <Send size={20} /></>}
          </button>
        </form>
      </div>

      {/* Right Column Summary */}
      <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
        <div className="glass-card flex flex-col justify-between items-center p-8 md:p-12 text-center h-full">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Summary</p>
            <h3 className="text-3xl font-black tracking-tight mt-2 italic">Official Ticket</h3>
          </div>
          <div className="w-full space-y-6 py-8">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Tour Members</span>
              <span className="text-xl font-black">{formData.groupSize} People</span>
            </div>
            <div className="flex justify-between items-baseline pt-4">
              <span className="text-2xl font-black gradient-text uppercase tracking-widest">Total Cost</span>
              <span className="text-5xl font-black">{total} <span className="text-sm text-slate-500 font-bold">ETB</span></span>
            </div>
          </div>
          <div className="w-full p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex gap-4 items-center">
            <div className="p-3 bg-white/5 rounded-xl">
              <ShieldCheck size={20} className="text-indigo-400" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-sm">Secure Entry</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Validation on site</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {ticket && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm my-auto"
            >
              {/* Close button outside card */}
              <div className="flex justify-end mb-3">
                <button onClick={() => setTicket(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* ─── DOWNLOADABLE TICKET CARD ─── */}
              <div
                ref={ticketCardRef}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  background: '#0a0f1e',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Card Header */}
                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '28px 28px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', letterSpacing: '0.2em', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Official Tourist Pass
                      </p>
                      <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                        {ticket.guardianName}
                      </h2>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
                      <p style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0, lineHeight: 1 }}>{ticket.groupSize}</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>People</p>
                    </div>
                  </div>
                </div>

                {/* Decorative dotted divider */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', background: '#0d1224' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0a0f1e', marginLeft: '-32px', flexShrink: 0 }} />
                  <div style={{ flex: 1, borderTop: '2px dashed rgba(255,255,255,0.08)', margin: '0 8px' }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0a0f1e', marginRight: '-32px', flexShrink: 0 }} />
                </div>

                {/* Card Body */}
                <div style={{ background: '#0d1224', padding: '20px 28px 28px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* QR Code */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '16px', flexShrink: 0 }}>
                    <QRCodeCanvas value={ticket.serialNumber} size={120} level="H" />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Serial No.', value: ticket.serialNumber },
                      { label: 'Amount Paid', value: `${ticket.amountPaid.toLocaleString()} ETB` },
                      { label: 'Payment', value: ticket.paymentMethod },
                      { label: 'Visit Time', value: ticket.isImmediate ? 'Priority Entry (Now)' : (ticket.visitingDate ? new Date(ticket.visitingDate).toLocaleString() : '—') },
                      { label: 'Issued On', value: new Date(ticket.createdAt).toLocaleDateString() },
                    ].map((item) => (
                      <div key={item.label}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>{item.label}</p>
                        <p style={{ color: '#fff', fontSize: '11px', fontWeight: 700, margin: '2px 0 0', lineHeight: 1.3 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{ background: '#07091a', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                    TourPass · tourpass.et
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    <p style={{ color: '#10b981', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Verified & Secure</p>
                  </div>
                </div>
              </div>

              {/* Download Button (outside the card so it doesn't appear in screenshot) */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full mt-4 bg-white text-black p-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? 'Generating...' : <><Download size={18} /> Download Pass</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
