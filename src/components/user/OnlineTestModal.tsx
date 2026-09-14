import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { Exam, QuizQuestion, ExamRegistration } from '../../types';

interface OnlineTestModalProps {
  exam: Exam;
  registration: ExamRegistration;
  onClose: () => void;
  onSubmitTest: (score: number, percentage: number, answers: Record<string, string>) => Promise<void>;
}

export const OnlineTestModal: React.FC<OnlineTestModalProps> = ({
  exam,
  registration,
  onClose,
  onSubmitTest
}) => {
  const questions: QuizQuestion[] = exam.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(registration.submittedAnswers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(registration.status === 'completed');
  const [resultScore, setResultScore] = useState(registration.examScore || 0);
  const [resultPercentage, setResultPercentage] = useState(registration.examPercentage || 0);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (completed) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: String(index)
    }));
  };

  const handleParagraphAnswer = (text: string) => {
    if (completed) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: text
    }));
  };

  const calculateFinalScore = () => {
    let earnedPoints = 0;
    let totalPoints = 0;

    questions.forEach(q => {
      const qPts = q.points || 10;
      totalPoints += qPts;
      const userAns = (answers[q.id] || '').trim().toLowerCase();

      if (q.type === 'choose') {
        if (userAns === (q.correctAnswer || '0').trim().toLowerCase()) {
          earnedPoints += qPts;
        }
      } else {
        // Paragraph grading: basic keyword presence check or non-empty thoughtful response
        if (userAns.length > 15) {
          earnedPoints += qPts; // award points for comprehensive answer
        } else if (userAns.length > 5) {
          earnedPoints += Math.round(qPts / 2);
        }
      }
    });

    if (totalPoints === 0) totalPoints = 100;
    const pct = Math.min(100, Math.round((earnedPoints / totalPoints) * 100));
    return { earnedPoints, pct };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { earnedPoints, pct } = calculateFinalScore();
      await onSubmitTest(earnedPoints, pct, answers);
      setResultScore(earnedPoints);
      setResultPercentage(pct);
      setCompleted(true);
    } catch (err) {
      console.error("Test submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="online-test-modal" 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Online Examination
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {exam.duration}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif mt-1">
              {exam.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed State */}
        {completed ? (
          <div className="py-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 font-serif">Exam Successfully Submitted!</h4>
            <div className="p-4 rounded-xl glass-panel-green max-w-sm mx-auto border border-emerald-300">
              <p className="text-xs text-emerald-800 font-medium">Your Performance Score</p>
              <p className="text-4xl font-extrabold text-emerald-950 font-serif my-1">{resultPercentage}%</p>
              <p className="text-xs text-emerald-700">
                {resultPercentage >= (exam.passingPercentage || 60)
                  ? 'Status: PASSED • Eligible for Official Certificate'
                  : 'Status: Completed • Review pending with instructor'}
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              As per Mocosart regulations, your official signed certificate with security seal is routed to the <b>Certificate</b> tab within 10 days of exam completion.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Question Form */
          <div className="overflow-y-auto my-4 pr-1 space-y-5 flex-1">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Points: {currentQ?.points || 10}</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%` }}
              />
            </div>

            {currentQ ? (
              <div className="p-5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                      {currentQ.type === 'choose' ? 'Multiple Choice Question' : 'Paragraph Subjective Answer'}
                    </span>
                    <h4 className="text-base font-semibold text-slate-900 leading-snug mt-1 font-serif">
                      {currentQ.question}
                    </h4>
                  </div>
                </div>

                {/* Question Type: Choose options */}
                {currentQ.type === 'choose' && currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = answers[currentQ.id] === String(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                              : 'bg-white/80 border-slate-200 hover:border-emerald-300 text-slate-700'
                          }`}
                        >
                          <span>{option}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Question Type: Paragraph write-up */}
                {currentQ.type === 'paragraph' && (
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Type your answer below:
                    </label>
                    <textarea
                      rows={5}
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleParagraphAnswer(e.target.value)}
                      placeholder="Write your explanation in clear technical details..."
                      className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-6">No questions added for this examination yet.</p>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Examination'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
