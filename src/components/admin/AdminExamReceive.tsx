import React, { useState } from 'react';
import { 
  FileCheck, 
  Download, 
  CheckCircle, 
  Clock, 
  Mail, 
  Search, 
  User, 
  MapPin, 
  PlayCircle,
  BellRing,
  Trash2
} from 'lucide-react';
import { ExamRegistration } from '../../types';
import { db } from '../../firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminExamReceiveProps {
  registrations: ExamRegistration[];
  onRefresh: () => void;
}

export const AdminExamReceive: React.FC<AdminExamReceiveProps> = ({
  registrations,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const filteredRegistrations = registrations.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveRegistration = async (reg: ExamRegistration) => {
    setApprovingId(reg.id);
    try {
      // 1. Update registration in Firestore
      const regRef = doc(db, 'exam_registrations', reg.id);
      await updateDoc(regRef, {
        approved: true,
        status: reg.status === 'completed' ? 'completed' : 'registered'
      });

      // 2. "click to approve button click send to notifaction on user on seprated user"
      await addDoc(collection(db, 'notifications'), {
        targetUserId: reg.userId,
        title: `Exam Application Approved: ${reg.examTitle}`,
        message: `Dear ${reg.userName}, your registration for "${reg.examTitle}" has been officially verified & approved by the examination board. You can now access your test/venue map link.`,
        type: 'success',
        createdAt: new Date().toISOString()
      });

      onRefresh();
    } catch (err) {
      console.error("Failed to approve registration:", err);
      alert("Failed to approve registration.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exam_registrations', id));
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
    onRefresh();
  };

  // "download the all the user details on PDF"
  const handleDownloadPDF = () => {
    const headers = ['Candidate Name', 'Email', 'Exam Title', 'Amount', 'Payment ID', 'Status', 'Score', 'Date'];
    const rows = filteredRegistrations.map(r => [
      r.userName,
      r.userEmail,
      r.examTitle,
      `INR ${r.amount}`,
      r.paymentId || 'N/A',
      r.approved ? 'Approved' : 'Pending',
      r.examScore !== undefined ? `${r.examPercentage}%` : 'Not Taken',
      new Date(r.registeredAt).toLocaleDateString()
    ]);

    exportTableToPDF('Mocosart - Exam Registrations & Applicants Report', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Exam Register Receive Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review incoming candidate registrations, verify credentials, approve seats, and export records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-exam-recv-export-pdf"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Applicants (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, email, exam..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Showing {filteredRegistrations.length} Applications
        </span>
      </div>

      {/* Registrations Table */}
      <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Candidate Details</th>
                <th className="p-3.5">Exam Curriculum</th>
                <th className="p-3.5">Fee & Payment ID</th>
                <th className="p-3.5">Exam Result</th>
                <th className="p-3.5">Approval State</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.map((reg) => {
                const isApproving = approvingId === reg.id;
                return (
                  <tr key={reg.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{reg.userName}</div>
                      <div className="text-[11px] text-slate-500">{reg.userEmail}</div>
                      {reg.userPhone && <div className="text-[10px] text-slate-400">{reg.userPhone}</div>}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      <div>{reg.examTitle}</div>
                      <div className="text-[10px] text-slate-400">Reg: {new Date(reg.registeredAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-emerald-800 font-serif">₹{reg.amount.toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">{reg.paymentId || 'Verified'}</div>
                    </td>
                    <td className="p-3.5">
                      {reg.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Passed ({reg.examPercentage}%)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Pending test</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {reg.approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          Awaiting Approval
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!reg.approved ? (
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={() => handleApproveRegistration(reg)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isApproving ? 'Approving...' : 'Approve'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">Approved</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Registration Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No exam registration records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
