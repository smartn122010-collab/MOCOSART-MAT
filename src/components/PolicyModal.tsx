import React from 'react';
import { X, Shield, FileText, RefreshCw, CheckCircle2, Calendar, Download } from 'lucide-react';
import { CompanyInfo, PolicyContent } from '../types';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'terms' | 'privacy' | 'refund';
  companyInfo: CompanyInfo;
  policies?: {
    terms: PolicyContent;
    privacy: PolicyContent;
    refund: PolicyContent;
  };
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policyType,
  companyInfo,
  policies
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (policyType) {
      case 'terms':
        return 'Terms and Conditions';
      case 'privacy':
        return 'Privacy Policy & Data Protection';
      case 'refund':
        return 'Refund Policy & Cancellation Conditions';
    }
  };

  const getSubtitle = () => {
    switch (policyType) {
      case 'terms':
        return 'Official terms governing student enrollment, examination protocols, course access, and verified credentials.';
      case 'privacy':
        return 'Transparency disclosure on how we safeguard learner profiles, academic test results, and payment details.';
      case 'refund':
        return 'Transparent guidelines outlining refund eligibility periods, exam cancellations, and credit turnaround times.';
    }
  };

  const getIcon = () => {
    switch (policyType) {
      case 'terms':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'privacy':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getContent = (): string => {
    // 1. Check policies prop
    if (policies && policies[policyType]?.content) {
      return policies[policyType].content;
    }
    // 2. Check localStorage
    try {
      const saved = localStorage.getItem(`mocosart_${policyType}_policy`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.content) return parsed.content;
      }
    } catch {}
    // 3. Check companyInfo
    switch (policyType) {
      case 'terms':
        return companyInfo.termsAndConditions || '';
      case 'privacy':
        return companyInfo.privacyPolicy || '';
      case 'refund':
        return companyInfo.refundPolicy || '';
    }
  };

  const rawContent = getContent();
  const paragraphs = rawContent
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="policy-modal-card" 
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl glass-panel p-6 sm:p-8 border border-white/90 shadow-2xl overflow-hidden bg-white/95"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 font-serif">{getTitle()}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Official
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{getSubtitle()}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Published by <span className="font-semibold text-slate-700">{companyInfo.companyName || 'Mocosart'}</span> • Binding Agreement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="overflow-y-auto my-4 pr-2 space-y-3 text-sm text-slate-700 leading-relaxed font-serif">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, idx) => {
              const isNumbered = /^\d+[\.\)]/.test(paragraph);
              const isHeading = paragraph.includes(':') && paragraph.length < 60;

              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    isNumbered || isHeading
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-800 font-medium'
                      : 'bg-white/60 border-slate-100 text-slate-700'
                  }`}
                >
                  <p>{paragraph}</p>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-500 italic">
              No formal text recorded yet for this policy section. Please check back shortly or contact administration.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Applies to all registered students, exam examinees & visitors</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer shadow-sm"
          >
            I Have Read & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
