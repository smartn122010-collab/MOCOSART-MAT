import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  UserProfile, 
  Course, 
  Exam, 
  Founder, 
  CompanyInfo, 
  SubscriptionPlan, 
  ExamRegistration, 
  PaymentRecord, 
  CertificateRecord, 
  AppNotification, 
  SubscriptionRecord, 
  RefundRecord 
} from './types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use custom firestoreDatabaseId if configured or default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Default initial data for seeding if database is freshly created
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  companyName: "Mocosart Learning Hub",
  description: "Mocosart is an advanced digital learning & examination certification platform empowering learners worldwide with verified credentials, live mentor sessions, and industry-standard course tracks.",
  email: "contact@mocosart.com",
  phone: "+91 98765 43210",
  address: "Mocosart Knowledge Campus, Innovation Corridor, Cyber City, Bangalore - 560100, India",
  websiteUrl: "https://mocosart.edu",
  socialLinks: {
    twitter: "https://twitter.com/mocosart",
    linkedin: "https://linkedin.com/company/mocosart",
    instagram: "https://instagram.com/mocosart",
    youtube: "https://youtube.com/@mocosart"
  },
  termsAndConditions: `Terms of Service - Mocosart\n1. Acceptance of Terms: By accessing Mocosart, you agree to these educational service terms.\n2. Course & Exam Enrollment: Registered users are granted access to scheduled live Google Meet classes and online or on-premise examination venues.\n3. Certification: Certificates are generated upon verified passing criteria and validated by founder endorsement.\n4. Prohibited Behavior: Fraudulent testing submissions or account sharing will result in disqualification.`,
  privacyPolicy: `Privacy Policy - Mocosart\n1. Data Collection: We collect full name, email, contact telephone, age, and academic results for issuing certificates.\n2. Google Sign-In: Authentication uses secure OAuth 2.0 protocols. No private passwords are stored.\n3. Payment Protection: Payments processed securely via Razorpay gateways with encrypted tokens.\n4. Non-Disclosure: We never sell student data to external third parties.`,
  refundPolicy: `Refund Policy - Mocosart\n1. Exam & Course Cancellation: Refund requests initiated within 48 hours prior to test commencement or first course live session are eligible for review.\n2. Processing: Approved refunds are credited back to the original source method within 5-7 business working days.\n3. Subscriptions: Monthly and yearly subscription plans can be terminated anytime, with prorated eligibility examined case-by-case.`
};

export const DEFAULT_FOUNDERS: Omit<Founder, 'id'>[] = [
  {
    name: "Dr. Arvind Mocosart",
    title: "Co-Founder & Chief Academic Officer",
    description: "Former Stanford AI researcher with 16+ years designing scalable higher-education learning curricula and interactive pedagogy frameworks.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    socialLink: "https://linkedin.com"
  },
  {
    name: "Sanjana Rao",
    title: "Co-Founder & Head of Operations",
    description: "EdTech visionary dedicated to accessible technical education, student mentorship networks, and global accreditation verification.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    socialLink: "https://linkedin.com"
  }
];

export const DEFAULT_COURSES: Omit<Course, 'id'>[] = [
  {
    title: "Full-Stack Web Engineering Mastery",
    description: "Master Modern React, Node.js, Cloud Architectures, and RESTful APIs with interactive live sessions and project code reviews.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    duration: "12 Weeks (48 Hours)",
    price: 4999,
    meetLink: "https://meet.google.com/moc-osrt-web",
    isOnlineCourse: true,
    published: true,
    level: "Intermediate",
    rating: 4.9,
    studentsCount: 1420,
    createdAt: new Date().toISOString()
  },
  {
    title: "Cloud DevOps & Kubernetes Systems",
    description: "Build automated CI/CD pipelines, container orchestration, microservices monitoring, and scalable infrastructure on Google Cloud.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    duration: "8 Weeks (32 Hours)",
    price: 5499,
    meetLink: "https://meet.google.com/moc-dev-ops",
    isOnlineCourse: true,
    published: true,
    level: "Advanced",
    rating: 4.8,
    studentsCount: 880,
    createdAt: new Date().toISOString()
  },
  {
    title: "Artificial Intelligence & Practical Machine Learning",
    description: "From statistical inference and neural networks to transformer models and real-time inference APIs.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    duration: "10 Weeks (40 Hours)",
    price: 6999,
    meetLink: "https://meet.google.com/moc-aiml-lab",
    isOnlineCourse: true,
    published: true,
    level: "Comprehensive",
    rating: 4.95,
    studentsCount: 1940,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_EXAMS: Omit<Exam, 'id'>[] = [
  {
    title: "Certified Full-Stack Engineer Certification Exam",
    description: "Standardized technical examination covering frontend components, state management, asynchronous backend services, and database consistency.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    duration: "60 Minutes",
    amount: 1499,
    venueType: "online",
    published: true,
    passingPercentage: 65,
    questions: [
      {
        id: "q1",
        type: "choose",
        question: "Which hook in React is primarily used for handling side effects such as data subscriptions or manual DOM manipulations?",
        options: ["useState", "useEffect", "useMemo", "useContext"],
        correctAnswer: "1",
        points: 20
      },
      {
        id: "q2",
        type: "choose",
        question: "What is the key advantage of using server-side rendering (SSR) in full-stack applications?",
        options: ["Faster client CPU overclocking", "Optimized initial page load, SEO, and social preview crawlers", "Removal of all database queries", "Zero JavaScript required"],
        correctAnswer: "1",
        points: 20
      },
      {
        id: "q3",
        type: "paragraph",
        question: "Explain the concept of idempotency in RESTful HTTP APIs and why it is critical for payment processing gateways.",
        correctAnswer: "Idempotent requests can be called multiple times without altering the result beyond the initial application, preventing duplicate charges.",
        points: 30
      },
      {
        id: "q4",
        type: "choose",
        question: "In relational and document databases, what is an ACID transaction designed to guarantee?",
        options: ["Atomicity, Consistency, Isolation, Durability", "Automated Cloud Internet Distribution", "Asynchronous Code In Deployment", "Audio Capture Interface Device"],
        correctAnswer: "0",
        points: 30
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    title: "National DevOps & Infrastructure Certification Assessment",
    description: "Hands-on invigilated physical venue examination for high-concurrency systems and secure network deployment.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    duration: "90 Minutes",
    amount: 1999,
    venueType: "venue",
    venueAddress: "Mocosart Exam Center Hall A, 4th Floor, Tech Hub Tower, MG Road, Bangalore 560001",
    mapCoordinates: "12.9716, 77.5946",
    published: true,
    passingPercentage: 70,
    questions: [
      {
        id: "d1",
        type: "choose",
        question: "In Docker containerization, which directive specifies the base image from which you are building?",
        options: ["RUN", "FROM", "ENTRYPOINT", "EXPOSE"],
        correctAnswer: "1",
        points: 50
      },
      {
        id: "d2",
        type: "paragraph",
        question: "Describe the principle of blue-green deployment and how it mitigates production downtime.",
        correctAnswer: "Two identical environments run side-by-side; one serves live traffic while the new version is deployed to the second, followed by an atomic router cutover.",
        points: 50
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SUBSCRIPTION_PLANS: Omit<SubscriptionPlan, 'id'>[] = [
  {
    interval: "weekly",
    title: "Weekly Sprint Pass",
    amount: 499,
    descriptionLines: [
      "Full access to live Google Meet mentor sessions",
      "Unlimited course catalog video streams",
      "Interactive coding sandboxes & quiz prep",
      "Standard email academic assistance"
    ],
    features: ["Meet Access", "Catalog Access", "Community Forum"],
    active: true
  },
  {
    interval: "monthly",
    title: "Monthly Scholar Pro",
    amount: 1499,
    descriptionLines: [
      "Includes all Weekly Sprint privileges",
      "1 Verified Certification Exam Registration token included",
      "Direct 1-on-1 resume & career portfolio review",
      "Priority Google Meet breakout rooms with industry founders"
    ],
    features: ["1 Exam Included", "1-on-1 Review", "Priority Support", "Full Catalog"],
    active: true
  },
  {
    interval: "yearly",
    title: "Yearly Elite Fellow",
    amount: 9999,
    descriptionLines: [
      "All Monthly Scholar Pro benefits for a full 365 days",
      "Unlimited Verified Certification Exams & Re-takes",
      "Diamond grade certificate eligibility & verification seal",
      "Direct mentorship access to company founders Dr. Arvind & Sanjana",
      "Exclusive offline hackathon & campus venue passes"
    ],
    features: ["Unlimited Exams", "Diamond Grade Fast-track", "Founder Mentorship", "Physical Campus Access"],
    active: true
  }
];

// Helper to seed initial data in Firestore ONCE (never re-seeds deleted items)
export async function seedInitialFirestoreData() {
  try {
    const initRef = doc(db, 'settings', 'systemInit');
    const initSnap = await getDoc(initRef);

    // If already initialized once, DO NOT re-seed deleted courses, exams, founders, or subscriptions!
    if (initSnap.exists()) {
      return;
    }

    // 1. Settings / About
    const aboutRef = doc(db, 'settings', 'companyInfo');
    const aboutSnap = await getDoc(aboutRef);
    if (!aboutSnap.exists()) {
      await setDoc(aboutRef, DEFAULT_COMPANY_INFO);
    }

    // 2. Founders
    const foundersCol = collection(db, 'founders');
    const foundersSnap = await getDocs(foundersCol);
    if (foundersSnap.empty) {
      for (const f of DEFAULT_FOUNDERS) {
        await addDoc(foundersCol, f);
      }
    }

    // 3. Courses
    const coursesCol = collection(db, 'courses');
    const coursesSnap = await getDocs(coursesCol);
    if (coursesSnap.empty) {
      for (const c of DEFAULT_COURSES) {
        await addDoc(coursesCol, c);
      }
    }

    // 4. Exams
    const examsCol = collection(db, 'exams');
    const examsSnap = await getDocs(examsCol);
    if (examsSnap.empty) {
      for (const e of DEFAULT_EXAMS) {
        await addDoc(examsCol, e);
      }
    }

    // 5. Subscription Plans
    const subsCol = collection(db, 'subscription_plans');
    const subsSnap = await getDocs(subsCol);
    if (subsSnap.empty) {
      for (const s of DEFAULT_SUBSCRIPTION_PLANS) {
        await addDoc(subsCol, s);
      }
    }

    // 6. Default Payment Method (UPI & Mobile 7358800371)
    const payCol = collection(db, 'payment_methods');
    const paySnap = await getDocs(payCol);
    if (paySnap.empty) {
      await addDoc(payCol, {
        provider: 'Google Pay • PhonePe • Paytm • Any UPI',
        mobileNumber: '7358800371',
        accountName: 'Mocosart Learning Hub',
        active: true,
        notes: 'Scan uploaded QR Code or pay via UPI mobile number 7358800371',
        createdAt: new Date().toISOString()
      });
    }

    // Mark system as permanently initialized
    await setDoc(initRef, {
      initialized: true,
      seededAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore seeding notice (using local fallback if permissions initializing):", err);
  }
}
