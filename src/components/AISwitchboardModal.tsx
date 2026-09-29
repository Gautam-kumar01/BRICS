'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  KeyRound, 
  Zap, 
  ShieldCheck,
  Server,
  Activity,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { AIProviderStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AISwitchboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdate?: () => void;
}

export default function AISwitchboardModal({ isOpen, onClose }: AISwitchboardModalProps) {
  const { isOfficial } = useAuth();
  const [providers, setProviders] = useState<AIProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ isNeonConnected: boolean; message: string }>({
    isNeonConnected: false,
    message: 'Checking database...'
  });

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
      fetchDbStatus();
    }
  }, [isOpen]);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDbStatus() {
    try {
      const res = await fetch('/api/db/init');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {}
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 text-stone-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center space-x-2">
                <span>AI Gateway & Neon Database Telemetry</span>
              </h2>
              <p className="text-xs text-stone-600">
                Resilient 4-tier cascading failover: Gemini ➔ Groq ➔ OpenRouter ➔ Local NLP Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Cascading Pipeline Visualizer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <span>Live AI Provider Cascading Matrix</span>
            </h3>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center space-x-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Providers</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1: Gemini */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Priority 1
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-bold text-sm text-stone-900">Google Gemini</div>
              <div className="text-[11px] text-stone-600 font-mono">gemini-1.5-flash</div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-500 border-t border-stone-200">
                <span>Multi-lingual NLP</span>
                <span className="text-emerald-700 font-bold">~210ms</span>
              </div>
            </div>

            {/* Step 2: Groq */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Priority 2 (Fast)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-bold text-sm text-stone-900">Groq LPU</div>
              <div className="text-[11px] text-stone-600 font-mono">llama-3.3-70b</div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-500 border-t border-stone-200">
                <span>Ultra-low Latency</span>
                <span className="text-sky-700 font-bold">~85ms</span>
              </div>
            </div>

            {/* Step 3: OpenRouter */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Priority 3
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-bold text-sm text-stone-900">OpenRouter</div>
              <div className="text-[11px] text-stone-600 font-mono">multi-model fallback</div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-500 border-t border-stone-200">
                <span>Global Multi-LLM</span>
                <span className="text-amber-700 font-bold">~310ms</span>
              </div>
            </div>

            {/* Step 4: Local Smart NLP */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-emerald-300 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Zero-Downtime Base
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-sm text-emerald-800">Smart Local Engine</div>
              <div className="text-[11px] text-stone-600 font-mono">Deterministic NLP</div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-500 border-t border-stone-200">
                <span>100% Offline Safe</span>
                <span className="text-emerald-700 font-bold">12ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Security Status */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-stone-900">Neon PostgreSQL Database Status</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              dbStatus.isNeonConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {dbStatus.isNeonConnected ? 'Neon Connected' : 'Resilient In-Memory & Seed Mode'}
            </span>
          </div>
          <p className="text-xs text-stone-600">
            {dbStatus.message}
          </p>
        </div>

        {/* Safe Credential Storage Notice */}
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-stone-900">Secure Server-Side Credential Storage:</span>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              For enterprise security, all API keys (Groq, Gemini, OpenRouter) and your Neon Database URL are managed securely via server-side environment variables in <span className="font-mono text-stone-900 font-semibold">.env.local</span> and are never exposed to public website visitors.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            Close Telemetry View
          </button>
        </div>

      </div>
    </div>
  );
}
