import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Download, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  BellRing
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionRecord } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminSubscriptionProps {
  plans: SubscriptionPlan[];
  subscriptions: SubscriptionRecord[];
  onRefresh: () => void;
}

export const AdminSubscription: React.FC<AdminSubscriptionProps> = ({
  plans,
  subscriptions,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'management'>('plans');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [interval, setInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState<number>(1999);
  const [descriptionLinesText, setDescriptionLinesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingSubId, setConfirmingSubId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingPlan(null);
    setTitle('Full Access Master Pass');
    setInterval('monthly');
    setAmount(1999);
    setDescriptionLinesText('All Course Access\nWeekly Live Google Meet Mentorship\nDirect Examination Certification Pass\nPriority Academic Advisory');
    setShowModal(true);
  };

  const openEditModal = (p: SubscriptionPlan) => {
    setEditingPlan(p);
    setTitle(p.title);
    setInterval(p.interval);
    setAmount(p.amount);
    setDescriptionLinesText(p.descriptionLines ? p.descriptionLines.join('\n') : '');
    setShowModal(true);
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a plan title.");
      return;
    }
    setSaving(true);

    try {
      const planData = {
        title: title.trim(),
        interval,
        amount: Math.max(0, Number(amount) || 0),
        descriptionLines: descriptionLinesText.split('\n').map(l => l.trim()).filter(l => l.length > 0),
        features: descriptionLinesText.split('\n').map(l => l.trim()).filter(l => l.length > 0),
        active: true,
        createdAt: editingPlan?.createdAt || new Date().toISOString()
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'subscription_plans', editingPlan.id), planData);
      } else {
        await addDoc(collection(db, 'subscription_plans'), planData);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save plan:", err);
      alert(`Failed to save subscription plan: ${err?.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string, planTitle: string) => {
    try {
      await deleteDoc(doc(db, 'subscription_plans', id));
    } catch (err) {
      console.warn("Firestore delete notice (id may be fallback):", err);
    }
    onRefresh();
  };

  const handleDeleteSubscriptionRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
    onRefresh();
  };

  // "Subscription management - user pay the subscriotion- succesfull click the tick button message send the seprate user notification . so details for download the all the user details on PDF."
  const handleTickSuccessfulSub = async (sub: SubscriptionRecord) => {
    setConfirmingSubId(sub.id);
    try {
      // 1. Update sub status
      await updateDoc(doc(db, 'subscriptions', sub.id), {
        status: 'successful'
      });

      // 2. Send notification to separate user
      await addDoc(collection(db, 'notifications'), {
        targetUserId: sub.userId,
        title: `Subscription Active: ${sub.planTitle}`,
        message: `Your ${sub.planInterval} subscription of ₹${sub.amount.toLocaleString()} is officially verified and renewed through ${new Date(sub.endDate).toLocaleDateString()}. Enjoy unlimited access!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onRefresh();
    } catch (err) {
      console.error("Failed to tick subscription:", err);
      alert("Could not update subscription.");
    } finally {
      setConfirmingSubId(null);
    }
  };

  const handleDownloadPDF = () => {
    const headers = ['Learner Name', 'User Email', 'Plan Title', 'Interval', 'Amount', 'Payment ID', 'Status', 'Expiry Date'];
    const rows = subscriptions.map(s => [
      s.userName,
      s.userEmail,
      s.planTitle,
      s.planInterval.toUpperCase(),
      `INR ${s.amount}`,
      s.paymentId || 'N/A',
      s.status.toUpperCase(),
      new Date(s.endDate).toLocaleDateString()
    ]);

    exportTableToPDF('Mocosart - User Subscription Submissions & Revenue Dossier', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Subscription Pricing & User Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure recurring tiers (Weekly, Monthly, Yearly) and reconcile subscriber entitlements.
          </p>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'plans' ? (
            <button
              id="admin-add-sub-plan-btn"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscription Plan</span>
            </button>
          ) : (
            <button
              id="admin-subs-export-pdf"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download All Subscriptions (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'plans'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Subscription Plans Configuration
        </button>
        <button
          onClick={() => setActiveSubTab('management')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'management'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Subscription Management ({subscriptions.length} Users)
        </button>
      </div>

      {/* Sub-view 1: Plans Configuration */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id || plan.interval}
              className="rounded-2xl glass-card border border-white/90 p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    {plan.interval}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 font-serif">
                    ₹{plan.amount.toLocaleString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 font-serif text-lg">
                  {plan.title}
                </h3>

                <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {plan.descriptionLines?.map((line, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan.id, plan.title)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-view 2: Subscription Management & User Notification */}
      {activeSubTab === 'management' && (
        <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Subscriber Profile</th>
                  <th className="p-3.5">Plan Title & Frequency</th>
                  <th className="p-3.5">Subscription Fee</th>
                  <th className="p-3.5">Gateway Reference</th>
                  <th className="p-3.5">Active Expiry</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Confirm Tick</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((s) => {
                  const isBusy = confirmingSubId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-white/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{s.userName}</div>
                        <div className="text-[11px] text-slate-500">{s.userEmail}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{s.planTitle}</div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          {s.planInterval}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800 font-serif">
                        ₹{s.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                        {s.paymentId || 'Verified'}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(s.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* "succesfull click the tick button message send the seprate user notification" */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleTickSuccessfulSub(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            title="Confirm active subscription and notify user"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isBusy ? 'Notifying...' : 'Tick & Notify'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriptionRecord(s.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Delete Subscription Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No user subscriptions on record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingPlan ? 'Edit Subscription Plan' : 'Add Subscription Tier'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Plan Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pro Learner Pass"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Option show for Weekly, Monthly, Yearly */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Billing Interval</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Plan Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description Lines (One benefit per line)
                </label>
                <textarea
                  rows={4}
                  value={descriptionLinesText}
                  onChange={(e) => setDescriptionLinesText(e.target.value)}
                  placeholder="Unlimited Course Access&#10;Google Meet Weekly Live Calls&#10;Verified Certificates&#10;Priority 24/7 Mentorship"
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800 font-mono"
                  required
                />
              </div>

              {/* Save & Publish */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-plan-btn"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
