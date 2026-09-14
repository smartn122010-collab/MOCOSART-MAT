import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  Inbox, 
  CreditCard, 
  Award, 
  Users, 
  UserCheck, 
  Zap, 
  RefreshCw, 
  Bell, 
  Building2, 
  Menu, 
  X, 
  ArrowLeft, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  Smartphone,
  QrCode,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { 
  UserProfile, 
  Course, 
  Exam, 
  ExamRegistration, 
  PaymentRecord, 
  CertificateRecord, 
  RefundRecord, 
  Founder, 
  AppNotification, 
  SubscriptionPlan, 
  SubscriptionRecord, 
  CompanyInfo, 
  PolicyContent,
  PaymentMethod,
  StudentLearning,
  isUserAdmin,
  ADMIN_EMAIL 
} from '../../types';

import { AdminDashboard } from './AdminDashboard';
import { AdminCourseExplore } from './AdminCourseExplore';
import { AdminExamRegister } from './AdminExamRegister';
import { AdminExamReceive } from './AdminExamReceive';
import { AdminPaymentReceive } from './AdminPaymentReceive';
import { AdminPaymentMethods } from './AdminPaymentMethods';
import { AdminCertificateGen } from './AdminCertificateGen';
import { AdminFounders } from './AdminFounders';
import { AdminUserDetails } from './AdminUserDetails';
import { AdminSubscription } from './AdminSubscription';
import { AdminRefunds } from './AdminRefunds';
import { AdminNotifications } from './AdminNotifications';
import { AdminAboutPolicies } from './AdminAboutPolicies';
import { AdminGrowthManagement } from './AdminGrowthManagement';
import { AdminStudentLearning } from './AdminStudentLearning';

interface AdminPanelProps {
  currentUser: UserProfile;
  courses: Course[];
  exams: Exam[];
  registrations: ExamRegistration[];
  payments: PaymentRecord[];
  paymentMethods?: PaymentMethod[];
  certificates: CertificateRecord[];
  refunds: RefundRecord[];
  founders: Founder[];
  users: UserProfile[];
  notifications: AppNotification[];
  subscriptionPlans: SubscriptionPlan[];
  subscriptions: SubscriptionRecord[];
  studentLearnings?: StudentLearning[];
  companyInfo: CompanyInfo;
  policies: {
    terms: PolicyContent;
    privacy: PolicyContent;
    refund: PolicyContent;
  };
  onCloseAdmin: () => void;
  onRefreshData: () => void;
  onSignOut: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  courses,
  exams,
  registrations,
  payments,
  paymentMethods = [],
  certificates,
  refunds,
  founders,
  users,
  notifications,
  subscriptionPlans,
  subscriptions,
  studentLearnings = [],
  companyInfo,
  policies,
  onCloseAdmin,
  onRefreshData,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Strict check: only smartnp09812@gmail.com
  if (!isUserAdmin(currentUser.email)) {
    return (
      <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-2xl glass-panel text-center space-y-4 shadow-xl border border-red-200">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Access</h2>
        <p className="text-sm text-slate-600">
          Only the authorized administrator account (<span className="font-mono font-semibold text-slate-900">{ADMIN_EMAIL}</span>) has permission to view and manage this admin panel.
        </p>
        <button
          onClick={onCloseAdmin}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 cursor-pointer"
        >
          Return to Learner Dashboard
        </button>
      </div>
    );
  }

  const pendingExamsCount = registrations.filter(r => !r.approved).length;
  const pendingRefundsCount = refunds.filter(r => r.status === 'pending').length;

  // Exact navigation bar items as required by prompt:
  // "Navigation bar- Dashboard, course explore, Exam register Recieve,Payment Recive, Certificate Genereated , Terms and Condition, Privacy policy, Refund Condition, Founders manegment, Users Detailed, Subscription Manegment."
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'growth', label: 'Growth Management', icon: TrendingUp },
    { id: 'student-learning', label: 'Student Learning', icon: GraduationCap },
    { id: 'courses', label: 'Course Explore', icon: BookOpen },
    { id: 'exams-config', label: 'Exam Register (Build)', icon: FileCheck },
    { id: 'exam-recv', label: 'Exam Register Recieve', icon: Inbox, badge: pendingExamsCount > 0 ? pendingExamsCount : undefined },
    { id: 'payments', label: 'Payment Recieve', icon: CreditCard },
    { id: 'payment-methods', label: 'Payment Gateway (UPI)', icon: Smartphone },
    { id: 'certificates', label: 'Certificate Generated', icon: Award },
    { id: 'founders', label: 'Founders Management', icon: UserCheck },
    { id: 'users', label: 'Users Detailed', icon: Users },
    { id: 'subs', label: 'Subscription Management', icon: Zap },
    { id: 'refunds', label: 'Refund Management', icon: RefreshCw, badge: pendingRefundsCount > 0 ? pendingRefundsCount : undefined },
    { id: 'notifications', label: 'Notifications Dispatch', icon: Bell },
    { id: 'policies', label: 'About Us & Policies', icon: Building2 }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
      {/* Top Bar for Admin */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-serif">Mocosart Administrative Console</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Signed in as {currentUser.displayName} ({currentUser.email})</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onCloseAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Learner View</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Mobile Toggle */}
        <div className="md:hidden w-full flex items-center justify-between p-3 rounded-xl glass-panel">
          <span className="font-serif font-bold text-sm text-slate-900">Admin Modules</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs flex items-center gap-1.5"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`w-full md:w-64 shrink-0 rounded-2xl glass-panel p-3 sm:p-4 border border-white/80 shadow-md space-y-2 ${
            sidebarOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Modules
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Admin Sub-Panel */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              courses={courses}
              exams={exams}
              registrations={registrations}
              payments={payments}
              certificates={certificates}
              refunds={refunds}
              founders={founders}
              users={users}
              subscriptions={subscriptions}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'growth' && (
            <AdminGrowthManagement
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'student-learning' && (
            <AdminStudentLearning
              studentLearnings={studentLearnings || []}
              users={users}
              courses={courses}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'courses' && (
            <AdminCourseExplore
              courses={courses}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'exams-config' && (
            <AdminExamRegister
              exams={exams}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'exam-recv' && (
            <AdminExamReceive
              registrations={registrations}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPaymentReceive
              payments={payments}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'payment-methods' && (
            <AdminPaymentMethods
              paymentMethods={paymentMethods}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'certificates' && (
            <AdminCertificateGen
              certificates={certificates}
              users={users}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'founders' && (
            <AdminFounders
              founders={founders}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'users' && (
            <AdminUserDetails
              users={users}
            />
          )}

          {activeTab === 'subs' && (
            <AdminSubscription
              plans={subscriptionPlans}
              subscriptions={subscriptions}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'refunds' && (
            <AdminRefunds
              refunds={refunds}
              payments={payments}
              users={users}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'notifications' && (
            <AdminNotifications
              notifications={notifications}
              users={users}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'policies' && (
            <AdminAboutPolicies
              companyInfo={companyInfo}
              policies={policies}
              onRefresh={onRefreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
