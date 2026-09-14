import React, { useState } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { UserProfile } from '../../types';
import { exportTableToPDF } from '../../utils/pdfExport';

interface AdminUserDetailsProps {
  users: UserProfile[];
}

export const AdminUserDetails: React.FC<AdminUserDetailsProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.phoneNumber && u.phoneNumber.includes(searchTerm)) ||
    (u.address && u.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // "download the all the user details on PDF"
  const handleDownloadPDF = () => {
    const headers = ['User Full Name', 'Gmail / Email', 'Mobile Phone', 'Age', 'Role', 'Subscription', 'Address'];
    const rows = filteredUsers.map(u => [
      u.displayName || 'N/A',
      u.email,
      u.phoneNumber || 'N/A',
      u.age || 'N/A',
      u.role?.toUpperCase() || 'STUDENT',
      u.subscriptionStatus === 'active' ? `Active (${u.subscriptionPlan})` : 'None',
      u.address || 'N/A'
    ]);

    exportTableToPDF('Mocosart - Registered Users Directory & Dossier', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            User Details & Student Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Institutional directory of all learners, verified candidate profiles, and platform administrators.
          </p>
        </div>

        <button
          id="admin-users-export-pdf"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download All Users (PDF)</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs font-medium text-slate-500">
          Total: {filteredUsers.length} Users
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl glass-panel border border-white/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Learner Profile</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Age & Address</th>
                <th className="p-3.5">Account Role</th>
                <th className="p-3.5">Membership Plan</th>
                <th className="p-3.5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-white/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.displayName || 'Learner')}`}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-400/40"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{u.displayName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{u.uid.substring(0, 10)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-600" />
                      <span>{u.email}</span>
                    </div>
                    {u.phoneNumber && (
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.phoneNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="text-slate-700">Age: <b>{u.age || '22'}</b></div>
                    <div className="text-slate-500 text-[11px] truncate max-w-[150px]">
                      {u.address || 'Address not listed'}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.subscriptionStatus === 'active' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold capitalize">
                        {u.subscriptionPlan} Plan
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Free Tier</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right text-slate-500 text-[11px]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users found matching search criteria.
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
