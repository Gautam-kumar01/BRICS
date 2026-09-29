'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SetPasswordPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [token, setToken] = useState<string>('');
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [officerDetails, setOfficerDetails] = useState<any>(null);

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (!tokenParam) {
        setIsValidating(false);
        setValidationError('No activation token found in URL. Please use the official invitation link provided by your administrator.');
        return;
      }
      setToken(tokenParam);
      validateToken(tokenParam);
    }
  }, []);

  async function validateToken(tokenToValidate: string) {
    setIsValidating(true);
    setValidationError(null);
    try {
      const res = await fetch(`/api/auth/validate-token?token=${encodeURIComponent(tokenToValidate)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token validation failed.');
      }
      setOfficerDetails(data);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid or expired invitation token.');
    } finally {
      setIsValidating(false);
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to set password.');
      }

      setIsSuccess(true);

      // Auto login
      if (data.user) {
        login(data.user);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error activating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 text-stone-900">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Header Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-900 text-xs font-mono font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Official Government Credential Setup</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-stone-900">
            Activate Official Account
          </h1>
          <p className="text-xs text-stone-600 font-medium max-w-sm mx-auto">
            Set your secure password to access your designated district and department governance console.
          </p>
        </div>

        {/* State 1: Validating Token */}
        {isValidating && (
          <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm text-center space-y-3">
            <Sparkles className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <div className="text-xs font-bold text-stone-700">Verifying Cryptographic Invitation Token...</div>
          </div>
        )}

        {/* State 2: Token Invalid Error */}
        {!isValidating && validationError && (
          <div className="p-6 rounded-3xl bg-red-50 border-2 border-red-200 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Invitation Verification Failed</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              {validationError}
            </p>
            <div className="pt-2 border-t border-red-200 text-xs flex justify-between items-center">
              <span className="text-stone-600 font-mono text-[11px]">Central Authority: gautamkr192007@gmail.com</span>
              <Link href="/login" className="font-bold text-orange-700 hover:text-orange-900 underline">
                Go to Sign In →
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Token Valid - Set Password Form */}
        {!isValidating && !validationError && officerDetails && !isSuccess && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-orange-200 shadow-xl space-y-6">
            
            {/* Officer Designated Scope Header */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900 text-sm">{officerDetails.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-orange-100 text-orange-800 border border-orange-300">
                  {officerDetails.role?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-stone-600 font-mono text-[11px]">{officerDetails.email}</div>

              <div className="pt-2 border-t border-orange-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Assigned Territory:</span>
                  <strong className="text-stone-900 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    <span>{officerDetails.assignedDistrict || 'All Jurisdictions'}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Agency / Ministry:</span>
                  <strong className="text-stone-900 truncate block">{officerDetails.agency}</strong>
                </div>
              </div>
            </div>

            {/* Password Setup Form */}
            <form onSubmit={handleSetPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">New Security Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 font-medium focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-100 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Confirm Security Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 font-medium focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-stone-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25 active:scale-98'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Set Password & Activate Official Access</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* State 4: Success */}
        {isSuccess && (
          <div className="p-8 rounded-3xl bg-white border-2 border-emerald-300 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl text-stone-900">
                Account Activated Successfully!
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Your password has been encrypted and your official jurisdiction permissions are now active.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-mono">
              Role: <strong className="text-stone-900">{officerDetails?.role}</strong> • Territory: <strong className="text-orange-700">{officerDetails?.assignedDistrict || 'National'}</strong>
            </div>

            <button
              onClick={() => router.push('/operations')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Enter Municipal Operations Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
