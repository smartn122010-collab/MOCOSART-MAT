import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  FileText,
  User, 
  BookOpen,
  Percent,
  Calendar,
  Sparkles,
  ShieldCheck,
  PenTool,
  X,
  Save
} from 'lucide-react';
import { StudentLearning, UserProfile, Course, CertificateRecord } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { exportTableToPDF, exportTableToCSV } from '../../utils/pdfExport';

interface AdminStudentLearningProps {
  studentLearnings: StudentLearning[];
  users: UserProfile[];
  courses: Course[];
  onRefresh: () => void;
}

export const AdminStudentLearning: React.FC<AdminStudentLearningProps> = ({
  studentLearnings,
  users,
  courses,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentLearning | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states - strictly manually entered by Admin
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Master'>('Intermediate');
  const [percentage, setPercentage] = useState<number>(85);
  const [status, setStatus] = useState<'In Progress' | 'Completed' | 'Certified'>('Completed');
  const [certificateIssued, setCertificateIssued] = useState<boolean>(true);
  const [grade, setGrade] = useState<'Silver' | 'Gold' | 'Diamond'>('Gold');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderSignature, setFounderSignature] = useState('');
  const [cofounderName, setCofounderName] = useState('');
  const [cofounderSignature, setCofounderSignature] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setCourseTitle(courses[0]?.title || '');
    setCourseLevel('Intermediate');
    setPercentage(85);
    setStatus('Completed');
    setCertificateIssued(true);
    setGrade('Gold');
    setCertificateNumber(`MOC-VLC-${Math.floor(100000 + Math.random() * 900000)}`);
    setFounderName('');
    setFounderSignature('');
    setCofounderName('');
    setCofounderSignature('');
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setNotes('Verified course curriculum progression and module completion.');
    setShowModal(true);
  };

  const openEditModal = (item: StudentLearning) => {
    setEditingItem(item);
    setStudentName(item.studentName);
    setStudentEmail(item.studentEmail);
    setStudentPhone(item.studentPhone || '');
    setCourseTitle(item.courseTitle);
    setCourseLevel((item.courseLevel as any) || 'Intermediate');
    setPercentage(item.percentage);
    setStatus(item.status);
    setCertificateIssued(item.certificateIssued);
    setGrade(item.grade || 'Gold');
    setCertificateNumber(item.certificateNumber || `MOC-VLC-${Math.floor(100000 + Math.random() * 900000)}`);
    setFounderName(item.founderName || '');
    setFounderSignature(item.founderSignature || '');
    setCofounderName(item.cofounderName || '');
    setCofounderSignature(item.cofounderSignature || '');
    setCompletionDate(item.completionDate || new Date().toISOString().split('T')[0]);
    setNotes(item.notes || '');
    setShowModal(true);
  };

  const handleSelectUser = (uid: string) => {
    const u = users.find(user => user.uid === uid);
    if (u) {
      setStudentName(u.displayName);
      setStudentEmail(u.email);
      setStudentPhone(u.phoneNumber || '');
    }
  };

  const handleSelectCourse = (title: string) => {
    setCourseTitle(title);
    const foundCourse = courses.find(c => c.title === title);
    if (foundCourse?.level) {
      setCourseLevel(foundCourse.level as any);
    }
  };

  // Save manual record to Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseTitle.trim()) {
      alert("Please enter Student Name and Course Title.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const now = new Date().toISOString();
      const generatedCertNum = certificateNumber.trim() || `MOC-VLC-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const learningData: Partial<StudentLearning> = {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        studentPhone: studentPhone.trim(),
        courseTitle: courseTitle.trim(),
        courseLevel,
        percentage: Number(percentage) || 0,
        status,
        certificateIssued,
        grade,
        certificateNumber: generatedCertNum,
        founderName: founderName.trim(),
        founderSignature: founderSignature.trim(),
        cofounderName: cofounderName.trim(),
        cofounderSignature: cofounderSignature.trim(),
        completionDate,
        notes: notes.trim(),
        updatedAt: now,
      };

      if (editingItem) {
        await updateDoc(doc(db, 'student_learning', editingItem.id), learningData);
        setFeedback(`Learning record for "${studentName}" updated successfully.`);
      } else {
        learningData.createdAt = now;
        await addDoc(collection(db, 'student_learning'), learningData);
        setFeedback(`Learning record for "${studentName}" created successfully.`);
      }

      // If verified certificate issued, also sync to official certificates collection
      if (certificateIssued) {
        const matchingUser = users.find(u => u.email.toLowerCase() === studentEmail.trim().toLowerCase());
        const certRecord: Omit<CertificateRecord, 'id'> = {
          userId: matchingUser?.uid || 'direct_student',
          userName: studentName.trim(),
          userEmail: studentEmail.trim(),
          courseName: `${courseTitle.trim()} (${courseLevel} Level)`,
          courseLevel,
          percentage: Number(percentage) || 0,
          grade: grade || 'Gold',
          foundersName: founderName.trim() || 'Founder',
          founderDesignation: 'Founder & Chancellor',
          founderSignature: founderSignature.trim() || 'Arvind Mocosart',
          cofounderName: cofounderName.trim() || 'Co-Founder',
          cofounderDesignation: 'Co-Founder & Operations Director',
          cofounderSignature: cofounderSignature.trim() || 'Sanjana Rao',
          description: notes.trim() || `Has successfully completed ${courseLevel} level curriculum with verified course percentage of ${percentage}%.`,
          issuedAt: completionDate || now,
          certificateNumber: generatedCertNum,
          status: 'generated'
        };

        await addDoc(collection(db, 'certificates'), certRecord);

        // Notify user if UID found
        if (matchingUser) {
          await addDoc(collection(db, 'notifications'), {
            targetUserId: matchingUser.uid,
            title: `Course Certificate Issued: ${courseTitle}`,
            message: `Congratulations! Your official verified certificate for ${courseTitle} (${courseLevel} Level) with ${percentage}% score has been issued by administration.`,
            type: 'success',
            createdAt: now
          });
        }
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save learning record:", err);
      alert(`Error saving record: ${err?.message || 'Check database connection'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete learning record for "${name}" permanently?`)) return;
    try {
      await deleteDoc(doc(db, 'student_learning', id));
      setFeedback(`Record for "${name}" deleted.`);
      onRefresh();
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  // Filtered list
  const filtered = studentLearnings.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.certificateNumber && item.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = filterLevel === 'all' || item.courseLevel === filterLevel;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Download Report with proper, neat alignment
  const handleDownloadPDFReport = () => {
    const headers = ['Student Name', 'Email', 'Course Title', 'Level', 'Percentage', 'Status', 'Verified Cert No', 'Issue Date'];
    const rows = filtered.map(item => [
      item.studentName,
      item.studentEmail || '-',
      item.courseTitle,
      item.courseLevel || 'Standard',
      `${item.percentage}%`,
      item.status,
      item.certificateIssued ? (item.certificateNumber || 'Yes') : 'No',
      item.completionDate || new Date(item.createdAt).toLocaleDateString()
    ]);
    exportTableToPDF('Mocosart - Student Learning, Course Level & Verified Certificates Dossier', headers, rows, 'student_learning_verified_certs');
  };

  const handleDownloadCSVReport = () => {
    const headers = ['Student Name', 'Email', 'Phone', 'Course Title', 'Level', 'Percentage', 'Status', 'Certificate Issued', 'Certificate Number', 'Grade', 'Founder Name', 'Co-Founder Name', 'Date'];
    const rows = filtered.map(item => [
      item.studentName,
      item.studentEmail,
      item.studentPhone || '',
      item.courseTitle,
      item.courseLevel,
      `${item.percentage}%`,
      item.status,
      item.certificateIssued ? 'Yes' : 'No',
      item.certificateNumber || '',
      item.grade || '',
      item.founderName || '',
      item.cofounderName || '',
      item.completionDate || item.createdAt
    ]);
    exportTableToCSV('student_learning_records', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-serif">
                Student Learning & Verified Certificates Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Admin manual entry for student learning progression, course levels, percentages, and verified accreditation certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDFReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
            title="Download aligned PDF ledger"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Download Aligned PDF</span>
          </button>
          <button
            onClick={handleDownloadCSVReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            id="admin-add-student-learning-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Manual Enter Student Record</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-white/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Learners</span>
          <p className="text-2xl font-bold text-slate-900 font-serif mt-1">{studentLearnings.length}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Certificates</span>
          <p className="text-2xl font-bold text-emerald-700 font-serif mt-1">
            {studentLearnings.filter(s => s.certificateIssued).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Course %</span>
          <p className="text-2xl font-bold text-teal-700 font-serif mt-1">
            {studentLearnings.length > 0 
              ? Math.round(studentLearnings.reduce((acc, c) => acc + (c.percentage || 0), 0) / studentLearnings.length) 
              : 0}%
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certified Status</span>
          <p className="text-2xl font-bold text-blue-700 font-serif mt-1">
            {studentLearnings.filter(s => s.status === 'Certified').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, course title or certificate no..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Certified">Certified</option>
          </select>
        </div>
      </div>

      {/* Table of Records */}
      <div className="rounded-2xl glass-panel border border-white/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Details</th>
                <th className="px-4 py-3">Course & Level</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified Cert</th>
                <th className="px-4 py-3">Signatures Entered</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {item.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.studentName}</p>
                          <p className="text-[11px] text-slate-500">{item.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{item.courseTitle}</span>
                      <div className="mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.courseLevel === 'Master' ? 'bg-purple-100 text-purple-800' :
                          item.courseLevel === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                          item.courseLevel === 'Intermediate' ? 'bg-teal-100 text-teal-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.courseLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 font-mono text-sm">{item.percentage}%</span>
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Certified' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Completed' ? 'bg-teal-100 text-teal-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.certificateIssued ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                          <p className="font-mono text-[10px] text-slate-500">{item.certificateNumber}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Issued</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      <div>Founder: <b className="text-slate-800">{item.founderName || 'Manual entry pending'}</b></div>
                      <div>Co-Founder: <b className="text-slate-800">{item.cofounderName || 'Manual entry pending'}</b></div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {item.completionDate || new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Edit manual entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.studentName)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No student learning records found.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Manual Enter Student Record" to record student progress and issue verified certificates.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="rounded-3xl glass-panel bg-white border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif">
                    {editingItem ? 'Edit Student Learning & Certificate Record' : 'Manual Entry: Student Learning & Verified Certificate'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Enter student progression, course level, percentage, and verified certificate details manually.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Quick Select User (Optional helper) */}
              {users.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Optional: Prefill from Registered Student Directory
                  </label>
                  <select
                    onChange={(e) => handleSelectUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select a registered student or enter manually below --</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student Details Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Student Identity & Contact</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Student Email Address</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Student Phone / Mobile</label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Course Progression & Level Section */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Course Level & Manually Entered Percentage</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Course Title *</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. Master React, Node.js & Cloud DevOps"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Course Level *</label>
                    <select
                      value={courseLevel}
                      onChange={(e) => setCourseLevel(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced Level</option>
                      <option value="Master">Master Level</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Manual Percentage (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => setPercentage(Number(e.target.value))}
                        required
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Learning Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Certified">Certified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Completion / Issue Date</label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Award Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Silver">Silver Grade (70-79%)</option>
                      <option value="Gold">Gold Grade (80-89%)</option>
                      <option value="Diamond">Diamond Grade (90-100%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Verified Certificate Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Verified Certificate Details</span>
                  </h4>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={certificateIssued}
                      onChange={(e) => setCertificateIssued(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Issue Verified Certificate</span>
                  </label>
                </div>

                {certificateIssued && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Certificate Number / ID</label>
                      <input
                        type="text"
                        value={certificateNumber}
                        onChange={(e) => setCertificateNumber(e.target.value)}
                        placeholder="MOC-VLC-123456"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* ONLY Founder and Co-Founder Signatures - Manually Entered by Admin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Founder Signature Box */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Founder Signature (Manual Entry)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Founder Name</label>
                          <input
                            type="text"
                            value={founderName}
                            onChange={(e) => setFounderName(e.target.value)}
                            placeholder="e.g. Dr. Arvind Mocosart"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Founder Signature Text / Script</label>
                          <input
                            type="text"
                            value={founderSignature}
                            onChange={(e) => setFounderSignature(e.target.value)}
                            placeholder="e.g. Arvind Mocosart (cursive render)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-serif italic text-slate-900 bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Co-Founder Signature Box */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <PenTool className="w-3.5 h-3.5 text-teal-600" />
                          <span>Co-Founder Signature (Manual Entry)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Co-Founder Name</label>
                          <input
                            type="text"
                            value={cofounderName}
                            onChange={(e) => setCofounderName(e.target.value)}
                            placeholder="e.g. Sanjana Rao"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Co-Founder Signature Text / Script</label>
                          <input
                            type="text"
                            value={cofounderSignature}
                            onChange={(e) => setCofounderSignature(e.target.value)}
                            placeholder="e.g. Sanjana Rao (cursive render)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-serif italic text-slate-900 bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes / Remarks */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">Administrative Notes / Curriculum Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Official accreditation notes..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingItem ? 'Update Learning Record' : 'Save & Publish Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
