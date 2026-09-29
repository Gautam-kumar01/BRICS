'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Filter, 
  Eye, 
  Activity, 
  Droplet, 
  Wifi, 
  Car, 
  Zap, 
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { DemandCluster, InfrastructureDomain } from '@/types';

interface MapComponentProps {
  clusters?: DemandCluster[];
  selectedClusterId?: string;
  onSelectCluster?: (cluster: DemandCluster) => void;
  showOverlayLayers?: boolean;
}

const REGION_CENTERS = [
  { name: 'South Africa (Tshwane / Gauteng)', country: 'South Africa', lat: -25.52, lng: 28.09, zoom: 11 },
  { name: 'India (Dhule / Maharashtra)', country: 'India', lat: 20.90, lng: 74.77, zoom: 11 },
  { name: 'Brazil (Recife / Pernambuco)', country: 'Brazil', lat: -8.04, lng: -34.87, zoom: 11 },
  { name: 'China (Liangshan / Sichuan)', country: 'China', lat: 27.69, lng: 103.24, zoom: 10 },
  { name: 'Russia (Zarechny / Urals)', country: 'Russia', lat: 56.81, lng: 61.32, zoom: 10 },
  { name: 'Egypt (Giza / Al-Ayat)', country: 'Egypt', lat: 29.62, lng: 31.25, zoom: 10 },
  { name: 'Ethiopia (Adama / Oromia)', country: 'Ethiopia', lat: 8.54, lng: 39.27, zoom: 10 },
];

export default function MapComponent({
  clusters = [],
  selectedClusterId,
  onSelectCluster,
  showOverlayLayers = true,
}: MapComponentProps) {
  const [activeRegion, setActiveRegion] = useState(REGION_CENTERS[0]);
  const [selectedDomain, setSelectedDomain] = useState<InfrastructureDomain | 'all'>('all');
  const [showUncertaintyRadius, setShowUncertaintyRadius] = useState(true);
  const [showVulnerabilityChoropleth, setShowVulnerabilityChoropleth] = useState(true);
  const [hoveredCluster, setHoveredCluster] = useState<DemandCluster | null>(null);

  const filteredClusters = clusters.filter(c => {
    if (selectedDomain !== 'all' && c.domain !== selectedDomain) return false;
    return true;
  });

  const getDomainColor = (domain: InfrastructureDomain) => {
    switch (domain) {
      case 'water': return { bg: 'bg-blue-600', text: 'text-blue-300', border: 'border-blue-500', glow: 'rgba(59, 130, 246, 0.45)', hex: '#3b82f6' };
      case 'roads': return { bg: 'bg-civic-orange', text: 'text-orange-200', border: 'border-civic-orange', glow: 'rgba(249, 115, 22, 0.45)', hex: '#f97316' };
      case 'connectivity': return { bg: 'bg-purple-600', text: 'text-purple-300', border: 'border-purple-500', glow: 'rgba(168, 85, 247, 0.45)', hex: '#a855f7' };
      case 'energy': return { bg: 'bg-amber-500', text: 'text-amber-200', border: 'border-amber-500', glow: 'rgba(245, 158, 11, 0.45)', hex: '#f59e0b' };
      case 'health': return { bg: 'bg-emerald-600', text: 'text-emerald-300', border: 'border-emerald-500', glow: 'rgba(16, 185, 129, 0.45)', hex: '#10b981' };
      default: return { bg: 'bg-civic-orange', text: 'text-orange-200', border: 'border-civic-orange', glow: 'rgba(249, 115, 22, 0.45)', hex: '#f97316' };
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden glass-panel border border-civic-orange/20 flex flex-col">
      
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* Region Quick Navigator */}
        <div className="flex items-center space-x-1.5 bg-brics-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-civic-orange/30 shadow-xl">
          <MapPin className="w-4 h-4 text-civic-orange shrink-0" />
          <select
            value={activeRegion.name}
            onChange={(e) => {
              const match = REGION_CENTERS.find(r => r.name === e.target.value);
              if (match) setActiveRegion(match);
            }}
            className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            {REGION_CENTERS.map(r => (
              <option key={r.name} value={r.name} className="bg-brics-900 text-white">
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Domain Filters */}
        <div className="flex items-center space-x-1 bg-brics-950/95 backdrop-blur-md p-1 rounded-2xl border border-civic-orange/30 shadow-xl text-xs">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedDomain === 'all' ? 'bg-civic-orange text-white shadow-glow-orange' : 'text-brics-200 hover:text-white'
            }`}
          >
            All Domains
          </button>
          <button
            onClick={() => setSelectedDomain('water')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-all ${
              selectedDomain === 'water' ? 'bg-blue-600 text-white shadow-md' : 'text-brics-200 hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-blue-300" />
            <span>Water</span>
          </button>
          <button
            onClick={() => setSelectedDomain('roads')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-all ${
              selectedDomain === 'roads' ? 'bg-civic-orange text-white shadow-md' : 'text-brics-200 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-orange-200" />
            <span>Roads</span>
          </button>
          <button
            onClick={() => setSelectedDomain('connectivity')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-all ${
              selectedDomain === 'connectivity' ? 'bg-purple-600 text-white shadow-md' : 'text-brics-200 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-purple-200" />
            <span>Telecom/DPI</span>
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="hidden sm:flex items-center space-x-2 bg-brics-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-civic-orange/30 shadow-xl text-xs text-amber-200">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showUncertaintyRadius}
              onChange={(e) => setShowUncertaintyRadius(e.target.checked)}
              className="rounded bg-brics-900 border-white/20 text-civic-orange focus:ring-0"
            />
            <span className="text-[11px] font-semibold">Uncertainty Buffers</span>
          </label>
          <span className="text-white/20">|</span>
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showVulnerabilityChoropleth}
              onChange={(e) => setShowVulnerabilityChoropleth(e.target.checked)}
              className="rounded bg-brics-900 border-white/20 text-civic-orange focus:ring-0"
            />
            <span className="text-[11px] font-semibold">Demographic Vulnerability</span>
          </label>
        </div>

      </div>

      {/* Interactive Cartographic Map Viewport */}
      <div className="relative flex-1 w-full bg-[#160d07] overflow-hidden flex items-center justify-center">
        {/* Deep Cartographic Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Simulated Topographic / Administrative Boundary Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-warm" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(249,115,22,0.12)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-warm)" />
          <path d="M 50,150 Q 200,80 400,220 T 750,180 T 1100,300" fill="none" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1.5" strokeDasharray="6,6" />
          <path d="M 80,320 Q 300,400 550,280 T 900,380 T 1200,200" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" />
          <path d="M 20,450 Q 350,520 680,420 T 1100,480" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
        </svg>

        {/* Vulnerability Density Gradients */}
        {showVulnerabilityChoropleth && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-600/10 blur-3xl" />
          </div>
        )}

        {/* Clustered Demand Hotspots Nodes */}
        <div className="relative w-full h-full p-8 flex items-center justify-around">
          {filteredClusters.map((cluster, index) => {
            const colors = getDomainColor(cluster.domain);
            const isSelected = selectedClusterId === cluster.id;
            
            const positions = [
              { top: '38%', left: '26%' },
              { top: '55%', left: '52%' },
              { top: '32%', left: '72%' },
              { top: '68%', left: '34%' },
            ];
            const pos = positions[index % positions.length];

            return (
              <div
                key={cluster.id}
                style={{ top: pos.top, left: pos.left }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => onSelectCluster && onSelectCluster(cluster)}
                onMouseEnter={() => setHoveredCluster(cluster)}
                onMouseLeave={() => setHoveredCluster(null)}
              >
                {/* Uncertainty Buffer Radius Circle */}
                {showUncertaintyRadius && (
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed animate-pulse-subtle pointer-events-none"
                    style={{
                      width: `${Math.max(70, cluster.submissionCount * 2.2)}px`,
                      height: `${Math.max(70, cluster.submissionCount * 2.2)}px`,
                      borderColor: colors.hex,
                      backgroundColor: `${colors.hex}18`,
                    }}
                  />
                )}

                {/* Pulsing Core Radar Beacon */}
                <div 
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl ${colors.bg} text-white shadow-xl transition-transform duration-200 group-hover:scale-125 ${
                    isSelected ? 'ring-4 ring-amber-300 shadow-glow-orange scale-125' : ''
                  }`}
                  style={{ boxShadow: `0 0 20px ${colors.glow}` }}
                >
                  <span className="font-mono font-extrabold text-xs">
                    {cluster.submissionCount}
                  </span>
                  
                  <span 
                    className="absolute inset-0 rounded-2xl animate-ping opacity-30"
                    style={{ backgroundColor: colors.hex }}
                  />
                </div>

                {/* Floating Hotspot Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-brics-950 border border-civic-orange/40 shadow-2xl text-[11px] text-white font-bold group-hover:border-amber-400 transition-all">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.hex }} />
                    <span className="font-bold text-white">{cluster.district}</span>
                    <span className="text-[10px] text-amber-200 font-mono">({cluster.severityScore.toFixed(0)} sev)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover / Selected Cluster Information Card Overlay (Priority 10) */}
        {(hoveredCluster || (selectedClusterId && clusters.find(c => c.id === selectedClusterId))) && (
          <div className="absolute bottom-4 left-4 max-w-md rounded-3xl bg-stone-950/95 border border-orange-500/40 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 z-30 space-y-3 text-stone-100">
            {(() => {
              const current = hoveredCluster || clusters.find(c => c.id === selectedClusterId)!;
              const col = getDomainColor(current.domain);
              const urgentCount = Math.round(current.submissionCount * 0.35);
              const infGap = Math.round(current.severityScore * 0.9);
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-extrabold ${col.bg} text-white`}>
                      {current.domain} • {current.clusterCode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/30 font-bold">
                      AI Priority: {current.severityScore.toFixed(1)}/100
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-extrabold text-sm text-white leading-snug">
                      {current.title}
                    </h4>
                    <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                      {current.summaryRationale}
                    </p>
                  </div>

                  {/* Multi-Dimensional Hotspot Attributes */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 text-[11px] font-mono">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Area Jurisdiction:</span>
                      <strong className="text-white font-sans">{current.district}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Dominant Issue:</span>
                      <strong className="text-orange-400 uppercase font-sans">{current.domain}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Citizen Reports:</span>
                      <strong className="text-white">{current.submissionCount} (Urgent: {urgentCount})</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Affected Population:</span>
                      <strong className="text-cyan-400">~{current.affectedPopulation.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Infrastructure Gap:</span>
                      <strong className="text-rose-400">{infGap}% Deficit</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Existing Investment:</span>
                      <strong className="text-amber-400">Low / Unserved</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] font-mono text-stone-500">🛡️ 300m Privacy Obfuscation</span>
                    <a
                      href="/planning"
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>View Recommendation</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend with Continuous Demand & Gap Gradients */}
        <div className="absolute bottom-4 right-4 bg-stone-950/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-800 shadow-2xl text-[11px] text-stone-300 space-y-2.5 hidden md:block max-w-xs">
          <div className="flex items-center justify-between font-mono font-bold text-[10px] text-stone-400 uppercase tracking-wider border-b border-stone-800 pb-1">
            <span>Demand & Deficit Legend</span>
            <span className="text-orange-400">GIS 250m</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>Demand Density:</span>
              <span className="text-white font-bold">Low ─── High</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-orange-600" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>Infrastructure Gap:</span>
              <span className="text-rose-400 font-bold">Low ─── Critical</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600" />
          </div>

          <div className="pt-1 text-[10px] font-mono text-stone-500 leading-tight">
            Public View: 300m Aggregated Buffer • Precise operational GPS reserved for verified municipal engineers.
          </div>
        </div>

      </div>

    </div>
  );
}
