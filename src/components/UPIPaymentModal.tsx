import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Smartphone, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight,
  QrCode,
  CreditCard,
  Check,
  Download
} from 'lucide-react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  amount: number;
  itemType: 'course' | 'exam' | 'subscription';
  userDisplayName?: string;
  userEmail?: string;
  onPaymentSuccess: (details: {
    utrNumber: string;
    upiId: string;
    upiMobile: string;
    paymentMethod: string;
  }) => void;
  customMobileNumber?: string;
  customUpiId?: string;
  customQrCode?: string;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  amount,
  itemType,
  userDisplayName,
  userEmail,
  onPaymentSuccess,
  customMobileNumber = '7358800371',
  customUpiId = '7358800371@upi',
  customQrCode
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>('Google Pay');
  const [showUtrInput, setShowUtrInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const mobileNo = customMobileNumber || '7358800371';
  const upiId = customUpiId || `${mobileNo}@upi`;
  const payeeName = 'Mocosart Learning Hub';
  const cleanTitle = itemTitle.replace(/[^a-zA-Z0-9 ]/g, ' ').substring(0, 30);

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(cleanTitle)}`;
  
  // Specific UPI App deep links
  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(cleanTitle)}`;
  const phonepeUri = `phonepe://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(cleanTitle)}`;
  const paytmUri = `paytmmp://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(cleanTitle)}`;

  // QR Code URL: Prefer admin-uploaded custom QR code, otherwise use generated UPI QR code
  const qrCodeUrl = (customQrCode && customQrCode.trim().length > 0)
    ? customQrCode
    : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;

  const handleDownloadQrCode = async () => {
    setDownloadingQr(true);
    try {
      if (qrCodeUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `mocosart_qr_${cleanTitle.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(qrCodeUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `mocosart_qr_${cleanTitle.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn("Direct blob download fallback:", err);
      window.open(qrCodeUrl, '_blank');
    } finally {
      setDownloadingQr(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(mobileNo);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleOpenApp = (appUrl: string, appName: string) => {
    setSelectedApp(appName);
    setShowUtrInput(true);
    // Open UPI App
    window.location.href = appUrl;
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setValidationError("UPI Transaction / UTR number is required. Please enter the reference number from your payment receipt to proceed.");
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    setTimeout(() => {
      onPaymentSuccess({
        utrNumber: cleanUtr,
        upiId,
        upiMobile: mobileNo,
        paymentMethod: selectedApp
      });
      setSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              ₹
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif leading-tight">
                UPI Instant Payment
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Google Pay • PhonePe • Paytm • Any UPI App
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto my-3 pr-1 space-y-4 text-slate-800">
          {/* Amount and Item summary card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-200/80 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {itemType.toUpperCase()} ENROLLMENT FEE
              </span>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base font-serif line-clamp-1">
                {itemTitle}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Payee: <span className="font-semibold text-slate-700">{payeeName}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Payable</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-serif">
                ₹{amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dedicated UPI Mobile Number Box */}
          <div className="rounded-2xl p-3.5 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Official UPI Mobile Number
                </span>
                <span className="text-base font-bold text-slate-900 font-mono tracking-wide">
                  {mobileNo}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPhone ? 'Copied Number!' : 'Copy Mobile'}</span>
            </button>
          </div>

          {/* UPI ID Details */}
          <div className="rounded-2xl p-3.5 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100/80 text-teal-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Merchant UPI ID
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {upiId}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyUpi}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUpi ? 'Copied UPI ID!' : 'Copy UPI ID'}</span>
            </button>
          </div>

          {/* Quick Pay Buttons for UPI Apps */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Tap to Pay in Any UPI App (Mobile)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Google Pay */}
              <button
                type="button"
                id="upi-btn-gpay"
                onClick={() => handleOpenApp(gpayUri, 'Google Pay')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                  GPay
                </div>
                <span className="text-[11px] font-bold text-slate-800">Google Pay</span>
              </button>

              {/* PhonePe */}
              <button
                type="button"
                id="upi-btn-phonepe"
                onClick={() => handleOpenApp(phonepeUri, 'PhonePe')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                  Pe
                </div>
                <span className="text-[11px] font-bold text-slate-800">PhonePe</span>
              </button>

              {/* Paytm */}
              <button
                type="button"
                id="upi-btn-paytm"
                onClick={() => handleOpenApp(paytmUri, 'Paytm')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                  Paytm
                </div>
                <span className="text-[11px] font-bold text-slate-800">Paytm</span>
              </button>

              {/* Other / Any UPI App */}
              <button
                type="button"
                id="upi-btn-any"
                onClick={() => handleOpenApp(upiUri, 'Other UPI App')}
                className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                  UPI
                </div>
                <span className="text-[11px] font-bold">Any UPI App</span>
              </button>
            </div>
          </div>

          {/* Desktop & Mobile QR Code Scan & Download Section */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-32 h-32 object-contain"
                />
              </div>

              {/* Download QR Code Button */}
              <button
                type="button"
                id="btn-download-qr-code"
                onClick={handleDownloadQrCode}
                disabled={downloadingQr}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Download QR code to phone gallery / files"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>{downloadingQr ? 'Downloading...' : 'Download QR Code'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-slate-900 font-serif">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scan or Download QR Code</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download the QR Code to scan directly from your gallery, or open Google Pay, PhonePe, or Paytm camera to scan and pay ₹{amount.toLocaleString()}.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowUtrInput(true)}
                  className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Done with payment? Confirm enrollment below</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Verification / UTR Input Section */}
          <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Enter UPI Transaction / UTR No
              </label>
              <span className="text-[10px] text-slate-500 font-mono">12-Digit Reference</span>
            </div>

            <form onSubmit={handleSubmitVerification} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. 324109845612, 429384910283 or UPI Ref No"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 ${
                    validationError 
                      ? 'border-red-400 focus:ring-red-400' 
                      : utrNumber.trim() 
                      ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20' 
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                />
                {validationError ? (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⚠️ {validationError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {utrNumber.trim() ? (
                      <span className="text-emerald-700 font-semibold">✓ UPI Reference recorded! Now click "I have Paid" to verify.</span>
                    ) : (
                      <span>Found in your Google Pay, PhonePe, Paytm or BHIM receipt. <b className="text-slate-700">Enter UPI Transaction No above to unlock "I have Paid".</b></span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="upi-confirm-payment-btn"
                  type="submit"
                  disabled={submitting || !utrNumber.trim()}
                  title={!utrNumber.trim() ? "Please enter your UPI transaction reference number above first" : "Submit verification"}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all ${
                    !utrNumber.trim() || submitting
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/20 active:scale-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting 
                      ? 'Confirming...' 
                      : !utrNumber.trim() 
                      ? 'Enter UPI No to Activate "I have Paid"' 
                      : 'I have Paid • Confirm Enrollment'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted UPI Gateway • Instant Confirmation to {userEmail || 'Account'}</span>
        </div>
      </div>
    </div>
  );
};
