import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  FileQuestion, 
  Clock, 
  CreditCard, 
  Check, 
  X, 
  Navigation, 
  Upload,
  Layers,
  Download,
  Save,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { Exam, QuizQuestion } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { compressImageFile } from '../../utils/imageCompressor';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminExamRegisterProps {
  exams: Exam[];
  onRefresh: () => void;
}

export const AdminExamRegister: React.FC<AdminExamRegisterProps> = ({
  exams,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState('60 Minutes');
  const [amount, setAmount] = useState<number>(1499);
  const [venueType, setVenueType] = useState<'online' | 'venue'>('online');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingExam(null);
    setTitle('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
    setDuration('60 Minutes');
    setAmount(1499);
    setVenueType('online');
    setVenueAddress('');
    setMapCoordinates('');
    setQuestions([
      {
        id: `q_${Date.now()}_1`,
        type: 'choose',
        question: 'Which architecture is best suited for real-time synchronization in modern web applications?',
        options: ['Polling every 5 seconds', 'WebSockets / Firestore Listeners', 'Batch daily cron jobs', 'Manual page reload'],
        correctAnswer: '1',
        points: 25
      }
    ]);
    setShowModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description);
    setImageUrl(exam.imageUrl);
    setDuration(exam.duration);
    setAmount(exam.amount);
    setVenueType(exam.venueType);
    setVenueAddress(exam.venueAddress || '');
    setMapCoordinates(exam.mapCoordinates || '');
    setQuestions(exam.questions || []);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.75);
        setImageUrl(compressed);
      } catch (err) {
        console.warn("Image compression fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => setImageUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // "address of place button click auto enable current location"
  const handleAutoEnableCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setMapCoordinates(coords);
        setVenueAddress(`Mocosart Regional Examination Venue (Coordinates: ${coords})`);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setMapCoordinates("12.9716, 77.5946");
        setVenueAddress("Mocosart Central Campus Hall, Bangalore, Karnataka (Auto Geolocation Default)");
        setDetectingLocation(false);
      }
    );
  };

  // Question manipulation
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      type: 'choose',
      question: 'New Question Title',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: '0',
      points: 20
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || [])];
    opts[optIdx] = val;
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const handleSaveExam = async (isPublish: boolean) => {
    if (!title.trim()) {
      alert("Please enter an exam title.");
      return;
    }
    setSaving(true);

    try {
      const examData = {
        title: title.trim(),
        description: description.trim() || 'Official accredited examination assessment.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        duration: duration.trim() || '60 Minutes',
        amount: Math.max(0, Number(amount) || 0),
        venueType,
        venueAddress: venueType === 'venue' ? (venueAddress.trim() || 'Mocosart Regional Campus') : '',
        mapCoordinates: venueType === 'venue' ? (mapCoordinates.trim() || '12.9716, 77.5946') : '',
        questions: venueType === 'online' ? questions : [],
        published: isPublish,
        createdAt: editingExam?.createdAt || new Date().toISOString()
      };

      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), examData);
      } else {
        await addDoc(collection(db, 'exams'), examData);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save exam:", err);
      alert(`Failed to save exam: ${err?.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (exam: Exam) => {
    try {
      const newStatus = !exam.published;
      await updateDoc(doc(db, 'exams', exam.id), {
        published: newStatus
      });
      onRefresh();
    } catch (err: any) {
      console.error("Failed to toggle publish:", err);
      alert(`Error updating publish state: ${err?.message || 'Please try again.'}`);
    }
  };

  const handleDownloadExamsReport = () => {
    const headers = ['Exam Title', 'Format', 'Duration', 'Fee (INR)', 'Questions Count', 'Publish Status', 'Venue / Coords'];
    const rows = exams.map(e => [
      e.title,
      e.venueType === 'online' ? 'Online Quiz' : 'Venue Centre',
      e.duration,
      `Rs. ${e.amount}`,
      e.questions?.length || 0,
      e.published ? 'Published (Live)' : 'Draft (Saved)',
      e.venueType === 'venue' ? (e.venueAddress || e.mapCoordinates || 'Regional') : 'Online Portal'
    ]);
    exportTableToPDF('Mocosart - Examination Register & Curriculum Assessment Ledger', headers, rows, 'examination_register_report');
  };

  const handleDeleteExam = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'exams', id));
    } catch (err) {
      console.warn("Firestore delete notice (id may be fallback):", err);
    }
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Exam Register & Assessment Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Build standardized online quiz tests or physical examination venues. Save questions as draft and publish when ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadExamsReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Aligned PDF</span>
          </button>
          <button
            id="admin-add-exam-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Build New Exam</span>
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-2xl glass-card border border-white/90 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={exam.imageUrl}
                  alt={exam.title}
                  className="w-full h-full object-cover"
                />
                {/* Format badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold uppercase">
                  {exam.venueType === 'online' ? 'Online Quiz Test' : 'Physical Venue Address'}
                </div>

                {/* Published / Draft Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm backdrop-blur-md bg-white/90">
                  <span className={`w-2 h-2 rounded-full ${exam.published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className={exam.published ? 'text-emerald-800' : 'text-amber-800'}>
                    {exam.published ? 'Published (Live)' : 'Draft (Saved)'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/95 text-slate-800 text-[11px] font-bold">
                  ₹{exam.amount.toLocaleString()}
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <h3 className="font-bold text-slate-900 font-serif text-base leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {exam.duration}
                  </span>
                  {exam.venueType === 'online' ? (
                    <span className="font-bold text-emerald-800 text-xs">
                      {exam.questions?.length || 0} Quiz Questions
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700 text-xs truncate max-w-[160px]">
                      {exam.venueAddress || 'Campus Venue'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Toggle Publish, Edit, Delete */}
            <div className="p-5 pt-0 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTogglePublish(exam)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  exam.published 
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
                title={exam.published ? 'Revert to Draft' : 'Publish to Students'}
              >
                {exam.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{exam.published ? 'Unpublish (Draft)' : 'Publish Live'}</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(exam)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Questions</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExam(exam.id, exam.title)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingExam ? 'Edit Exam & Questions' : 'Add New Examination Registration'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveExam(true); }} className="overflow-y-auto pr-1 my-3 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Certified Cloud Architect Examination"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Exam Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Criteria, syllabus, passing grade requirements..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              {/* Exam Course Image */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Exam Course Image (Upload or URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 90 Minutes"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Registration Amount (₹ INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Venue Selection: Online Test OR Address of Place */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Venue Mode:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="venueType"
                      value="online"
                      checked={venueType === 'online'}
                      onChange={() => setVenueType('online')}
                      className="text-emerald-600"
                    />
                    <span>Online Test (Interactive Quiz)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="venueType"
                      value="venue"
                      checked={venueType === 'venue'}
                      onChange={() => setVenueType('venue')}
                      className="text-emerald-600"
                    />
                    <span>Physical Venue Address</span>
                  </label>
                </div>

                {/* Option 1: Physical Venue with Auto Enable Current Location */}
                {venueType === 'venue' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700">
                        Venue Physical Address & Map Pin
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoEnableCurrentLocation}
                        disabled={detectingLocation}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>{detectingLocation ? 'Detecting GPS...' : 'Auto Enable Current Location'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="Enter authorized test venue address..."
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-800"
                      required={venueType === 'venue'}
                    />

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Google Maps Coordinates (lat, lng)</label>
                      <input
                        type="text"
                        value={mapCoordinates}
                        onChange={(e) => setMapCoordinates(e.target.value)}
                        placeholder="e.g. 12.9716, 77.5946"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Option 2: Online Test Question Builder */}
                {venueType === 'online' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Quiz Questions Builder</span>
                        <span className="text-[11px] text-slate-500">Configure multiple choice options or paragraph responses</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {/* Question Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800">Q{qIdx + 1}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={q.type}
                                onChange={(e) => handleQuestionChange(qIdx, 'type', e.target.value)}
                                className="px-2 py-1 rounded text-xs border border-slate-200 bg-slate-50"
                              >
                                <option value="choose">Choose Option</option>
                                <option value="paragraph">Paragraph Use</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIdx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                            placeholder="Enter question text..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                            required
                          />

                          {q.type === 'choose' && (
                            <div className="space-y-1.5 pl-2">
                              <span className="text-[10px] text-slate-500 font-medium block">Answer Options & Correct Choice:</span>
                              {(q.options || ['A', 'B', 'C', 'D']).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct_${q.id}`}
                                    checked={q.correctAnswer === String(optIdx)}
                                    onChange={() => handleQuestionChange(qIdx, 'correctAnswer', String(optIdx))}
                                    title="Mark as correct answer"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                    className="flex-1 px-2 py-1 rounded text-xs border border-slate-200"
                                    placeholder={`Option ${optIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'paragraph' && (
                            <p className="text-[11px] text-slate-500 italic pl-1">
                              Student will submit a paragraph explanation. Points awarded based on keyword match & depth.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Separated Save and Publish Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Currently save the question as draft */}
                  <button
                    id="admin-save-questions-draft-btn"
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveExam(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-900/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    title="Save current questions as draft without publishing to students"
                  >
                    <Save className="w-4 h-4 text-sky-400" />
                    <span>{saving ? 'Saving...' : 'Save Questions (Draft)'}</span>
                  </button>

                  {/* Manually publish the question / exam */}
                  <button
                    id="admin-publish-exam-btn"
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveExam(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    title="Publish questions live for registered students"
                  >
                    <Send className="w-4 h-4" />
                    <span>{saving ? 'Publishing...' : 'Publish Exam Assessment'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
