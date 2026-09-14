import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  Save, 
  QrCode,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Download,
  Link2
} from 'lucide-react';
import { PaymentMethod } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { compressImageFile } from '../../utils/imageCompressor';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminPaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onRefresh: () => void;
}

export const AdminPaymentMethods: React.FC<AdminPaymentMethodsProps> = ({
  paymentMethods,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Form states - fully manually entered by admin
  const [provider, setProvider] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [notes, setNotes] = useState('');
  const [qrInputMode, setQrInputMode] = useState<'upload' | 'url'>('upload');
  const [qrManualUrl, setQrManualUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingMethod(null);
    setProvider('');
    setQrCodeUrl('');
    setQrManualUrl('');
    setMobileNumber('');
    setAccountName('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setProvider(method.provider || '');
    setQrCodeUrl(method.qrCodeUrl || '');
    setQrManualUrl(method.qrCodeUrl || '');
    setMobileNumber(method.mobileNumber || '');
    setAccountName(method.accountName || '');
    setNotes(method.notes || '');
    setShowModal(true);
  };

  // Upload QR code from "My files" with manual format compression
  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingQr(true);
      try {
        const compressed = await compressImageFile(file, 800, 0.88);
        setQrCodeUrl(compressed);
        setQrManualUrl(compressed);
      } catch (err) {
        console.warn("QR compression fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          setQrCodeUrl(res);
          setQrManualUrl(res);
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingQr(false);
      }
    }
  };

  const handleApplyQrUrl = () => {
    if (qrManualUrl.trim()) {
      setQrCodeUrl(qrManualUrl.trim());
    }
  };

  // Save and Publish Payment Method
  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      alert("Please enter UPI Number / Mobile Number.");
      return;
    }
    if (!accountName.trim()) {
      alert("Please enter Account / Beneficiary Name.");
      return;
    }
    setSaving(true);
    setFeedback(null);

    try {
      const methodData = {
        provider: provider.trim() || 'UPI Payment Method',
        mobileNumber: mobileNumber.trim(),
        accountName: accountName.trim(),
        qrCodeUrl: qrCodeUrl.trim() || qrManualUrl.trim() || '',
        active: true,
        notes: notes.trim(),
        createdAt: editingMethod?.createdAt || new Date().toISOString()
      };

      if (editingMethod) {
        await updateDoc(doc(db, 'payment_methods', editingMethod.id), methodData);
        setFeedback(`Payment method "${methodData.provider}" updated and published!`);
      } else {
        await addDoc(collection(db, 'payment_methods'), methodData);
        setFeedback(`Payment method "${methodData.provider}" created successfully!`);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save payment method:", err);
      alert(`Failed to save payment method: ${err?.message || 'Please check your connection.'}`);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  // Permanent Delete
  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await deleteDoc(doc(db, 'payment_methods', id));
      setFeedback("Payment method removed permanently.");
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
    onRefresh();
  };

  const handleDownloadPaymentReport = () => {
    const headers = ['Provider / Gateway', 'UPI / Mobile No', 'Account Name', 'QR Code Status', 'Notes / Instructions'];
    const rows = paymentMethods.map(m => [
      m.provider || 'UPI Gateway',
      m.mobileNumber || '-',
      m.accountName || '-',
      m.qrCodeUrl ? 'Custom Uploaded' : 'Auto Generated',
      m.notes || 'None'
    ]);
    exportTableToPDF('Mocosart - Payment Gateways & UPI Channels Ledger', headers, rows, 'payment_methods_report');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Payment Gateway & QR Code Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manually enter UPI Number, Account Name, and Notes, and upload or link QR codes for student payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPaymentReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Aligned PDF</span>
          </button>
          <button
            id="admin-add-payment-method-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Payment Method & QR</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paymentMethods.map((method) => {
          const upiUri = `upi://pay?pa=${encodeURIComponent(`${method.mobileNumber}@upi`)}&pn=${encodeURIComponent(method.accountName)}&cu=INR`;
          const displayQr = method.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(upiUri)}`;

          return (
            <div
              key={method.id}
              className="rounded-2xl glass-card border border-white/90 p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 font-serif text-base">
                        {method.provider}
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                        Active Gateway
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Enabled
                  </span>
                </div>

                {/* QR Code and Details Layout */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={displayQr}
                      alt="Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs w-full">
                    <div className="flex justify-between">
                      <span className="text-slate-500">QR Code:</span>
                      <span className="font-semibold text-emerald-700">
                        {method.qrCodeUrl ? 'Custom Uploaded' : 'Auto Generated'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">UPI / Mobile:</span>
                      <span className="font-mono font-bold text-slate-900">{method.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary:</span>
                      <span className="font-medium text-slate-800">{method.accountName}</span>
                    </div>
                    {method.notes && (
                      <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200">
                        {method.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions: Edit & Permanent Delete */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(method)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Gateway & QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Permanently Delete Payment Method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {paymentMethods.length === 0 && (
          <div className="col-span-2 p-8 text-center rounded-2xl glass-panel text-slate-400 text-xs">
            No payment methods configured. Click &quot;Add Payment Method &amp; QR&quot; to manually enter UPI details and upload QR.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingMethod ? 'Edit Payment Method & QR Code' : 'Add New Payment Method & Upload QR'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method Provider Name (Manually Enter)
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Google Pay / PhonePe / Paytm / BHIM UPI"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              {/* Upload or Link QR Code manually */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Upload or Provide QR Code
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQrInputMode('upload')}
                      className={`px-2 py-0.5 rounded ${qrInputMode === 'upload' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrInputMode('url')}
                      className={`px-2 py-0.5 rounded ${qrInputMode === 'url' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {qrCodeUrl ? (
                    <div className="relative w-28 h-28 bg-white p-1 rounded-xl border border-emerald-300 shadow-sm shrink-0 flex items-center justify-center group">
                      <img
                        src={qrCodeUrl}
                        alt="Uploaded QR Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => { setQrCodeUrl(''); setQrManualUrl(''); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-700 transition-all cursor-pointer"
                        title="Remove QR code"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[9px] font-semibold text-center px-1">No QR Code Uploaded</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    {qrInputMode === 'upload' ? (
                      <div>
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>{uploadingQr ? 'Optimizing QR...' : 'Choose QR File from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                          Select screenshot or image of your UPI QR code (JPG, PNG, WEBP).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="url"
                            value={qrManualUrl}
                            onChange={(e) => setQrManualUrl(e.target.value)}
                            placeholder="https://example.com/my-qr.png"
                            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleApplyQrUrl}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Paste a direct image URL for the QR code.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* UPI Number / Mobile Number & Account Name (Manually Entered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UPI Number / Mobile (Manually Enter)
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 7358800371 or username@upi"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account / Beneficiary Name (Manually Enter)
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Mocosart Learning Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes & Instructions for Students (Manually Enter)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Scan QR code or transfer to UPI number. Submit UTR / Transaction number after paying."
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Save and Publish */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-payment-method-btn"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Payment Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
