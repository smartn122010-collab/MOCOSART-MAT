import React from 'react';
import { Cpu, Sparkles, Brain, Network, Binary, ShieldCheck } from 'lucide-react';

export const AITechBackground: React.FC = () => {
  return (
    <div 
      id="ai-technology-animated-bg" 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Top Ambient Glow / AI Neural Aura */}
      <div 
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-b from-emerald-300/25 via-teal-300/20 to-transparent blur-3xl animate-pulse-glow" 
      />

      {/* Subtle Right Tech Orb */}
      <div 
        className="absolute top-1/4 -right-24 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-200/15 to-transparent blur-3xl animate-float-slow" 
      />

      {/* Subtle Left Deep Neural Glow */}
      <div 
        className="absolute top-2/3 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-300/15 via-emerald-100/20 to-transparent blur-3xl animate-float-delayed" 
      />

      {/* Cybernetic Tech Grid & Isometric Dot Matrix Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#059669_1.2px,transparent_1.2px)] [background-size:28px_28px]" 
      />

      {/* SVG Neural Connections & Animated Wave Lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-20 stroke-emerald-500/40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0d9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
          <pattern id="circuitGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
            <circle cx="120" cy="0" r="2.5" fill="#10b981" fillOpacity="0.25" />
            <circle cx="0" cy="120" r="2.5" fill="#0d9488" fillOpacity="0.25" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#circuitGrid)" />

        {/* Ambient Neural Synapse Curves */}
        <path 
          d="M -100,200 Q 300,50 700,280 T 1500,180" 
          fill="none" 
          stroke="url(#neuralGrad)" 
          strokeWidth="1.5" 
          strokeDasharray="6,8"
          className="opacity-40"
        />
        <path 
          d="M 100,600 Q 500,450 900,700 T 1800,550" 
          fill="none" 
          stroke="url(#neuralGrad)" 
          strokeWidth="1.2" 
          strokeDasharray="4,6"
          className="opacity-30"
        />
      </svg>

      {/* Floating Modern AI Tech Badges / Floating Elements */}
      <div className="absolute top-[18%] left-[6%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-water border border-white/60 shadow-lg animate-float-slow opacity-45">
        <Cpu className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '24s' }} />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-emerald-900 uppercase">
          AI Neural Core v4.8
        </span>
      </div>

      <div className="absolute top-[32%] right-[5%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-water border border-white/60 shadow-lg animate-float-delayed opacity-40">
        <Brain className="w-4 h-4 text-teal-600" />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-teal-900 uppercase">
          Adaptive Learning Matrix
        </span>
      </div>

      <div className="absolute bottom-[22%] left-[8%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-water border border-white/60 shadow-lg animate-float-delayed opacity-35">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-700 uppercase">
          Encrypted Verification Shield
        </span>
      </div>

      <div className="absolute bottom-[18%] right-[8%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-water border border-white/60 shadow-lg animate-float-slow opacity-35">
        <Binary className="w-4 h-4 text-cyan-600" />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-cyan-900 uppercase">
          Quantum Ledger Sync
        </span>
      </div>
    </div>
  );
};
