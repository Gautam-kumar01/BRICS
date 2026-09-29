'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mic, 
  Send, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Smartphone, 
  Star, 
  Copy, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Activity,
  Droplet,
  Car,
  Wifi,
  Radio,
  Check,
  FileText,
  HelpCircle,
  Building2,
  Share2,
  Navigation,
  Compass,
  ArrowUpRight,
  Phone,
  BellRing,
  CheckCheck,
  Truck,
  Wrench
} from 'lucide-react';
import VoiceRecorder, { LiveLocationData } from '@/components/VoiceRecorder';
import { CitizenSubmission, SupportedLanguage, SubmissionChannel, InfrastructureDomain, UrgencyLevel } from '@/types';
import { AIExtractionResult } from '@/lib/ai/ai-gateway';
import { SEED_SUBMISSIONS } from '@/data/seed-data';
import DataStatusBadge from '@/components/DataStatusBadge';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';

export default function CitizenPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'whatsapp' | 'ussd'>('submit');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [channel, setChannel] = useState<SubmissionChannel>('web_voice');

  // Live Feed of Submissions (Displays newly reported problems immediately)
  const [recentSubmissions, setRecentSubmissions] = useState<CitizenSubmission[]>(SEED_SUBMISSIONS);

  // Form State
  const [rawText, setRawText] = useState('');
  const [category, setCategory] = useState<InfrastructureDomain>('water');
  const [subcategory, setSubcategory] = useState('Potable Water Supply Deficit');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [country, setCountry] = useState('India');
  const [district, setDistrict] = useState('Dhule (Dhulia)');
  const [pincode, setPincode] = useState('424001');
  const [ward, setWard] = useState('Ward 14 (Central Sector)');
  const [landmark, setLandmark] = useState('Public Health Post Road');
  const [latitude, setLatitude] = useState(20.9042);
  const [longitude, setLongitude] = useState(74.7749);
  const [affectedPop, setAffectedPop] = useState(4500);
  const [aiConfidence, setAiConfidence] = useState(0.92);
  const [contactValue, setContactValue] = useState('');
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [consentPublicMap, setConsentPublicMap] = useState(true);
  const [consentUpdates, setConsentUpdates] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<CitizenSubmission | null>(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTab, setSmsTab] = useState<'both' | 'hi' | 'en'>('both');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [autoDetectedNotification, setAutoDetectedNotification] = useState<string | null>(null);

  // Tracking State
  const [trackRef, setTrackRef] = useState('CP-IN-2026-4421');
  const [trackedSubmission, setTrackedSubmission] = useState<CitizenSubmission | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // WhatsApp Simulation State
  const [waMessages, setWaMessages] = useState([
    { sender: 'bot', text: '👋 Welcome to BRICS CivicPulse Official Citizen Bot. Please tell us your infrastructure issue or send a voice note.' },
  ]);
  const [waInput, setWaInput] = useState('');

  useEffect(() => {
    fetchSubmissions();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const trackCode = params.get('track');
      if (trackCode) {
        setTrackRef(trackCode);
        setActiveTab('track');
        handleTrackLookup(trackCode);
      }
    }
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setRecentSubmissions(data);
      }
    } catch (e) {
      console.warn('Could not load live submissions feed:', e);
    }
  }

  const handleAIResult = (
    text: string, 
    lang: SupportedLanguage, 
    aiResult?: AIExtractionResult, 
    locationData?: LiveLocationData
  ) => {
    setRawText(text);
    
    // Auto-populate from live GPS geolocation if available
    if (locationData) {
      if (locationData.district) setDistrict(locationData.district);
      if (locationData.pincode) setPincode(locationData.pincode);
      if (locationData.country) setCountry(locationData.country);
      if (locationData.ward) setWard(locationData.ward);
      if (locationData.landmark) setLandmark(locationData.landmark);
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
      
      setAutoDetectedNotification(`📍 Location & PIN ${locationData.pincode} captured via live GPS!`);
      setTimeout(() => setAutoDetectedNotification(null), 5000);
    }

    // Auto-populate from AI Intent extraction
    if (aiResult) {
      setCategory(aiResult.category);
      setSubcategory(aiResult.subcategory);
      setUrgency(aiResult.urgency);
      if (aiResult.affectedPopulationEstimate) {
        setAffectedPop(aiResult.affectedPopulationEstimate);
      }
      if (aiResult.confidenceScore) {
        setAiConfidence(aiResult.confidenceScore);
      }

      if (aiResult.locationDetails && !locationData) {
        if (aiResult.locationDetails.country) setCountry(aiResult.locationDetails.country);
        if (aiResult.locationDetails.district) setDistrict(aiResult.locationDetails.district);
        if (aiResult.locationDetails.pincode) setPincode(aiResult.locationDetails.pincode);
        if (aiResult.locationDetails.ward) setWard(aiResult.locationDetails.ward);
        if (aiResult.locationDetails.landmark) setLandmark(aiResult.locationDetails.landmark);
        if (aiResult.locationDetails.estimatedLat) setLatitude(aiResult.locationDetails.estimatedLat);
        if (aiResult.locationDetails.estimatedLng) setLongitude(aiResult.locationDetails.estimatedLng);

        setAutoDetectedNotification(`✨ AI extracted category "${aiResult.category.toUpperCase()}" and location ${aiResult.locationDetails.district}!`);
        setTimeout(() => setAutoDetectedNotification(null), 5000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      alert('Please describe or record your infrastructure issue before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        channel,
        language: selectedLanguage,
        rawInput: rawText,
        translatedText: rawText,
        category,
        subcategory,
        urgency,
        affectedPopulationEstimate: affectedPop,
        location: {
          country,
          district,
          pincode,
          ward,
          landmark,
          latitude,
          longitude,
          uncertaintyRadiusMeters: 300,
          confidence: aiConfidence,
          formattedAddress: `${ward}, ${district}, PIN: ${pincode}, ${country}`,
        },
        extractedEntities: [
          { field: 'reported_domain', value: category, confidence: 0.95 },
          { field: 'specific_issue', value: subcategory, confidence: 0.91 },
          { field: 'pincode', value: pincode, confidence: 0.98 },
          { field: 'district', value: district, confidence: 0.94 },
        ],
        aiConfidenceScore: aiConfidence,
        status: 'submitted',
        isAssisted: channel === 'assisted_desk',
        citizenConsent: {
          dataAnalytics: consentAnalytics,
          publicMapAggregation: consentPublicMap,
          contactForUpdates: consentUpdates,
          contactValue: contactValue || undefined,
        },
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit request');
      const data: CitizenSubmission = await res.json();
      
      // Update local state and prepend into the live problem feed immediately!
      setSubmittedRecord(data);
      setRecentSubmissions(prev => [data, ...prev]);
      setShowSmsModal(true);

      // Safe client-side confetti trigger
      if (typeof window !== 'undefined') {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }

    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (codeToSearch?: string) => {
    const code = (codeToSearch || trackRef).trim();
    if (!code) return;

    setTrackRef(code);
    setTrackLoading(true);
    setTrackError(null);
    setTrackedSubmission(null);
    setFeedbackSubmitted(false);

    try {
      const res = await fetch(`/api/submissions/${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error('Reference code not found in active registry');
      const data: CitizenSubmission = await res.json();
      setTrackedSubmission(data);
    } catch (err: any) {
      setTrackError(err.message || 'Unable to locate submission');
    } finally {
      setTrackLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleSendFeedback = async () => {
    if (!trackedSubmission) return;
    try {
      const res = await fetch(`/api/submissions/${trackedSubmission.referenceCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      alert('Failed to send feedback');
    }
  };

  const [isWaTyping, setIsWaTyping] = useState(false);

  const handleWaSend = async (overrideText?: string) => {
    const textToSend = (overrideText || waInput).trim();
    if (!textToSend || isWaTyping) return;

    const userMsg = { sender: 'user', text: textToSend };
    setWaMessages(prev => [...prev, userMsg]);
    if (!overrideText) setWaInput('');
    setIsWaTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: waMessages,
          location: {
            country,
            district,
            pincode,
            ward,
            landmark,
            latitude,
            longitude
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWaMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        
        // If a new submission was registered, add it to live feed
        if (data.submission) {
          setRecentSubmissions(prev => [data.submission, ...prev]);
        }
      } else {
        setWaMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: '⚠️ Hello, I am here to help. You can report an infrastructure problem (e.g. water, road, electricity) or type a reference code to check status.' 
          }
        ]);
      }
    } catch (err) {
      setWaMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: '⚠️ Hello! I received your message. Please share your infrastructure issue with area and pincode.' 
        }
      ]);
    } finally {
      setIsWaTyping(false);
    }
  };

  const renderFormattedMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return (
        <span key={lIdx} className="block min-h-[1.25em]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-stone-950">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={pIdx} className="font-semibold text-stone-900">{part.slice(1, -1)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 text-stone-900">
      
      {/* Prototype Environment Notice */}
      <PrototypeDisclosure variant="banner" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-700 font-bold mb-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            <span>FR-01, FR-02 & FR-11 Public Citizen Interface</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 tracking-tight mt-1">
            Citizen Voice & Demand Portal
          </h1>
          <p className="text-sm text-stone-700 mt-1 max-w-3xl font-medium">
            Speak your local infrastructure problem in your dialect. The AI automatically captures your GPS location, district & pincode, categorizes the urgency, and routes it directly to municipal government engineers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white border-2 border-orange-200 text-xs font-bold self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'submit' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm' : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            Submit Problem
          </button>
          <button
            onClick={() => {
              setActiveTab('track');
              handleTrackLookup('CP-IN-2026-8491');
            }}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'track' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm' : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'whatsapp' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Bot</span>
          </button>
          <button
            onClick={() => setActiveTab('ussd')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'ussd' ? 'bg-amber-600 text-white font-bold' : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2G / USSD</span>
          </button>
        </div>
      </div>

      {/* Auto-detected notification banner */}
      {autoDetectedNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{autoDetectedNotification}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MULTI-CHANNEL CIVIC INTAKE ARCHITECTURE (Priority 6 Alignment)       */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-orange-500/30">
              Universal Ingestion
            </span>
            <h2 className="text-sm font-bold text-white">Multi-Channel Civic Intake Architecture</h2>
          </div>
          <div className="flex items-center gap-2">
            <DataStatusBadge status="simulated" size="xs" />
            <span className="text-[11px] font-mono text-stone-400">Prototype Gateway Integration</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => { setActiveTab('submit'); setChannel('web_voice'); }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              activeTab === 'submit' && channel === 'web_voice'
                ? 'bg-orange-950/40 border-orange-500 ring-1 ring-orange-500'
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎙️</span>
              <span className="text-[10px] font-mono font-bold text-orange-400 uppercase bg-orange-950/60 px-2 py-0.5 rounded">Voice Channel</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Vernacular Speech</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Citizen speaks naturally in 7 languages with live audio transcription & auto-GPS.</p>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('submit'); setChannel('web_text'); }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              activeTab === 'submit' && channel === 'web_text'
                ? 'bg-orange-950/40 border-orange-500 ring-1 ring-orange-500'
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">💬</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded">Web Portal</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Multimodal Web Text</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Direct complaint registration with photo/evidence uploads and live tracking.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">📱</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded">WhatsApp Gateway</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">WhatsApp Bot</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Conversational messaging gateway for location pins, voice clips, and status checks.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ussd')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              activeTab === 'ussd'
                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">✉️</span>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-950/60 px-2 py-0.5 rounded">2G SMS / USSD</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Low-Bandwidth Intake</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Feature-phone compatible intake via toll-free shortcode strings without Internet.</p>
            </div>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-500 border-t border-stone-800">
          <span>Ingestion Pipeline: WhatsApp / SMS / Voice → Messaging Gateway → CivicPulse AI Intake → Classification + Geo</span>
          <span className="text-orange-400">Zero Commercial APIs Required</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SUBMIT PROBLEM                                                */}
      {/* ==================================================================== */}
      {activeTab === 'submit' && (
        <div className="space-y-12">
          
          {submittedRecord ? (
            /* Success Receipt Card */
            <div className="rounded-3xl bg-white border-2 border-emerald-300 shadow-lg p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Problem Registered & Forwarded to Government
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 mt-2">
                  Reference Code: <span className="text-orange-600 font-mono">{submittedRecord.referenceCode}</span>
                </h2>
                <p className="text-xs text-stone-700 leading-relaxed max-w-lg mx-auto font-medium">
                  Your complaint has been normalized with AI and transferred to the District Operations Triage Desk with live GPS and Pincode coordinates.
                </p>
              </div>

              {/* Receipt Details */}
              <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200 text-left text-xs space-y-2.5 font-mono">
                <div className="flex justify-between border-b border-orange-200/60 pb-1.5">
                  <span className="text-stone-600 font-sans font-semibold">Infrastructure Domain:</span>
                  <span className="text-orange-800 uppercase font-extrabold">{submittedRecord.category} ({submittedRecord.subcategory})</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/60 pb-1.5">
                  <span className="text-stone-600 font-sans font-semibold">Captured Location:</span>
                  <span className="text-stone-900 font-bold">{submittedRecord.location.district}, PIN: {submittedRecord.location.pincode || '424001'}</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/60 pb-1.5">
                  <span className="text-stone-600 font-sans font-semibold">Severity / Urgency:</span>
                  <span className="text-red-700 font-bold uppercase">{submittedRecord.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-sans font-semibold">Triage Desk Status:</span>
                  <span className="text-emerald-700 font-extrabold uppercase bg-emerald-100 px-2 py-0.5 rounded">{submittedRecord.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmittedRecord(null);
                    setRawText('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors border border-stone-300"
                >
                  Submit Another Issue
                </button>
                <Link
                  href="/operations"
                  className="px-5 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-xs font-bold text-orange-900 transition-colors border border-orange-300 flex items-center space-x-1"
                >
                  <span>View in Government Triage Desk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    setTrackRef(submittedRecord.referenceCode);
                    setActiveTab('track');
                    handleTrackLookup(submittedRecord.referenceCode);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5"
                >
                  <span>Track Status Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Multichannel Voice/Text Studio (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Channel & Language Selection */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border-2 border-orange-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-800">Intake Channel:</span>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as SubmissionChannel)}
                      className="bg-orange-50 border border-orange-300 px-3 py-1.5 rounded-xl text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="web_voice">🎙️ Multilingual Voice Note</option>
                      <option value="web_text">✍️ Written Text Description</option>
                      <option value="assisted_desk">🏢 Assisted Call-Centre Desk</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-800">Spoken Dialect:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                      className="bg-orange-50 border border-orange-300 px-3 py-1.5 rounded-xl text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="en">🌐 English (Global)</option>
                      <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                      <option value="pt">🇧🇷 Português (Brasil)</option>
                      <option value="ru">🇷🇺 Русский (Russian)</option>
                      <option value="zh">🇨🇳 中文 (Chinese)</option>
                      <option value="ar">🇪🇬 العربية (Arabic)</option>
                      <option value="sw">🇪🇹 Kiswahili (Swahili)</option>
                    </select>
                  </div>
                </div>

                {/* Voice Recorder & Real-time AI Extraction Component */}
                <VoiceRecorder
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={(l) => setSelectedLanguage(l)}
                  onTranscriptionComplete={handleAIResult}
                />

              </div>

              {/* Right Column: Location, AI Classification Review & Submission Action (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Location Card with Pincode and GPS */}
                <div className="rounded-3xl bg-white border-2 border-orange-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                    <div className="flex items-center space-x-2 text-xs font-extrabold text-stone-900">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span>Captured Location & Pincode</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      GPS Active
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-800 font-bold">BRICS Member Nation</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl bg-orange-50/50 border border-orange-200 text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                      >
                        <option value="India">🇮🇳 India</option>
                        <option value="South Africa">🇿🇦 South Africa</option>
                        <option value="Brazil">🇧🇷 Brazil</option>
                        <option value="Russia">🇷🇺 Russia</option>
                        <option value="China">🇨🇳 China</option>
                        <option value="Egypt">🇪🇬 Egypt</option>
                        <option value="Ethiopia">🇪🇹 Ethiopia</option>
                        <option value="UAE">🇦🇪 United Arab Emirates</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-800 font-bold">District / City</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Dhule / Tshwane"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-orange-200 text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-stone-800 font-bold flex items-center justify-between">
                          <span>Pincode / Postal Code</span>
                          <span className="text-[10px] text-orange-600 font-mono">Auto-GPS</span>
                        </label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="e.g. 424001 or 0152"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-orange-200 text-orange-900 font-mono font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-800 font-bold">Ward / Sector</label>
                        <input
                          type="text"
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          placeholder="Ward 14"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-stone-800 font-bold">Landmark / Route</label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near Community Well"
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* AI Classification Category Review */}
                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <label className="text-stone-800 font-bold">Classified Domain & Urgency</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as InfrastructureDomain)}
                          className="px-2.5 py-2 rounded-xl bg-orange-50 border border-orange-300 text-xs font-bold text-stone-900 capitalize"
                        >
                          <option value="water">💧 Water & Sanitation</option>
                          <option value="roads">🛣️ Roads & Bridges</option>
                          <option value="connectivity">📶 Digital & Telecom</option>
                          <option value="energy">⚡ Energy & Grid</option>
                          <option value="sanitation">♻️ Waste & Drainage</option>
                          <option value="health">🏥 Primary Health Clinic</option>
                        </select>

                        <select
                          value={urgency}
                          onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                          className={`px-2.5 py-2 rounded-xl border text-xs font-bold uppercase ${
                            urgency === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                            urgency === 'high' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="critical">🔴 Critical Emergency</option>
                          <option value="high">🟠 High Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="low">🔵 Low Priority</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-950 leading-relaxed font-medium">
                      <span className="font-bold">Spatial Privacy: </span>
                      Your GPS coords ({latitude.toFixed(3)}, {longitude.toFixed(3)}) are clustered into 300m buffers for public heatmaps while municipal workers receive exact repair points.
                    </div>
                  </div>
                </div>

                {/* Consent & Submit Card */}
                <div className="rounded-3xl bg-white border-2 border-orange-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-stone-900 border-b border-orange-100 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Verification & Notification</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAnalytics}
                        onChange={(e) => setConsentAnalytics(e.target.checked)}
                        className="mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-800 font-medium">
                        Consent to NLP analysis for municipal infrastructure budgeting.
                      </span>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentPublicMap}
                        onChange={(e) => setConsentPublicMap(e.target.checked)}
                        className="mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-800 font-medium">
                        Include report on the public community demand heatmap.
                      </span>
                    </label>

                    {/* Prominent Mobile Phone Number Input */}
                    <div className="pt-2 border-t border-stone-200 space-y-1.5">
                      <label className="text-stone-900 font-bold flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-orange-600" />
                          <span>Mobile Number (For Instant SMS & WhatsApp Receipt)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Official Alert
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98234 56789 / +27 82 123 4567"
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-orange-50/50 border-2 border-orange-200 text-stone-900 text-xs font-mono font-bold placeholder:text-stone-400 focus:outline-none focus:border-orange-500 shadow-2xs"
                      />
                      <p className="text-[11px] text-stone-600 font-medium">
                        📱 You will receive an instant confirmation SMS with your Reference Code and tracking instructions in both Hindi & English.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !rawText.trim()}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
                      !rawText.trim() || isSubmitting
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-98'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Transmitting to Municipal Triage Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Problem to Government Desk</span>
                      </>
                    )}
                  </button>

                </div>

              </div>

            </form>
          )}

          {/* ================================================================ */}
          {/* LIVE CITIZEN SUBMITTED PROBLEMS FEED                             */}
          {/* ================================================================ */}
          <div className="rounded-3xl bg-white border-2 border-orange-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600 border border-orange-300">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-stone-900">
                    Live Submitted Problems & Community Pulse
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Real-time citizen demands registered across BRICS pilot territories with verified PIN codes.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-orange-800 bg-orange-100 px-3.5 py-1 rounded-full border border-orange-300 self-start sm:self-auto">
                {recentSubmissions.length} Verified Demands
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSubmissions.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-orange-50/40 border border-orange-200 hover:border-orange-400 hover:bg-white transition-all flex flex-col justify-between space-y-3 group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">
                        {item.referenceCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                        item.urgency === 'critical' ? 'bg-red-100 text-red-800 border border-red-300' :
                        item.urgency === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {item.urgency}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900">{item.subcategory}</h4>
                    <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed font-sans">
                      "{item.translatedText || item.rawInput}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-orange-100 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-stone-800 font-bold">{item.location.district}</span>
                      <span className="text-orange-700">({item.location.pincode || '424001'})</span>
                    </div>
                    <span className="text-emerald-800 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TRACK STATUS                                                  */}
      {/* ==================================================================== */}
      {activeTab === 'track' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-orange-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-700 font-bold mb-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live Municipal Audit Trail & Resolution Stepper</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 mt-1">
                Track Your Civic Issue Resolution Status
              </h2>
              <p className="text-xs text-stone-600 font-medium mt-1">
                Enter your unique reference code (e.g. CP-IN-2026-8491) to view real-time department assignment, field inspection dispatches, and SLA timers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                placeholder="Enter Reference Code (e.g. CP-IN-2026-4421)..."
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-orange-200 text-stone-900 font-mono font-bold text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 uppercase shadow-2xs"
              />
              <button
                onClick={() => handleTrackLookup()}
                disabled={trackLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shrink-0 shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                {trackLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Track Status</span>
              </button>
            </div>

            {/* Quick Track Reference Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono font-bold text-stone-500">Quick Track Live Cases:</span>
              {[
                { code: 'CP-IN-2026-4421', label: '🇮🇳 India 4G Deficit (Verified)' },
                { code: 'CP-ZA-2026-1049', label: '🇿🇦 South Africa Water Pipe (Clustered)' },
                { code: 'CP-BR-2026-9012', label: '🇧🇷 Brazil Bridge Collapse (Critical)' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleTrackLookup(item.code)}
                  className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-orange-100/70 hover:bg-orange-200 text-orange-950 border border-orange-300 shadow-2xs transition-all active:scale-95 flex items-center space-x-1"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {trackError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{trackError}</span>
              </div>
            )}

            {trackedSubmission && (
              <div className="space-y-6 pt-2">
                {/* Stepper Card */}
                <div className="p-6 rounded-3xl bg-orange-50/50 border-2 border-orange-200 shadow-sm space-y-6">
                  
                  {/* Case Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-300">
                        Official Case Record
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-extrabold text-stone-900 mt-1 flex items-center space-x-2">
                        <span>{trackedSubmission.referenceCode}</span>
                        <span className="text-xs font-mono font-bold text-stone-500">({trackedSubmission.category.toUpperCase()})</span>
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase shadow-2xs ${
                        trackedSubmission.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        trackedSubmission.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        trackedSubmission.status === 'verified' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-orange-100 text-orange-800 border border-orange-300'
                      }`}>
                        ● Status: {trackedSubmission.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* 5-STEP VISUAL PROGRESS TIMELINE */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      5-Stage Resolution Lifecycle
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            ✓
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">1. Received</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-tight">
                          GPS geocoded with 300m spatial privacy buffer.
                        </p>
                        <div className="text-[9px] font-mono text-emerald-800 font-bold">
                          {new Date(trackedSubmission.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
                        ['triaged', 'verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-orange-100/70 border-orange-400 ring-2 ring-orange-200'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            ['triaged', 'verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-orange-600 text-white'
                          }`}>
                            {['triaged', 'verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status) ? '✓' : '2'}
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">2. AI Triage</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-tight">
                          Urgency: <strong className="text-stone-900 uppercase">{trackedSubmission.urgency}</strong> (~{trackedSubmission.affectedPopulationEstimate || 2500} people).
                        </p>
                        <div className="text-[9px] font-mono text-stone-500">
                          {Math.round(trackedSubmission.aiConfidenceScore * 100)}% Confidence
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
                        ['verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                          ? 'bg-emerald-50 border-emerald-300'
                          : trackedSubmission.status === 'triaged'
                          ? 'bg-orange-100/70 border-orange-400 ring-2 ring-orange-200'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            ['verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}>
                            {['verified', 'approved', 'in_progress', 'resolved'].includes(trackedSubmission.status) ? '✓' : '3'}
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">3. Assigned</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-tight">
                          Allocated to <strong className="text-stone-900">{trackedSubmission.assignedDepartment || 'Municipal Division'}</strong>.
                        </p>
                        <div className="text-[9px] font-mono text-stone-500">
                          SLA &lt; 24h
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
                        ['approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                          ? 'bg-emerald-50 border-emerald-300'
                          : trackedSubmission.status === 'verified'
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            ['approved', 'in_progress', 'resolved'].includes(trackedSubmission.status)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}>
                            {['approved', 'in_progress', 'resolved'].includes(trackedSubmission.status) ? '✓' : '4'}
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">4. Inspection</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-tight">
                          Remediation work order active with municipal repair crew.
                        </p>
                        <div className="text-[9px] font-mono text-stone-500">
                          Field Crew Active
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
                        trackedSubmission.status === 'resolved'
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            trackedSubmission.status === 'resolved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}>
                            {trackedSubmission.status === 'resolved' ? '✓' : '5'}
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">5. Closure</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-tight">
                          Repaired & verified by local community residents.
                        </p>
                        <div className="text-[9px] font-mono text-stone-500">
                          Resident Verified
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-orange-200">
                    <div>
                      <span className="text-stone-500 font-semibold">Reported Issue:</span>
                      <p className="text-stone-900 font-bold mt-0.5">{trackedSubmission.subcategory}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">District & Pincode:</span>
                      <p className="text-stone-900 font-bold mt-0.5">
                        {trackedSubmission.location.district} (PIN: {trackedSubmission.location.pincode || '424001'}), {trackedSubmission.location.country}
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">Assigned Authority:</span>
                      <p className="text-orange-900 font-bold mt-0.5">{trackedSubmission.assignedDepartment || 'Municipal Engineering Division'}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">Reported At:</span>
                      <p className="text-stone-900 font-mono mt-0.5">{new Date(trackedSubmission.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Feedback rating if resolved or investigated */}
                  <div className="pt-4 border-t border-orange-200 space-y-3">
                    <h4 className="font-bold text-xs text-stone-900">Citizen Satisfaction Closure Feedback</h4>
                    {feedbackSubmitted || trackedSubmission.citizenFeedback ? (
                      <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Feedback recorded with 5 stars. Thank you for helping verify public infrastructure!</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="p-1 text-amber-500 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`} />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Was your issue resolved satisfactorily? (Optional comment)"
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={handleSendFeedback}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Submit Closure Rating
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: WHATSAPP SIMULATION                                           */}
      {/* ==================================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-white border-2 border-orange-200 shadow-md p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-stone-900 flex items-center space-x-2">
                  <span>BRICS CivicPulse WhatsApp Bot</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                    GovTech Verified
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Citizen Support • Powered by Multilingual DPI Gateway</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setWaMessages([
                { sender: 'bot', text: '👋 Welcome to BRICS CivicPulse Official Citizen Bot. Please tell us your infrastructure issue or send a voice note.' }
              ])}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
              title="Clear chat history"
            >
              Reset Chat
            </button>
          </div>

          {/* Chat Bubble Feed */}
          <div className="h-96 overflow-y-auto bg-[#f6f2ec] rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs shadow-inner border border-stone-200">
            {waMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'bot'
                    ? 'bg-white text-stone-900 shadow-sm mr-auto border border-stone-200'
                    : 'bg-emerald-700 text-white shadow-sm ml-auto font-medium'
                }`}
              >
                {renderFormattedMessage(msg.text)}
              </div>
            ))}

            {isWaTyping && (
              <div className="max-w-[85%] p-3 rounded-2xl bg-white text-stone-500 shadow-sm mr-auto border border-stone-200 flex items-center space-x-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span className="text-[11px] font-bold">CivicPulse AI is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Scenario Recommendation Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold mr-1">Quick prompts:</span>
            {[
              '👋 Hello!',
              '🚰 Water pipeline leaking PIN 424001',
              '🛣️ Broken road & potholes near market',
              '🔍 Track CP-IN-2026-8491',
              '🔒 Is my location private?'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleWaSend(chip.replace(/^[^\s]+\s/, ''))}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 shadow-2xs transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWaSend()}
              placeholder="Type your message, issue or reference code (e.g. CP-IN-2026-8491)..."
              disabled={isWaTyping}
              className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-orange-200 text-xs text-stone-900 font-medium focus:outline-none focus:border-orange-500 shadow-2xs font-sans"
            />
            <button
              onClick={() => handleWaSend()}
              disabled={isWaTyping || !waInput.trim()}
              className={`p-2.5 rounded-xl font-bold shrink-0 transition-all ${
                isWaTyping || !waInput.trim()
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: 2G / USSD SIMULATION                                          */}
      {/* ==================================================================== */}
      {activeTab === 'ussd' && (
        <div className="max-w-md mx-auto rounded-3xl bg-stone-900 text-stone-100 p-6 space-y-4 shadow-xl border-4 border-stone-800">
          <div className="text-center border-b border-stone-800 pb-3">
            <span className="text-[10px] font-mono text-amber-400 font-bold">2G Feature Phone • USSD *134*2742#</span>
          </div>

          <div className="bg-black/90 font-mono text-xs p-4 rounded-xl space-y-3 text-emerald-400 border border-emerald-900/60">
            <p>BRICS CivicPulse Offline USSD Gateway:</p>
            <p>1. Water Supply Deficit</p>
            <p>2. Road & Bridge Damage</p>
            <p>3. Power Grid Outage</p>
            <p>4. Healthcare Access Gap</p>
            <p>5. Enter Pincode Location</p>
            <p className="text-amber-300 pt-2">&gt; Reply with option [1-5]:</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. 1*424001#"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INSTANT BILINGUAL SMS & WHATSAPP DISPATCH CONFIRMATION MODAL         */}
      {/* ==================================================================== */}
      {showSmsModal && submittedRecord && (
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
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition-colors"
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
              <span className="text-orange-950 font-extrabold">{contactValue || '+91 98234 56789'}</span>
            </div>

            {/* Language Tabs for SMS Preview */}
            <div className="flex items-center space-x-1.5 border-b border-stone-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setSmsTab('both')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  smsTab === 'both' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Both Languages (दोनों भाषाएं)
              </button>
              <button
                onClick={() => setSmsTab('hi')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  smsTab === 'hi' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                🇮🇳 हिन्दी SMS
              </button>
              <button
                onClick={() => setSmsTab('en')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  smsTab === 'en' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                      <div>📋 <span className="text-stone-400 font-sans">शिकायत संदर्भ संख्या:</span> <strong className="text-orange-400 font-extrabold">{submittedRecord.referenceCode}</strong></div>
                      <div>🏷️ <span className="text-stone-400 font-sans">श्रेणी:</span> <span className="text-stone-200">{submittedRecord.category.toUpperCase()} ({submittedRecord.subcategory})</span></div>
                      <div>📍 <span className="text-stone-400 font-sans">स्थान:</span> <span className="text-stone-200">{submittedRecord.location.district} (पिन: {submittedRecord.location.pincode || '424001'})</span></div>
                      <div>🏢 <span className="text-stone-400 font-sans">संबंधित विभाग:</span> <span className="text-stone-200">{submittedRecord.assignedDepartment || 'सड़क एवं जल अवसंरचना प्रभाग'}</span></div>
                    </div>

                    <div className="pt-1 text-xs space-y-1">
                      <div className="font-bold text-amber-300">🔍 शिकायत की स्थिति (Status) कैसे ट्रैक करें?</div>
                      <div className="text-stone-300 pl-2 space-y-0.5 text-[11px]">
                        <div>1. ऑनलाइन: <strong className="text-white">brics-civicpulse.gov.in/citizen</strong> पर <strong className="text-orange-300">'Track Status'</strong> टैब में संदर्भ कोड <strong className="text-orange-400 font-mono">{submittedRecord.referenceCode}</strong> दर्ज करें।</div>
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
                      <div>📋 <span className="text-emerald-400/80 font-sans">Complaint Ref No:</span> <strong className="text-orange-400 font-extrabold">{submittedRecord.referenceCode}</strong></div>
                      <div>🏷️ <span className="text-emerald-400/80 font-sans">Category:</span> <span className="text-emerald-100">{submittedRecord.category.toUpperCase()} ({submittedRecord.subcategory})</span></div>
                      <div>📍 <span className="text-emerald-400/80 font-sans">Location:</span> <span className="text-emerald-100">{submittedRecord.location.district} (PIN: {submittedRecord.location.pincode || '424001'})</span></div>
                      <div>🏢 <span className="text-emerald-400/80 font-sans">Assigned Authority:</span> <span className="text-emerald-100">{submittedRecord.assignedDepartment || 'Municipal Engineering Division'}</span></div>
                    </div>

                    <div className="pt-1 text-xs space-y-1">
                      <div className="font-bold text-amber-300">🔍 HOW TO TRACK YOUR COMPLAINT STATUS:</div>
                      <div className="text-emerald-200 pl-2 space-y-0.5 text-[11px]">
                        <div>1. Web: Visit <strong className="text-white">brics-civicpulse.gov.in/citizen</strong> → Click <strong className="text-orange-300">'Track Status'</strong> → Enter code <strong className="text-orange-400 font-mono">{submittedRecord.referenceCode}</strong>.</div>
                        <div>2. WhatsApp: Send <strong className="text-orange-400 font-mono">{submittedRecord.referenceCode}</strong> to our official WhatsApp Bot for live updates.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(submittedRecord.referenceCode)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-stone-300"
              >
                {copiedCode === submittedRecord.referenceCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode === submittedRecord.referenceCode ? 'Copied Reference Code!' : 'Copy Reference Code'}</span>
              </button>

              <button
                onClick={() => {
                  setShowSmsModal(false);
                  setTrackRef(submittedRecord.referenceCode);
                  setActiveTab('track');
                  handleTrackLookup(submittedRecord.referenceCode);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
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
