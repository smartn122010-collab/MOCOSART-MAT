import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  User, 
  Users, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';
import { AppNotification, UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface AdminNotificationsProps {
  notifications: AppNotification[];
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  users,
  onRefresh
}) => {
  const [targetUserId, setTargetUserId] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'alert'>('info');
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // "Send the Notification differnent user any one user click to send the message and management for anywhere on text formate to send the separate user."
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSentNotice(null);

    try {
      await addDoc(collection(db, 'notifications'), {
        targetUserId,
        title,
        message,
        type,
        createdAt: new Date().toISOString()
      });

      setSentNotice(`Notification successfully delivered to ${targetUserId === 'all' ? 'All Registered Users' : 'Selected Candidate'}!`);
      setTitle('');
      setMessage('');
      onRefresh();
    } catch (err) {
      console.error("Failed to send notification:", err);
      alert("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getUserDisplayName = (uid: string) => {
    if (uid === 'all') return 'All Users (Broadcast)';
    const found = users.find(u => u.uid === uid);
    return found ? `${found.displayName} (${found.email})` : uid;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 font-serif">
          Notification Broadcast & Direct Messaging
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Send text-formatted notifications to individual students or broadcast system-wide academic alerts.
        </p>
      </div>

      {sentNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sentNotice}</span>
          </div>
          <button onClick={() => setSentNotice(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Two Columns: Compose Form and Quick User Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-white/80 shadow-md">
          <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Compose Message to Student / Cohort</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Recipient</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
              >
                <option value="all">📢 All Users (System Broadcast)</option>
                {users.map(u => (
                  <option key={u.uid} value={u.uid}>
                    👤 {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update for Google Meet Cohort"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Message Severity</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                >
                  <option value="info">Info (Standard Announcement)</option>
                  <option value="success">Success (Approval / Celebration)</option>
                  <option value="alert">Alert (Urgent Action Required)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notification Body (Text Formatted)
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter text message for user notification inbox..."
                className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Dispatching...' : 'Send Notification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Click User to Message */}
        <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Tap to Message User</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any candidate below to target them directly:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setTargetUserId('all')}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  targetUserId === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">Broadcast to Everyone</span>
              </button>

              {users.map(u => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => setTargetUserId(u.uid)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    targetUserId === u.uid
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <div className="truncate">
                    <span className="block font-medium truncate">{u.displayName}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Notifications Log */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-serif">
          Notification History Log ({notifications.length})
        </h3>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-xl bg-white/70 border border-slate-200 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    To: {getUserDisplayName(n.targetUserId)}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{n.message}</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteNotification(n.id)}
                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                title="Remove Notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-xs text-slate-400 py-3 text-center">No notifications broadcasted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
