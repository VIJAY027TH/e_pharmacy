import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Activity, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      alert('Registration successful! Please login with your account.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-3xl shadow-sm border border-warm-200/60">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5"><span className="brand-mark"><Activity className="h-5 w-5" /><span className="brand-cross">+</span></span></div>
        <p className="text-sm font-bold tracking-tight text-sage-700 mb-2">PharmaVital</p>
        <h2 className="text-2xl font-bold text-warm-900">Create your account</h2>
        <p className="text-sm text-warm-600 mt-1">Create an account to manage your care and orders.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Full Name</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <User className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Email Address</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Mail className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Password</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Lock className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Phone Number</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Phone className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-555-0199"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Delivery Address</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <MapPin className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Health Street, City"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sage-600 text-white font-bold py-3.5 rounded-xl hover:bg-sage-700 transition shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          {loading ? 'Registering...' : 'Complete Registration'} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-warm-600">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-sage-600 hover:text-sage-700">
          Sign In
        </Link>
      </div>
    </div>
  );
};
