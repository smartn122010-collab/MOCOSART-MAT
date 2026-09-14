import React from 'react';
import { X, Shield, FileText, RefreshCw } from 'lucide-react';
import { CompanyInfo } from '../types';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'terms' | 'privacy' | 'refund';
  companyInfo: CompanyInfo;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policyType,
  companyInfo
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (policyType) {
      case 'terms':
        return 'Terms of Service';
      case 'privacy':
        return 'Privacy Policy';
      case 'refund':
        return 'Refund Policy';
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

  const getContent = () => {
    switch (policyType) {
      case 'terms':
        return companyInfo.termsAndConditions;
      case 'privacy':
        return companyInfo.privacyPolicy;
      case 'refund':
        return companyInfo.refundPolicy;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="policy-modal-card" 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl glass-panel p-6 md:p-8 border border-white/80 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">{getTitle()}</h3>
              <p className="text-xs text-slate-500">Official legal disclosure • {companyInfo.companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="overflow-y-auto my-4 pr-2 space-y-4 text-sm text-slate-700 leading-relaxed font-serif">
          {getContent()
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((paragraph, idx) => (
              <p key={idx} className="p-2.5 rounded-lg bg-white/40 border border-slate-100">
                {paragraph}
              </p>
            ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Last updated: {new Date().toLocaleDateString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
