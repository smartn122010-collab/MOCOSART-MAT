import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Eye, 
  Check, 
  X, 
  FileText,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { CertificateRecord, UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { exportCertificateToPDF, exportTableToPDF } from '../../utils/pdfExport';
import { CertificateTemplate } from '../CertificateTemplate';

interface AdminCertificateGenProps {
  certificates: CertificateRecord[];
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminCertificateGen: React.FC<AdminCertificateGenProps> = ({
  certificates,
  users,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateRecord | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);

  // Form states - strictly manually entered by Admin
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [percentage, setPercentage] = useState<number>(85);
  const [grade, setGrade] = useState<'Silver' | 'Gold' | 'Diamond'>('Diamond');
  const [description, setDescription] = useState('Demonstrated distinguished mastery in comprehensive assessment curriculum.');
  const [foundersName, setFoundersName] = useState('Dr. Arvind Mocosart');
  const [founderDesignation, setFounderDesignation] = useState('Founder & Chancellor');
  const [founderSignature, setFounderSignature] = useState('Arvind Mocosart');
  const [cofounderName, setCofounderName] = useState('Sanjana Rao');
  const [cofounderDesignation, setCofounderDesignation] = useState('Co-Founder & Operations Director');
  const [cofounderSignature, setCofounderSignature] = useState('Sanjana Rao');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingCert(null);
    setUserName('');
    setUserEmail('');
    setCourseName('Full Stack React & Cloud Architecture');
    setPercentage(92);
    setGrade('Diamond');
    setDescription('Has demonstrated outstanding excellence and technical mastery in advanced course assessments.');
    setFoundersName('Dr. Arvind Mocosart');
    setFounderDesignation('Founder & Chancellor');
    setFounderSignature('Arvind Mocosart');
    setCofounderName('Sanjana Rao');
    setCofounderDesignation('Co-Founder & Operations Director');
    setCofounderSignature('Sanjana Rao');
    setShowModal(true);
  };

  const openEditModal = (cert: CertificateRecord) => {
    setEditingCert(cert);
    setUserName(cert.userName);
    setUserEmail(cert.userEmail);
    setCourseName(cert.courseName);
    setPercentage(cert.percentage);
    setGrade(cert.grade);
    setDescription(cert.description);
    setFoundersName(cert.foundersName || 'Dr. Arvind Mocosart');
    setFounderDesignation(cert.founderDesignation || 'Founder & Chancellor');
    setFounderSignature(cert.founderSignature || 'Arvind Mocosart');
    setCofounderName(cert.cofounderName || 'Sanjana Rao');
    setCofounderDesignation(cert.cofounderDesignation || 'Co-Founder & Operations Director');
    setCofounderSignature(cert.cofounderSignature || 'Sanjana Rao');
    setShowModal(true);
  };

  const handleSelectUser = (uid: string) => {
    const selected = users.find(u => u.uid === uid);
    if (selected) {
      setUserName(selected.displayName);
      setUserEmail(selected.email);
    }
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Please enter recipient name.");
      return;
    }
    setSaving(true);

    try {
      const certData = {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        courseName: courseName.trim() || 'Accredited Master Course',
        percentage: Number(percentage) || 85,
        grade,
        description: description.trim() || 'Demonstrated distinguished mastery in comprehensive assessment curriculum.',
        foundersName: foundersName.trim() || 'Dr. Arvind Mocosart',
        founderDesignation: founderDesignation.trim() || 'Founder & Chancellor',
        founderSignature: founderSignature.trim() || 'Arvind Mocosart',
        cofounderName: cofounderName.trim() || 'Sanjana Rao',
        cofounderDesignation: cofounderDesignation.trim() || 'Co-Founder & Operations Director',
        cofounderSignature: cofounderSignature.trim() || 'Sanjana Rao',
        issuedAt: editingCert?.issuedAt || new Date().toISOString(),
        certificateNumber: editingCert?.certificateNumber || `MOC-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'generated' as const,
        userId: editingCert?.userId || (users.find(u => u.email === userEmail.trim())?.uid || 'direct_issued')
      };

      if (editingCert) {
        await updateDoc(doc(db, 'certificates', editingCert.id), certData);
      } else {
        await addDoc(collection(db, 'certificates'), certData);

        // Notify user if known
        if (certData.userId && certData.userId !== 'direct_issued') {
          await addDoc(collection(db, 'notifications'), {
            targetUserId: certData.userId,
            title: `Certificate Issued: ${certData.courseName}`,
            message: `Your accredited ${certData.grade} Grade Certificate has been published and is ready for download in your Certificate dashboard!`,
            type: 'success',
            createdAt: new Date().toISOString()
          });
        }
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save certificate:", err);
      alert(`Failed to publish certificate: ${err?.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCert = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'certificates', id));
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
    onRefresh();
  };

  const handleShareToUser = async (cert: CertificateRecord) => {
    try {
      const targetUid = cert.userId && cert.userId !== 'direct_issued'
        ? cert.userId
        : (users.find(u => u.email === cert.userEmail)?.uid || cert.userEmail);

      await addDoc(collection(db, 'notifications'), {
        targetUserId: targetUid,
        title: `Certificate Granted: ${cert.courseName}`,
        message: `Congratulations ${cert.userName}! Your official Mocosart ${cert.grade} Grade Certificate has been verified and shared to your account. Open your Certificate tab to download the accredited PDF.`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onRefresh();
    } catch (err) {
      console.error("Failed to share certificate notification:", err);
    }
  };

  const getRibbonBadge = (g: string) => {
    switch (g) {
      case 'Diamond': return 'from-sky-500 to-indigo-600 text-white';
      case 'Gold': return 'from-amber-400 to-yellow-600 text-white';
      default: return 'from-slate-400 to-zinc-600 text-white';
    }
  };

  const handleDownloadLedger = () => {
    const headers = ['Certificate ID', 'Recipient Name', 'Email', 'Course / Exam', 'Percentage', 'Grade', 'Issued Date'];
    const rows = certificates.map(c => [
      c.certificateNumber || c.id,
      c.userName,
      c.userEmail,
      c.courseName,
      `${c.percentage}%`,
      c.grade,
      new Date(c.issuedAt).toLocaleDateString()
    ]);
    exportTableToPDF('Mocosart - Official Verified Certificates Accreditation Ledger', headers, rows, 'verified_certificates_ledger');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Certificate Generated Section
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish, edit, and issue verified accreditation certificates with premium styling and manual founder / co-founder signatures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadLedger}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Aligned PDF</span>
          </button>
          <button
            id="admin-issue-cert-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Manual Enter Certificate</span>
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Candidate Name & Email</th>
                <th className="p-3.5">Course / Exam</th>
                <th className="p-3.5">Grade Ribbon</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5">Certificate ID</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((c) => (
                <tr key={c.id} className="hover:bg-white/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{c.userName}</div>
                    <div className="text-[11px] text-slate-500">{c.userEmail}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">
                    {c.courseName}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${getRibbonBadge(c.grade)} shadow-sm`}>
                      ★ {c.grade}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-800 font-serif text-sm">
                    {c.percentage}%
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                    {c.certificateNumber}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(c.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    {/* View preview */}
                    <button
                      type="button"
                      onClick={() => setPreviewCert(c)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Preview Certificate Style"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* Download PDF */}
                    <button
                      type="button"
                      onClick={() => exportCertificateToPDF(c)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {/* Share to User */}
                    <button
                      type="button"
                      onClick={() => handleShareToUser(c)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Share to Student Account & Send Notification"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Certificate Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(c.id, c.userName)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {certificates.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No certificates issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingCert ? 'Edit Certificate Information' : 'Issue & Generate Certificate'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="overflow-y-auto pr-1 my-3 space-y-4">
              {/* Optional Quick User Select */}
              {users.length > 0 && !editingCert && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Quick Select User</label>
                  <select
                    onChange={(e) => handleSelectUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  >
                    <option value="">-- Choose from Registered Users --</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Student / Candidate Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course / Assessment Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Grade Option Select: Silver, Gold, Diamond */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Grade Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  >
                    <option value="Silver">Silver Ribbon</option>
                    <option value="Gold">Gold Ribbon</option>
                    <option value="Diamond">Diamond Ribbon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Score Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Certificate Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-800"
                  required
                />
              </div>

              {/* Strictly Manual Founder and Co-Founder Signatures */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Under-Certificate Signatures (Manually Entered by Admin)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Founder Block */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-900">1. Founder Signature</p>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Founder Name</label>
                      <input
                        type="text"
                        value={foundersName}
                        onChange={(e) => setFoundersName(e.target.value)}
                        placeholder="Dr. Arvind Mocosart"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Founder Designation</label>
                      <input
                        type="text"
                        value={founderDesignation}
                        onChange={(e) => setFounderDesignation(e.target.value)}
                        placeholder="Founder & Chancellor"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Founder Signature Text</label>
                      <input
                        type="text"
                        value={founderSignature}
                        onChange={(e) => setFounderSignature(e.target.value)}
                        placeholder="Arvind Mocosart"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-serif italic text-slate-900 bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  {/* Co-Founder Block */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-900">2. Co-Founder Signature</p>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Co-Founder Name</label>
                      <input
                        type="text"
                        value={cofounderName}
                        onChange={(e) => setCofounderName(e.target.value)}
                        placeholder="Sanjana Rao"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Co-Founder Designation</label>
                      <input
                        type="text"
                        value={cofounderDesignation}
                        onChange={(e) => setCofounderDesignation(e.target.value)}
                        placeholder="Co-Founder & Operations Director"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Co-Founder Signature Text</label>
                      <input
                        type="text"
                        value={cofounderSignature}
                        onChange={(e) => setCofounderSignature(e.target.value)}
                        placeholder="Sanjana Rao"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-serif italic text-slate-900 bg-slate-50"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save and Publish */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-cert-btn"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Certificate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl glass-panel p-4 sm:p-6 border border-white shadow-2xl overflow-hidden bg-slate-50/90 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-cinzel">
                  Official Certificate Preview • Blue & White Theme
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  {previewCert.grade} Grade
                </span>
              </div>
              <button 
                onClick={() => setPreviewCert(null)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Blue & White Certificate Template with Flowing Ribbon & Cursive Typography */}
            <CertificateTemplate 
              cert={previewCert} 
              onDownloadPDF={() => exportCertificateToPDF(previewCert)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
