import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  ShieldAlert, 
  User, 
  Mail,
  BellRing,
  Trash2
} from 'lucide-react';
import { RefundRecord, PaymentRecord, UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminRefundsProps {
  refunds: RefundRecord[];
  payments: PaymentRecord[];
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminRefunds: React.FC<AdminRefundsProps> = ({
  refunds,
  payments,
  users,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New refund claim states - direct entry, no payment selection required
  const [targetType, setTargetType] = useState<'subscription' | 'exam' | 'course'>('exam');
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantUpi, setClaimantUpi] = useState('7358800371@upi');
  const [refundAmount, setRefundAmount] = useState<number>(1499);
  const [reason, setReason] = useState('Authorized refund per policy guidelines');
  const [saving, setSaving] = useState(false);

  const filteredRefunds = refunds.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // "both of subscription and exam register refund the amount for succesfull enable button click message send the seprate user notification"
  const handleEnableSuccessfulRefund = async (refund: RefundRecord) => {
    setProcessingId(refund.id);
    try {
      // 1. Update refund status
      await updateDoc(doc(db, 'refunds', refund.id), {
        status: 'successful'
      });

      // 2. Also update associated payment record status to 'refunded'
      if (refund.paymentId) {
        const matchingPay = payments.find(p => p.id === refund.paymentId || p.upiId === refund.paymentId);
        if (matchingPay) {
          await updateDoc(doc(db, 'payments', matchingPay.id), {
            status: 'refunded'
          });
        }
      }

      // 3. Send message to separate user notification
      await addDoc(collection(db, 'notifications'), {
        targetUserId: refund.userId || refund.userEmail,
        title: `Refund Processed: ₹${refund.amount.toLocaleString()}`,
        message: `Dear ${refund.userName}, your refund claim for ${refund.type.toUpperCase()} of ₹${refund.amount.toLocaleString()} has been approved and credited back to your UPI account (${refund.paymentId || '7358800371@upi'}).`,
        type: 'alert',
        createdAt: new Date().toISOString()
      });

      onRefresh();
    } catch (err) {
      console.error("Failed to approve refund:", err);
      onRefresh();
    } finally {
      setProcessingId(null);
    }
  };

  // Delete refund record directly
  const handleDeleteRefund = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'refunds', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete refund:", err);
      onRefresh();
    }
  };

  // Create new refund claim without requiring payment transaction selection
  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const matchedUser = users.find(u => u.email.toLowerCase() === claimantEmail.toLowerCase());
      const refundData = {
        userId: matchedUser?.uid || claimantEmail || 'manual_claimant',
        userName: claimantName || matchedUser?.displayName || 'Candidate Learner',
        userEmail: claimantEmail || 'student@mocosart.com',
        paymentId: claimantUpi || 'UPI_REFUND',
        amount: Number(refundAmount),
        type: targetType,
        reason,
        status: 'pending' as const,
        requestedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'refunds'), refundData);
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to add refund claim:", err);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  // "download the all the user details on PDF"
  const handleDownloadPDF = () => {
    const headers = ['Learner Name', 'Email', 'Type', 'Refund Amount', 'Payment Ref', 'Status', 'Reason', 'Date'];
    const rows = filteredRefunds.map(r => [
      r.userName,
      r.userEmail,
      r.type.toUpperCase(),
      `INR ${r.amount}`,
      r.paymentId || 'N/A',
      r.status.toUpperCase(),
      r.reason,
      new Date(r.requestedAt).toLocaleDateString()
    ]);

    exportTableToPDF('Mocosart - Comprehensive Refund Ledger Report', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Refund Management & Settlement
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review exam register and subscription refunds, verify chargebacks, and dispatch user credits.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Refund Claim</span>
          </button>
          <button
            id="admin-refunds-export-pdf"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Refunds (PDF)</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, email, reason..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs font-medium text-slate-500">
          Showing {filteredRefunds.length} Refund Records
        </span>
      </div>

      {/* Refunds Table */}
      <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Learner / Claimant</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Refund Sum</th>
                <th className="p-3.5">Reason & Policy Clause</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5 text-right">Refund Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefunds.map((r) => {
                const isBusy = processingId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{r.userName}</div>
                      <div className="text-[11px] text-slate-500">{r.userEmail}</div>
                      <div className="text-[10px] font-mono text-slate-400">Tx: {r.paymentId}</div>
                    </td>
                    <td className="p-3.5 uppercase text-[10px] font-bold text-slate-600">
                      {r.type}
                    </td>
                    <td className="p-3.5 font-bold text-rose-800 font-serif text-sm">
                      ₹{r.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 max-w-xs text-slate-600">
                      <p className="line-clamp-2">{r.reason}</p>
                      <span className="text-[10px] text-slate-400">{new Date(r.requestedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'successful' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* "succesfull enable button click message send the seprate user notification" */}
                        {r.status !== 'successful' ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleEnableSuccessfulRefund(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isBusy ? 'Processing...' : 'Approve Refund & Notify'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">Refund Settled</span>
                        )}

                        {/* Working delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRefund(r.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Refund Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRefunds.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No active refund claims.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Refund Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 pb-2 border-b border-slate-200">
              Initiate Refund Settlement
            </h3>

            <form onSubmit={handleCreateRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Category</label>
                <div className="flex gap-4">
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="refundType"
                      checked={targetType === 'exam'}
                      onChange={() => setTargetType('exam')}
                    />
                    <span>Exam Register</span>
                  </label>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="refundType"
                      checked={targetType === 'subscription'}
                      onChange={() => setTargetType('subscription')}
                    />
                    <span>Subscription</span>
                  </label>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="refundType"
                      checked={targetType === 'course'}
                      onChange={() => setTargetType('course')}
                    />
                    <span>Course Fee</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="Candidate Student Name"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Email</label>
                  <input
                    type="email"
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate UPI ID / Mobile No</label>
                <input
                  type="text"
                  value={claimantUpi}
                  onChange={(e) => setClaimantUpi(e.target.value)}
                  placeholder="7358800371@upi or 7358800371"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Refund Amount (₹ INR)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Refund Reason & Notes</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {saving ? 'Recording...' : 'File Refund Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
