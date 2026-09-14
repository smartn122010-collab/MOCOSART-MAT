import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, Clock, Trash2, ChevronRight, X, ArrowRight, RotateCcw } from 'lucide-react';
import { AppNotification, UserProfile } from '../../types';

interface NotificationViewProps {
  notifications: AppNotification[];
  currentUser: UserProfile | null;
  onMarkAllRead?: () => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  currentUser,
  onMarkAllRead
}) => {
  const storageKey = `dismissed_notifs_${currentUser?.uid || 'guest'}`;

  // Local state for dismissed notification IDs
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    } catch (e) {
      console.warn("Failed to persist dismissed notifications:", e);
    }
  }, [dismissedIds, storageKey]);

  // Filter notifications relevant to current user: 'all' or specific user uid AND not dismissed
  const activeNotifications = notifications
    .filter(n => n.targetUserId === 'all' || (currentUser && n.targetUserId === currentUser.uid))
    .filter(n => !dismissedIds.includes(n.id));

  // Clear all notification messages immediately without window.confirm (iframe safe)
  const handleClearAll = () => {
    if (activeNotifications.length === 0) return;
    const allActiveIds = activeNotifications.map(n => n.id);
    setDismissedIds(prev => [...new Set([...prev, ...allActiveIds])]);
    if (onMarkAllRead) onMarkAllRead();
  };

  // Remove individual notification
  const handleRemoveSingle = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  // Restore cleared notifications
  const handleRestoreCleared = () => {
    setDismissedIds([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Clear All Button */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Notifications & Announcements
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Official communications, payment confirmations, and course schedule updates. Slide any card to remove it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestoreCleared}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
              title="Restore cleared notifications"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore ({dismissedIds.length})</span>
            </button>
          )}

          {activeNotifications.length > 0 && (
            <>
              {onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Mark All Read
                </button>
              )}

              <button
                id="clear-all-notifications-btn"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Notifications</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeNotifications.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Showing {activeNotifications.length} message{activeNotifications.length > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1">
              <span>Tip: Slide right on any notification to remove it</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {activeNotifications.map((notif) => (
            <SlideToRemoveCard
              key={notif.id}
              notification={notif}
              onRemove={() => handleRemoveSingle(notif.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass-panel p-12 text-center border border-white/80 max-w-md mx-auto space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700 font-serif">No Notifications Right Now</h4>
          <p className="text-xs text-slate-500">
            You are all caught up! All notifications have been cleared. New exam approvals and receipts will appear here.
          </p>
          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestoreCleared}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
              <span>Restore Previously Cleared Notifications</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Slide-To-Remove Card Component
interface SlideCardProps {
  notification: AppNotification;
  onRemove: () => void;
}

const SlideToRemoveCard: React.FC<SlideCardProps> = ({ notification, onRemove }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const startXRef = useRef(0);
  const threshold = 120; // pixels to trigger remove

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    // Only allow sliding rightwards (or slight left)
    if (diff > 0) {
      setDragOffset(Math.min(diff, 280));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > threshold) {
      triggerRemove();
    } else {
      setDragOffset(0);
    }
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    if (diff > 0) {
      setDragOffset(Math.min(diff, 280));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > threshold) {
      triggerRemove();
    } else {
      setDragOffset(0);
    }
  };

  const triggerRemove = () => {
    setIsRemoving(true);
    setDragOffset(350);
    setTimeout(() => {
      onRemove();
    }, 250);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl select-none group">
      {/* Background reveal action when sliding */}
      <div className="absolute inset-0 bg-red-600 text-white rounded-2xl flex items-center justify-between px-6 font-bold text-xs">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 animate-bounce" />
          <span>Release to remove</span>
        </div>
        <button
          onClick={triggerRemove}
          className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] cursor-pointer"
        >
          Remove Now
        </button>
      </div>

      {/* Foreground Notification Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            if (dragOffset > threshold) triggerRemove();
            else setDragOffset(0);
          }
        }}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out',
          opacity: isRemoving ? 0 : 1
        }}
        className="relative z-10 p-4 rounded-2xl glass-card border border-white/90 shadow-sm flex items-start gap-3.5 bg-white cursor-grab active:cursor-grabbing hover:border-emerald-200 transition-colors"
      >
        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
          notification.type === 'success' 
            ? 'bg-emerald-100 text-emerald-700' 
            : notification.type === 'alert' 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-teal-100 text-teal-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : notification.type === 'alert' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 font-serif">
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerRemove();
                }}
                className="opacity-40 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                title="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {notification.message}
          </p>

          {/* Slide-to-remove indicator strip */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-slate-400 animate-pulse" />
              Slide right to remove
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerRemove();
              }}
              className="text-slate-400 hover:text-red-600 underline font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
