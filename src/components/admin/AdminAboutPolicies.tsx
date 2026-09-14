import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Share2,
  Download
} from 'lucide-react';
import { CompanyInfo, PolicyContent } from '../../types';
import { db } from '../../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminAboutPoliciesProps {
  companyInfo: CompanyInfo;
  policies: {
    terms: PolicyContent;
    privacy: PolicyContent;
    refund: PolicyContent;
  };
  onRefresh: () => void;
}

export const AdminAboutPolicies: React.FC<AdminAboutPoliciesProps> = ({
  companyInfo,
  policies,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'terms' | 'privacy' | 'refund'>('company');

  // Load any previously saved manual overrides from local storage as immediate fallback
  const getSavedCompany = () => {
    try {
      const saved = localStorage.getItem('mocosart_manual_company_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const initialCompany = getSavedCompany() || companyInfo;

  // Company info state - strictly manually entered
  const [companyName, setCompanyName] = useState(initialCompany.companyName || 'Mocosart');
  const [phone, setPhone] = useState(initialCompany.phone || '+91 7358800371');
  const [gmail, setGmail] = useState(initialCompany.gmail || 'smartnp09812@gmail.com');
  const [websiteUrl, setWebsiteUrl] = useState(initialCompany.websiteUrl || 'https://mocosart.edu');
  const [address, setAddress] = useState(initialCompany.address || '');
  const [description, setDescription] = useState(initialCompany.description || '');
  const [socialLinks, setSocialLinks] = useState(initialCompany.socialLinks || {
    linkedin: 'https://linkedin.com/company/mocosart',
    twitter: 'https://twitter.com/mocosart',
    youtube: 'https://youtube.com/@mocosart'
  });

  // Policies states - strictly manually entered
  const [termsText, setTermsText] = useState(policies.terms.content);
  const [privacyText, setPrivacyText] = useState(policies.privacy.content);
  const [refundText, setRefundText] = useState(policies.refund.content);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync state if remote props change AND local storage is empty
  useEffect(() => {
    if (companyInfo && !localStorage.getItem('mocosart_manual_company_info')) {
      if (companyInfo.companyName) setCompanyName(companyInfo.companyName);
      if (companyInfo.phone) setPhone(companyInfo.phone);
      if (companyInfo.gmail) setGmail(companyInfo.gmail);
      if (companyInfo.websiteUrl) setWebsiteUrl(companyInfo.websiteUrl);
      if (companyInfo.address) setAddress(companyInfo.address);
      if (companyInfo.description) setDescription(companyInfo.description);
      if (companyInfo.socialLinks) setSocialLinks(companyInfo.socialLinks);
    }
  }, [companyInfo]);

  useEffect(() => {
    if (policies.terms?.content && !localStorage.getItem('mocosart_terms_policy')) {
      setTermsText(policies.terms.content);
    }
    if (policies.privacy?.content && !localStorage.getItem('mocosart_privacy_policy')) {
      setPrivacyText(policies.privacy.content);
    }
    if (policies.refund?.content && !localStorage.getItem('mocosart_refund_policy')) {
      setRefundText(policies.refund.content);
    }
  }, [policies]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);

    const data: CompanyInfo = {
      companyName: companyName.trim(),
      phone: phone.trim(),
      email: (gmail || '').trim(),
      gmail: gmail.trim(),
      websiteUrl: websiteUrl.trim(),
      address: address.trim(),
      description: description.trim(),
      socialLinks
    };

    // Save permanently in local storage so page reload NEVER reverts to old name!
    try {
      localStorage.setItem('mocosart_manual_company_info', JSON.stringify(data));
    } catch {}

    try {
      // Save to BOTH 'companyInfo' and 'company_info' to ensure absolute database consistency
      await Promise.all([
        setDoc(doc(db, 'settings', 'companyInfo'), data, { merge: true }),
        setDoc(doc(db, 'settings', 'company_info'), data, { merge: true })
      ]);
      setSaveSuccess("Company details saved & published successfully! Saved permanently.");
      onRefresh();
    } catch (err) {
      console.warn("Firestore sync warning, saved to local store:", err);
      setSaveSuccess("Company details saved locally in browser!");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicy = async (type: 'terms' | 'privacy' | 'refund') => {
    setSaving(true);
    setSaveSuccess(null);

    const content = type === 'terms' ? termsText : type === 'privacy' ? privacyText : refundText;
    const title = type === 'terms' 
      ? 'Terms of Service & Academic Regulations' 
      : type === 'privacy' 
        ? 'Privacy Policy & Student Data Protection' 
        : 'Refund Policy & Cancellation Terms';

    const policyPayload = {
      title,
      content,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`mocosart_${type}_policy`, JSON.stringify(policyPayload));
    } catch {}

    try {
      await setDoc(doc(db, 'policies', type), policyPayload, { merge: true });
      setSaveSuccess(`${type.toUpperCase()} Policy successfully updated & saved permanently!`);
      onRefresh();
    } catch (err) {
      console.warn("Policy firestore save warning, saved locally:", err);
      setSaveSuccess(`${type.toUpperCase()} Policy saved locally!`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPoliciesReport = () => {
    const headers = ['Document Section', 'Title', 'Content Excerpt', 'Last Updated'];
    const rows = [
      ['Company Info', companyName, description.substring(0, 80) + '...', 'Current'],
      ['Terms Policy', 'Terms of Service', termsText.substring(0, 80) + '...', policies.terms.updatedAt ? new Date(policies.terms.updatedAt).toLocaleDateString() : 'Current'],
      ['Privacy Policy', 'Privacy & Data Protection', privacyText.substring(0, 80) + '...', policies.privacy.updatedAt ? new Date(policies.privacy.updatedAt).toLocaleDateString() : 'Current'],
      ['Refund Policy', 'Refunds & Cancellations', refundText.substring(0, 80) + '...', policies.refund.updatedAt ? new Date(policies.refund.updatedAt).toLocaleDateString() : 'Current']
    ];
    exportTableToPDF('Mocosart - Company Profile & Governance Policies', headers, rows, 'company_policies_report');
  };

  const handleClearPolicy = (type: 'terms' | 'privacy' | 'refund') => {
    if (!window.confirm(`Clear content for ${type}? You can paste your updated legal text before saving.`)) return;
    if (type === 'terms') setTermsText('');
    else if (type === 'privacy') setPrivacyText('');
    else setRefundText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            About Us & Legal Policy Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage corporate credentials, official contact lines, social media channels, Terms & Conditions, Privacy Policy, and Refund Condition. All changes are saved permanently.
          </p>
        </div>

        <button
          onClick={handleDownloadPoliciesReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Download Aligned PDF</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('company')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'company'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Company Information & Social Links
        </button>
        <button
          onClick={() => setActiveSubTab('terms')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'terms'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Terms and Conditions
        </button>
        <button
          onClick={() => setActiveSubTab('privacy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'privacy'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveSubTab('refund')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'refund'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Refund Condition & Policy
        </button>
      </div>

      {/* SubTab 1: Company Info */}
      {activeSubTab === 'company' && (
        <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md">
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Gmail / Support Email</label>
                <input
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Registered Campus / Place Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Mission & Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                required
              />
            </div>

            {/* Social Media Links */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Social Media Links
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Twitter / X URL</label>
                  <input
                    type="url"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">YouTube URL</label>
                  <input
                    type="url"
                    value={socialLinks.youtube || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Save & Publish Company Info'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SubTab 2: Terms and Conditions */}
      {activeSubTab === 'terms' && (
        <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Edit Terms and Conditions
            </h3>
            <button
              type="button"
              onClick={() => handleClearPolicy('terms')}
              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Text</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            className="w-full p-4 rounded-xl glass-input text-xs text-slate-800 font-serif leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSavePolicy('terms')}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Terms'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 3: Privacy Policy */}
      {activeSubTab === 'privacy' && (
        <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Edit Privacy Policy
            </h3>
            <button
              type="button"
              onClick={() => handleClearPolicy('privacy')}
              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Text</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={privacyText}
            onChange={(e) => setPrivacyText(e.target.value)}
            className="w-full p-4 rounded-xl glass-input text-xs text-slate-800 font-serif leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSavePolicy('privacy')}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Privacy Policy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 4: Refund Condition */}
      {activeSubTab === 'refund' && (
        <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Edit Refund Condition & Guidelines
            </h3>
            <button
              type="button"
              onClick={() => handleClearPolicy('refund')}
              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Text</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={refundText}
            onChange={(e) => setRefundText(e.target.value)}
            className="w-full p-4 rounded-xl glass-input text-xs text-slate-800 font-serif leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSavePolicy('refund')}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Refund Policy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
