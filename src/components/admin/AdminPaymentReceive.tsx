import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  BellRing,
  ShieldCheck,
  RefreshCcw,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { PaymentRecord } from '../../types';
import { db } from '../../firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminPaymentReceiveProps {
  payments: PaymentRecord[];
  onRefresh: () => void;
}

export const AdminPaymentReceive: React.FC<AdminPaymentReceiveProps> = ({
  payments,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingUpiId, setEditingUpiId] = useState<string>('');

  const filteredPayments = payments.filter((p) => {
    const matchesText = 
      p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.upiId && p.upiId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.utrNumber && p.utrNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesText) return false;
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  // "Just Successful Payement enable button send on notification on user on seprated user"
  const handleConfirmSuccessfulPayment = async (p: PaymentRecord) => {
    setConfirmingId(p.id);
    try {
      // 1. Update payment status
      await updateDoc(doc(db, 'payments', p.id), {
        status: 'successful'
      });

      // 2. Dispatch individual user notification
      await addDoc(collection(db, 'notifications'), {
        targetUserId: p.userId,
        title: `Payment Receipt: ₹${p.amount.toLocaleString()} Confirmed`,
        message: `Your payment of ₹${p.amount.toLocaleString()} for ${p.itemTitle} (UPI Ref: ${p.utrNumber || p.upiId || '7358800371@upi'}) has been verified. Welcome to Mocosart!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onRefresh();
    } catch (err) {
      console.error("Failed to confirm payment:", err);
      onRefresh();
    } finally {
      setConfirmingId(null);
    }
  };

  // Alter / Save UPI ID
  const handleSaveUpiId = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        upiId: editingUpiId,
        utrNumber: editingUpiId
      });
      setEditingPaymentId(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to update UPI ID:", err);
    }
  };

  // Delete payment record directly
  const handleDeletePayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'payments', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete payment:", err);
      onRefresh();
    }
  };

  // "download the all the user details on PDF"
  const handleDownloadPDF = () => {
    const headers = ['User Name', 'Email', 'Payment Item', 'Type', 'Amount (INR)', 'UPI ID / UTR', 'Status', 'Date'];
    const rows = filteredPayments.map(p => [
      p.userName,
      p.userEmail,
      p.itemTitle,
      p.type.toUpperCase(),
      `INR ${p.amount}`,
      p.utrNumber || p.upiId || '7358800371@upi',
      p.status.toUpperCase(),
      new Date(p.createdAt).toLocaleDateString()
    ]);

    exportTableToPDF('Mocosart - Financial Payment Receipts Ledger', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Payment Receive & Financial Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Reconcile UPI & Mobile (7358800371) transactions across course enrollments, examination registrations, and subscriptions.
          </p>
        </div>

        <button
          id="admin-payment-export-pdf"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download All Payments (PDF)</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by payer, email, item, UPI ID / UTR..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          {['all', 'course', 'exam', 'subscription'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                filterType === t 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Learner & Account</th>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">UPI ID / UTR No</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const isBusy = confirmingId === p.id;
                const isEditing = editingPaymentId === p.id;
                const upiDisplay = p.utrNumber || p.upiId || '7358800371@upi';

                return (
                  <tr key={p.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{p.userName}</div>
                      <div className="text-[11px] text-slate-500">{p.userEmail}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      <div>{p.itemTitle}</div>
                      <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-3.5 uppercase text-[10px] font-bold text-slate-500">
                      {p.type}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800 font-serif text-sm">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingUpiId}
                            onChange={(e) => setEditingUpiId(e.target.value)}
                            placeholder="Enter UPI ID / UTR"
                            className="px-2 py-1 rounded-lg border border-emerald-400 font-mono text-xs w-36"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveUpiId(p.id)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Save UPI ID"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPaymentId(null)}
                            className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono text-slate-700 text-[11px]">
                          <span>{upiDisplay}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaymentId(p.id);
                              setEditingUpiId(upiDisplay);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                            title="Alter UPI ID"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'successful'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'refunded'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status === 'successful' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Successful Payment Enable Button: sends notification to separated user */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleConfirmSuccessfulPayment(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          title="Reconcile and send receipt notification to student"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Notifying...' : 'Reconcile & Notify'}</span>
                        </button>

                        {/* Delete Payment Record */}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No payment records found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
