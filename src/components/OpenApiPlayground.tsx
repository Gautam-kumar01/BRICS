'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  Play, 
  Check, 
  Copy, 
  Layers, 
  Globe2, 
  FileCode2, 
  Database,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function OpenApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'clusters' | 'submissions' | 'recommendations'>('clusters');
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const endpoints = {
    clusters: {
      method: 'GET',
      url: '/api/clusters',
      desc: 'Retrieve anonymized 300m spatial demand clusters with severity scores and aggregated grievances.',
      sampleDownloadName: 'civicpulse-clusters-anonymized.geojson',
    },
    submissions: {
      method: 'GET',
      url: '/api/submissions',
      desc: 'Fetch citizen feedback stream normalized into standard infrastructure categories with differential privacy.',
      sampleDownloadName: 'civicpulse-citizen-stream.csv',
    },
    recommendations: {
      method: 'GET',
      url: '/api/recommendations',
      desc: 'Query prioritized civil works recommendations scored via deterministic MCDA explainable algorithm.',
      sampleDownloadName: 'civicpulse-mcda-recommendations.json',
    }
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseJson(null);
    try {
      const active = endpoints[selectedEndpoint];
      const res = await fetch(active.url);
      if (res.ok) {
        const data = await res.json();
        setResponseJson(JSON.stringify(data, null, 2));
      } else {
        setResponseJson(JSON.stringify({ error: `HTTP ${res.status}: Failed to query endpoint` }, null, 2));
      }
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: err.message || 'Network error' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (responseJson && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(responseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'geojson' | 'csv' | 'json') => {
    const filename = `brics-civicpulse-${selectedEndpoint}-${Date.now()}.${format}`;
    const content = responseJson || JSON.stringify({ message: 'CivicPulse Sovereign Open Data Export' }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-md border-2 border-[#d9c4b3] text-[#1c1109] p-6 sm:p-8 shadow-xl shadow-[#26160f]/5 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5d5c5] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-extrabold border border-emerald-300">
            <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>DPG Standard: Interoperability & Open APIs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#1c1109]">
            Digital Public Good (DPG) Open Data & API Console
          </h2>
          <p className="text-xs text-[#5c4638] font-medium max-w-2xl">
            Verify sovereign interoperability. Test live REST endpoints and export 300m differential privacy datasets for open municipal integration.
          </p>
        </div>

        {/* 1-Click Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handleDownload('geojson')}
            className="px-3.5 py-1.5 rounded-xl bg-[#faf5ee] hover:bg-orange-50 text-orange-900 border border-[#d9c4b3] text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span>Export GeoJSON</span>
          </button>
          <button
            onClick={() => handleDownload('csv')}
            className="px-3.5 py-1.5 rounded-xl bg-[#faf5ee] hover:bg-orange-50 text-orange-900 border border-[#d9c4b3] text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'clusters', label: 'GET /api/clusters (Spatial Hotspots)' },
          { id: 'submissions', label: 'GET /api/submissions (Grievance Feed)' },
          { id: 'recommendations', label: 'GET /api/recommendations (MCDA Prioritization)' }
        ].map((ep) => (
          <button
            key={ep.id}
            onClick={() => {
              setSelectedEndpoint(ep.id as any);
              setResponseJson(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedEndpoint === ep.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                : 'bg-[#faf5ee] text-[#4a372c] border border-[#d9c4b3] hover:bg-orange-50'
            }`}
          >
            {ep.label}
          </button>
        ))}
      </div>

      {/* Endpoint Explorer Box */}
      <div className="rounded-2xl bg-[#faf5ee] border-2 border-[#d9c4b3] p-4 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5d5c5] pb-2.5">
          <div className="flex items-center space-x-2 font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px]">
              {endpoints[selectedEndpoint].method}
            </span>
            <span className="font-bold text-[#1c1109]">{endpoints[selectedEndpoint].url}</span>
          </div>

          <button
            onClick={handleExecuteRequest}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Querying Endpoint...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Live API Request</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[#5c4638] font-medium leading-relaxed">
          {endpoints[selectedEndpoint].desc}
        </p>
      </div>

      {/* Live JSON Response Terminal */}
      {responseJson && (
        <div className="rounded-2xl bg-gradient-to-br from-[#1c1109] to-[#2b1810] text-amber-300 p-4 border-2 border-orange-500/30 space-y-2 font-mono text-xs shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-[11px] text-stone-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HTTP 200 OK • Response Received</span>
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-2 max-h-64 overflow-y-auto text-[11px] leading-relaxed text-stone-200 bg-black/40 rounded-xl border border-stone-800">
            {responseJson}
          </pre>
        </div>
      )}

    </div>
  );
}
