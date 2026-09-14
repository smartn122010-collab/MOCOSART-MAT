export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  age?: string;
  phoneNumber?: string;
  photoURL?: string;
  address?: string;
  college?: string;
  qualification?: string;
  occupation?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  subscriptionPlan?: 'weekly' | 'monthly' | 'yearly' | 'none';
  subscriptionStatus?: 'active' | 'pending' | 'expired';
  subscriptionExpiry?: string;
}

export interface Founder {
  id: string;
  name: string;
  title: string;
  role?: string;
  description: string;
  photoUrl: string;
  socialLink?: string;
  order?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  price: number;
  meetLink?: string;
  isOnlineCourse: boolean;
  published: boolean;
  level?: string;
  rating?: number;
  studentsCount?: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'choose' | 'paragraph';
  options?: string[];
  correctAnswer?: string; // option index or keywords
  points?: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  amount: number;
  venueType: 'online' | 'venue';
  venueAddress?: string;
  mapCoordinates?: string; // e.g. "12.9716,77.5946"
  questions: QuizQuestion[];
  published: boolean;
  passingPercentage?: number;
  createdAt: string;
}

export interface ExamRegistration {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  amount: number;
  paymentStatus: 'pending' | 'successful' | 'refunded';
  paymentId?: string;
  registeredAt: string;
  approved: boolean;
  status: 'registered' | 'in_progress' | 'completed';
  examScore?: number;
  examPercentage?: number;
  submittedAnswers?: Record<string, string>;
  completedAt?: string;
}

export interface PaymentRecord {
  id: string;
  type: 'course' | 'exam' | 'subscription';
  itemTitle: string;
  itemId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  upiId?: string;
  utrNumber?: string;
  upiMobile?: string;
  paymentMethod?: string;
  status: 'pending' | 'successful' | 'refunded';
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  provider: string; // 'Google Pay' | 'PhonePe' | 'Paytm' | 'All UPI Apps' | string;
  upiId?: string;
  qrCodeUrl?: string; // Uploaded QR Code image data/URL from My files
  mobileNumber: string;
  accountName: string;
  active: boolean;
  notes?: string;
  createdAt?: string;
}

export interface CertificateRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseName: string;
  courseLevel?: string;
  examId?: string;
  percentage: number;
  grade: 'Silver' | 'Gold' | 'Diamond';
  foundersName: string;
  founderDesignation?: string;
  founderSignature: string; // text cursive or data URL
  cofounderName?: string;
  cofounderDesignation?: string;
  cofounderSignature?: string; // text cursive or data URL
  description: string;
  issuedAt: string;
  certificateNumber: string;
  status: 'generated' | 'sent';
}

export interface StudentLearning {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseId?: string;
  courseTitle: string;
  courseLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | string;
  percentage: number;
  status: 'In Progress' | 'Completed' | 'Certified';
  certificateIssued: boolean;
  certificateNumber?: string;
  grade?: 'Silver' | 'Gold' | 'Diamond';
  founderName?: string;
  founderSignature?: string;
  cofounderName?: string;
  cofounderSignature?: string;
  completionDate?: string;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  targetUserId: string; // 'all' or specific user UID
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  readBy?: string[];
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  interval: 'weekly' | 'monthly' | 'yearly';
  title: string;
  amount: number;
  descriptionLines: string[];
  features: string[];
  active: boolean;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planInterval: 'weekly' | 'monthly' | 'yearly';
  planTitle: string;
  amount: number;
  status: 'pending' | 'successful' | 'refunded';
  paymentId?: string;
  startDate: string;
  endDate: string;
}

export interface RefundRecord {
  id: string;
  type: 'exam' | 'subscription' | 'course';
  paymentId?: string;
  referenceId?: string; // paymentId or registrationId
  itemTitle?: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'successful' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  createdAt?: string;
}

export interface CompanyInfo {
  companyName: string;
  description: string;
  email: string;
  gmail?: string;
  phone: string;
  address: string;
  websiteUrl: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

export interface PolicyContent {
  title: string;
  content: string;
  updatedAt: string;
}

export interface GrowthMetric {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  category: 'learning' | 'certificate' | 'percentage' | 'custom';
  courseLevelStats?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    master: number;
  };
  highlight?: boolean;
  order?: number;
  updatedAt?: string;
}

export const DEFAULT_GROWTH_METRICS: GrowthMetric[] = [
  {
    id: 'growth-student-learning',
    title: 'Student Learning+',
    value: '1,500+',
    subtitle: 'Active certified learners enrolled in continuous career modules',
    category: 'learning',
    highlight: true,
    order: 1
  },
  {
    id: 'growth-verified-certificate',
    title: 'Verified Certificates',
    value: '890+',
    subtitle: 'Digitally verified credentials issued with QR authentication',
    category: 'certificate',
    highlight: true,
    order: 2
  },
  {
    id: 'growth-percentage-course-level',
    title: 'Percentage Course Level',
    value: '96.4%',
    subtitle: 'Overall cohort assessment mastery and practical exam pass rate',
    category: 'percentage',
    courseLevelStats: {
      beginner: 98,
      intermediate: 95,
      advanced: 92,
      master: 89
    },
    highlight: true,
    order: 3
  }
];

export const ADMIN_EMAIL = 'smartnp09812@gmail.com';

export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === 'smartnp09812@gmail.com' || clean === 'smartnp0912@gmail.com';
};
