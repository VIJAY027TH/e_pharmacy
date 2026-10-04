import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/medicines');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-sm border border-warm-200/60">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5"><span className="brand-mark"><Activity className="h-5 w-5" /><span className="brand-cross">+</span></span></div>
        <p className="text-sm font-bold tracking-tight text-sage-700 mb-2">PharmaVital</p>
        <h2 className="text-2xl font-bold text-warm-900">Welcome back</h2>
        <p className="text-sm text-warm-600 mt-1">Sign in to continue to your PharmaVital account.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="flex items-center px-3.5 bg-warm-50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Mail className="h-5 w-5 text-warm-400 mr-2.5 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900 placeholder-warm-400 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-700 uppercase mb-1">Password</label>
          <div className="flex items-center px-3 bg-warm-50/50 rounded-xl border border-warm-200 focus-within:border-sage-500 focus-within:bg-white transition">
            <Lock className="h-5 w-5 text-warm-400 mr-2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent py-3 text-sm outline-none text-warm-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sage-600 text-white font-bold py-3.5 rounded-xl hover:bg-sage-700 transition shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-warm-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-sage-600 hover:text-sage-700">
          Register now
        </Link>
      </div>
    </div>
  );
};
