import React from 'react';
import { 
  BookOpen, 
  FileCheck, 
  CreditCard, 
  Award, 
  RefreshCw, 
  Users, 
  UserCheck, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  Course, 
  Exam, 
  ExamRegistration, 
  PaymentRecord, 
  CertificateRecord, 
  RefundRecord, 
  Founder, 
  UserProfile, 
  SubscriptionRecord 
} from '../../types';

interface AdminDashboardProps {
  courses: Course[];
  exams: Exam[];
  registrations: ExamRegistration[];
  payments: PaymentRecord[];
  certificates: CertificateRecord[];
  refunds: RefundRecord[];
  founders: Founder[];
  users: UserProfile[];
  subscriptions: SubscriptionRecord[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  registrations,
  payments,
  certificates,
  refunds,
  founders,
  users,
  subscriptions,
  onNavigateTab
}) => {
  // Exact metric counts required by prompt:
  // 1. how many add course
  const addCourseCount = courses.length;
  // 2. how many Exam Register Recieve
  const examRegisterReceiveCount = registrations.length;
  // 3. How many Payment recieve
  const paymentReceiveCount = payments.filter(p => p.status === 'successful').length;
  // 4. how many certificate share on USers
  const certificateSharedCount = certificates.length;
  // 5. How many Refund Money
  const refundMoneyTotal = refunds
    .filter(r => r.status === 'successful')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const refundCount = refunds.length;
  // 6. How many Founders
  const foundersCount = founders.length;
  // 7. How many Users
  const usersCount = users.length;
  // 8. How many Users Subscription payment
  const userSubscriptionPaymentCount = subscriptions.filter(s => s.status === 'successful').length;
  // 9. How many user Subscription Refund
  const userSubscriptionRefundCount = refunds.filter(r => r.type === 'subscription' && r.status === 'successful').length;

  const statCards = [
    {
      id: 'courses',
      title: 'Added Courses',
      count: addCourseCount,
      sub: 'Active curriculum tracks',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-800',
      tab: 'courses'
    },
    {
      id: 'exam-recv',
      title: 'Exam Register Recieve',
      count: examRegisterReceiveCount,
      sub: 'Applications submitted',
      icon: FileCheck,
      color: 'bg-teal-100 text-teal-800',
      tab: 'exam-recv'
    },
    {
      id: 'payment-recv',
      title: 'Payment Recieve',
      count: paymentReceiveCount,
      sub: 'Successful transactions',
      icon: CreditCard,
      color: 'bg-emerald-100 text-emerald-800',
      tab: 'payments'
    },
    {
      id: 'certs',
      title: 'Certificates Shared',
      count: certificateSharedCount,
      sub: 'Accreditations issued',
      icon: Award,
      color: 'bg-indigo-100 text-indigo-800',
      tab: 'certificates'
    },
    {
      id: 'refunds',
      title: 'Refund Money Total',
      count: `₹${refundMoneyTotal.toLocaleString()}`,
      sub: `${refundCount} claims processed`,
      icon: RefreshCw,
      color: 'bg-amber-100 text-amber-800',
      tab: 'refunds'
    },
    {
      id: 'founders',
      title: 'Active Founders',
      count: foundersCount,
      sub: 'Directorate members',
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-800',
      tab: 'founders'
    },
    {
      id: 'users',
      title: 'Total Users Enrolled',
      count: usersCount,
      sub: 'Learners & administrators',
      icon: Users,
      color: 'bg-purple-100 text-purple-800',
      tab: 'users'
    },
    {
      id: 'subs-pay',
      title: 'Subscription Payments',
      count: userSubscriptionPaymentCount,
      sub: 'Active recurring members',
      icon: Zap,
      color: 'bg-emerald-100 text-emerald-800',
      tab: 'subs'
    },
    {
      id: 'subs-ref',
      title: 'Subscription Refunds',
      count: userSubscriptionRefundCount,
      sub: 'Terminated plans resolved',
      icon: RefreshCw,
      color: 'bg-rose-100 text-rose-800',
      tab: 'refunds'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Executive Control Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Mocosart Administration Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time management for course curricula, examinations, revenue receipts, and student certifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
            Live Sync: Active
          </span>
        </div>
      </div>

      {/* Grid of the 9 requested metric containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigateTab(card.tab)}
              className="rounded-2xl glass-card border border-white/90 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {card.title}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif block group-hover:text-emerald-700 transition-colors">
                    {card.count}
                  </span>
                  <p className="text-[11px] text-slate-500">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl ${card.color} shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span>Manage Section</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
