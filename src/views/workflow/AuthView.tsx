/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from '../../lib/firebase';
import { Lock, Mail, User, ArrowRight, Check, AlertCircle, Sparkles, Shield, Zap, Radio } from 'lucide-react';
import { TeamEmblem } from '../../components/TeamEmblem';

export const AuthView: React.FC = () => {
  const { user, updateUserName, loginUserSession, teams } = useAuction();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle();
      setLoading(false);
      if (res.success && res.user) {
        if (res.user.displayName) updateUserName(res.user.displayName);
        const authedUser = {
          ...user,
          id: res.user.uid,
          name: res.user.displayName || user.name || 'Franchise Director',
          email: res.user.email || user.email || 'director@ipl2027.com',
          isAuthenticated: true,
        };
        loginUserSession(authedUser);
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Google authentication was cancelled or interrupted.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Password reset link sent to your email address.');
      } else {
        setErrorMsg(res.error || 'Failed to send reset email.');
      }
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name or director title.');
        setLoading(false);
        return;
      }
      const res = await registerWithEmail(email, password, displayName);
      setLoading(false);
      if (res.success && res.user) {
        updateUserName(displayName);
        const updatedUser = {
          ...user,
          id: res.user.uid,
          name: displayName,
          email: email,
          isAuthenticated: true,
        };
        loginUserSession(updatedUser);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
      return;
    }

    // Default: Sign In
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success && res.user) {
      const updatedUser = {
        ...user,
        id: res.user.uid,
        name: res.user.displayName || email.split('@')[0],
        email: email,
        isAuthenticated: true,
      };
      loginUserSession(updatedUser);
    } else {
      setErrorMsg(res.error || 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D1B] text-[#F5F4FF] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Background Floodlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#A78BFA]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00D6D0]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Split-Screen Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-[#11182B] border border-[#202944] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 backdrop-blur-md">
        
        {/* LEFT COLUMN: Luxury Sports Technology Showcase */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#171D35] via-[#11182B] to-[#090D1B] p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#202944] relative overflow-hidden">
          {/* Subtle decorative stadium grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(245, 244, 255, 0.5) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div>
            {/* Brand Logo & Emblem */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8BD68] to-[#cba04a] text-[#090D1B] flex items-center justify-center font-extrabold text-xl shadow-lg shadow-[#E8BD68]/20 ring-1 ring-[#E8BD68]/50">
                🏏
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8BD68] block">
                  OFFICIAL AUCTION PORTAL
                </span>
                <span className="font-heading font-extrabold text-lg text-[#F5F4FF] tracking-tight">
                  IPL AUCTION ARENA 2027
                </span>
              </div>
            </div>

            {/* Tagline & Pitch */}
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#F5F4FF] leading-tight tracking-tight mt-6">
              BUILD YOUR TEAM.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#00D6D0] to-[#E8BD68]">
                OWN THE AUCTION.
              </span>
            </h2>

            <p className="mt-4 text-sm text-[#A5A9C3] leading-relaxed">
              Step into the executive war room. Authenticate your franchise credentials to unlock real-time bidding,
              BCCI squad governance, and multi-user live room synchronization.
            </p>

            {/* Feature Bullets */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F5F4FF]">Real-Time Firebase Cloud Engine</h4>
                  <p className="text-[11px] text-[#A5A9C3]">Sub-millisecond bid synchronization across all tables.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00D6D0]/10 border border-[#00D6D0]/20 flex items-center justify-center text-[#00D6D0] shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F5F4FF]">Official BCCI Retention & RTM Tiers</h4>
                  <p className="text-[11px] text-[#A5A9C3]">₹18 Cr, ₹14 Cr, ₹11 Cr, ₹4 Cr contract caps enforced.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8BD68]/10 border border-[#E8BD68]/20 flex items-center justify-center text-[#E8BD68] shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F5F4FF]">Broadcast-Grade Live Arena</h4>
                  <p className="text-[11px] text-[#A5A9C3]">15s countdown timer, audio gavel, and live statistics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Franchise Mini Bar */}
          <div className="mt-8 pt-6 border-t border-[#202944]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A9C3] block mb-2.5">
              10 Official Franchises Standing By
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {teams.slice(0, 8).map((t) => (
                <div key={t.id} title={t.name} className="shrink-0 p-1 rounded-lg bg-[#202944]/50 border border-[#202944]">
                  <TeamEmblem code={t.code} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Forms */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#090D1B]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#11182B] border border-[#202944] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#A78BFA] text-[#090D1B] shadow-sm font-extrabold'
                  : 'text-[#A5A9C3] hover:text-[#F5F4FF]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#A78BFA] text-[#090D1B] shadow-sm font-extrabold'
                  : 'text-[#A5A9C3] hover:text-[#F5F4FF]'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'forgot'
                  ? 'bg-[#A78BFA] text-[#090D1B] shadow-sm font-extrabold'
                  : 'text-[#A5A9C3] hover:text-[#F5F4FF]'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 mb-4 rounded-xl bg-[#FF5C75]/15 border border-[#FF5C75] text-[#F5F4FF] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF5C75] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-4 rounded-xl bg-[#20C997]/15 border border-[#20C997] text-[#F5F4FF] text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-[#20C997] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In CTA */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#171D35] hover:bg-[#202944] border border-[#202944] hover:border-[#A78BFA]/50 text-[#F5F4FF] text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md mb-5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-[#202944] w-full" />
                <span className="bg-[#090D1B] px-3 text-[10px] uppercase font-bold text-[#A5A9C3] tracking-wider">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* Email Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                  Franchise Director Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A5A9C3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Parth Jindal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#F5F4FF] focus:border-[#A78BFA] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A5A9C3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@iplfranchise.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#F5F4FF] focus:border-[#A78BFA] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A5A9C3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#F5F4FF] focus:border-[#A78BFA] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Verifying...'
                  : mode === 'signin'
                  ? 'Sign In to War Room'
                  : mode === 'register'
                  ? 'Create Director Account'
                  : 'Send Reset Instructions'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom helper */}
          <div className="mt-5 text-center">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-[#A5A9C3] hover:text-[#A78BFA] transition-colors cursor-pointer"
              >
                Forgot your password?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-[#A5A9C3] hover:text-[#A78BFA] transition-colors cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            )}
          </div>

          {/* Instant Evaluation / Demo Login option */}
          <div className="mt-5 pt-5 border-t border-[#202944] text-center">
            <button
              type="button"
              onClick={() => {
                const demoUser = {
                  ...user,
                  id: 'usr_director_' + Math.random().toString(36).substring(2, 7),
                  name: 'Franchise Director (Demo)',
                  email: 'director@ipl2027.com',
                  isAuthenticated: true,
                };
                loginUserSession(demoUser);
              }}
              className="text-xs font-semibold text-[#00D6D0] hover:text-[#00D6D0]/80 cursor-pointer flex items-center justify-center gap-1.5 mx-auto py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Enter as Franchise Director (Demo / QA Mode)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
