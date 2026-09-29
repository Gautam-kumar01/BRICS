'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  ExternalLink,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithCredentials } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your official government email and security password.');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithCredentials(email.trim(), password);

      if (!result.success) {
        setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      const authenticatedUser = result.user;
      setSuccessMsg(`Welcome, ${authenticatedUser?.name}! Redirecting to your assigned workspace...`);

      setTimeout(() => {
        if (authenticatedUser?.role === 'super_admin') {
          router.push('/governance');
        } else if (authenticatedUser?.role === 'district_collector') {
          router.push('/operations');
        } else if (authenticatedUser?.role === 'department_engineer') {
          router.push('/operations');
        } else {
          router.push('/operations');
        }
      }, 700);

    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-stone-900">
      
      {/* Top GovTech Security Shield Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2D180F] text-orange-400 border border-orange-500/40 text-xs font-mono font-bold shadow-md">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
          <span>BRICS CivicPulse • Sovereign Governance Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-950 tracking-tight">
          Official Government Authority Sign-In
        </h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
          Restricted municipal and sovereign access for Central Super Administrators, District Magistrates, and Municipal Infrastructure Authorities.
        </p>
      </div>

      {/* Citizen Zero-Login Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-900">Public Citizen Access Notice</div>
            <p className="text-emerald-800 text-xs mt-0.5">
              Citizens <strong>never need to log in or create an account</strong>. Submit grievances, record voice notes, and track reference codes directly.
            </p>
          </div>
        </div>
        <Link
          href="/citizen"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-all shadow-sm hover:shadow active:scale-95 flex items-center space-x-1.5"
        >
          <span>Submit Grievance as Citizen (No Login)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Centered Sovereign Authentication Card */}
      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border-2 border-orange-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        
        <div className="border-b border-orange-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg text-stone-900">
                Government Credentials Verification
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-orange-800 bg-orange-100/80 px-2.5 py-1 rounded-full border border-orange-300">
              Server-Side RBAC
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1.5">
            Public self-registration is strictly disabled. Official accounts and role permissions are provisioned exclusively by Central Governance Super Administrators.
          </p>
        </div>

        {/* Error / Success Feedback Banners */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Access Restriction Alert</span>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            {errorMsg.includes('activation link') && (
              <div className="pt-2 border-t border-red-200 flex justify-end">
                <Link 
                  href="/set-password"
                  className="inline-flex items-center space-x-1 font-bold text-red-700 hover:text-red-900 underline"
                >
                  <span>Go to Account Activation Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Official Government Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. dm.jehanabad@bihar.gov.in"
              required
              className="w-full px-4 py-3 rounded-xl bg-orange-50/40 border-2 border-orange-200 focus:border-orange-500 focus:bg-white text-stone-900 font-mono text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              Must match an authorized official profile provisioned on the sovereign switchboard.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-800">
                Security Access Key / Password
              </label>
              <Link
                href="/set-password"
                className="text-[11px] font-bold text-orange-700 hover:text-orange-900 hover:underline inline-flex items-center space-x-1"
              >
                <span>Invited? Set password</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter your security access password"
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-orange-50/40 border-2 border-orange-200 focus:border-orange-500 focus:bg-white text-stone-900 font-mono text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-md cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Sovereign Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Official Workspace</span>
              </>
            )}
          </button>
        </form>

        {/* Invitation Onboarding Banner */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <span className="text-[11px] text-stone-500">
            Received an official government invitation dispatch?
          </span>
          <Link
            href="/set-password"
            className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-bold text-[11px] transition-colors inline-flex items-center space-x-1"
          >
            <span>Activate via Token</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* Security Compliance Guarantee */}
      <div className="max-w-xl mx-auto w-full p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1.5 text-center sm:text-left flex items-start space-x-3">
        <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5 hidden sm:block" />
        <p className="text-[11px] leading-relaxed">
          <strong>Sovereign Territory Isolation:</strong> Officials authenticate strictly into their provisioned district or departmental jurisdiction. Unrecognized email addresses are blocked with immutable audit logs.
        </p>
      </div>

    </div>
  );
}
