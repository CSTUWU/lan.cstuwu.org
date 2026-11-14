'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkAdminAuth, setAdminAuth } from '@/lib/storage';
import { api } from '@/lib/api';
import { Shield, Lock, User, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';

export default function AdminLoginView() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    if (checkAdminAuth()) {
      window.location.href = '/admin/dashboard';
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const user = username.trim();
    const pass = password.trim();

    if (!user || !pass) {
      setErrorMessage('Please provide both username and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.auth.login(user, pass);
      if (res.success) {
        setAdminAuth(true);
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 300);
        return;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid username or passphrase.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-military-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-olive/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-card border border-olive/60 text-sand clip-tactical shadow-[0_2px_14px_rgba(24,30,24,0.7)] mb-3">
            <Shield className="w-7 h-7 text-sand" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-mutedText">
            UVA WELLASSA UNIVERSITY OF SRI LANKA
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
            CST LAN <span className="text-sand">TAC-OPS</span> PORTAL
          </h1>
          <p className="text-xs font-mono text-mutedText mt-0.5">
            Internal Tournament Management &amp; Control Center
          </p>
        </div>

        <div className="bg-card/95 border border-gunmetal p-6 sm:p-8 backdrop-blur-md shadow-2xl relative">
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-olive" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sand" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-olive" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sand" />

          {isSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/80 mb-5 flex items-center gap-2.5 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AUTHENTICATION APPROVED. Redirecting to command center...</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-mutedText uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>OPERATOR USERNAME</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-mutedText absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter username"
                  required
                  autoComplete="off"
                  className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-sand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-mutedText uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>SECURITY PASSPHRASE</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-mutedText absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter password"
                  required
                  autoComplete="off"
                  className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-sand"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full py-3 px-4 bg-olive hover:bg-olive-light text-black font-bold border border-olive-light/50 text-xs font-mono uppercase font-black tracking-wider transition-all flex items-center justify-center gap-2 clip-tactical cursor-pointer mt-4 shadow-[0_2px_12px_rgba(37,44,36,0.8)]"
            >
              <span>{isSuccess ? 'ENTERING DASHBOARD...' : isSubmitting ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs font-mono text-mutedText hover:text-tacticalWhite transition-colors">
              ← Return to Public Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

