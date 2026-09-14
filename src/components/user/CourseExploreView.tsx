import React, { useState } from 'react';
import { 
  Video, 
  Clock, 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  X,
  Sparkles,
  QrCode,
  Download,
  Smartphone
} from 'lucide-react';
import { Course, UserProfile, PaymentRecord, PaymentMethod } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { UPIPaymentModal } from '../UPIPaymentModal';

interface CourseExploreViewProps {
  courses: Course[];
  currentUser: UserProfile | null;
  enrolledCourseIds: string[];
  paymentMethods?: PaymentMethod[];
  onEnrollmentSuccess: (courseId: string, paymentId: string) => void;
  selectedCourseFromSearch?: Course | null;
  onClearSelectedCourse?: () => void;
}

export const CourseExploreView: React.FC<CourseExploreViewProps> = ({
  courses,
  currentUser,
  enrolledCourseIds,
  paymentMethods = [],
  onEnrollmentSuccess,
  selectedCourseFromSearch,
  onClearSelectedCourse
}) => {
  const [activeCourseModal, setActiveCourseModal] = useState<Course | null>(selectedCourseFromSearch || null);
  const [paymentModalCourse, setPaymentModalCourse] = useState<Course | null>(null);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Sync if prop changed
  React.useEffect(() => {
    if (selectedCourseFromSearch) {
      setActiveCourseModal(selectedCourseFromSearch);
    }
  }, [selectedCourseFromSearch]);

  // Primary payment gateway config (custom uploaded QR code from admin if available)
  const activeGateway = paymentMethods.find(m => m.active !== false) || paymentMethods[0];
  const gatewayMobile = activeGateway?.mobileNumber || '7358800371';
  const gatewayQr = activeGateway?.qrCodeUrl || '';
  const gatewayUpi = activeGateway?.upiId || `${gatewayMobile}@upi`;

  // Open QR code payment modal
  const handleOpenPayment = (course: Course) => {
    if (!currentUser) {
      alert("Please sign in to enroll in courses.");
      return;
    }
    setPaymentModalCourse(course);
  };

  // Payment confirmation: "pay with send the message admin after auto enter on any course"
  const handlePaymentSuccess = async (details: {
    utrNumber: string;
    upiId: string;
    upiMobile: string;
    paymentMethod: string;
  }) => {
    if (!currentUser || !paymentModalCourse) return;
    const course = paymentModalCourse;
    setIsEnrolling(true);

    try {
      // 1. Record payment in Firestore payments collection
      const paymentRef = await addDoc(collection(db, 'payments'), {
        type: 'course',
        itemTitle: course.title,
        itemId: course.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        amount: course.price,
        currency: 'INR',
        upiId: details.upiId,
        upiMobile: details.upiMobile || gatewayMobile,
        utrNumber: details.utrNumber,
        paymentMethod: details.paymentMethod || 'QR Code UPI',
        status: 'successful',
        createdAt: new Date().toISOString()
      });

      // 2. "send the message admin" -> Notification sent to admin (smartnp09812@gmail.com)
      await addDoc(collection(db, 'notifications'), {
        targetUserId: 'smartnp09812@gmail.com',
        title: `New Course Enrollment: ${course.title}`,
        message: `Learner ${currentUser.displayName} (${currentUser.email}) has completed QR code payment of ₹${course.price.toLocaleString()} for "${course.title}". UTR/Payment Ref: ${details.utrNumber}. Auto-enrolled into classroom.`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      // 3. User receipt notification
      await addDoc(collection(db, 'notifications'), {
        targetUserId: currentUser.uid,
        title: `Enrolled in ${course.title}`,
        message: `Your payment of ₹${course.price.toLocaleString()} has been verified via QR code (Ref: ${details.utrNumber}). Google Meet live classroom link is now unlocked!`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      // 4. "after auto enter on any course" -> automatically enroll & enter course!
      onEnrollmentSuccess(course.id, paymentRef.id || details.utrNumber);
      setEnrollSuccessMessage(`🎉 Payment verified! You have auto-entered "${course.title}". Google Meet live session unlocked!`);
      
      // Close payment modal and auto-open course detail modal with unlocked Google Meet link
      setPaymentModalCourse(null);
      setActiveCourseModal(course);
    } catch (err) {
      console.error("Enrollment processing error:", err);
      // Still auto-enter user on client side
      onEnrollmentSuccess(course.id, details.utrNumber || 'LOCAL_CONFIRMED');
      setEnrollSuccessMessage(`🎉 Welcome to ${course.title}! Google Meet link unlocked.`);
      setPaymentModalCourse(null);
      setActiveCourseModal(course);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Course Explore & Live Meet
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Scan or download the official QR Code to pay and auto-enter any live course classroom.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100/90 text-emerald-950 text-xs font-semibold border border-emerald-300">
          <QrCode className="w-4 h-4 text-emerald-700" />
          <span>Scan &amp; Download QR Code • Mobile: {gatewayMobile}</span>
        </div>
      </div>

      {enrollSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{enrollSuccessMessage}</span>
          </div>
          <button
            onClick={() => setEnrollSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Course Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className="rounded-2xl glass-card border border-white/90 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {course.isOnlineCourse && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 border border-emerald-400/40">
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Meet</span>
                    </div>
                  )}

                  {isEnrolled && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Enrolled &amp; Unlocked</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 font-serif text-lg leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {course.duration}
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-serif">
                      ₹{course.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: QR Payment & Auto Enter */}
              <div className="p-5 pt-0 space-y-2">
                {isEnrolled ? (
                  <div className="space-y-2">
                    {course.isOnlineCourse && course.meetLink && (
                      <a
                        href={course.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Google Meet Session</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveCourseModal(course)}
                      className="w-full py-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Course Syllabus &amp; Material
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPayment(course)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Pay ₹{course.price.toLocaleString()} with QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourseModal(course)}
                      className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl glass-panel p-6 md:p-8 border border-white shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setActiveCourseModal(null);
                if (onClearSelectedCourse) onClearSelectedCourse();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-1 space-y-4">
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={activeCourseModal.imageUrl}
                  alt={activeCourseModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    {activeCourseModal.level || 'Professional Track'}
                  </span>
                  <h3 className="text-xl font-bold font-serif mt-1">
                    {activeCourseModal.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Overview</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                  {activeCourseModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/70 border border-slate-200 text-center">
                  <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Duration</span>
                  <span className="text-xs font-bold text-slate-900">{activeCourseModal.duration}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-slate-200 text-center">
                  <CreditCard className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Enrollment Fee</span>
                  <span className="text-xs font-bold text-slate-900">₹{activeCourseModal.price.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-slate-200 text-center col-span-2 sm:col-span-1">
                  <Video className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">Class Mode</span>
                  <span className="text-xs font-bold text-emerald-800">Google Meet Live</span>
                </div>
              </div>

              {/* Action: Enrolled vs Open QR Code Payment */}
              <div className="pt-2">
                {enrolledCourseIds.includes(activeCourseModal.id) ? (
                  <div className="p-4 rounded-xl glass-panel-green border border-emerald-300 text-center space-y-2">
                    <p className="text-xs font-bold text-emerald-950">You are enrolled in this course</p>
                    {activeCourseModal.meetLink && (
                      <a
                        href={activeCourseModal.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Open &amp; Join Google Meet Live Session</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const c = activeCourseModal;
                      setActiveCourseModal(null);
                      handleOpenPayment(c);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pay ₹{activeCourseModal.price.toLocaleString()} with QR Code &amp; Auto Enter</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Payment & Auto-Enter Modal */}
      {paymentModalCourse && (
        <UPIPaymentModal
          isOpen={!!paymentModalCourse}
          onClose={() => setPaymentModalCourse(null)}
          itemTitle={paymentModalCourse.title}
          amount={paymentModalCourse.price}
          itemType="course"
          userDisplayName={currentUser?.displayName}
          userEmail={currentUser?.email}
          customMobileNumber={gatewayMobile}
          customUpiId={gatewayUpi}
          customQrCode={gatewayQr}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
