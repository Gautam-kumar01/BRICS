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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white border-2 border-orange-300 rounded-3xl shadow-2xl overflow-hidden text-stone-900 flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="provenance-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#faf6f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 font-bold text-lg shrink-0">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="provenance-title" className="text-base font-extrabold text-stone-900">Data Provenance & Traceability</h3>
                <DataStatusBadge status={prov.status} size="xs" />
              </div>
              <p className="text-xs text-stone-600 font-medium">Verifiable metadata regarding origin, collection period, and fidelity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="px-6 py-3.5 bg-orange-50 border-b border-orange-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-orange-800 font-extrabold block">
              Audited Indicator
            </span>
            <span className="text-sm font-bold text-stone-900">{metricName}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-mono text-orange-800 font-extrabold block">
              Observed / Forecast Value
            </span>
            <span className="text-base font-mono font-extrabold text-orange-700">{metricValue}</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Dataset Name</span>
              <p className="font-bold text-stone-900">{prov.datasetName}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Source Authority / Pipeline</span>
              <p className="font-bold text-stone-900">{prov.source}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Reference Year</span>
              <p className="font-mono font-bold text-stone-900">{prov.year}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Geographic Resolution</span>
              <p className="font-bold text-stone-900">{prov.geography}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Data Fidelity & Type</span>
              <p className="font-bold text-stone-900">{prov.dataType}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Last Synchronized</span>
              <p className="font-mono font-bold text-stone-900">{prov.lastUpdated}</p>
            </div>
          </div>

          {/* Prototype Disclosure Note */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-amber-900">
              <span>⚠️</span>
              <span>Prototype Data Integrity Note</span>
            </div>
            <p className="leading-relaxed font-medium">
              To maintain academic and governmental transparency, CivicPulse explicitly tags synthetic benchmark values as <span className="font-mono font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">SIMULATED</span>. In production deployment, this slot binds directly to verified National Open Government Data (OGD), Census Bureau APIs, and departmental ERP registries without architectural changes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-[#faf6f0] flex items-center justify-between text-xs">
          <span className="text-stone-600 font-mono font-bold">DPI Data Governance Standard v1.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataProvenanceModal;
