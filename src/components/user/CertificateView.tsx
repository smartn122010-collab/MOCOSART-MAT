import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  X,
  Calendar,
  FileCheck
} from 'lucide-react';
import { CertificateRecord, UserProfile } from '../../types';
import { exportCertificateToPDF } from '../../utils/pdfExport';

interface CertificateViewProps {
  certificates: CertificateRecord[];
  currentUser: UserProfile | null;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificates,
  currentUser
}) => {
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);

  const getGradeRibbonStyle = (grade: string) => {
    switch (grade) {
      case 'Diamond':
        return 'from-sky-500 to-indigo-600 text-white shadow-sky-500/30';
      case 'Gold':
        return 'from-amber-400 to-yellow-600 text-white shadow-amber-500/30';
      case 'Silver':
      default:
        return 'from-slate-400 to-zinc-600 text-white shadow-slate-400/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Verified Certificates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Official accredited diplomas issued with digital signatures and security seals.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tamper-Proof Verification</span>
        </div>
      </div>

      {/* 10-Day Notice Banner as requested by user */}
      <div className="p-4 rounded-xl glass-panel-green border border-emerald-300/80 flex items-start gap-3 shadow-sm">
        <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950">
          <p className="font-bold">Institutional Accreditation Regulation:</p>
          <p className="text-emerald-900/80 leading-relaxed mt-0.5">
            Upon completing the exam register course, the academic board completes secondary verification within <b>10 days</b>. Your finalized certificate with founders' signatures and grade ribbons will appear here and is permanently downloadable.
          </p>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setActiveCert(cert)}
              className="relative rounded-2xl glass-card border border-white/90 p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              {/* Ribbon Badge on top left */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${getGradeRibbonStyle(cert.grade)} shadow-md`}>
                  ★ {cert.grade} Grade
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {cert.certificateNumber}
                </span>
              </div>

              {/* Certificate Mini Preview Box */}
              <div className="relative p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 mb-4 text-center group-hover:bg-emerald-100/40 transition-colors">
                <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-widest">
                  MOCOSART
                </p>
                <h4 className="text-base font-bold text-slate-900 font-serif my-1">
                  {cert.courseName}
                </h4>
                <p className="text-xs text-slate-600">
                  Awarded to <span className="font-semibold text-slate-900">{cert.userName}</span>
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Score: {cert.percentage}%
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportCertificateToPDF(cert);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass-panel p-12 text-center border border-white/80 max-w-md mx-auto space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700 font-serif">No Certificates Issued Yet</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Complete your registered examinations in the <b>Exam Register</b> tab. Once submitted, your certificate will be delivered here!
          </p>
        </div>
      )}

      {/* Full Certificate Modal Display */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-panel p-5 sm:p-8 border border-white shadow-2xl overflow-hidden">
            {/* Header controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-800 font-serif">Official Certificate View</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCertificateToPDF(activeCert)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res PDF</span>
                </button>
                <button
                  onClick={() => setActiveCert(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="overflow-y-auto my-4 p-4 sm:p-8 rounded-2xl bg-amber-50/40 border-4 border-emerald-700/80 shadow-inner relative text-center space-y-6">
              {/* Top Left Ribbon */}
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest bg-gradient-to-r ${getGradeRibbonStyle(activeCert.grade)} shadow-lg`}>
                  ★ {activeCert.grade} GRADE
                </div>
              </div>

              <div className="absolute top-4 right-4 text-right">
                <span className="text-[10px] font-mono text-slate-500 block">Accreditation ID</span>
                <span className="text-xs font-mono font-bold text-slate-800">{activeCert.certificateNumber}</span>
              </div>

              {/* Company Header */}
              <div className="pt-8 space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif tracking-wider">
                  MOCOSART
                </h1>
                <p className="text-[11px] sm:text-xs uppercase font-bold text-emerald-700 tracking-widest">
                  Institute of Digital Learning & Verified Accreditation
                </p>
                <div className="w-24 h-0.5 bg-emerald-500 mx-auto mt-2" />
              </div>

              {/* Certificate Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-serif italic text-slate-800">
                  Certificate of Achievement & Excellence
                </h3>
                <p className="text-xs uppercase tracking-wider text-slate-500 mt-2 font-sans">
                  This is proudly presented to
                </p>
              </div>

              {/* Recipient */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif uppercase tracking-wide">
                  {activeCert.userName}
                </h2>
                <div className="w-48 h-0.5 bg-emerald-600/40 mx-auto mt-1.5" />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                has demonstrated exceptional competence and successfully passed the rigorous examination curriculum for{' '}
                <span className="font-bold text-emerald-800 block text-base sm:text-lg font-serif mt-1">
                  {activeCert.courseName}
                </span>
              </p>

              <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-xl bg-white/80 border border-emerald-200 text-xs text-slate-700">
                <span>Final Score: <b>{activeCert.percentage}%</b></span>
                <span>•</span>
                <span>Date: <b>{new Date(activeCert.issuedAt).toLocaleDateString()}</b></span>
              </div>

              {/* Footer Signatures */}
              <div className="pt-8 grid grid-cols-3 items-end max-w-2xl mx-auto">
                {/* Founder 1 */}
                <div className="text-center">
                  <div className="font-serif italic text-base sm:text-lg text-slate-900 mb-1 border-b border-slate-400 pb-1">
                    {activeCert.founderSignature || 'Arvind Mocosart'}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{activeCert.foundersName || 'Dr. Arvind Mocosart'}</p>
                  <p className="text-[10px] text-slate-500">Chief Academic Officer</p>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-600 bg-emerald-50 flex flex-col items-center justify-center text-emerald-800 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">VERIFIED</span>
                  </div>
                </div>

                {/* Founder 2 */}
                <div className="text-center">
                  <div className="font-serif italic text-base sm:text-lg text-slate-900 mb-1 border-b border-slate-400 pb-1">
                    Sanjana Rao
                  </div>
                  <p className="text-xs font-bold text-slate-900">Sanjana Rao</p>
                  <p className="text-[10px] text-slate-500">Head of Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
