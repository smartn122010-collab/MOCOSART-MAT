import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  FileCheck, 
  Award, 
  Bell, 
  User, 
  Menu, 
  X, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  GraduationCap,
  Calendar,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  UserProfile, 
  Course, 
  Exam, 
  ExamRegistration, 
  PaymentRecord, 
  CertificateRecord, 
  AppNotification, 
  SubscriptionPlan, 
  SubscriptionRecord,
  PaymentMethod,
  GrowthMetric,
  isUserAdmin 
} from '../../types';
import { SearchCourseView } from './SearchCourseView';
import { CourseExploreView } from './CourseExploreView';
import { ExamRegisterView } from './ExamRegisterView';
import { CertificateView } from './CertificateView';
import { NotificationView } from './NotificationView';
import { ProfileView } from './ProfileView';

interface UserDashboardProps {
  currentUser: UserProfile;
  courses: Course[];
  exams: Exam[];
  registrations: ExamRegistration[];
  payments: PaymentRecord[];
  certificates: CertificateRecord[];
  notifications: AppNotification[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: SubscriptionRecord[];
  paymentMethods?: PaymentMethod[];
  growthMetrics?: GrowthMetric[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onOpenAdminPanel?: () => void;
  onRefreshData: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  courses,
  exams,
  registrations,
  payments,
  certificates,
  notifications,
  subscriptionPlans,
  userSubscriptions,
  paymentMethods = [],
  growthMetrics = [],
  onUpdateProfile,
  onSignOut,
  onNavigateHome,
  onOpenAdminPanel,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'explore' | 'exams' | 'certificates' | 'notifications' | 'profile'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourseFromSearch, setSelectedCourseFromSearch] = useState<Course | null>(null);

  // Derived metrics
  const completedExamsCount = registrations.filter(r => r.status === 'completed').length;
  const pendingCoursesCount = Math.max(0, payments.filter(p => p.type === 'course').length - completedExamsCount);
  const examRegisterCount = registrations.length;
  const userCertificatesCount = certificates.filter(c => c.userId === currentUser.uid).length;
  const unreadNotificationsCount = notifications.filter(
    n => (n.targetUserId === 'all' || n.targetUserId === currentUser.uid) && (!n.readBy || !n.readBy.includes(currentUser.uid))
  ).length;

  const enrolledCourseIds = payments
    .filter(p => p.type === 'course' && p.userId === currentUser.uid && p.status === 'successful')
    .map(p => p.itemId);

  const handleSelectCourseFromSearch = (course: Course) => {
    setSelectedCourseFromSearch(course);
    setActiveTab('explore');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search Course', icon: Search },
    { id: 'explore', label: 'Course Explore', icon: BookOpen },
    { id: 'exams', label: 'Exam Register', icon: FileCheck },
    { id: 'certificates', label: 'Certificate', icon: Award, badge: userCertificatesCount > 0 ? userCertificatesCount : undefined },
    { id: 'notifications', label: 'Notification', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden w-full flex items-center justify-between p-3 rounded-xl glass-panel">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span className="font-serif font-bold text-sm text-slate-900">Learner Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs flex items-center gap-1.5"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>

        {/* Navigation Bar on Side Left */}
        <aside
          className={`w-full md:w-64 shrink-0 rounded-2xl glass-panel p-4 border border-white/80 shadow-md space-y-6 ${
            sidebarOpen ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Top User Profile Summary */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/70">
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.displayName || 'Learner')}`}
              alt=""
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/20"
            />
            <div className="overflow-hidden">
              <span className="font-serif font-bold text-slate-900 text-sm block truncate">
                {currentUser.displayName}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium block capitalize">
                {currentUser.role === 'admin' ? 'Administrator' : 'Verified Learner'}
              </span>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`user-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                      : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Switcher & Sign Out */}
          <div className="pt-4 border-t border-slate-200/70 space-y-2">
            {isUserAdmin(currentUser.email) && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Switch to Admin Panel</span>
              </button>
            )}

            <button
              onClick={() => {
                onSignOut();
                onNavigateHome();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content View Area */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top of left side padding on Welcome, login user name */}
              <div 
                id="user-dashboard-welcome-header"
                className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/80 shadow-md relative overflow-hidden"
              >
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mocosart Learner Hub</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
                    Welcome, {currentUser.displayName}!
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Track your registered courses, exam completions, verified certifications, and career progress metrics in real-time.
                  </p>
                </div>
              </div>

              {/* Under welcome instruction containers show for:
                  course completed , and course Pending, how many exam register , how many certificated and growth with users */}
              <div 
                id="user-dashboard-stat-containers" 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Container 1: Course Completed */}
                <div className="rounded-2xl glass-panel p-5 border border-white/90 shadow-sm flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Course Completed
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif block mt-0.5">
                      {completedExamsCount}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Verified passed modules</span>
                  </div>
                </div>

                {/* Container 2: Course Pending */}
                <div className="rounded-2xl glass-panel p-5 border border-white/90 shadow-sm flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Course Pending
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif block mt-0.5">
                      {pendingCoursesCount}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">Ongoing live sessions</span>
                  </div>
                </div>

                {/* Container 3: How many Exam Register */}
                <div className="rounded-2xl glass-panel p-5 border border-white/90 shadow-sm flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Exam Register
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif block mt-0.5">
                      {examRegisterCount}
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium">Accredited applications</span>
                  </div>
                </div>

                {/* Container 4: How many Certificated */}
                <div className="rounded-2xl glass-panel p-5 border border-white/90 shadow-sm flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Certificated
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif block mt-0.5">
                      {userCertificatesCount}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-medium">Signed diplomas issued</span>
                  </div>
                </div>
              </div>

              {/* Growth with Users Container (Configured via Admin Growth Management) */}
              <div 
                id="user-dashboard-growth-container"
                className="rounded-2xl glass-water-card p-6 sm:p-8 border border-white/80 shadow-md space-y-5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                        Growth with Users & Learning Milestones
                      </h3>
                      <p className="text-xs text-slate-500">
                        Institutional growth metrics and curriculum level mastery monitored by administration
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                    Official Institutional Metrics
                  </span>
                </div>

                {/* 3 Core Growth Metrics: Student Learning+, Verified Certificate, Percentage Course Level */}
                {(() => {
                  const learningStat = growthMetrics.find(m => m.category === 'learning' || m.id.includes('learning')) || {
                    title: 'Student Learning+',
                    value: '1,500+',
                    subtitle: 'Active certified learners enrolled in continuous career modules'
                  };
                  const certificateStat = growthMetrics.find(m => m.category === 'certificate' || m.id.includes('certificate')) || {
                    title: 'Verified Certificates',
                    value: '890+',
                    subtitle: 'Digitally verified credentials issued with QR authentication'
                  };
                  const percentageStat = growthMetrics.find(m => m.category === 'percentage' || m.id.includes('percentage') || m.id.includes('level')) || {
                    title: 'Percentage Course Level',
                    value: '96.4%',
                    subtitle: 'Overall cohort assessment mastery and practical exam pass rate',
                    courseLevelStats: { beginner: 98, intermediate: 95, advanced: 92, master: 89 }
                  };

                  return (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-white/75 border border-emerald-100 shadow-sm text-center">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {learningStat.title}
                          </span>
                          <span className="text-2xl font-extrabold text-emerald-800 font-serif block mt-1">
                            {learningStat.value}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{learningStat.subtitle}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/75 border border-teal-100 shadow-sm text-center">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {certificateStat.title}
                          </span>
                          <span className="text-2xl font-extrabold text-teal-800 font-serif block mt-1">
                            {certificateStat.value}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{certificateStat.subtitle}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/75 border border-indigo-100 shadow-sm text-center">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {percentageStat.title}
                          </span>
                          <span className="text-2xl font-extrabold text-indigo-800 font-serif block mt-1">
                            {percentageStat.value}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{percentageStat.subtitle}</p>
                        </div>
                      </div>

                      {/* Course Level Percentage Breakdown */}
                      {percentageStat.courseLevelStats && (
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                          <span className="text-xs font-bold text-slate-800 block">
                            Percentage by Course Level:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block text-[10px] uppercase">Beginner</span>
                              <span className="font-bold text-slate-900">{percentageStat.courseLevelStats.beginner}%</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block text-[10px] uppercase">Intermediate</span>
                              <span className="font-bold text-slate-900">{percentageStat.courseLevelStats.intermediate}%</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block text-[10px] uppercase">Advanced</span>
                              <span className="font-bold text-slate-900">{percentageStat.courseLevelStats.advanced}%</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block text-[10px] uppercase">Master</span>
                              <span className="font-bold text-slate-900">{percentageStat.courseLevelStats.master}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Quick Shortcuts */}
                <div className="pt-4 border-t border-slate-200/70 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search New Course</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Register Certification Exam</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View My Certificates</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <SearchCourseView
              courses={courses}
              onSelectCourse={handleSelectCourseFromSearch}
            />
          )}

          {activeTab === 'explore' && (
            <CourseExploreView
              courses={courses}
              currentUser={currentUser}
              enrolledCourseIds={enrolledCourseIds}
              selectedCourseFromSearch={selectedCourseFromSearch}
              onClearSelectedCourse={() => setSelectedCourseFromSearch(null)}
              paymentMethods={paymentMethods}
              onEnrollmentSuccess={() => {
                onRefreshData();
              }}
            />
          )}

          {activeTab === 'exams' && (
            <ExamRegisterView
              exams={exams}
              currentUser={currentUser}
              registrations={registrations.filter(r => r.userId === currentUser.uid)}
              paymentMethods={paymentMethods}
              onRegistrationUpdate={onRefreshData}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificateView
              certificates={certificates.filter(c => c.userId === currentUser.uid)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationView
              notifications={notifications}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              paymentHistory={payments}
              subscriptionPlans={subscriptionPlans}
              userSubscriptions={userSubscriptions}
              paymentMethods={paymentMethods}
              onUpdateProfile={onUpdateProfile}
              onSignOut={onSignOut}
              onNavigateHome={onNavigateHome}
              onRefreshData={onRefreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
