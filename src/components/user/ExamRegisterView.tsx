import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  PlayCircle, 
  ShieldCheck, 
  FileQuestion,
  Navigation,
  QrCode
} from 'lucide-react';
import { Exam, ExamRegistration, UserProfile, PaymentMethod } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { OnlineTestModal } from './OnlineTestModal';
import { UPIPaymentModal } from '../UPIPaymentModal';

interface ExamRegisterViewProps {
  exams: Exam[];
  currentUser: UserProfile | null;
  registrations: ExamRegistration[];
  paymentMethods?: PaymentMethod[];
  onRegistrationUpdate: () => void;
}

export const ExamRegisterView: React.FC<ExamRegisterViewProps> = ({
  exams,
  currentUser,
  registrations,
  paymentMethods = [],
  onRegistrationUpdate
}) => {
  const [activeQuizExam, setActiveQuizExam] = useState<{ exam: Exam; reg: ExamRegistration } | null>(null);
  const [paymentModalExam, setPaymentModalExam] = useState<Exam | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Active payment gateway config
  const activeGateway = paymentMethods.find(m => m.active !== false) || paymentMethods[0];
  const gatewayMobile = activeGateway?.mobileNumber || '7358800371';
  const gatewayQr = activeGateway?.qrCodeUrl || '';
  const gatewayUpi = activeGateway?.upiId || `${gatewayMobile}@upi`;

  // Find registration for an exam
  const getRegistration = (examId: string) => {
    return registrations.find(r => r.examId === examId);
  };

  const handleOpenExamPayment = (exam: Exam) => {
    if (!currentUser) {
      alert("Please sign in to register for certification exams.");
      return;
    }
    setPaymentModalExam(exam);
  };

  const handleExamPaymentSuccess = async (details: {
    utrNumber: string;
    upiId: string;
    upiMobile: string;
    paymentMethod: string;
  }) => {
    if (!currentUser || !paymentModalExam) return;
    const exam = paymentModalExam;

    try {
      // 1. Record Exam Registration in Firestore
      await addDoc(collection(db, 'exam_registrations'), {
        examId: exam.id,
        examTitle: exam.title,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        userPhone: currentUser.phoneNumber || '',
        amount: exam.amount,
        paymentStatus: 'successful',
        paymentId: details.utrNumber,
        registeredAt: new Date().toISOString(),
        approved: true,
        status: 'registered'
      });

      // 2. Record Payment Record
      await addDoc(collection(db, 'payments'), {
        type: 'exam',
        itemTitle: `Exam: ${exam.title}`,
        itemId: exam.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        amount: exam.amount,
        currency: 'INR',
        upiId: details.upiId,
        upiMobile: details.upiMobile || gatewayMobile,
        utrNumber: details.utrNumber,
        paymentMethod: details.paymentMethod || 'QR Code UPI',
        status: 'successful',
        createdAt: new Date().toISOString()
      });

      // 3. Send message to Admin (smartnp09812@gmail.com)
      await addDoc(collection(db, 'notifications'), {
        targetUserId: 'smartnp09812@gmail.com',
        title: `Exam Registration: ${exam.title}`,
        message: `Candidate ${currentUser.displayName} (${currentUser.email}) has registered for "${exam.title}" paying ₹${exam.amount.toLocaleString()} via QR code. UTR/Payment Ref: ${details.utrNumber}.`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      // 4. Candidate Notification
      await addDoc(collection(db, 'notifications'), {
        targetUserId: currentUser.uid,
        title: `Exam Registered: ${exam.title}`,
        message: `Registration confirmed (Payment Ref: ${details.utrNumber}). Your examination access & venue details are now unlocked!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      setActionNotice(`Successfully registered for ${exam.title}! Access details unlocked below.`);
      setPaymentModalExam(null);
      onRegistrationUpdate();
    } catch (err) {
      console.error("Exam registration error:", err);
      setActionNotice(`Registered for ${exam.title}. Access unlocked.`);
      setPaymentModalExam(null);
      onRegistrationUpdate();
    }
  };

  const handleTestSubmit = async (score: number, percentage: number, answers: Record<string, string>) => {
    if (!activeQuizExam || !currentUser) return;

    try {
      // Update registration record in Firestore
      if (activeQuizExam.reg.id) {
        const regRef = doc(db, 'exam_registrations', activeQuizExam.reg.id);
        await updateDoc(regRef, {
          status: 'completed',
          examScore: score,
          examPercentage: percentage,
          submittedAnswers: answers,
          completedAt: new Date().toISOString()
        });
      }

      // Auto generate/schedule certificate record
      const grade = percentage >= 85 ? 'Diamond' : percentage >= 70 ? 'Gold' : 'Silver';
      await addDoc(collection(db, 'certificates'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        courseName: activeQuizExam.exam.title,
        examId: activeQuizExam.exam.id,
        percentage: percentage,
        grade: grade,
        foundersName: "Dr. Arvind Mocosart & Sanjana Rao",
        founderSignature: "Arvind Mocosart",
        description: `Successfully cleared the rigorous online examination criteria with a score of ${percentage}%.`,
        issuedAt: new Date().toISOString(),
        certificateNumber: `MOC-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'generated'
      });

      // User notification
      await addDoc(collection(db, 'notifications'), {
        targetUserId: currentUser.uid,
        title: `Exam Completed: ${activeQuizExam.exam.title}`,
        message: `You scored ${percentage}% (${grade} Grade). Your certificate has been generated and is viewable in the Certificate tab!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onRegistrationUpdate();
    } catch (err) {
      console.error("Failed to record test completion:", err);
    }
  };

  const getGoogleMapsUrl = (address?: string, coords?: string) => {
    if (coords) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || 'Mocosart Tech Hub')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Exam Registration & Certification
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Register for standardized online tests or authorized physical venue assessments.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100/90 text-emerald-900 text-xs font-semibold border border-emerald-300">
          <Award className="w-4 h-4 text-emerald-700" />
          <span>Accredited Examination Board</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const reg = getRegistration(exam.id);
          const isRegistered = !!reg && reg.paymentStatus === 'successful';

          return (
            <div
              key={exam.id}
              className="rounded-2xl glass-card border border-white/90 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={exam.imageUrl}
                    alt={exam.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                    {exam.venueType === 'online' ? (
                      <>
                        <FileQuestion className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Online Test</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Venue Address</span>
                      </>
                    )}
                  </div>

                  {isRegistered && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Registered</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 font-serif text-lg leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {exam.duration}
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-serif">
                      ₹{exam.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="p-5 pt-0 space-y-3">
                {/* AFTER PAYMENT: Show Online Test or Venue Address */}
                {isRegistered ? (
                  <div className="p-4 rounded-xl glass-panel-green border border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Registration Active
                      </span>
                      {reg.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                          Score: {reg.examPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Case 1: Venue Address */}
                    {exam.venueType === 'venue' ? (
                      <div className="space-y-2 pt-1 border-t border-emerald-200">
                        <div className="flex items-start gap-2 text-xs text-slate-700">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">Authorized Exam Center Venue:</span>
                            <p className="text-xs text-slate-600">{exam.venueAddress || 'Main Campus Hall, Bangalore'}</p>
                          </div>
                        </div>

                        {/* Tap to open Google Map link */}
                        <a
                          id={`exam-map-btn-${exam.id}`}
                          href={getGoogleMapsUrl(exam.venueAddress, exam.mapCoordinates)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tap to Open Google Map to Pin Location</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    ) : (
                      /* Case 2: Online Test */
                      <div className="space-y-2 pt-1 border-t border-emerald-200">
                        <div className="text-xs text-emerald-900">
                          <span className="font-bold block">Online Examination Ready:</span>
                          <p className="text-[11px] text-emerald-800">
                            {exam.questions?.length || 0} Questions • Multiple choice & paragraph responses
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveQuizExam({ exam, reg })}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>
                            {reg.status === 'completed' ? 'Review Submitted Quiz Answers' : 'Start Online Test & Quiz'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* BEFORE PAYMENT: Payment button */
                  <button
                    type="button"
                    onClick={() => handleOpenExamPayment(exam)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>
                      Pay ₹{exam.amount.toLocaleString()} with QR Code &amp; Register
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Payment Modal */}
      {paymentModalExam && (
        <UPIPaymentModal
          isOpen={!!paymentModalExam}
          onClose={() => setPaymentModalExam(null)}
          itemTitle={paymentModalExam.title}
          amount={paymentModalExam.amount}
          itemType="exam"
          userDisplayName={currentUser?.displayName}
          userEmail={currentUser?.email}
          customMobileNumber={gatewayMobile}
          customUpiId={gatewayUpi}
          customQrCode={gatewayQr}
          onPaymentSuccess={handleExamPaymentSuccess}
        />
      )}

      {/* Online Test Quiz Modal */}
      {activeQuizExam && (
        <OnlineTestModal
          exam={activeQuizExam.exam}
          registration={activeQuizExam.reg}
          onClose={() => setActiveQuizExam(null)}
          onSubmitTest={handleTestSubmit}
        />
      )}
    </div>
  );
};
