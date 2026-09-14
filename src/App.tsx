import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, seedInitialFirestoreData, DEFAULT_COMPANY_INFO, DEFAULT_FOUNDERS, DEFAULT_COURSES, DEFAULT_EXAMS, DEFAULT_SUBSCRIPTION_PLANS } from './firebase';

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
  GrowthMetric,
  DEFAULT_GROWTH_METRICS,
  StudentLearning,
  isUserAdmin,
  ADMIN_EMAIL
} from './types';

// Components
import { SplashCard } from './components/SplashCard';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { AboutUsModal } from './components/AboutUsModal';
import { PolicyModal } from './components/PolicyModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { AITechBackground } from './components/AITechBackground';

export default function App() {
  // Splash Card state - shown when website opens
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Auth & View state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'admin'>('home');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [policyModalType, setPolicyModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Application Data States (synced with Firestore)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [founders, setFounders] = useState<Founder[]>(
    DEFAULT_FOUNDERS.map((f, i) => ({ ...f, id: `founder-${i + 1}` }))
  );
  const [courses, setCourses] = useState<Course[]>(
    DEFAULT_COURSES.map((c, i) => ({ ...c, id: `course-${i + 1}` }))
  );
  const [exams, setExams] = useState<Exam[]>(
    DEFAULT_EXAMS.map((e, i) => ({ ...e, id: `exam-${i + 1}` }))
  );
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(
    DEFAULT_SUBSCRIPTION_PLANS.map((s, i) => ({ ...s, id: `plan-${i + 1}` }))
  );

  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [studentLearnings, setStudentLearnings] = useState<StudentLearning[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>(() => {
    try {
      const cached = localStorage.getItem('mocosart_growth_metrics_cache');
      return cached ? JSON.parse(cached) : DEFAULT_GROWTH_METRICS;
    } catch {
      return DEFAULT_GROWTH_METRICS;
    }
  });

  // Policies text format
  const [policies, setPolicies] = useState<{
    terms: PolicyContent;
    privacy: PolicyContent;
    refund: PolicyContent;
  }>({
    terms: {
      title: 'Terms of Service & Academic Regulations',
      content: DEFAULT_COMPANY_INFO.termsAndConditions || '',
      updatedAt: new Date().toISOString()
    },
    privacy: {
      title: 'Privacy Policy & Student Data Protection',
      content: DEFAULT_COMPANY_INFO.privacyPolicy || '',
      updatedAt: new Date().toISOString()
    },
    refund: {
      title: 'Refund Policy & Cancellation Terms',
      content: DEFAULT_COMPANY_INFO.refundPolicy || '',
      updatedAt: new Date().toISOString()
    }
  });

  // 1. Initial Seeding and Auth Listener
  useEffect(() => {
    // Seed initial collections if database is fresh
    seedInitialFirestoreData();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isSuperAdmin = isUserAdmin(firebaseUser.email);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // Strict role verification: only smartnp09812@gmail.com can have admin role
            const targetRole: 'admin' | 'user' = isSuperAdmin ? 'admin' : 'user';
            if (data.role !== targetRole) {
              await updateDoc(userDocRef, { role: targetRole });
              data.role = targetRole;
            }
            setCurrentUser(data);
          } else {
            // Strict admin assignment: ONLY smartnp09812@gmail.com
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              phoneNumber: '',
              age: '',
              address: '',
              role: isSuperAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              subscriptionPlan: 'none',
              subscriptionStatus: 'expired'
            };

            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn("Failed to load user document, using auth profile fallback:", err);
          const isSuperAdmin = isUserAdmin(firebaseUser.email);
          setCurrentUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Learner',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: isSuperAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Subscriptions
  useEffect(() => {
    // Company Info listener
    const unsubCompany = onSnapshot(doc(db, 'settings', 'companyInfo'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyInfo;
        setCompanyInfo(prev => ({ ...prev, ...data }));
      }
    }, (err) => console.warn("Company info stream notice:", err));

    // Founders listener
    const unsubFounders = onSnapshot(collection(db, 'founders'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Founder));
      setFounders(items);
    }, (err) => console.warn("Founders stream notice:", err));

    // Courses listener
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
      setCourses(items);
    }, (err) => console.warn("Courses stream notice:", err));

    // Exams listener
    const unsubExams = onSnapshot(collection(db, 'exams'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      setExams(items);
    }, (err) => console.warn("Exams stream notice:", err));

    // Subscription Plans listener
    const unsubPlans = onSnapshot(collection(db, 'subscription_plans'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan));
      setSubscriptionPlans(items);
    }, (err) => console.warn("Subscription plans stream notice:", err));

    // Exam Registrations listener
    const unsubRegs = onSnapshot(collection(db, 'exam_registrations'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamRegistration));
      setRegistrations(items);
    }, (err) => console.warn("Registrations stream notice:", err));

    // Payments listener
    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord));
      setPayments(items);
    }, (err) => console.warn("Payments stream notice:", err));

    // Certificates listener
    const unsubCerts = onSnapshot(collection(db, 'certificates'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertificateRecord));
      setCertificates(items);
    }, (err) => console.warn("Certificates stream notice:", err));

    // Refunds listener
    const unsubRefunds = onSnapshot(collection(db, 'refunds'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as RefundRecord));
      setRefunds(items);
    }, (err) => console.warn("Refunds stream notice:", err));

    // Notifications listener
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(items);
    }, (err) => console.warn("Notifications stream notice:", err));

    // Users list listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const items = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      setUsersList(items);
    }, (err) => console.warn("Users list stream notice:", err));

    // Subscriptions records listener
    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionRecord));
      setSubscriptions(items);
    }, (err) => console.warn("Subscriptions stream notice:", err));

    // Payment methods listener (UPI ID / Mobile 7358800371)
    const unsubPayMethods = onSnapshot(collection(db, 'payment_methods'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod));
      setPaymentMethods(items);
    }, (err) => console.warn("Payment methods stream notice:", err));

    // Policies listener
    const unsubPolicyTerms = onSnapshot(doc(db, 'policies', 'terms'), (d) => {
      if (d.exists()) {
        const data = d.data() as PolicyContent;
        setPolicies(p => ({ ...p, terms: data }));
      }
    }, () => {});

    const unsubPolicyPrivacy = onSnapshot(doc(db, 'policies', 'privacy'), (d) => {
      if (d.exists()) {
        const data = d.data() as PolicyContent;
        setPolicies(p => ({ ...p, privacy: data }));
      }
    }, () => {});

    const unsubPolicyRefund = onSnapshot(doc(db, 'policies', 'refund'), (d) => {
      if (d.exists()) {
        const data = d.data() as PolicyContent;
        setPolicies(p => ({ ...p, refund: data }));
      }
    }, () => {});

    // Growth Metrics listener
    const unsubGrowth = onSnapshot(doc(db, 'app_settings', 'growth_metrics'), (d) => {
      if (d.exists()) {
        const data = d.data();
        if (data && Array.isArray(data.metrics)) {
          setGrowthMetrics(data.metrics);
          try {
            localStorage.setItem('mocosart_growth_metrics_cache', JSON.stringify(data.metrics));
          } catch {}
        }
      }
    }, () => {});

    const handleCustomGrowthUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setGrowthMetrics(e.detail);
      }
    };
    window.addEventListener('growth_metrics_updated', handleCustomGrowthUpdate);

    // Student Learnings listener
    const unsubStudentLearning = onSnapshot(collection(db, 'student_learning'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentLearning));
      setStudentLearnings(items);
    }, () => {});

    return () => {
      unsubCompany();
      unsubFounders();
      unsubCourses();
      unsubExams();
      unsubPlans();
      unsubRegs();
      unsubPayments();
      unsubCerts();
      unsubRefunds();
      unsubNotifs();
      unsubUsers();
      unsubSubs();
      unsubPayMethods();
      unsubPolicyTerms();
      unsubPolicyPrivacy();
      unsubPolicyRefund();
      unsubGrowth();
      unsubStudentLearning();
      window.removeEventListener('growth_metrics_updated', handleCustomGrowthUpdate);
    };
  }, []);

  // Update profile handler
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updated);
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      console.error("Failed to update user profile in Firestore:", err);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setCurrentView('home');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Refresh data trigger
  const handleRefreshData = () => {
    // Firestore snapshots are live, but trigger can be used for UI confirmation
  };

  return (
    <div className="min-h-screen relative text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 flex flex-col font-sans">
      {/* Animated AI Technology Background with Glassmorphism and Neural Synapses */}
      <AITechBackground />

      {/* 1. Splash Card on website - MOCOSART */}
      {showSplash && (
        <SplashCard onFinish={() => setShowSplash(false)} />
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        companyInfo={companyInfo}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin-dashboard' || view.startsWith('admin-')) {
            if (isUserAdmin(currentUser?.email)) {
              setCurrentView('admin');
            } else {
              setCurrentView(currentUser ? 'dashboard' : 'home');
            }
          } else if (view === 'dashboard' || view.startsWith('user-')) {
            if (!currentUser) {
              setAuthModalOpen(true);
            } else {
              setCurrentView('dashboard');
            }
          } else {
            setCurrentView('home');
          }
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAboutUs={() => setAboutModalOpen(true)}
        onOpenPolicy={(type) => setPolicyModalType(type)}
        onSignOut={handleSignOut}
      />

      {/* 3. Main Dynamic Content Body */}
      <main className="flex-1 flex flex-col items-center w-full relative z-10">
        {/* VIEW 1: Home Screen */}
        {currentView === 'home' && (
          <HomeScreen
            companyInfo={companyInfo}
            founders={founders}
            growthMetrics={growthMetrics}
            onGetStarted={() => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setAuthModalOpen(true);
              }
            }}
            onExploreCourses={() => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setAuthModalOpen(true);
              }
            }}
            onOpenPolicy={(type) => setPolicyModalType(type)}
          />
        )}

        {/* VIEW 2: Learner / User Dashboard */}
        {currentView === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            courses={courses}
            exams={exams}
            registrations={registrations.filter(r => r.userId === currentUser.uid)}
            payments={payments.filter(p => p.userId === currentUser.uid)}
            certificates={certificates.filter(c => c.userId === currentUser.uid || c.userEmail === currentUser.email)}
            notifications={notifications.filter(n => n.targetUserId === 'all' || n.targetUserId === currentUser.uid)}
            subscriptionPlans={subscriptionPlans}
            userSubscriptions={subscriptions.filter(s => s.userId === currentUser.uid)}
            paymentMethods={paymentMethods}
            growthMetrics={growthMetrics}
            onUpdateProfile={handleUpdateProfile}
            onSignOut={handleSignOut}
            onNavigateHome={() => setCurrentView('home')}
            onOpenAdminPanel={isUserAdmin(currentUser.email) ? () => setCurrentView('admin') : undefined}
            onRefreshData={handleRefreshData}
          />
        )}

        {/* VIEW 3: Super Admin Panel - STRICTLY SMARTNP09812@GMAIL.COM */}
        {currentView === 'admin' && currentUser && isUserAdmin(currentUser.email) && (
          <AdminPanel
            currentUser={currentUser}
            courses={courses}
            exams={exams}
            registrations={registrations}
            payments={payments}
            paymentMethods={paymentMethods}
            certificates={certificates}
            refunds={refunds}
            founders={founders}
            users={usersList}
            notifications={notifications}
            subscriptionPlans={subscriptionPlans}
            subscriptions={subscriptions}
            studentLearnings={studentLearnings}
            companyInfo={companyInfo}
            policies={policies}
            onCloseAdmin={() => setCurrentView('dashboard')}
            onRefreshData={handleRefreshData}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="w-full py-8 border-t border-emerald-900/10 bg-white/40 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-900 text-sm tracking-tight">MOCOSART</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <button 
              onClick={() => setAboutModalOpen(true)} 
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button 
              onClick={() => setPolicyModalType('terms')} 
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setPolicyModalType('privacy')} 
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setPolicyModalType('refund')} 
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className="text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                Admin Console
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {/* Google / Email Sign-In Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setCurrentView('dashboard');
        }}
      />

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        companyInfo={companyInfo}
        founders={founders}
        onOpenPolicy={(type) => {
          setAboutModalOpen(false);
          setPolicyModalType(type);
        }}
      />

      {/* Policy Modal (Terms / Privacy / Refund) */}
      {policyModalType && (
        <PolicyModal
          isOpen={!!policyModalType}
          onClose={() => setPolicyModalType(null)}
          policyType={policyModalType}
          companyInfo={companyInfo}
          policies={policies}
        />
      )}
    </div>
  );
}
