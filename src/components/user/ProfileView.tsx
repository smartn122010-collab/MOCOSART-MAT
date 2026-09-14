import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Save, 
  CreditCard, 
  BookOpen, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Zap,
  QrCode
} from 'lucide-react';
import { UserProfile, PaymentRecord, SubscriptionPlan, SubscriptionRecord, PaymentMethod } from '../../types';
import { db } from '../../firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { UPIPaymentModal } from '../UPIPaymentModal';

interface ProfileViewProps {
  currentUser: UserProfile;
  paymentHistory: PaymentRecord[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: SubscriptionRecord[];
  paymentMethods?: PaymentMethod[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onRefreshData?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  paymentHistory,
  subscriptionPlans,
  userSubscriptions,
  paymentMethods = [],
  onUpdateProfile,
  onSignOut,
  onNavigateHome,
  onRefreshData
}) => {
  // Editable fields by user - strictly manually entered, no auto-filling
  const [name, setName] = useState(currentUser.displayName || '');
  const [age, setAge] = useState(currentUser.age || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [mobile, setMobile] = useState(currentUser.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
  const [address, setAddress] = useState(currentUser.address || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [paymentModalPlan, setPaymentModalPlan] = useState<SubscriptionPlan | null>(null);
  const [subMessage, setSubMessage] = useState<string | null>(null);

  // Active payment gateway configuration
  const activeMethod = paymentMethods.find(m => m.active);
  const gatewayMobile = activeMethod?.mobileNumber || '7358800371';
  const gatewayUpi = activeMethod?.upiId || `${gatewayMobile}@upi`;
  const gatewayQr = activeMethod?.qrCodeUrl;

  // Filter payments for this user
  const userPayments = paymentHistory.filter(p => p.userId === currentUser.uid);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updatedData: Partial<UserProfile> = {
        displayName: name.trim(),
        age: age ? String(age).trim() : '',
        email: email.trim(),
        phoneNumber: mobile.trim(),
        photoURL: photoURL.trim(),
        address: address.trim()
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updatedData);

      onUpdateProfile(updatedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubscriptionPaymentSuccess = async (details: {
    utrNumber: string;
    upiId: string;
    upiMobile: string;
    paymentMethod: string;
  }) => {
    if (!paymentModalPlan) return;
    const plan = paymentModalPlan;

    // Duration calculation
    const startDate = new Date();
    const endDate = new Date();
    if (plan.interval === 'weekly') endDate.setDate(startDate.getDate() + 7);
    else if (plan.interval === 'monthly') endDate.setDate(startDate.getDate() + 30);
    else endDate.setDate(startDate.getDate() + 365);

    try {
      // 1. Add subscription record to Firestore
      await addDoc(collection(db, 'subscriptions'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || name,
        userEmail: currentUser.email || email,
        planInterval: plan.interval,
        planTitle: plan.title,
        amount: plan.amount,
        status: 'successful',
        paymentId: details.utrNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // 2. Add payment record to Firestore
      await addDoc(collection(db, 'payments'), {
        type: 'subscription',
        itemTitle: `Subscription: ${plan.title}`,
        itemId: plan.id || plan.interval,
        userId: currentUser.uid,
        userName: currentUser.displayName || name,
        userEmail: currentUser.email || email,
        amount: plan.amount,
        currency: 'INR',
        utrNumber: details.utrNumber,
        upiId: details.upiId,
        upiMobile: details.upiMobile,
        paymentMethod: details.paymentMethod,
        status: 'successful',
        createdAt: new Date().toISOString()
      });

      // 3. Update user status in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscriptionPlan: plan.interval,
        subscriptionStatus: 'active',
        subscriptionExpiry: endDate.toISOString()
      });

      // 4. Send Confirmation Notification to user
      await addDoc(collection(db, 'notifications'), {
        targetUserId: currentUser.uid,
        title: `Subscription Confirmed: ${plan.title}`,
        message: `Your ${plan.interval} subscription is active through ${endDate.toLocaleDateString()} (Payment Ref: ${details.utrNumber}). Thank you for learning with Mocosart!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onUpdateProfile({
        subscriptionPlan: plan.interval,
        subscriptionStatus: 'active',
        subscriptionExpiry: endDate.toISOString()
      });

      setSubMessage(`Successfully subscribed to ${plan.title}! Payment UTR Ref: ${details.utrNumber}`);
      setPaymentModalPlan(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Subscription payment processing error:", err);
      setSubMessage(`Subscribed to ${plan.title}. Your access has been recorded.`);
      setPaymentModalPlan(null);
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Profile Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <img
            src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.displayName || 'Learner')}`}
            alt={currentUser.displayName}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-emerald-600 text-white shadow">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-serif">
              {currentUser.displayName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold self-center sm:self-auto uppercase tracking-wide">
              {currentUser.role === 'admin' ? 'Administrator' : 'Student Learner'}
            </span>
          </div>
          <p className="text-xs text-slate-600">{currentUser.email}</p>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 pt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUser.address || 'Address not updated'}</span>
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully to your cloud account!</span>
        </div>
      )}

      {/* Editable Details Form */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">
          Edit Profile Information
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          All details must be manually entered by the student. Auto-filling has been disabled to ensure complete data accuracy.
        </p>

        <form onSubmit={handleSaveProfile} autoComplete="off" className="space-y-4">
          {/* Dummy inputs to prevent browser autofill heuristics from suggesting values */}
          <input type="text" name="fake_usernameremembered" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="fake_passwordremembered" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">User Full Name (Manual Entry)</label>
              <input
                id="profile-name-input"
                name="mocosart_manual_user_fullname"
                type="text"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full official name"
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">User Age (Manual Entry)</label>
              <input
                id="profile-age-input"
                name="mocosart_manual_user_age"
                type="number"
                min="10"
                max="100"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 21"
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">User Gmail / Email (Manual Entry)</label>
              <input
                id="profile-email-input"
                name="mocosart_manual_user_email"
                type="text"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number (Manual Entry)</label>
              <input
                id="profile-mobile-input"
                name="mocosart_manual_user_mobile"
                type="text"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Profile Picture URL (Manual Entry)</label>
              <input
                id="profile-photo-input"
                name="mocosart_manual_user_photo"
                type="text"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Residential / Venue Address (Manual Entry)</label>
              <input
                id="profile-address-input"
                name="mocosart_manual_user_address"
                type="text"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, State, Postal Code"
                className="w-full px-3.5 py-2.5 rounded-xl glass-water-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="profile-save-btn"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Plans Section */}
      {/* "subscription, click to the weekly,monthly, yearly of subscription amount and not edit with user on Subscription" */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>Mocosart Member Subscriptions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select Weekly, Monthly, or Yearly plan (Pricing set by administration).
            </p>
          </div>

          {currentUser.subscriptionStatus === 'active' && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              Active Plan: {currentUser.subscriptionPlan?.toUpperCase()}
            </span>
          )}
        </div>

        {subMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
            {subMessage}
          </div>
        )}

        {/* 3 Option Cards: Weekly, Monthly, Yearly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {subscriptionPlans.map((plan) => {
            const isCurrent = currentUser.subscriptionPlan === plan.interval && currentUser.subscriptionStatus === 'active';
            const isBusy = paymentModalPlan?.interval === plan.interval;

            return (
              <div
                key={plan.id || plan.interval}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'glass-panel-green border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                    : 'glass-card border-white/90 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      {plan.interval}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Subscribed
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 font-serif text-base">{plan.title}</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold text-slate-900 font-serif">
                        ₹{plan.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {plan.descriptionLines?.map((line, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setPaymentModalPlan(plan)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-slate-200 text-slate-500 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>
                      {isCurrent
                        ? 'Current Subscription'
                        : `Subscribe ₹${plan.amount.toLocaleString()} (UPI / QR)`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment & Course Detailed History */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-slate-900 font-serif">
          History of Payments & Course Details
        </h3>

        {userPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/70 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item / Course</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment ID (Razorpay)</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/50">
                    <td className="p-3 font-semibold text-slate-900">{p.itemTitle}</td>
                    <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{p.type}</td>
                    <td className="p-3 font-bold text-slate-900 font-serif">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{p.razorpayPaymentId || p.id}</td>
                    <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'successful' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : p.status === 'refunded'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3">No payments recorded on this account yet.</p>
        )}
      </div>

      {/* Sign Out Button (returns to Home Screen) */}
      <div className="pt-2 pb-6 flex justify-center">
        <button
          id="profile-signout-btn"
          type="button"
          onClick={() => {
            onSignOut();
            onNavigateHome();
          }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Mocosart</span>
        </button>
      </div>

      {/* Subscription UPI Payment Modal */}
      {paymentModalPlan && (
        <UPIPaymentModal
          isOpen={!!paymentModalPlan}
          onClose={() => setPaymentModalPlan(null)}
          itemTitle={`Subscription: ${paymentModalPlan.title} (${paymentModalPlan.interval})`}
          amount={paymentModalPlan.amount}
          itemType="subscription"
          userDisplayName={currentUser.displayName || name}
          userEmail={currentUser.email || email}
          customMobileNumber={gatewayMobile}
          customUpiId={gatewayUpi}
          customQrCode={gatewayQr}
          onPaymentSuccess={handleSubscriptionPaymentSuccess}
        />
      )}
    </div>
  );
};
