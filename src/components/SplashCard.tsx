import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

interface SplashCardProps {
  onDismiss: () => void;
}

export const SplashCard: React.FC<SplashCardProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  // Allow automatic dismiss after 3.5 seconds or manual click
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto transition
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
      <div 
        id="splash-card-container" 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel-green p-8 md:p-10 border border-emerald-400/40 shadow-2xl text-center transform transition-all animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-300/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-300/40 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/25 ring-4 ring-emerald-100">
          <GraduationCap className="h-10 w-10 text-emerald-100" />
        </div>

        {/* Main Splash Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Verified Learning & Accreditation
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-950 font-serif mb-3">
          MOCOSART
        </h1>

        <p className="text-emerald-900/80 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
          Empowering the next generation of engineers, leaders, and creators with verified certifications, live expert mentorship, and standardized assessments.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-left">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-emerald-100 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Government-grade Certificates</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-emerald-100 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Live Google Meet Tracks</span>
          </div>
        </div>

        {/* Enter Button */}
        <button
          id="splash-enter-btn"
          onClick={handleClose}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-medium shadow-md shadow-emerald-900/20 active:scale-[0.99] transition-all cursor-pointer text-base"
        >
          <span>Enter Mocosart Hub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
