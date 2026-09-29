'use client';

import React, { useState } from 'react';
import DataStatusBadge from '@/components/DataStatusBadge';
import DataProvenanceModal from '@/components/DataProvenanceModal';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';
import { DATASET_REGISTRY, BRICS_COUNTRIES_CONFIG } from '@/data/seed-data';
import { DataProvenanceInfo } from '@/types';
import Link from 'next/link';

export default function DataIntelligencePage() {
  const [selectedDataset, setSelectedDataset] = useState<any>(DATASET_REGISTRY[0]);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [activeProvenance, setActiveProvenance] = useState<DataProvenanceInfo | null>(null);

  const openProvenance = (ds: any) => {
    setActiveProvenance({
      datasetName: ds.name,
      source: ds.source,
      year: ds.year,
      geography: ds.geography,
      lastUpdated: ds.lastUpdated,
      dataType: ds.dataType,
      status: ds.status,
      confidenceScore: 0.96,
      sampleCount: ds.sampleCount,
      methodologyUrl: 'https://github.com/Gautam-kumar01/BRICS#data-fusion-methodology',
    });
    setProvenanceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Page Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
              Track 1 Core Innovation
            </span>
            <DataStatusBadge status="simulated" size="xs" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Data Intelligence & Multi-Source Fusion Layer
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Governments fail to allocate capital efficiently because citizen grievances, census records, asset condition surveys, and ministerial budget books live in disconnected silos. CivicPulse executes real-time spatial joins across 4 foundational datasets to generate explainable infrastructure priorities.
          </p>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="p-6 lg:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">4-Pillar Data Fusion Architecture</h2>
              <p className="text-xs text-stone-400">Continuous ingestion pipeline transforming unstructured feedback into evidence-based public capital allocations</p>
            </div>
            <span className="text-xs font-mono text-stone-400">Spatial Resolution: 250m GIS Grid</span>
          </div>

          {/* Stepper Diagram */}
          <div className="relative">
            {/* 4 Ingestion Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Citizen Demand */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-orange-500/40 space-y-3 relative group hover:border-orange-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎙️</span>
                  <span className="text-[10px] font-mono font-bold text-orange-400 uppercase bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">Pillar 1</span>
                </div>
                <h3 className="text-sm font-bold text-white">Citizen Demand Stream</h3>
                <ul className="text-xs text-stone-400 space-y-1.5 font-mono text-[11px]">
                  <li>• Voice, Text, WhatsApp & SMS</li>
                  <li>• NLP Intent & Urgency Extraction</li>
                  <li>• 300m Spatial PIN Clustering</li>
                  <li>• Duplicate Grievance Aggregation</li>
                </ul>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[10px]">
                  <span className="text-stone-500 font-mono">Weight: 25-30%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[0])} className="text-orange-400 hover:underline font-bold">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 2: Demographics */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-cyan-500/40 space-y-3 relative group hover:border-cyan-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👥</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">Pillar 2</span>
                </div>
                <h3 className="text-sm font-bold text-white">Demographic & Vulnerability</h3>
                <ul className="text-xs text-stone-400 space-y-1.5 font-mono text-[11px]">
                  <li>• Ward & Panchayat Census Density</li>
                  <li>• Age-Dependency & Health clinics</li>
                  <li>• Multidimensional Vulnerability Index</li>
                  <li>• Per-Capita Exposure Weighting</li>
                </ul>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[10px]">
                  <span className="text-stone-500 font-mono">Weight: 20-25%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[1])} className="text-cyan-400 hover:underline font-bold">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 3: Infrastructure Index */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-500/40 space-y-3 relative group hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏗️</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">Pillar 3</span>
                </div>
                <h3 className="text-sm font-bold text-white">Infrastructure Gap Index</h3>
                <ul className="text-xs text-stone-400 space-y-1.5 font-mono text-[11px]">
                  <li>• Piped Water & Tanker Deficits</li>
                  <li>• Road Quality & Culvert Scour</li>
                  <li>• Grid Power Outage Duration</li>
                  <li>• Target vs Baseline Deficit Gap</li>
                </ul>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[10px]">
                  <span className="text-stone-500 font-mono">Weight: 20-25%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[2])} className="text-emerald-400 hover:underline font-bold">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 4: Public Investment */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-purple-500/40 space-y-3 relative group hover:border-purple-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💰</span>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">Pillar 4</span>
                </div>
                <h3 className="text-sm font-bold text-white">Public Capital Investment</h3>
                <ul className="text-xs text-stone-400 space-y-1.5 font-mono text-[11px]">
                  <li>• Medium-Term Pipeline (MTIP)</li>
                  <li>• Active Contractor Tenders</li>
                  <li>• Underserved Spatial Blindspots</li>
                  <li>• Fiscal Capacity & Cost Efficiency</li>
                </ul>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[10px]">
                  <span className="text-stone-500 font-mono">Weight: 15-20%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[3])} className="text-purple-400 hover:underline font-bold">Inspect Provenance →</button>
                </div>
              </div>
            </div>

            {/* Fusion Arrow */}
            <div className="my-6 flex items-center justify-center">
              <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-stone-950 border border-stone-700 text-xs font-mono text-stone-300">
                <span>⬇️</span>
                <span className="font-bold text-white">CivicPulse Multi-Source Spatial Data Fusion Engine</span>
                <span>⬇️</span>
              </div>
            </div>

            {/* Downstream Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
                <span className="text-xs font-bold text-white block">1. Spatial Demand Hotspots</span>
                <p className="text-[11px] text-stone-400">High-resolution GIS heatmaps identifying severe unserved clusters</p>
                <Link href="/planning" className="inline-block text-[11px] font-bold text-orange-400 hover:underline mt-2">View Demand Map →</Link>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
                <span className="text-xs font-bold text-white block">2. Explainable AI Priority Engine</span>
                <p className="text-[11px] text-stone-400">Deterministic scoring with transparent mathematical attribution</p>
                <Link href="/planning" className="inline-block text-[11px] font-bold text-orange-400 hover:underline mt-2">Inspect Scoring Models →</Link>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
                <span className="text-xs font-bold text-white block">3. Human Policy Recommendations</span>
                <p className="text-[11px] text-stone-400">Awaiting authorized decision maker approval and capital sign-off</p>
                <Link href="/governance" className="inline-block text-[11px] font-bold text-orange-400 hover:underline mt-2">Human Governance Gate →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Registry Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🗄️</span>
                <span>Connected Dataset Registry & Provenance Catalog</span>
              </h2>
              <p className="text-xs text-stone-400">Transparent registry of all ingested data sources, refresh frequencies, and prototype fidelity levels</p>
            </div>
            <DataStatusBadge status="simulated" size="xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATASET_REGISTRY.map((ds) => (
              <div
                key={ds.id}
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300">
                      {ds.category}
                    </span>
                    <DataStatusBadge status={ds.status} size="xs" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{ds.name}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{ds.description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1.5 text-xs font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Source:</span>
                    <span className="text-stone-300 truncate max-w-[200px]">{ds.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Geo Resolution:</span>
                    <span className="text-stone-300">{ds.geography}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Last Synced:</span>
                    <span className="text-stone-300">{ds.lastUpdated}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-stone-500">~{ds.sampleCount.toLocaleString()} Data Points</span>
                  <button
                    onClick={() => openProvenance(ds)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Data Provenance 🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BRICS 11-Member Data Availability Matrix */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🌐</span>
                <span>BRICS 11-Member Data Availability Matrix</span>
              </h2>
              <p className="text-xs text-stone-400">Jurisdictional coverage without data fabrication. Unconnected regions display explicit unavailable state.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRICS_COUNTRIES_CONFIG.map((c) => (
              <div
                key={c.code}
                className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-[10px] font-mono font-bold text-stone-500">{c.code}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.name}</h4>
                  <p className="text-[10px] text-stone-500 font-mono">{c.currencySymbol} • {c.language.toUpperCase()}</p>
                </div>
                <div className="pt-1">
                  <DataStatusBadge
                    status={c.dataAvailability === 'available' ? 'simulated' : c.dataAvailability === 'partial' ? 'projected' : 'not_available'}
                    size="xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Provenance Modal */}
      <DataProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        provenance={activeProvenance}
        metricName={activeProvenance?.datasetName}
      />
    </div>
  );
}
