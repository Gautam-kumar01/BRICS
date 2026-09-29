'use client';

import React, { useState } from 'react';
import DataStatusBadge from '@/components/DataStatusBadge';

interface PipelineStage {
  id: string;
  number: string;
  name: string;
  shortDesc: string;
  icon: string;
  status: 'active' | 'completed' | 'verified';
  inputExample: string;
  outputExample: string;
  technicalDetails: string;
  confidence?: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'intake',
    number: '01',
    name: 'Multi-Channel Intake',
    shortDesc: 'Ingests voice, text, WhatsApp & SMS streams',
    icon: '🎙️',
    status: 'verified',
    inputExample: 'Citizen speaks into mobile app or sends WhatsApp audio clip.',
    outputExample: 'Raw Audio Waveform (22s WebM, 16kHz sample rate) / Raw UTF-8 Text Buffer',
    technicalDetails: 'Polyglot WebRTC audio capture with adaptive bitrate & noise reduction.',
    confidence: 0.99,
  },
  {
    id: 'lang_detect',
    number: '02',
    name: 'Language Detection',
    shortDesc: 'Identifies dialect & native linguistic code',
    icon: '🌐',
    status: 'verified',
    inputExample: '"जहानाबाद के काको ब्लॉक में मुख्य पेयजल आपूर्ति पाइपलाइन..."',
    outputExample: 'Language: Hindi (hi-IN) — Script: Devanagari',
    technicalDetails: 'FastText & Whisper-large-v3 language ID vector classification.',
    confidence: 0.98,
  },
  {
    id: 'stt',
    number: '03',
    name: 'Speech-to-Text & Processing',
    shortDesc: 'Converts acoustic phonemes to normalized script',
    icon: '⚡',
    status: 'verified',
    inputExample: 'Acoustic audio buffer (22s, Hindi speech)',
    outputExample: '"जहानाबाद के काको ब्लॉक (पिनकोड 804408) में मुख्य पेयजल आपूर्ति पाइपलाइन 10 दिनों से टूटी हुई है।"',
    technicalDetails: 'Fine-tuned IndicWhisper / Groq Llama-3-Audio for sub-second streaming inference.',
    confidence: 0.97,
  },
  {
    id: 'translation',
    number: '04',
    name: 'Cross-Lingual Translation',
    shortDesc: 'Translates to standardized English for cross-BRICS analysis',
    icon: '🔄',
    status: 'verified',
    inputExample: 'Hindi transcript: "मुख्य पेयजल आपूर्ति पाइपलाइन 10 दिनों से टूटी हुई है।"',
    outputExample: '"The main drinking water supply pipeline in Kako Block (PIN 804408) has been ruptured for 10 days."',
    technicalDetails: 'Semantic alignment preserving administrative jargon and civic terms.',
    confidence: 0.96,
  },
  {
    id: 'intent',
    number: '05',
    name: 'Intent Extraction',
    shortDesc: 'Extracts core civic problem and root failure mode',
    icon: '🎯',
    status: 'verified',
    inputExample: '"600 से अधिक परिवारों को गंदा पानी मिल रहा है और अस्पताल में भी जल संकट है।"',
    outputExample: 'Intent: INFRASTRUCTURE_FAILURE_REPORT • Asset: Potable Water Main',
    technicalDetails: 'Few-shot structured JSON extraction with validation schemas.',
    confidence: 0.96,
  },
  {
    id: 'classification',
    number: '06',
    name: 'Infrastructure Classification',
    shortDesc: 'Routes to one of 6 SDG infrastructure domains',
    icon: '🏷️',
    status: 'verified',
    inputExample: 'Drinking water pipeline rupture + contaminated supply',
    outputExample: 'Domain: WATER & SANITATION (SDG 6.1) • Subcategory: Primary Pipeline Rupture',
    technicalDetails: 'Multi-label taxonomy classification mapped to municipal departments (PHED).',
    confidence: 0.98,
  },
  {
    id: 'urgency',
    number: '07',
    name: 'Urgency Detection',
    shortDesc: 'Evaluates public health hazard & isolation scale',
    icon: '🚨',
    status: 'verified',
    inputExample: 'Contaminated hospital supply + 600 households without potable water for 10 days',
    outputExample: 'Urgency Level: CRITICAL (Score: 94/100) • SLA Window: < 24 Hours',
    technicalDetails: 'Rule-augmented neural safety gate; elevates health facility deficits automatically.',
    confidence: 0.95,
  },
  {
    id: 'geo',
    number: '08',
    name: 'Geospatial Resolution',
    shortDesc: 'Resolves postal PIN code, block, and GPS coordinates',
    icon: '📍',
    status: 'verified',
    inputExample: '"काको ब्लॉक, जहानाबाद (पिनकोड 804408), निकट काको स्वास्थ्य केंद्र"',
    outputExample: 'Lat: 25.1788°N, Lng: 85.0315°E • District: Jehanabad • Uncertainty Buffer: 250m',
    technicalDetails: 'Spatial gazetteer join with DPG privacy-preserving location obfuscation.',
    confidence: 0.96,
  },
  {
    id: 'clustering',
    number: '09',
    name: 'Duplicate Detection & Clustering',
    shortDesc: 'Groups nearby overlapping reports into demand hotspots',
    icon: '🔗',
    status: 'verified',
    inputExample: '42 independent citizen submissions within 500m radius of Kako Block during 7-day window',
    outputExample: 'Assigned Cluster: cl-jhn-wat-01 (Kako Drinking Water Grid Hotspot) • 42 Submissions',
    technicalDetails: 'DBSCAN spatio-temporal clustering with cosine semantic similarity threshold (τ = 0.82).',
    confidence: 0.94,
  },
  {
    id: 'fusion',
    number: '10',
    name: 'Multi-Source Data Fusion',
    shortDesc: 'Combines citizen demand with Census, ISI, & MTIP budgets',
    icon: '🧬',
    status: 'verified',
    inputExample: 'Cluster cl-jhn-wat-01 + Jehanabad Demographics + ISI Index (82% Gap) + Public Investment ($0)',
    outputExample: 'Fused Vector: Demand (96) + Population (28.5k) + Vulnerability (95) + Gap (82%) + Investment (Low)',
    technicalDetails: 'Spatial overlay join across 4 independent heterogeneous municipal datasets.',
    confidence: 0.93,
  },
  {
    id: 'scoring',
    number: '11',
    name: 'Explainable Priority Scoring',
    shortDesc: 'Generates transparent composite rank for policymakers',
    icon: '📊',
    status: 'verified',
    inputExample: 'Weighted combination: Demand (25%) + Gap (20%) + Vulnerability (20%) + Population (15%) + Efficiency (20%)',
    outputExample: 'Composite Priority Score: 94.2 / 100 • Rank #1 in District',
    technicalDetails: 'Linear multi-criteria decision analysis (MCDA) with deterministic score attribution.',
    confidence: 0.96,
  },
  {
    id: 'governance',
    number: '12',
    name: 'Human-in-the-Loop Review',
    shortDesc: 'AI recommends. Authorized policymakers decide.',
    icon: '🏛️',
    status: 'active',
    inputExample: 'Candidate Recommendation rec-jhn-01 presented with full evidence packet',
    outputExample: 'Status: AWAITING AUTHORIZED HUMAN APPROVAL • Audit Event #AUD-2026-8812 Logged',
    technicalDetails: 'Non-autonomous governance gate; requires signed official approval with rationale.',
    confidence: 1.0,
  },
];

export function AIPipelineVisualizer() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(PIPELINE_STAGES[9]); // Default to Data Fusion stage

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-8 text-stone-100 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold uppercase">
              End-to-End Decision Architecture
            </span>
            <DataStatusBadge status="simulated" size="xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
            CivicPulse AI Decision Pipeline
          </h2>
          <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl">
            From raw voice audio to explainable capital allocation: 12 verifiable, auditable stages combining grassroots voice with structural datasets under strict human oversight.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-stone-950 px-3 py-2 rounded-xl border border-stone-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-stone-300">12 Stages Active • Zero Black-Box Decisions</span>
        </div>
      </div>

      {/* Interactive Horizontal / Grid Pipeline Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const isSelected = selectedStage.id === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-orange-950/40 border-orange-500 shadow-lg shadow-orange-950/50 ring-1 ring-orange-500'
                  : 'bg-stone-950 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{stage.icon}</span>
                <span className={`font-mono text-[10px] font-extrabold ${isSelected ? 'text-orange-400' : 'text-stone-500'}`}>
                  {stage.number}
                </span>
              </div>
              <div className="mt-3">
                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>
                  {stage.name}
                </h4>
                <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
                  {stage.shortDesc}
                </p>
              </div>
              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rotate-45 rounded-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Stage Deep Dive Card */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedStage.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orange-400">Stage {selectedStage.number}</span>
                <span className="text-stone-600">•</span>
                <h3 className="text-lg font-bold text-white">{selectedStage.name}</h3>
              </div>
              <p className="text-xs text-stone-400">{selectedStage.shortDesc}</p>
            </div>
          </div>

          {selectedStage.confidence && (
            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <span className="text-stone-400">Confidence:</span>
              <span className="font-mono font-bold text-emerald-400">{(selectedStage.confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Live Input / Output Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-400">Sample Stage Input</span>
              <span className="text-[10px] font-mono text-stone-500">Raw Stream</span>
            </div>
            <p className="text-xs text-stone-200 bg-stone-950 p-3 rounded-xl border border-stone-800/80 font-mono leading-relaxed">
              {selectedStage.inputExample}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-orange-300">Normalized Stage Output</span>
              <span className="text-[10px] font-mono text-orange-400">Structured Payload</span>
            </div>
            <p className="text-xs text-orange-200 bg-stone-950 p-3 rounded-xl border border-orange-500/20 font-mono leading-relaxed">
              {selectedStage.outputExample}
            </p>
          </div>
        </div>

        {/* Technical Rigor & Governance Note */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">⚙️</span>
            <span><strong className="text-stone-300">Underlying Mechanism:</strong> {selectedStage.technicalDetails}</span>
          </div>
          <span className="font-mono text-[11px] text-stone-500 shrink-0">Open Architecture • Verifiable Pipeline</span>
        </div>
      </div>
    </div>
  );
}

export default AIPipelineVisualizer;
