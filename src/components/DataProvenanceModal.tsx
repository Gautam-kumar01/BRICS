'use client';

import React from 'react';
import { DataProvenanceInfo, DataStatusType } from '@/types';
import DataStatusBadge from '@/components/DataStatusBadge';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provenance?: DataProvenanceInfo | null;
  metricName?: string;
  metricValue?: string | number;
}

export function DataProvenanceModal({
  isOpen,
  onClose,
  provenance,
  metricName = 'Metric Value',
  metricValue = 'N/A',
}: DataProvenanceModalProps) {
  if (!isOpen) return null;

  // Default fallback provenance if not explicitly passed
  const prov: DataProvenanceInfo = provenance || {
    datasetName: 'CivicPulse Regional Integrated Dataset',
    source: 'Illustrative Prototype Ingestion Stream',
    year: 2026,
    geography: 'District & Sub-District Enumeration Block',
    lastUpdated: '2026-09-29',
    dataType: 'Simulated Administrative & Sensor Metrics',
    status: 'simulated',
    confidenceScore: 0.94,
    methodologyUrl: 'https://github.com/Gautam-kumar01/BRICS#data-fusion-methodology',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="provenance-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="provenance-title" className="text-base font-bold text-white">Data Provenance & Traceability</h3>
                <DataStatusBadge status={prov.status} size="xs" />
              </div>
              <p className="text-xs text-stone-400">Verifiable metadata regarding origin, collection period, and fidelity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="px-6 py-4 bg-orange-950/20 border-b border-orange-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-mono text-orange-300 font-bold block">
              Audited Indicator
            </span>
            <span className="text-sm font-semibold text-white">{metricName}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider font-mono text-orange-300 font-bold block">
              Observed / Forecast Value
            </span>
            <span className="text-base font-mono font-extrabold text-orange-400">{metricValue}</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Dataset Name</span>
              <p className="font-semibold text-stone-200">{prov.datasetName}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Source Authority / Pipeline</span>
              <p className="font-semibold text-stone-200">{prov.source}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Reference Year</span>
              <p className="font-mono font-semibold text-stone-200">{prov.year}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Geographic Resolution</span>
              <p className="font-semibold text-stone-200">{prov.geography}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Data Fidelity & Type</span>
              <p className="font-semibold text-stone-200">{prov.dataType}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Last Synchronized</span>
              <p className="font-mono font-semibold text-stone-200">{prov.lastUpdated}</p>
            </div>
          </div>

          {/* Prototype Disclosure Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span>⚠️</span>
              <span>Prototype Data Integrity Note</span>
            </div>
            <p className="leading-relaxed">
              To maintain academic and governmental transparency, CivicPulse explicitly tags synthetic benchmark values as <span className="font-mono font-bold text-amber-300">SIMULATED</span>. In production deployment, this slot binds directly to verified National Open Government Data (OGD), Census Bureau APIs, and departmental ERP registries without architectural changes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-mono">DPI Data Governance Standard v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataProvenanceModal;
