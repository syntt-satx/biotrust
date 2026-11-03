import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Award, FileQuestion, Megaphone } from 'lucide-react';
import { NotificationItem } from '../types/index.js';
import { api } from '../services/api.js';

interface NotificationCenterProps {
  onSelectLink?: (linkType: string, linkId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectLink }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const handleMarkRead = async (notifId: string) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'VERIFIED':
        return <Award className="w-4 h-4 text-[#2C5E3B]" />;
      case 'DISPUTED':
        return <ShieldAlert className="w-4 h-4 text-[#E65F2B]" />;
      case 'REQUEST_INFO':
        return <FileQuestion className="w-4 h-4 text-[#1C1B18]" />;
      case 'THREAT_UPDATE':
        return <Megaphone className="w-4 h-4 text-[#E65F2B]" />;
      default:
        return <Bell className="w-4 h-4 text-[#2C5E3B]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) loadNotifications();
        }}
        className="relative p-1.5 border border-[#1C1B18] bg-[#EFE9DF] hover:bg-[#1C1B18] hover:text-[#F9F6F0] rounded-full text-[#1C1B18] transition-colors cursor-pointer"
        title="Live Alerts & Broadcasts"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E65F2B] text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded-full border border-[#1C1B18]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 md:w-96 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[6px_6px_0px_#1C1B18] p-4 text-left">
            <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2C5E3B]" />
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#1C1B18]">
                  Alert Stream & Notifications
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#E65F2B] bg-[#EFE9DF] px-2 py-0.5 border border-[#1C1B18]">
                {unreadCount} UNREAD
              </span>
            </div>

            {loading && notifications.length === 0 ? (
              <p className="text-xs text-[#8C8476] py-4 text-center">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-[#8C8476] py-4 text-center italic">No active notifications.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.notificationId}
                    className={`p-2.5 text-xs border-2 border-[#1C1B18] transition-colors ${
                      n.readStatus 
                        ? 'bg-[#EFE9DF]' 
                        : 'bg-white shadow-[2px_2px_0px_#1C1B18] border-l-4 border-l-[#E65F2B]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#1C1B18]">
                        {getIcon(n.type)}
                        <span className="truncate">{n.title}</span>
                      </div>
                      {!n.readStatus && (
                        <button
                          onClick={() => handleMarkRead(n.notificationId)}
                          className="text-[10px] text-[#8C8476] hover:text-[#1C1B18] cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[#1C1B18] text-[11px] leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#8C8476]">
                      <span>{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.linkId && onSelectLink && (
                        <button
                          onClick={() => {
                            setOpen(false);
                            onSelectLink(n.linkType || 'record', n.linkId!);
                          }}
                          className="flex items-center gap-0.5 text-[#2C5E3B] font-bold hover:underline cursor-pointer"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
