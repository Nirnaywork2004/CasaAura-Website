import React, { useState, useEffect } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    login, 
    register 
  } = useCartWishlist();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setSuccessMsg(null);
      setShowForgotNotice(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  // Validation functions
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isValidPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Frontend Validations
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!phone.trim() || !isValidPhone(phone)) {
      setError('Please provide a valid phone number (minimum 10 digits).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password, phone.trim());
      if (!res.success) {
        setError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !isValidEmail(loginEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!loginPassword) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (!res.success) {
        setError(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'customer' | 'admin') => {
    setLoading(true);
    setError(null);
    const demoEmail = role === 'admin' ? 'admin@casaaura.in' : 'priya@casaaura.in';
    const demoPass = 'Pass@1234';
    
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);

    const res = await login(demoEmail, demoPass);
    if (!res.success) {
      const regRes = await register(
        role === 'admin' ? 'Aura Administrator' : 'Priya Sharma',
        demoEmail,
        demoPass,
        '+91 98765 43210'
      );
      if (!regRes.success) {
        setError('Could not complete demo sign in.');
      }
    }
    setLoading(false);
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-md bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10 p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#666666] hover:text-[#1A1A1A] hover:bg-[#EFEBE1] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-11 h-11 mx-auto rounded-full bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            C
          </div>
          <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">
            {authModalMode === 'login' ? 'Sign In to CasaAura' : 'Create an Account'}
          </h3>
          <p className="text-xs text-[#666666]">
            {authModalMode === 'login' 
              ? 'Access your orders, saved addresses, and personal wishlist.' 
              : 'Join the CasaAura community for curated decor and seamless checkout.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-[#EFEBE1] p-1 rounded-xl mb-5 border border-[#E5E1D8]">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => {
              setAuthModalMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-[#1A1A1A] shadow-xs'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-tab-register"
            onClick={() => {
              setAuthModalMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              authModalMode === 'register'
                ? 'bg-white text-[#1A1A1A] shadow-xs'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ---------------- REGISTER FORM ---------------- */}
        {authModalMode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="create-account-submit-btn"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <span>Creating Account in MongoDB...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-xs text-[#666666] hover:text-[#1A1A1A] font-medium"
              >
                Already have an account? <span className="text-[#1A1A1A] font-bold underline underline-offset-2">Login</span>
              </button>
            </div>
          </form>
        ) : (
          /* ---------------- LOGIN FORM ---------------- */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] text-[#8C7E6A] hover:text-[#1A1A1A] underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            {showForgotNotice && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D8] text-[11px] text-[#666666] space-y-1">
                <p className="font-semibold text-[#1A1A1A]">Password Reset Assistance</p>
                <p>To reset your credentials, email support@casaaura.in or sign in using quick demo credentials below.</p>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <span>Authenticating with bcrypt & JWT...</span>
              ) : (
                <>
                  <span>Sign In to CasaAura</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-xs text-[#666666] hover:text-[#1A1A1A] font-medium"
              >
                New to CasaAura? <span className="text-[#1A1A1A] font-bold underline underline-offset-2">Create Account</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Sign-In Section */}
        <div className="mt-6 pt-4 border-t border-[#E5E1D8]">
          <p className="text-[10px] font-bold text-[#8C7E6A] uppercase tracking-widest text-center mb-2.5">
            Quick One-Click Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="quick-demo-customer-btn"
              onClick={() => handleQuickDemoLogin('customer')}
              className="py-2 px-2.5 rounded-lg bg-white hover:bg-[#EFEBE1] border border-[#E5E1D8] text-[11px] font-semibold text-[#333333] transition-colors flex items-center justify-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#8C7E6A]" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              id="quick-demo-admin-btn"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-2.5 rounded-lg bg-white hover:bg-[#EFEBE1] border border-[#E5E1D8] text-[11px] font-semibold text-[#333333] transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C7E6A]" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
