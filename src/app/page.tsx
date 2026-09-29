'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  MapPin,
  Search,
  Clock,
  TrendingUp,
  Smartphone,
  Phone,
  Check,
  CheckCheck,
  Copy,
  Send,
  Activity,
  AlertCircle,
  Building2,
  Layers,
  FileText,
  Volume2,
  Play,
  Radio,
  Cpu,
  Zap,
  Users,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import VoiceRecorder, { LiveLocationData } from '@/components/VoiceRecorder';
import { SEED_CLUSTERS, SEED_SUBMISSIONS } from '@/data/seed-data';
import { SupportedLanguage, CitizenSubmission } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';
import AIPipelineVisualizer from '@/components/AIPipelineVisualizer';
import DataStatusBadge from '@/components/DataStatusBadge';

export default function HomePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [selectedDemoLang, setSelectedDemoLang] = useState<SupportedLanguage>(language);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [liveSubmissions, setLiveSubmissions] = useState<CitizenSubmission[]>(SEED_SUBMISSIONS);
  const [searchQuery, setSearchQuery] = useState('');

  // Homepage Direct Complaint Submission State
  const [sandboxText, setSandboxText] = useState('');
  const [sandboxLocation, setSandboxLocation] = useState<LiveLocationData | null>(null);
  const [sandboxPhone, setSandboxPhone] = useState('+91 98234 56789');
  const [isSubmittingSandbox, setIsSubmittingSandbox] = useState(false);
  const [submittedSandboxRecord, setSubmittedSandboxRecord] = useState<CitizenSubmission | null>(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTab, setSmsTab] = useState<'both' | 'hi' | 'en'>('both');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // 🔍 HOMEPAGE DIRECT GRIEVANCE TRACKER STATE
  const [trackCodeInput, setTrackCodeInput] = useState('CP-IN-2026-8041');
  const [trackedSubmission, setTrackedSubmission] = useState<CitizenSubmission | null>(SEED_SUBMISSIONS[0]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackNotFound, setTrackNotFound] = useState(false);

  // 🌐 PILOT TERRITORY SHOWCASE STATE
  const [activePilotTerritory, setActivePilotTerritory] = useState<'jehanabad' | 'dhule' | 'tshwane' | 'recife'>('jehanabad');

  // Keep sandbox language synced with header language selection
  useEffect(() => {
    setSelectedDemoLang(language);
  }, [language]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          setLiveSubmissions(data);
          // Default tracked to first if available
          if (data.length > 0 && !trackedSubmission) {
            setTrackedSubmission(data[0]);
            setTrackCodeInput(data[0].referenceCode);
          }
        }
      } catch (e) { }
    }
    loadFeed();
  }, []);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const handleTrackSearch = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const code = (directCode || trackCodeInput).trim().toUpperCase();
    if (!code) return;

    setIsTrackingLoading(true);
    setTrackNotFound(false);

    // Try finding in current live state first
    const foundLocal = liveSubmissions.find(s => s.referenceCode.toUpperCase() === code);
    if (foundLocal) {
      setTrackedSubmission(foundLocal);
      setTrackCodeInput(foundLocal.referenceCode);
      setIsTrackingLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/submissions/${code}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedSubmission(data);
        setTrackCodeInput(data.referenceCode);
      } else {
        setTrackNotFound(true);
      }
    } catch (err) {
      setTrackNotFound(true);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleApplySamplePrompt = (sample: {
    text: string;
    lang: SupportedLanguage;
    loc: LiveLocationData;
    category: any;
    subcategory: string;
    urgency: any;
  }) => {
    setSandboxText(sample.text);
    setSelectedDemoLang(sample.lang);
    setSandboxLocation(sample.loc);
    setDemoResult({
      category: sample.category,
      subcategory: sample.subcategory,
      urgency: sample.urgency,
      confidenceScore: 0.96,
      affectedPopulationEstimate: 4200,
      locationDetails: {
        district: sample.loc.district,
        pincode: sample.loc.pincode,
        country: sample.loc.country,
        estimatedLat: sample.loc.latitude,
        estimatedLng: sample.loc.longitude,
      },
      plainLanguageSummary: sample.text
    });

    // Scroll to sandbox section smoothly
    const sandboxEl = document.getElementById('citizen-sandbox');
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSandboxSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSubmit = sandboxText || (demoResult?.plainLanguageSummary ? `Issue: ${demoResult.plainLanguageSummary}` : '');
    if (!textToSubmit.trim()) {
      alert('Please speak or enter an infrastructure issue before submitting.');
      return;
    }

    setIsSubmittingSandbox(true);
    try {
      const loc = sandboxLocation || {
        country: demoResult?.locationDetails?.country || 'India',
        district: demoResult?.locationDetails?.district || 'Jehanabad',
        pincode: demoResult?.locationDetails?.pincode || '804408',
        latitude: demoResult?.locationDetails?.estimatedLat || 25.1788,
        longitude: demoResult?.locationDetails?.estimatedLng || 85.0315,
        formattedAddress: 'Jehanabad District, Bihar 804408, India'
      };

      const payload = {
        channel: 'web_voice',
        language: selectedDemoLang,
        rawInput: textToSubmit,
        translatedText: textToSubmit,
        category: demoResult?.category || 'water',
        subcategory: demoResult?.subcategory || 'Infrastructure Deficit',
        urgency: demoResult?.urgency || 'high',
        affectedPopulationEstimate: demoResult?.affectedPopulationEstimate || 3500,
        location: {
          country: loc.country,
          district: loc.district,
          pincode: loc.pincode,
          ward: (loc as any).ward || 'Ward 08 (Main Town)',
          landmark: (loc as any).landmark || 'PHED Water Distribution Center',
          latitude: loc.latitude,
          longitude: loc.longitude,
          uncertaintyRadiusMeters: 300,
          confidence: demoResult?.confidenceScore || 0.92,
          formattedAddress: loc.formattedAddress || `${loc.district}, PIN: ${loc.pincode}, ${loc.country}`,
        },
        extractedEntities: [
          { field: 'reported_domain', value: demoResult?.category || 'water', confidence: 0.95 },
          { field: 'specific_issue', value: demoResult?.subcategory || 'Infrastructure Deficit', confidence: 0.91 },
          { field: 'pincode', value: loc.pincode, confidence: 0.98 },
          { field: 'district', value: loc.district, confidence: 0.94 },
        ],
        aiConfidenceScore: demoResult?.confidenceScore || 0.92,
        status: 'submitted',
        citizenConsent: {
          dataAnalytics: true,
          publicMapAggregation: true,
          contactForUpdates: true,
          contactValue: sandboxPhone || ''
        },
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit grievance');
      const data: CitizenSubmission = await res.json();

      setSubmittedSandboxRecord(data);
      setLiveSubmissions(prev => [data, ...prev]);
      setTrackedSubmission(data);
      setTrackCodeInput(data.referenceCode);
      setShowSmsModal(true);
      setSubmitSuccessNotice(`Complaint registered! Ref Code: ${data.referenceCode}`);

      if (typeof window !== 'undefined') {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) { }
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmittingSandbox(false);
    }
  };

  const popularTags = [
    'Water Pipeline Deficit',
    'Bridge Repair',
    'Primary Health Clinic',
    'Rural Broadband Gap',
    'Solar Microgrid',
    'Road Pavement Damage'
  ];

  const sampleScenarios = [
    {
      title: '💧 Jehanabad Water Deficit (हिन्दी)',
      text: 'जहानाबाद के काको ब्लॉक (पिनकोड 804408) में मुख्य पेयजल आपूर्ति पाइपलाइन 10 दिनों से टूटी हुई है। 600 से अधिक परिवारों को पीने का पानी नहीं मिल रहा है।',
      lang: 'hi' as SupportedLanguage,
      loc: {
        country: 'India',
        district: 'Jehanabad',
        pincode: '804408',
        latitude: 25.1788,
        longitude: 85.0315,
        isLiveGps: true,
        formattedAddress: 'Kako Block, Jehanabad, Bihar 804408'
      },
      category: 'water',
      subcategory: 'Primary Potable Water Pipeline Rupture',
      urgency: 'critical'
    },
    {
      title: '🚗 Dhule Bridge Culvert (मराठी/EN)',
      text: 'The culvert bridge on the river access corridor in Dhule (PIN 424001) has suffered severe structural subsidence after heavy rainfall, cutting off farm transport.',
      lang: 'en' as SupportedLanguage,
      loc: {
        country: 'India',
        district: 'Dhule (Dhulia)',
        pincode: '424001',
        latitude: 20.9042,
        longitude: 74.7749,
        isLiveGps: true,
        formattedAddress: 'Mohadi River Road, Dhule, Maharashtra 424001'
      },
      category: 'roads',
      subcategory: 'Culvert Bridge Structural Subsidence',
      urgency: 'high'
    },
    {
      title: '⚡ Tshwane Power Outage (Zulu/EN)',
      text: 'Substation circuit breaker tripped in Mamelodi East Ward 14 (PIN 0122). Primary health clinic operating on backup diesel generator.',
      lang: 'en' as SupportedLanguage,
      loc: {
        country: 'South Africa',
        district: 'City of Tshwane',
        pincode: '0122',
        latitude: -25.7479,
        longitude: 28.2293,
        isLiveGps: true,
        formattedAddress: 'Mamelodi East Sector 4, City of Tshwane 0122'
      },
      category: 'energy',
      subcategory: 'Substation Feeder Breaker Trip',
      urgency: 'critical'
    }
  ];

  const filteredSubmissions = searchQuery.trim()
    ? liveSubmissions.filter(s =>
      s.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location.pincode && s.location.pincode.includes(searchQuery))
    )
    : liveSubmissions;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 text-stone-900">

      {/* Top Prototype & Demo Disclosure Banner */}
      <PrototypeDisclosure />

      {/* ==================================================================== */}
      {/* 1. HERO SECTION: Problem Statement Alignment & Glassmorphism         */}
      {/* ==================================================================== */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">

        {/* Ambient Top Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-orange-300/20 via-amber-200/25 to-orange-300/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top Official Track Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border-2 border-orange-200/90 text-orange-900 text-xs font-bold shadow-xs backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
          <span>{t('hero.track_badge')}</span>
        </div>

        {/* Main Strategic Headline directly addressing Problem Statement */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-stone-900 leading-[1.12] max-w-5xl mx-auto">
          {t('hero.title_part1')} <span className="text-gradient-hero">{t('hero.title_highlight')}</span>
        </h1>

        {/* Tailored Subtitle for BRICS DPI Challenge */}
        <p className="text-base sm:text-lg text-stone-700 max-w-3xl mx-auto leading-relaxed font-medium">
          {t('hero.subtitle')}
        </p>

        {/* Floating Glassmorphic Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center w-full bg-white/90 backdrop-blur-xl rounded-full border-2 border-orange-300 shadow-[0_8px_32px_rgba(249,115,22,0.12)] hover:border-orange-500 transition-all focus-within:border-orange-600 focus-within:ring-4 focus-within:ring-orange-100 p-1.5 pl-5">
            <Search className="w-5 h-5 text-orange-600 shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero.search_placeholder')}
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none font-semibold"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 font-bold cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <Link
                href="/citizen"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 flex items-center space-x-1.5 shrink-0 transition-transform active:scale-95"
              >
                <span>{t('hero.voice_report_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Popular Priority Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-xs font-bold text-stone-600 mr-1">{t('hero.direct_filters')}</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${searchQuery === tag
                    ? 'bg-orange-600 border-orange-600 text-white font-bold shadow-sm'
                    : 'bg-white/80 backdrop-blur-sm border-orange-200 text-stone-800 hover:border-orange-400 hover:text-orange-700 shadow-2xs'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Glassmorphic KPI Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 max-w-5xl mx-auto text-left">

          {/* Card 1: Aggregated Requests */}
          <div className="bg-white/85 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-5 shadow-[0_8px_24px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.12)] hover:border-orange-400 transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 leading-none">
                {t('kpi.requests_num')}
              </div>
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-1">
                {t('kpi.requests_label')}
              </div>
            </div>
          </div>

          {/* Card 2: Hotspot Clusters */}
          <div className="bg-white/85 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-5 shadow-[0_8px_24px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.12)] hover:border-amber-400 transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 leading-none">
                {t('kpi.hotspots_num')}
              </div>
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-1">
                {t('kpi.hotspots_label')}
              </div>
            </div>
          </div>

          {/* Card 3: Prioritization SLA */}
          <div className="bg-white/85 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-5 shadow-[0_8px_24px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.12)] hover:border-yellow-400 transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-700 shrink-0 shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 leading-none">
                {t('kpi.triage_sla_num')}
              </div>
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-1">
                {t('kpi.triage_sla_label')}
              </div>
            </div>
          </div>

          {/* Card 4: Measurable Impact */}
          <div className="bg-white/85 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-5 shadow-[0_8px_24px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.12)] hover:border-emerald-400 transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 leading-none">
                {t('kpi.spending_num')}
              </div>
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-1">
                {t('kpi.spending_label')}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ==================================================================== */}
      {/* 2. 🔍 INSTANT GRIEVANCE TRACKER & LIVE STEPPER (NEW HOMEPAGE FEATURE) */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-950 via-[#26130B] to-stone-950 text-white p-6 sm:p-10 border-2 border-orange-500/40 shadow-2xl space-y-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-500/20 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/80 text-orange-300 text-xs font-mono font-bold border border-orange-500/40">
                <Search className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Citizen Transparency Tracker</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Instant Grievance Status & Department Routing
              </h2>
              <p className="text-xs text-stone-300">
                Track real-time municipal triage, geocoded spatial coordinates, and allocated nodal engineering departments.
              </p>
            </div>

            {/* Quick-Sample Reference Codes */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              <span className="text-[11px] font-mono text-stone-400">Quick Track:</span>
              {['CP-IN-2026-8041', 'CP-IN-2026-8044', 'CP-IN-2026-8042', 'CP-ZA-2026-0012'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleTrackSearch(undefined, code)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-mono font-bold transition-all cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={trackCodeInput}
                onChange={(e) => setTrackCodeInput(e.target.value)}
                placeholder="Enter Reference Number (e.g. CP-IN-2026-8041)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/50 border-2 border-orange-500/40 text-white font-mono font-bold text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={isTrackingLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
            >
              {isTrackingLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Registry...</span>
                </>
              ) : (
                <>
                  <span>Track Status Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Tracked Record Stepper Display */}
          {trackedSubmission && (
            <div className="rounded-3xl bg-black/40 border border-orange-500/30 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-500/20 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm sm:text-base font-mono font-extrabold text-orange-400">
                      {trackedSubmission.referenceCode}
                    </span>
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${trackedSubmission.urgency === 'critical' ? 'bg-red-950 text-red-300 border border-red-700' :
                        trackedSubmission.urgency === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}>
                      {trackedSubmission.urgency} Urgency
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-white">
                    {trackedSubmission.subcategory}
                  </h3>
                  <p className="text-xs text-stone-300 italic">
                    &ldquo;{trackedSubmission.translatedText || trackedSubmission.rawInput}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs space-y-1">
                  <span className="text-stone-400">Current Lifecycle State:</span>
                  <span className="font-mono font-extrabold text-xs uppercase px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600">
                    ✅ {trackedSubmission.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* 4-Stage Interactive Stepper Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">

                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center font-mono">1</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs block font-bold">Grievance Ingested</strong>
                  <p className="text-[11px] text-stone-400 font-mono">Channel: {trackedSubmission.channel.toUpperCase()}</p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center font-mono">2</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs block font-bold">AI Taxonomy & Geocoding</strong>
                  <p className="text-[11px] text-stone-400 font-mono">Conf: {(trackedSubmission.aiConfidenceScore * 100).toFixed(0)}% • PIN: {trackedSubmission.location.pincode || '804408'}</p>
                </div>

                {/* Step 3 */}
                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${['triaged', 'clustered', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                    ? 'bg-stone-900/90 border-emerald-500/40'
                    : 'bg-stone-900/40 border-stone-800 opacity-60'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center font-mono ${['triaged', 'clustered', 'in_progress', 'resolved'].includes(trackedSubmission.status) ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                      }`}>3</span>
                    {['triaged', 'clustered', 'in_progress', 'resolved'].includes(trackedSubmission.status) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-stone-600" />
                    )}
                  </div>
                  <strong className="text-white text-xs block font-bold">Authority Triage</strong>
                  <p className="text-[11px] text-stone-300 font-medium truncate">
                    {trackedSubmission.assignedDepartment || 'PHED / Public Works'}
                  </p>
                </div>

                {/* Step 4 */}
                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${trackedSubmission.status === 'resolved'
                    ? 'bg-stone-900/90 border-emerald-500/40'
                    : 'bg-stone-900/40 border-stone-800 opacity-60'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center font-mono ${trackedSubmission.status === 'resolved' ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                      }`}>4</span>
                    {trackedSubmission.status === 'resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-stone-600" />
                    )}
                  </div>
                  <strong className="text-white text-xs block font-bold">Resolution & Works</strong>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {trackedSubmission.status === 'resolved' ? 'Repaired & Verified' : 'Dispatched to Field'}
                  </p>
                </div>

              </div>

              {/* Nodal Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-orange-500/20 text-xs text-stone-300 font-mono">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{trackedSubmission.location.district}, {trackedSubmission.location.country} (PIN: {trackedSubmission.location.pincode || '804408'})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Assigned: <strong className="text-white">{trackedSubmission.assignedDepartment || 'PHED Engineering Division'}</strong></span>
                </div>
              </div>

            </div>
          )}

          {trackNotFound && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Reference code not found in sovereign registry. Please verify the alphanumeric format (e.g. CP-IN-2026-8041).</span>
            </div>
          )}

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. 🌐 MULTILATERAL PILOT TERRITORY SHOWCASE (NEW ENHANCEMENT)        */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-orange-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
              BRICS+ Sovereign Pilot Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 mt-1">
              Active Municipal Jurisdictions & Territory Scopes
            </h2>
            <p className="text-xs text-stone-600 font-medium mt-1">
              Explore how BRICS CivicPulse isolates data by district territory while enabling multilateral capital policy intelligence.
            </p>
          </div>

          {/* Territory Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'jehanabad', label: '🇮🇳 Jehanabad (Bihar)', flag: '🇮🇳' },
              { id: 'dhule', label: '🇮🇳 Dhule (Maharashtra)', flag: '🇮🇳' },
              { id: 'tshwane', label: '🇿🇦 City of Tshwane', flag: '🇿🇦' },
              { id: 'recife', label: '🇧🇷 Recife Metropolitan', flag: '🇧🇷' }
            ].map((terr) => (
              <button
                key={terr.id}
                onClick={() => setActivePilotTerritory(terr.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePilotTerritory === terr.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-orange-50'
                  }`}
              >
                {terr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Territory Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Jurisdiction Profile */}
          <div className="p-6 rounded-3xl bg-white border-2 border-orange-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {activePilotTerritory === 'jehanabad' ? 'Tier-3 Rural-Urban Pilot' :
                  activePilotTerritory === 'dhule' ? 'Aspirational District Pilot' :
                    activePilotTerritory === 'tshwane' ? 'Metropolitan Municipality' : 'Coastal Urban Drainage'}
              </span>
              <span className="text-lg">
                {activePilotTerritory === 'jehanabad' || activePilotTerritory === 'dhule' ? '🇮🇳' :
                  activePilotTerritory === 'tshwane' ? '🇿🇦' : '🇧🇷'}
              </span>
            </div>

            <h3 className="font-display font-extrabold text-xl text-stone-900">
              {activePilotTerritory === 'jehanabad' ? 'Jehanabad District' :
                activePilotTerritory === 'dhule' ? 'Dhule District (Dhulia)' :
                  activePilotTerritory === 'tshwane' ? 'City of Tshwane Metropolitan' : 'Recife Metropolitan'}
            </h3>

            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              {activePilotTerritory === 'jehanabad'
                ? 'High-density rural-urban corridor in Bihar. Focus on potable water pipeline restoration in Kako Block and municipal open storm drainage.'
                : activePilotTerritory === 'dhule'
                  ? 'Agricultural infrastructure corridor in North Maharashtra. Focus on culvert bridge subsidence and rural distribution power grids.'
                  : activePilotTerritory === 'tshwane'
                    ? 'Metropolitan district in Gauteng, South Africa. Addressing municipal water pressure deficits, township clinics, and energy microgrids.'
                    : 'Coastal city in Pernambuco, Brazil. Deploying multi-criteria flood drainage and bridge retrofitting.'}
            </p>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Designated Authority:</span>
              <span className="font-bold text-stone-900">
                {activePilotTerritory === 'jehanabad' ? 'Demo District Authority (Jehanabad)' :
                  activePilotTerritory === 'dhule' ? 'Demo District Authority (Dhule)' :
                    activePilotTerritory === 'tshwane' ? 'Demo Municipal Authority (Tshwane)' : 'Demo Infrastructure Officer (Recife)'}
              </span>
            </div>
          </div>

          {/* Card 2: Allocated Budget & Indicators */}
          <div className="p-6 rounded-3xl bg-white border-2 border-orange-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-600">Allocated Municipal Capital Budget:</span>
              <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {activePilotTerritory === 'jehanabad' ? '$1,800,000 USD' :
                  activePilotTerritory === 'dhule' ? '$2,200,000 USD' :
                    activePilotTerritory === 'tshwane' ? '$3,500,000 USD' : '$4,100,000 USD'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Primary Demand Hotspot:</span>
                  <span className="text-orange-700 uppercase font-mono">
                    {activePilotTerritory === 'jehanabad' ? 'WATER & DRAINAGE' :
                      activePilotTerritory === 'dhule' ? 'ROADS & POWER' :
                        activePilotTerritory === 'tshwane' ? 'WATER PRESSURE' : 'FLOOD BASIN'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {activePilotTerritory === 'jehanabad' ? 'Kako Block & Court Area Basin (PIN 804408)' :
                    activePilotTerritory === 'dhule' ? 'Mohadi River Corridor (PIN 424001)' :
                      activePilotTerritory === 'tshwane' ? 'Mamelodi East Ward 14 (PIN 0122)' : 'Boa Viagem Canal'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Verified Signals:</span>
                  <strong className="text-stone-900">
                    {activePilotTerritory === 'jehanabad' ? '4 Verified Complaints' :
                      activePilotTerritory === 'dhule' ? '3 Verified Complaints' : '2 Verified Complaints'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">DPI Spatial Privacy:</span>
                  <strong className="text-emerald-700">300m Noise Buffer Active</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 1-Click Sandbox Sample Launcher */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-black/20 text-white font-bold inline-block">
                Evaluator Quick-Run
              </span>
              <h4 className="font-display font-extrabold text-lg text-white">
                Test AI Ingestion for this Territory
              </h4>
              <p className="text-xs text-orange-100 font-medium">
                1-Click pre-fills realistic multilingual citizen grievances for {activePilotTerritory === 'jehanabad' ? 'Jehanabad' : activePilotTerritory === 'dhule' ? 'Dhule' : 'Tshwane'} into the AI Sandbox.
              </p>
            </div>

            <button
              onClick={() => {
                const sample = sampleScenarios.find(s =>
                  activePilotTerritory === 'jehanabad' ? s.loc.district.toLowerCase().includes('jehanabad') :
                    activePilotTerritory === 'dhule' ? s.loc.district.toLowerCase().includes('dhule') :
                      s.loc.country === 'South Africa'
                ) || sampleScenarios[0];
                handleApplySamplePrompt(sample);
              }}
              className="w-full py-3 rounded-2xl bg-white hover:bg-orange-50 text-orange-800 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-orange-800 text-orange-800" />
              <span>Load Sample Grievance & Test Ingestion</span>
            </button>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. LIVE INTERACTIVE VOICE/TEXT SANDBOX (Glassmorphic Studio)        */}
      {/* ==================================================================== */}
      <section id="citizen-sandbox" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-orange-200 shadow-md p-6 md:p-10 space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-mono font-bold border border-orange-300">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>{t('sandbox.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
                {t('sandbox.title')}
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                {t('sandbox.subtitle')}
              </p>
            </div>

            <Link
              href="/citizen"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all flex items-center space-x-2 self-start md:self-auto"
            >
              <span>{t('sandbox.full_portal_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick-Run Scenario Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-600">Quick Test Scenarios (1-Click Auto Fill & Geocode):</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sampleScenarios.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplySamplePrompt(sc)}
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-left transition-all space-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 group-hover:text-orange-700">{sc.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 uppercase font-semibold">
                      {sc.lang}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1">{sc.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Recorder with Auto-Location */}
          <VoiceRecorder
            selectedLanguage={selectedDemoLang}
            onLanguageChange={(l) => setSelectedDemoLang(l)}
            onLocationDetected={(loc) => setSandboxLocation(loc)}
            onTranscriptionComplete={(text, lang, result, loc) => {
              setSandboxText(text);
              setDemoResult(result);
              if (loc) setSandboxLocation(loc);
            }}
          />

          {/* 🚀 OFFICIAL COMPLAINT SUBMISSION & SMS DISPATCH SECTION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 shadow-md space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-3">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-orange-600" />
                <h3 className="font-display font-extrabold text-base sm:text-lg text-stone-900">
                  Official Grievance Registration & SMS Dispatch
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                100% Free & Zero-Login Required
              </span>
            </div>

            <p className="text-xs text-stone-700 font-medium leading-relaxed">
              Your voice or text input has been AI-geocoded and categorized into official municipal format. Enter your mobile number below to officially register this grievance and receive an instant bilingual SMS confirmation with your reference code.
            </p>

            {/* Auto-Captured Geolocation & Extracted Domain Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Live Location (Auto-GPS)</span>
                <div className="font-bold text-stone-900 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{sandboxLocation?.district || demoResult?.locationDetails?.district || 'Jehanabad'}</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-orange-700">
                  PIN: {sandboxLocation?.pincode || demoResult?.locationDetails?.pincode || '804408'} • {sandboxLocation?.country || 'India'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Classified Domain</span>
                <div className="font-extrabold text-stone-900 uppercase text-orange-700">
                  {demoResult?.category || 'WATER & SANITATION'}
                </div>
                <div className="text-[11px] text-stone-700 font-medium truncate">
                  {demoResult?.subcategory || 'Potable Water Pipeline Deficit'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Estimated Urgency</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold uppercase ${demoResult?.urgency === 'critical' ? 'bg-red-600 text-white' :
                      demoResult?.urgency === 'high' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                    {demoResult?.urgency || 'HIGH'}
                  </span>
                  <span className="text-[11px] font-mono text-stone-600 font-bold">
                    {Math.round((demoResult?.confidenceScore || 0.92) * 100)}% Conf
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 font-medium">SLA Priority: &lt; 24h</div>
              </div>
            </div>

            {/* Mobile Phone Input & Submit Action Bar */}
            <form onSubmit={handleSandboxSubmit} className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={sandboxPhone}
                    onChange={(e) => setSandboxPhone(e.target.value)}
                    placeholder="Enter Mobile Number for SMS (e.g. +91 98765 43210)..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-2 border-orange-300 text-stone-900 font-bold text-xs focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-2xs placeholder:text-stone-400 placeholder:font-normal"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSandbox}
                  className={`px-8 py-3.5 rounded-2xl font-extrabold text-xs text-white shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 ${isSubmittingSandbox
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer'
                    }`}
                >
                  {isSubmittingSandbox ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Registering Official Complaint...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>🚀 Submit Official Complaint & Get SMS Receipt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-600">
                <span className="flex items-center space-x-1 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Bilingual SMS (हिन्दी & English) sent upon clicking Submit</span>
                </span>
                <Link
                  href="/citizen"
                  className="font-bold text-orange-700 hover:text-orange-900 underline flex items-center space-x-1"
                >
                  <span>Or switch to Full Citizen Voice Portal →</span>
                </Link>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. LIVE CITIZEN DEMAND SIGNAL (Glassmorphic Cards)                  */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
              {t('demands.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 mt-1">
              {t('demands.title')}
            </h2>
          </div>

          <Link
            href="/citizen"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>{t('demands.view_all_btn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredSubmissions.slice(0, 3).map((item) => (
            <div key={item.id} className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-orange-200 shadow-[0_8px_24px_rgba(249,115,22,0.04)] space-y-3 flex flex-col justify-between hover:border-orange-400 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {item.referenceCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${item.urgency === 'critical' ? 'bg-red-100 text-red-800 border border-red-300' :
                      item.urgency === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                    {item.urgency}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{item.subcategory}</h4>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans font-medium">
                  "{item.translatedText || item.rawInput}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-stone-800 font-bold">{item.location.district}</span>
                  <span className="text-orange-700 font-bold">({item.location.pincode || '804408'})</span>
                </span>
                <span className="text-emerald-800 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. GEOSPATIAL DEMAND HOTSPOTS (Map Preview)                         */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
              {t('map.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 mt-1">
              {t('map.title')}
            </h2>
            <p className="text-xs text-stone-600 max-w-xl font-medium mt-1">
              {t('map.subtitle')}
            </p>
          </div>

          <Link
            href="/planning"
            className="px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-orange-300 hover:border-orange-500 text-stone-900 hover:text-orange-600 text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
          >
            <span>{t('map.launch_btn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-orange-200 p-2 shadow-md overflow-hidden">
          <MapComponent clusters={SEED_CLUSTERS} />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. HOW IT WORKS: From Citizen Voice to Public Impact (10-Step Journey)*/}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
            Multi-Stage DPI Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900">
            From Citizen Voice to Public Impact
          </h2>
          <p className="text-sm text-stone-600 font-medium">
            A transparent, 10-step Digital Public Infrastructure pipeline transforming vernacular audio reports into auditable capital budgets under sovereign human oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            { step: '01', title: 'Citizen Voice & Intake', desc: 'Citizen speaks naturally in native language or submits via Web, WhatsApp or SMS.', icon: '🎙️' },
            { step: '02', title: 'AI Linguistic Understanding', desc: 'FastText & Whisper classify dialect, transcribe audio, and normalize text.', icon: '🌐' },
            { step: '03', title: 'Spatial & Category Extraction', desc: 'Automated entity extraction identifies infrastructure domain, urgency and PIN code.', icon: '📍' },
            { step: '04', title: 'Duplicate Clustering', desc: 'DBSCAN algorithms aggregate overlapping neighbourhood complaints into clusters.', icon: '🔗' },
            { step: '05', title: 'Multi-Source Data Fusion', desc: 'Citizen voice is cross-referenced with Census demographics, ISI gap indices and MTIP budgets.', icon: '🧬' },
            { step: '06', title: 'Demand Hotspots Identified', desc: 'Spatial GIS layers map severity density with 300m privacy buffers on public views.', icon: '🗺️' },
            { step: '07', title: 'Explainable AI Priorities', desc: 'Deterministic MCDA models rank candidate civil works with mathematical evidence attribution.', icon: '📊' },
            { step: '08', title: 'Authorized Human Review', desc: 'AI recommends. Authorized district officials decide: approve, defer, or request evidence.', icon: '🏛️' },
            { step: '09', title: 'Delivery & Tenders Tracked', desc: 'Municipal work orders, contractor milestones, and budget disbursement tracked in real time.', icon: '🏗️' },
            { step: '10', title: 'Long-Term Impact Measured', desc: 'Baseline → Intervention → Target progression monitored with ground-truth citizen satisfaction.', icon: '✅' },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-mono text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">{item.step}</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-stone-900">{item.title}</h4>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. AI DECISION PIPELINE VISUALIZER (Interactive Deep Dive)          */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AIPipelineVisualizer />
      </section>

      {/* ==================================================================== */}
      {/* 9. FINAL VALUE PROPOSITION BANNER (Track 1 Alignment)               */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-[#2A150C] text-stone-100 border border-orange-500/30 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-orange-500/20 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                  Digital Public Infrastructure Standard
                </span>
                <DataStatusBadge status="simulated" size="xs" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                Citizen Voice → AI Intelligence → Evidence-Based Infrastructure Decisions
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                CivicPulse transforms fragmented citizen requests into explainable, spatially-aware infrastructure priorities while keeping final decisions under accountable human oversight.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/citizen"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Citizen Intake</span>
              </Link>
              <Link
                href="/planning"
                className="px-6 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 flex items-center justify-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Policy Intelligence Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* INSTANT BILINGUAL SMS & WHATSAPP DISPATCH CONFIRMATION MODAL         */}
      {/* ==================================================================== */}
      {showSmsModal && submittedSandboxRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-orange-300 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shrink-0">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      GovTech Alert Dispatched
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-stone-900 mt-0.5">
                    Official SMS & WhatsApp Notification
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recipient Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-mono font-bold">
              <span className="text-stone-700 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Recipient Mobile:</span>
              </span>
              <span className="text-orange-950 font-extrabold">{sandboxPhone || '+91 98234 56789'}</span>
            </div>

            {/* Language Tabs for SMS Preview */}
            <div className="flex items-center space-x-1.5 border-b border-stone-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setSmsTab('both')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${smsTab === 'both' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
              >
                Both Languages (दोनों भाषाएं)
              </button>
              <button
                onClick={() => setSmsTab('hi')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${smsTab === 'hi' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
              >
                🇮🇳 हिन्दी SMS
              </button>
              <button
                onClick={() => setSmsTab('en')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${smsTab === 'en' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
              >
                🌐 English SMS
              </button>
            </div>

            {/* SMS Message Boxes */}
            <div className="space-y-4">

              {/* Hindi SMS Preview */}
              {(smsTab === 'both' || smsTab === 'hi') && (
                <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 font-sans text-xs space-y-3 border-2 border-stone-800 shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold border-b border-stone-800 pb-1.5">
                    <span className="flex items-center space-x-1">
                      <span>🇮🇳 GovTech Official SMS — HINDI (हिन्दी)</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>DELIVERED</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-stone-200 leading-relaxed">
                    <div className="text-amber-300 font-bold text-xs">
                      🏛️ सरकारी नागरिक सेवा सूचना (BRICS CivicPulse)
                    </div>
                    <div className="text-emerald-400 font-bold">
                      ✅ आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है!
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1 font-mono text-[11px]">
                      <div>📋 <span className="text-stone-400 font-sans">शिकायत संदर्भ संख्या:</span> <strong className="text-orange-400 font-extrabold">{submittedSandboxRecord.referenceCode}</strong></div>
                      <div>🏷️ <span className="text-stone-400 font-sans">श्रेणी:</span> <span className="text-stone-200">{submittedSandboxRecord.category.toUpperCase()} ({submittedSandboxRecord.subcategory})</span></div>
                      <div>📍 <span className="text-stone-400 font-sans">स्थान:</span> <span className="text-stone-200">{submittedSandboxRecord.location.district} (पिन: {submittedSandboxRecord.location.pincode || '804408'})</span></div>
                      <div>🏢 <span className="text-stone-400 font-sans">संबंधित विभाग:</span> <span className="text-stone-200">{submittedSandboxRecord.assignedDepartment || 'लोक स्वास्थ्य अभियंत्रण विभाग (PHED)'}</span></div>
                    </div>

                    <div className="pt-1 text-xs space-y-1">
                      <div className="font-bold text-amber-300">🔍 शिकायत की स्थिति (Status) कैसे ट्रैक करें?</div>
                      <div className="text-stone-300 pl-2 space-y-0.5 text-[11px]">
                        <div>1. ऑनलाइन: होमपेज या <strong className="text-white">/citizen</strong> पर संदर्भ कोड <strong className="text-orange-400 font-mono">{submittedSandboxRecord.referenceCode}</strong> दर्ज करें।</div>
                        <div>2. व्हाट्सएप: हमारे वेरिफाइड बॉट पर यह कोड भेजकर लाइव स्थिति देखें।</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* English SMS Preview */}
              {(smsTab === 'both' || smsTab === 'en') && (
                <div className="p-4 rounded-2xl bg-[#062419] text-emerald-100 font-sans text-xs space-y-3 border-2 border-emerald-900 shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold border-b border-emerald-900/80 pb-1.5">
                    <span>🌐 GovTech Official SMS — ENGLISH</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>DELIVERED</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-emerald-100 leading-relaxed">
                    <div className="text-amber-300 font-bold text-xs">
                      🏛️ BRICS CivicPulse Citizen Alert
                    </div>
                    <div className="text-emerald-400 font-bold">
                      ✅ Your complaint has been registered successfully!
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 space-y-1 font-mono text-[11px]">
                      <div>📋 <span className="text-emerald-400/80 font-sans">Complaint Ref No:</span> <strong className="text-orange-400 font-extrabold">{submittedSandboxRecord.referenceCode}</strong></div>
                      <div>🏷️ <span className="text-emerald-400/80 font-sans">Category:</span> <span className="text-emerald-100">{submittedSandboxRecord.category.toUpperCase()} ({submittedSandboxRecord.subcategory})</span></div>
                      <div>📍 <span className="text-emerald-400/80 font-sans">Location:</span> <span className="text-emerald-100">{submittedSandboxRecord.location.district} (PIN: {submittedSandboxRecord.location.pincode || '804408'})</span></div>
                      <div>🏢 <span className="text-emerald-400/80 font-sans">Assigned Authority:</span> <span className="text-emerald-100">{submittedSandboxRecord.assignedDepartment || 'Municipal Engineering Division'}</span></div>
                    </div>

                    <div className="pt-1 text-xs space-y-1">
                      <div className="font-bold text-amber-300">🔍 HOW TO TRACK YOUR COMPLAINT STATUS:</div>
                      <div className="text-emerald-200 pl-2 space-y-0.5 text-[11px]">
                        <div>1. Web: Enter code <strong className="text-orange-400 font-mono">{submittedSandboxRecord.referenceCode}</strong> on the Homepage or <strong className="text-white">/citizen</strong>.</div>
                        <div>2. WhatsApp: Send <strong className="text-orange-400 font-mono">{submittedSandboxRecord.referenceCode}</strong> to our official WhatsApp Bot for live updates.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(submittedSandboxRecord.referenceCode)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-stone-300 cursor-pointer"
              >
                {copiedCode === submittedSandboxRecord.referenceCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode === submittedSandboxRecord.referenceCode ? 'Copied Reference Code!' : 'Copy Reference Code'}</span>
              </button>

              <button
                onClick={() => {
                  setShowSmsModal(false);
                  router.push(`/citizen?track=${submittedSandboxRecord.referenceCode}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
              >
                <span>Track Live Progress in Stepper (1-Click)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
