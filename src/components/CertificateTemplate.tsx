import React from 'react';
import { ShieldCheck, Award, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { CertificateRecord } from '../types';
import { exportCertificateToPDF } from '../utils/pdfExport';

interface CertificateTemplateProps {
  cert: CertificateRecord;
  onDownloadPDF?: () => void;
  interactive?: boolean;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  cert,
  onDownloadPDF,
  interactive = true
}) => {
  const grade = cert.grade || 'Gold';

  // Ribbon themes for Gold, Diamond, and Silver
  const ribbonConfig = {
    Gold: {
      ribbonBg: 'linear-gradient(135deg, #d97706 0%, #fbbf24 25%, #fef08a 50%, #f59e0b 75%, #b45309 100%)',
      ribbonBorder: 'border-amber-600',
      ribbonShadow: 'shadow-amber-500/40',
      sealBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 30%, #fef3c7 50%, #d97706 70%, #92400e 100%)',
      sealText: 'text-amber-950',
      sealBorder: 'border-amber-400',
      tailBg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
      accentColor: 'text-amber-700',
      pillBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-amber-950',
      goldAccent: 'border-amber-400/80',
      label: 'Gold Excellence'
    },
    Diamond: {
      ribbonBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 25%, #e0f2fe 50%, #0ea5e9 75%, #0369a1 100%)',
      ribbonBorder: 'border-sky-500',
      ribbonShadow: 'shadow-sky-500/40',
      sealBg: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 30%, #f0f9ff 50%, #38bdf8 70%, #075985 100%)',
      sealText: 'text-sky-950',
      sealBorder: 'border-sky-300',
      tailBg: 'linear-gradient(180deg, #0284c7 0%, #075985 100%)',
      accentColor: 'text-sky-700',
      pillBg: 'bg-gradient-to-r from-sky-400 to-blue-600 text-white',
      goldAccent: 'border-sky-400/80',
      label: 'Diamond Distinction'
    },
    Silver: {
      ribbonBg: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 25%, #f8fafc 50%, #94a3b8 75%, #475569 100%)',
      ribbonBorder: 'border-slate-400',
      ribbonShadow: 'shadow-slate-400/40',
      sealBg: 'linear-gradient(135deg, #475569 0%, #94a3b8 30%, #f1f5f9 50%, #cbd5e1 70%, #334155 100%)',
      sealText: 'text-slate-900',
      sealBorder: 'border-slate-300',
      tailBg: 'linear-gradient(180deg, #64748b 0%, #334155 100%)',
      accentColor: 'text-slate-700',
      pillBg: 'bg-gradient-to-r from-slate-400 to-zinc-600 text-white',
      goldAccent: 'border-slate-300/80',
      label: 'Silver Honors'
    }
  };

  const theme = ribbonConfig[grade as keyof typeof ribbonConfig] || ribbonConfig.Gold;

  const handleDownload = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      exportCertificateToPDF(cert);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Real Blue & White Certificate Container with Luxury Ribbon Flow */}
      <div 
        id={`cert-frame-${cert.certificateNumber}`}
        className="relative w-full max-w-4xl bg-white text-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border-[8px] border-blue-900 p-2 sm:p-3"
        style={{
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(30, 58, 138, 0.2)'
        }}
      >
        {/* Inner Guilloche Double Blue and Metallic Accent Border */}
        <div className={`relative w-full bg-gradient-to-b from-blue-50/40 via-white to-blue-50/30 rounded-lg border-2 ${theme.goldAccent} p-6 sm:p-10 md:p-12 text-center overflow-hidden`}>
          
          {/* Subtle Guilloche / Watermark Security Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(#1e3a8a 1.5px, transparent 1.5px), radial-gradient(#1e3a8a 1.5px, #ffffff 1.5px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px'
            }}
          />

          {/* Corner Floral / Regal Flourishes */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-blue-800 rounded-tl-sm pointer-events-none opacity-80" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-blue-800 rounded-tr-sm pointer-events-none opacity-80" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-blue-800 rounded-bl-sm pointer-events-none opacity-80" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-blue-800 rounded-br-sm pointer-events-none opacity-80" />

          {/* TOP RIBBON FLOW (Stag / Education Ribbon Banner) */}
          <div className="relative mx-auto -mt-6 sm:-mt-8 mb-6 sm:mb-8 flex flex-col items-center justify-center max-w-lg">
            {/* 3D Flowing Ribbon Graphic */}
            <div className="relative z-10 w-full flex items-center justify-center">
              {/* Left Ribbon Wing Fold */}
              <div 
                className="hidden sm:block w-12 md:w-16 h-8 -mr-2 transform -skew-y-6 shadow-md rounded-l-md"
                style={{ background: theme.ribbonBg, filter: 'brightness(0.85)' }}
              />
              
              {/* Center Flowing Banner */}
              <div 
                className={`relative px-6 sm:px-12 py-2 sm:py-2.5 rounded-sm shadow-lg border ${theme.ribbonBorder} flex items-center gap-2 transform z-20`}
                style={{ background: theme.ribbonBg }}
              >
                <Sparkles className="w-4 h-4 text-white/90 drop-shadow-sm" />
                <span className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  ★ {grade.toUpperCase()} ACCREDITED CERTIFICATE ★
                </span>
                <Sparkles className="w-4 h-4 text-white/90 drop-shadow-sm" />
              </div>

              {/* Right Ribbon Wing Fold */}
              <div 
                className="hidden sm:block w-12 md:w-16 h-8 -ml-2 transform skew-y-6 shadow-md rounded-r-md"
                style={{ background: theme.ribbonBg, filter: 'brightness(0.85)' }}
              />
            </div>

            {/* Subtle Ribbon Tails under banner */}
            <div className="w-24 h-1 mt-1 rounded-full opacity-60" style={{ background: theme.ribbonBg }} />
          </div>

          {/* Institution Header */}
          <div className="space-y-1 mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-12 sm:w-20 bg-blue-900/40" />
              <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black text-blue-950 tracking-[0.2em]">
                MOCOSART
              </h1>
              <span className="h-[1px] w-12 sm:w-20 bg-blue-900/40" />
            </div>
            <p className="font-serif text-[10px] sm:text-xs tracking-[0.3em] font-semibold text-blue-800 uppercase">
              International Institute of Educational Accreditation
            </p>
          </div>

          {/* Certificate Title */}
          <div className="mb-4">
            <h2 className="font-serif italic text-xl sm:text-2xl md:text-3xl text-slate-800">
              Certificate of Achievement & Excellence
            </h2>
            <div className="flex items-center justify-center gap-3 my-2">
              <span className="w-16 h-0.5 bg-blue-700/30" />
              <p className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
                This Is Proudly Conferred Upon
              </p>
              <span className="w-16 h-0.5 bg-blue-700/30" />
            </div>
          </div>

          {/* CANDIDATE NAME - GRAND CURSIVE LETTERING */}
          <div className="my-4 sm:my-6">
            <h3 
              className="font-cursive text-4xl sm:text-5xl md:text-6xl text-blue-950 font-normal tracking-wide px-4 py-1 drop-shadow-sm leading-tight"
              style={{
                textShadow: '0 2px 4px rgba(30, 58, 138, 0.12)'
              }}
            >
              {cert.userName}
            </h3>
            {/* Elegant Calligraphic Underline Bar */}
            <div className="relative max-w-md mx-auto mt-1 flex items-center justify-center">
              <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-blue-900 to-transparent" />
              <div className="absolute w-2 h-2 rotate-45 border border-blue-900 bg-white" />
            </div>
          </div>

          {/* Certification Subject & Details */}
          <div className="max-w-2xl mx-auto space-y-2 mb-8">
            <p className="font-serif text-xs sm:text-sm text-slate-600 leading-relaxed">
              for demonstrated academic distinction and successful mastery in the comprehensive certification curriculum of
            </p>
            <h4 className="font-cinzel text-lg sm:text-xl md:text-2xl font-bold text-blue-900 tracking-wide">
              {cert.courseName}
            </h4>
            
            {cert.description && (
              <p className="text-xs text-slate-500 italic max-w-xl mx-auto pt-1 font-serif">
                "{cert.description}"
              </p>
            )}

            {/* Performance Metrics Pill */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-700">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-semibold">
                Cohort Score: <strong className="text-blue-900">{cert.percentage}%</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600">
                Accreditation ID: {cert.certificateNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-semibold text-slate-600">
                Date: {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* SIGNATURES & OFFICIAL METALLIC SEAL (Stag Education Design) */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end max-w-3xl mx-auto">
            
            {/* 1. Founder Cursive Signature */}
            <div className="text-center order-2 sm:order-1">
              <div className="min-h-[44px] flex items-center justify-center">
                <span className="font-cursive text-2xl sm:text-3xl text-slate-900 font-normal tracking-wide">
                  {cert.founderSignature || cert.foundersName || 'Arvind Mocosart'}
                </span>
              </div>
              <div className="w-40 sm:w-48 h-[1px] bg-slate-400 mx-auto mt-1" />
              <p className="font-serif text-xs font-bold text-slate-900 mt-1.5">
                {cert.foundersName || 'Dr. Arvind Mocosart'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                {cert.founderDesignation || 'Founder & Chancellor'}
              </p>
            </div>

            {/* 2. Center Official Metallic Embossed Seal with Hanging Ribbon Tails */}
            <div className="flex flex-col items-center justify-center order-1 sm:order-2 my-2 sm:my-0">
              <div className="relative flex flex-col items-center">
                {/* Metallic Medallion Rosette */}
                <div 
                  className={`relative w-20 h-20 rounded-full border-4 ${theme.sealBorder} shadow-xl flex flex-col items-center justify-center p-1 z-10`}
                  style={{ background: theme.sealBg }}
                >
                  <div className="w-full h-full rounded-full border border-dashed border-white/70 flex flex-col items-center justify-center text-center p-1">
                    <ShieldCheck className="w-5 h-5 text-slate-900 mb-0.5 drop-shadow" />
                    <span className="text-[7px] font-black tracking-widest uppercase text-slate-900">
                      VERIFIED
                    </span>
                    <span className="text-[6px] font-bold tracking-tighter text-slate-950 uppercase">
                      OFFICIAL SEAL
                    </span>
                  </div>
                </div>

                {/* Hanging Ribbon Tails Flowing Out */}
                <div className="relative -mt-3 flex gap-2 z-0">
                  <div 
                    className="w-5 h-8 transform -rotate-12 shadow-md"
                    style={{ 
                      background: theme.tailBg,
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)'
                    }}
                  />
                  <div 
                    className="w-5 h-8 transform rotate-12 shadow-md"
                    style={{ 
                      background: theme.tailBg,
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Co-Founder Cursive Signature */}
            <div className="text-center order-3">
              <div className="min-h-[44px] flex items-center justify-center">
                <span className="font-cursive text-2xl sm:text-3xl text-slate-900 font-normal tracking-wide">
                  {cert.cofounderSignature || cert.cofounderName || 'Sanjana Rao'}
                </span>
              </div>
              <div className="w-40 sm:w-48 h-[1px] bg-slate-400 mx-auto mt-1" />
              <p className="font-serif text-xs font-bold text-slate-900 mt-1.5">
                {cert.cofounderName || 'Sanjana Rao'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                {cert.cofounderDesignation || 'Co-Founder & Operations Director'}
              </p>
            </div>

          </div>

          {/* Security & Verification Footer */}
          <div className="mt-8 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>SECURE DIGITAL RECORD • TAMPER PROOF</span>
            <span>VERIFIED VIA MOCOSART CREDENTIAL ENGINE</span>
          </div>

        </div>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Blue & Gold PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
