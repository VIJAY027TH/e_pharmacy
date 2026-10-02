import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Bell, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-warm-600">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-900">Notifications</h1>
          <p className="text-sm text-warm-600 mt-1">Updates regarding your orders, prescriptions, and refills</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-warm-200/60 shadow-sm space-y-2">
          <Bell className="h-10 w-10 text-warm-300 mx-auto" />
          <p className="text-sm text-warm-600 font-medium">You have no notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                n.isRead ? 'bg-white border-warm-200/60' : 'bg-sage-50/50 border-sage-200 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-sage-700 uppercase tracking-wider">{n.type}</span>
                <h4 className="font-bold text-warm-900 text-sm">{n.title}</h4>
                <p className="text-xs text-warm-700 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-warm-400 block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-xs font-semibold text-sage-700 hover:underline shrink-0 bg-white border border-sage-200 px-3 py-1 rounded-lg"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
