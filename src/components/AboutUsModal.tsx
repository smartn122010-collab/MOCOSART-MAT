import React from 'react';
import { X, Mail, Phone, MapPin, Globe, ExternalLink, Shield, FileText, RefreshCw, Users } from 'lucide-react';
import { CompanyInfo, Founder } from '../types';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  founders: Founder[];
  onOpenPolicy: (type: 'terms' | 'privacy' | 'refund') => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  founders,
  onOpenPolicy
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="about-us-modal-card" 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl glass-panel p-6 md:p-8 border border-white/80 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 font-serif">{companyInfo.companyName}</h3>
            <p className="text-xs md:text-sm text-emerald-700 font-medium">About Our Mission & Leadership</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto my-4 pr-2 space-y-6 text-slate-700 text-sm">
          {/* Company Description */}
          <div className="p-4 rounded-xl glass-panel-green border border-emerald-200">
            <h4 className="text-base font-semibold text-emerald-950 font-serif mb-2">Who We Are</h4>
            <p className="text-emerald-900/85 leading-relaxed">
              {companyInfo.description}
            </p>
          </div>

          {/* Founders Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900 font-serif">Founders & Academic Directorate</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {founders.map((founder) => (
                <div key={founder.id} className="p-4 rounded-xl glass-card border border-white flex gap-3.5 items-start">
                  <img
                    src={founder.photoUrl}
                    alt={founder.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 font-serif text-sm">{founder.name}</h5>
                    <p className="text-xs text-emerald-700 font-medium mb-1">{founder.title}</p>
                    <p className="text-xs text-slate-600 leading-snug">{founder.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details & Company Place */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">Official Support Email</span>
                <a href={`mailto:${companyInfo.email}`} className="text-xs font-semibold text-slate-800 hover:text-emerald-600">
                  {companyInfo.email}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">Student Helpline</span>
                <a href={`tel:${companyInfo.phone}`} className="text-xs font-semibold text-slate-800 hover:text-emerald-600">
                  {companyInfo.phone}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-500 block">Company Campus & Venue Headquarters</span>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {companyInfo.address}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block">Official Website</span>
                  <a href={companyInfo.websiteUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                    {companyInfo.websiteUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Policies Section - Click anywhere to read */}
          <div className="pt-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Legal & Institutional Policies (Tap to Read)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="p-3 rounded-xl bg-white/80 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 font-serif">Terms of Service</span>
                </div>
                <p className="text-[11px] text-slate-500">Student rules & testing rights</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="p-3 rounded-xl bg-white/80 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 font-serif">Privacy Policy</span>
                </div>
                <p className="text-[11px] text-slate-500">Data encryption & safety</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPolicy('refund')}
                className="p-3 rounded-xl bg-white/80 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 font-serif">Refund Policy</span>
                </div>
                <p className="text-[11px] text-slate-500">Moneyback rules & timelines</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
