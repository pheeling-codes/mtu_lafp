'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, Shield } from 'lucide-react';

type UserRole = 'STUDENT' | 'ADMIN';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
      // Call server API route (bypasses RLS with service role key)
      const requestBody = {
        email,
        password,
        selected_role: role,
      };


      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Role validated - redirect to dashboard
      // The server already set the session cookie
      window.location.href = role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="w-10 h-10 text-[#2563EB]" />
          <span className="text-2xl font-bold text-slate-900">MTU Portal</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  role === 'STUDENT'
                    ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  role === 'ADMIN'
                    ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-[#2563EB] hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#2563EB] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2025 MTU Centralized Lost and Found Portal
        </p>
      </div>
    </div>
  );
}
