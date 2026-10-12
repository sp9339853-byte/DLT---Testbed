import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, FlaskConical, Zap, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { NotificationItem } from '../types';

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load notifications
  useEffect(() => {
    let mounted = true;
    api.getNotifications().then((data) => {
      if (mounted) {
        setNotifications(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const interval = setInterval(() => {
      api.getNotifications().then((data) => {
        if (mounted) setNotifications(data);
      }).catch(() => {});
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'benchmark':
        return <FlaskConical className="w-4 h-4 text-primary-interaction" />;
      case 'stress':
        return <Zap className="w-4 h-4 text-status-warning" />;
      case 'report':
        return <FileText className="w-4 h-4 text-status-success" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-secondary transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary-interaction text-[10px] font-semibold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-warm border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary-interaction">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-interaction hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
            {loading && notifications.length === 0 && (
              <div className="p-8 text-center text-text-muted flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-interaction" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center text-text-secondary">
                <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-text-primary mb-1">No notifications</p>
                <p className="text-xs text-text-muted">You&apos;re all caught up with your experiments.</p>
              </div>
            )}

            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  item.read ? 'hover:bg-surface-secondary/60 bg-transparent' : 'bg-primary/[0.03] hover:bg-primary/[0.07]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
                  {getTypeIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className={`text-xs font-semibold truncate ${item.read ? 'text-text-primary' : 'text-primary-interaction'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-text-muted shrink-0 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{item.message}</p>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0 self-center">
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-primary-interaction mb-1" title="Unread" />
                  )}
                  {item.link && (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-surface-secondary/40 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/app/settings?tab=notifications');
              }}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Configure notification preferences →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
