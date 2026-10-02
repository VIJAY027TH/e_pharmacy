import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    authService
      .getProfile()
      .then((profile) => {
        if (isMounted && profile) {
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            password: '',
          });
          updateUser(profile);
        }
      })
      .catch(() => {
        if (isMounted && user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            password: '',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setFormData((prev) => ({ ...prev, password: '' }));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-page profile-page max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-warm-900">Your health profile</h1>
        <p className="text-sm text-warm-600 mt-1">Manage your personal details and default delivery address.</p>
      </div>

      {message && (
        <div className="bg-sage-50 border border-sage-200 text-sage-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-sage-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-warm-200/60 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Full Name</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <User className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Email Address</label>
          <div className="flex items-center px-3 bg-warm-100 rounded-xl border border-warm-200 cursor-not-allowed">
            <Mail className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full bg-transparent py-3 text-sm text-warm-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Phone Number</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Phone className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Default Address</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <MapPin className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">New Password (Optional)</label>
          <input
            type="password"
            placeholder="Leave blank to keep existing password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-3 bg-warm-50/50 rounded-xl border border-warm-200 text-sm outline-none focus:border-sage-500 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sage-600 text-white font-bold py-3.5 rounded-xl hover:bg-sage-700 transition shadow-sm flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" /> {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};
