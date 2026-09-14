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
import { CertificateTemplate } from '../CertificateTemplate';

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
        return 'from-sky-400 via-cyan-400 to-blue-600 text-white shadow-sky-500/30';
      case 'Gold':
        return 'from-amber-400 via-yellow-400 to-amber-600 text-amber-950 shadow-amber-500/30';
      case 'Silver':
      default:
        return 'from-slate-300 via-gray-300 to-slate-400 text-slate-900 shadow-slate-400/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-cinzel flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-800" />
            <span>Accredited Certificates</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Official accredited certificates issued with authentic founder signatures, flowing ribbons, and tamper-evident security seals.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Tamper-Proof Verification</span>
        </div>
      </div>

      {/* 10-Day Notice Banner as requested by user */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 shadow-sm">
        <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950">
          <p className="font-bold">Institutional Accreditation Regulation:</p>
          <p className="text-blue-900/80 leading-relaxed mt-0.5">
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
              className="relative rounded-2xl bg-white border-2 border-blue-900/20 p-5 shadow-sm hover:shadow-xl hover:border-blue-700/60 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              {/* Ribbon Badge on top left */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${getGradeRibbonStyle(cert.grade)} shadow-md`}>
                  ★ {cert.grade} Ribbon
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {cert.certificateNumber}
                </span>
              </div>

              {/* Certificate Mini Preview Box - Blue & White Theme */}
              <div className="relative p-4 rounded-xl bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 border-2 border-blue-900/30 mb-4 text-center group-hover:bg-blue-100/30 transition-colors">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-blue-800" />
                  <p className="text-[10px] uppercase font-bold text-blue-950 tracking-[0.2em] font-cinzel">
                    MOCOSART
                  </p>
                  <Sparkles className="w-3 h-3 text-blue-800" />
                </div>
                <h4 className="text-sm font-bold text-blue-900 font-serif line-clamp-1 my-1">
                  {cert.courseName}
                </h4>
                
                {/* Cursive Recipient Name */}
                <div className="my-2">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans">Conferred Upon</p>
                  <p className="font-cursive text-2xl text-blue-950 font-normal leading-tight">
                    {cert.userName}
                  </p>
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[10px] font-bold text-blue-900">
                  <CheckCircle className="w-3 h-3 text-blue-700" />
                  Final Score: {cert.percentage}%
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-panel p-4 sm:p-6 border border-white shadow-2xl overflow-y-auto bg-slate-50/95">
            {/* Header controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-900" />
                <span className="text-sm font-bold text-slate-900 font-cinzel">Official Accredited Certificate</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-950">
                  {activeCert.grade} Grade
                </span>
              </div>
              <button
                onClick={() => setActiveCert(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Template Display */}
            <CertificateTemplate 
              cert={activeCert} 
              onDownloadPDF={() => exportCertificateToPDF(activeCert)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
