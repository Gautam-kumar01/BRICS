'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Compass, 
  Layers, 
  SlidersHorizontal,
  CheckCircle2, 
  LogIn, 
  X,
  Lock,
  Eye,
  Scale,
  Database
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'ai_ethics' | 'data_minimisation' | null>(null);

  const POLICY_DETAILS = {
    privacy: {
      title: 'BRICS CivicPulse — Privacy & Spatial Data Charter',
      tag: 'DPG Section 8 Compliance',
      content: (
        <div className="space-y-4 text-xs text-stone-800 leading-relaxed font-medium">
          <p>
            <strong className="text-stone-950 font-bold">1. Non-Extractive Data Principles:</strong> BRICS CivicPulse is built on privacy-by-design. We do not collect personal identifiers (PII), biometric fingerprints, or tracking cookies. Citizen submissions are analyzed solely for community infrastructure remediation.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">2. 300-Meter Geospatial Buffering:</strong> Exact residential coordinates captured via GPS are obfuscated and clustered into minimum 300m spatial uncertainty zones on all public heatmaps, preventing any identification of individual dwellings.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">3. Voluntary Consent & Notification:</strong> Citizens maintain full granular consent over whether their anonymized audio/text is included in municipal capital allocation models or used exclusively for direct issue resolution.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">4. Cross-Border Sovereignty:</strong> Data processed across BRICS territories complies with national data protection acts (including India’s DPDP Act, South Africa’s POPIA, and Brazil’s LGPD).
          </p>
        </div>
      )
    },
    terms: {
      title: 'Digital Public Good (DPG) Terms of Access',
      tag: 'Open-Source GovTech License',
      content: (
        <div className="space-y-4 text-xs text-stone-800 leading-relaxed font-medium">
          <p>
            <strong className="text-stone-950 font-bold">1. Open Digital Public Infrastructure:</strong> BRICS CivicPulse is released under standard open public good frameworks. Municipalities and public research bodies are granted royalty-free rights to deploy and inspect code.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">2. Interoperable Open APIs:</strong> Triage queues, demand hotspot clusters, and project registries provide open JSON/GeoJSON feeds to connect seamlessly with national GIS and municipal enterprise resource planning (ERP) platforms.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">3. Fair & Unbiased Capital Allocation:</strong> Prioritization algorithms are open-source and mathematically auditable, preventing discriminatory budget allocation across diverse regional demographics.
          </p>
        </div>
      )
    },
    ai_ethics: {
      title: 'Responsible AI & Model Governance Charter',
      tag: 'Section 10 AI Governance Standard',
      content: (
        <div className="space-y-4 text-xs text-stone-800 leading-relaxed font-medium">
          <p>
            <strong className="text-stone-950 font-bold">1. Mandatory Human-in-the-Loop (HITL):</strong> AI algorithms classify intent and estimate affected populations, but final capital authorization and department dispatch require authenticated municipal engineering review.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">2. Cascading Failover Reliability:</strong> The AI gateway cascades between Google Gemini 1.5, Groq LPU, OpenRouter, and an offline local NLP heuristic engine to ensure 100% availability during network disruptions.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">3. Strict Confidence Gating:</strong> Submissions with AI confidence scores below 75% are automatically flagged for manual facilitator triage before inclusion in policy ranking models.
          </p>
        </div>
      )
    },
    data_minimisation: {
      title: 'Data Minimisation & Retention Protocol',
      tag: 'BRICS GovTech Policy',
      content: (
        <div className="space-y-4 text-xs text-stone-800 leading-relaxed font-medium">
          <p>
            <strong className="text-stone-950 font-bold">1. Ephemeral Voice Processing:</strong> Audio recordings are transcribed in-memory and discarded post-normalization, retaining only verified textual summaries and infrastructure parameters.
          </p>
          <p>
            <strong className="text-stone-950 font-bold">2. Immutable Audit Lineage:</strong> Every status alteration, priority score recalculation, and budget allocation is cryptographically recorded in tamper-evident system audit logs.
          </p>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="relative mt-24 border-t-2 border-[#4A2D1F] bg-gradient-to-b from-[#2D180F] via-[#23120A] to-[#180B06] text-[#F3E8DF] overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
        
        {/* Subtle warm ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Section: Digital Public Good & Multilateral Standard Header */}
        <div className="border-b border-[#4A2D1F] bg-[#3A2014]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 text-center md:text-left">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#FFF5EB]">
                  {t('footer.dpg_header')}
                </h3>
                <p className="text-xs text-[#DAC4B5] font-medium mt-0.5">
                  {t('footer.dpg_desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-mono text-[11px] flex items-center space-x-1.5 shadow-2xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Designed as a Digital Public Good</span>
              </span>
              <a 
                href="https://github.com/Gautam-kumar01/BRICS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-orange-950/80 text-orange-300 border border-orange-700/80 font-mono text-[11px] shadow-2xs font-extrabold hover:bg-orange-900 transition-colors"
              >
                Open Architecture ↗
              </a>
              <span className="px-3 py-1 rounded-full bg-[#422517] text-[#F3E8DF] border border-[#5C3623] font-mono text-[11px] font-extrabold">
                Accessibility Target: WCAG 2.2 AA
              </span>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Col 1: Brand & Multilateral Territory Scope (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 p-0.5 shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#1c1917] rounded-[14px] flex items-center justify-center p-1.5">
                    <Compass className="w-5 h-5 text-orange-400 animate-spin-slow" />
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-extrabold text-2xl tracking-tight text-[#FFF5EB]">BRICS</span>
                  <span className="font-display font-bold text-2xl tracking-tight text-orange-400">CivicPulse</span>
                </div>
              </Link>

              <p className="text-xs text-[#DAC4B5] leading-relaxed font-medium max-w-sm">
                A scalable, multilingual AI platform aggregating citizen development requests across voice, text, and messaging to surface demand hotspots and recommend high-priority public projects to national policymakers across BRICS nations.
              </p>

              {/* 11 Member Nations Coverage */}
              <div className="pt-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-orange-300 block mb-2">
                  11 BRICS Member States
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇮🇳 India</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇧🇷 Brazil</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇿🇦 South Africa</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇷🇺 Russia</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇨🇳 China</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇪🇬 Egypt</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇪🇹 Ethiopia</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇮🇩 Indonesia</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇮🇷 Iran</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇸🇦 Saudi Arabia</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#3D2115] border border-[#593321] text-[#F3E8DF] font-bold shadow-2xs">🇦🇪 UAE</span>
                </div>
              </div>
            </div>

            {/* Col 2: Core Product Surfaces */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-extrabold text-orange-300 uppercase tracking-wider">
                {t('footer.product_surfaces')}
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#DAC4B5]">
                <li>
                  <Link href="/citizen" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-orange-400" />
                    <span>Citizen Voice & Demand</span>
                  </Link>
                </li>
                <li>
                  <Link href="/data" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-orange-400" />
                    <span>Data Intelligence & Fusion</span>
                  </Link>
                </li>
                <li>
                  <Link href="/operations" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Operations Triage Desk</span>
                  </Link>
                </li>
                <li>
                  <Link href="/planning" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                    <span>Policy Prioritization</span>
                  </Link>
                </li>
                <li>
                  <Link href="/impact" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DPI Delivery Registry</span>
                  </Link>
                </li>
                <li>
                  <Link href="/governance" className="hover:text-orange-300 transition-colors flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                    <span>Model Cards & Audit Logs</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal, Privacy & Compliance (Interactive Modals) */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-extrabold text-orange-300 uppercase tracking-wider">
                {t('footer.privacy_governance')}
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-[#DAC4B5]">
                <li>
                  <button
                    onClick={() => setActivePolicyModal('privacy')}
                    className="hover:text-orange-300 transition-colors flex items-center space-x-1.5 text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Privacy & Spatial Data Charter</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyModal('terms')}
                    className="hover:text-orange-300 transition-colors flex items-center space-x-1.5 text-left"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>Digital Public Good Terms</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyModal('ai_ethics')}
                    className="hover:text-orange-300 transition-colors flex items-center space-x-1.5 text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Responsible AI Ethics Charter</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyModal('data_minimisation')}
                    className="hover:text-orange-300 transition-colors flex items-center space-x-1.5 text-left"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    <span>Data Minimisation Guidelines</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Sign-In & System Status */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-extrabold text-orange-300 uppercase tracking-wider">
                {t('footer.municipal_access')}
              </h4>
              <p className="text-xs text-[#DAC4B5] font-medium leading-relaxed">
                Role-based authenticated workspace for district magistrates, engineers, and planners.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('footer.official_login')}</span>
              </Link>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-emerald-300 font-extrabold block">
                  ● Telemetry: 100% Operational
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright, Multilateral Credit */}
        <div className="border-t border-[#4A2D1F] bg-[#180B06]/95 backdrop-blur-md py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#C4B2A5] gap-3">
            <p className="font-medium text-center sm:text-left">
              © 2026 <span className="font-extrabold text-[#FFF5EB]">BRICS CivicPulse Initiative</span> • Digital Public Good for Public Infrastructure & Governance
            </p>
            <div className="flex items-center space-x-3 font-mono text-[11px] font-extrabold text-orange-300">
              <span className="bg-[#2E180F] px-3 py-1 rounded-full border border-[#542F1D] shadow-2xs">
                Voice → Spatial Intelligence → Defensible Spending
              </span>
            </div>
          </div>
        </div>

      </footer>

      {/* Interactive Policy Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#fbf7f0] border-2 border-orange-300 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 text-stone-900">
            
            <div className="flex items-center justify-between border-b border-orange-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-extrabold text-orange-700 uppercase tracking-wider bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
                  {POLICY_DETAILS[activePolicyModal].tag}
                </span>
                <h3 className="font-display font-extrabold text-lg text-stone-900 mt-1">
                  {POLICY_DETAILS[activePolicyModal].title}
                </h3>
              </div>

              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-2 rounded-full bg-white hover:bg-orange-100 text-stone-500 hover:text-stone-900 border border-stone-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2">
              {POLICY_DETAILS[activePolicyModal].content}
            </div>

            <div className="pt-3 border-t border-orange-200 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Close Policy Charter
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
