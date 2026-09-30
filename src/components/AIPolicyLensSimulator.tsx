'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  RefreshCw,
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface CandidateProject {
  id: string;
  code: string;
  title: string;
  domain: string;
  district: string;
  costUSD: number;
  beneficiaries: number;
  severityScore: number;     // 0-100
  popDensityScore: number;   // 0-100
  vulnerabilityScore: number;// 0-100
  serviceGapScore: number;   // 0-100
  costEfficiencyScore: number;// 0-100
  sdgScore: number;          // 0-100
}

const INITIAL_PROJECTS: CandidateProject[] = [
  {
    id: 'p1',
    code: 'PRJ-WATER-JH-01',
    title: 'Kako Block Potable Pipeline Overhaul & Solar Feeder Pumps',
    domain: 'water',
    district: 'Jehanabad (Bihar)',
    costUSD: 1450000,
    beneficiaries: 18500,
    severityScore: 94,
    popDensityScore: 88,
    vulnerabilityScore: 92,
    serviceGapScore: 90,
    costEfficiencyScore: 85,
    sdgScore: 96,
  },
  {
    id: 'p2',
    code: 'PRJ-ROADS-DH-02',
    title: 'Mohadi River Corridor Culvert Bridge & Scour Retrofit',
    domain: 'roads',
    district: 'Dhule (Maharashtra)',
    costUSD: 2100000,
    beneficiaries: 24000,
    severityScore: 88,
    popDensityScore: 82,
    vulnerabilityScore: 78,
    serviceGapScore: 89,
    costEfficiencyScore: 80,
    sdgScore: 84,
  },
  {
    id: 'p3',
    code: 'PRJ-ENERGY-TS-03',
    title: 'Mamelodi East Clinic Grid Microgrid & Feeder Stabilization',
    domain: 'energy',
    district: 'City of Tshwane (Gauteng)',
    costUSD: 1850000,
    beneficiaries: 31000,
    severityScore: 85,
    popDensityScore: 90,
    vulnerabilityScore: 86,
    serviceGapScore: 92,
    costEfficiencyScore: 88,
    sdgScore: 90,
  },
  {
    id: 'p4',
    code: 'PRJ-DRAIN-RC-04',
    title: 'Boa Viagem Storm Drainage Canal Modernization',
    domain: 'sanitation',
    district: 'Recife Metropolitan (Brazil)',
    costUSD: 2400000,
    beneficiaries: 42000,
    severityScore: 91,
    popDensityScore: 94,
    vulnerabilityScore: 80,
    serviceGapScore: 86,
    costEfficiencyScore: 76,
    sdgScore: 88,
  },
  {
    id: 'p5',
    code: 'PRJ-HEALTH-JH-05',
    title: 'Kako Community Health Sub-Centre Cold-Chain Expansion',
    domain: 'health',
    district: 'Jehanabad (Bihar)',
    costUSD: 950000,
    beneficiaries: 14200,
    severityScore: 82,
    popDensityScore: 76,
    vulnerabilityScore: 95,
    serviceGapScore: 84,
    costEfficiencyScore: 91,
    sdgScore: 94,
  }
];

export default function AIPolicyLensSimulator() {
  // MCDA Weight sliders (percentage out of 100)
  const [weights, setWeights] = useState({
    severity: 25,
    population: 20,
    vulnerability: 20,
    serviceGap: 15,
    costEfficiency: 10,
    sdgAlignment: 10,
  });

  const [activePreset, setActivePreset] = useState<string>('standard');
  const maxBudgetUSD = 7000000; // $7.0M USD allocation envelope

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'water_health') {
      setWeights({ severity: 35, population: 15, vulnerability: 25, serviceGap: 15, costEfficiency: 5, sdgAlignment: 5 });
    } else if (presetKey === 'climate') {
      setWeights({ severity: 20, population: 20, vulnerability: 15, serviceGap: 30, costEfficiency: 5, sdgAlignment: 10 });
    } else if (presetKey === 'economic') {
      setWeights({ severity: 15, population: 30, vulnerability: 10, serviceGap: 15, costEfficiency: 20, sdgAlignment: 10 });
    } else if (presetKey === 'equity') {
      setWeights({ severity: 20, population: 10, vulnerability: 40, serviceGap: 15, costEfficiency: 5, sdgAlignment: 10 });
    } else {
      // Standard balanced
      setWeights({ severity: 25, population: 20, vulnerability: 20, serviceGap: 15, costEfficiency: 10, sdgAlignment: 10 });
    }
  };

  // Compute live deterministic scores for each candidate project
  const scoredProjects = INITIAL_PROJECTS.map((p) => {
    const totalWeight = weights.severity + weights.population + weights.vulnerability + weights.serviceGap + weights.costEfficiency + weights.sdgAlignment;
    const norm = totalWeight > 0 ? totalWeight : 100;

    const finalScore = (
      (p.severityScore * weights.severity) +
      (p.popDensityScore * weights.population) +
      (p.vulnerabilityScore * weights.vulnerability) +
      (p.serviceGapScore * weights.serviceGap) +
      (p.costEfficiencyScore * weights.costEfficiency) +
      (p.sdgScore * weights.sdgAlignment)
    ) / norm;

    return {
      ...p,
      calculatedScore: Math.round(finalScore * 10) / 10,
    };
  }).sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Determine budget cut-off
  let runningCost = 0;
  const fundedProjects = scoredProjects.filter((p) => {
    if (runningCost + p.costUSD <= maxBudgetUSD) {
      runningCost += p.costUSD;
      return true;
    }
    return false;
  });

  const totalBeneficiaries = fundedProjects.reduce((sum, p) => sum + p.beneficiaries, 0);

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-md border-2 border-[#d9c4b3] text-[#1c1109] p-6 sm:p-8 shadow-xl shadow-[#26160f]/5 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5d5c5] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-mono font-extrabold border border-orange-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
            <span>Deterministic MCDA AI Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1c1109]">
            AI Policy Lens & Dynamic ROI Scenario Forecaster
          </h2>
          <p className="text-xs text-[#5c4638] font-medium max-w-3xl">
            Test how varying national policy directives dynamically shift deterministic infrastructure capital allocations without black-box bias.
          </p>
        </div>

        {/* 4 Policy Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <span className="text-xs font-bold text-[#5c4638] mr-1">Policy Lenses:</span>
          {[
            { id: 'standard', label: '⚖️ Balanced Default' },
            { id: 'water_health', label: '💧 Water & Health 1st' },
            { id: 'climate', label: '🌪️ Climate Resilience' },
            { id: 'equity', label: '🤝 Vulnerability Equity' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activePreset === preset.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'bg-[#faf5ee] border border-[#d9c4b3] text-[#4a372c] hover:bg-orange-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sliders & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: 6 MCDA Weight Sliders */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#faf5ee] border-2 border-[#d9c4b3] space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5d5c5] pb-2.5">
            <span className="text-xs font-mono font-extrabold text-[#1c1109] uppercase">
              MCDA Weight Attribution (%)
            </span>
            <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
              Total: {weights.severity + weights.population + weights.vulnerability + weights.serviceGap + weights.costEfficiency + weights.sdgAlignment}%
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 1. Severity */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>1. Citizen Demand Severity</span>
                <span className="font-mono text-orange-700">{weights.severity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.severity}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, severity: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 2. Population */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>2. Ward Population Density</span>
                <span className="font-mono text-orange-700">{weights.population}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.population}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, population: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 3. Vulnerability */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>3. Multidimensional Vulnerability (MVI)</span>
                <span className="font-mono text-orange-700">{weights.vulnerability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.vulnerability}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, vulnerability: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 4. Service Gap */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>4. Baseline Infrastructure Service Gap</span>
                <span className="font-mono text-orange-700">{weights.serviceGap}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.serviceGap}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, serviceGap: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 5. Cost Efficiency */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>5. Capital Cost Efficiency & MTIP Fit</span>
                <span className="font-mono text-orange-700">{weights.costEfficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.costEfficiency}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, costEfficiency: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 6. SDG Alignment */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2a1810]">
                <span>6. National SDG & Net-Zero Target Fit</span>
                <span className="font-mono text-orange-700">{weights.sdgAlignment}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.sdgAlignment}
                onChange={(e) => {
                  setActivePreset('custom');
                  setWeights(prev => ({ ...prev, sdgAlignment: parseInt(e.target.value) || 0 }));
                }}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Dynamically Ranked Capital Proposals */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#26160f] via-[#362116] to-[#1e110b] text-white shadow-md">
            <div>
              <div className="text-[10px] font-mono text-stone-400 uppercase">Allocated Budget</div>
              <div className="text-base sm:text-lg font-mono font-extrabold text-amber-300">
                ${(runningCost / 1000000).toFixed(2)}M / $7.0M
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-stone-400 uppercase">Funded Projects</div>
              <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                {fundedProjects.length} of {INITIAL_PROJECTS.length} Works
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-stone-400 uppercase">Citizen Beneficiaries</div>
              <div className="text-base sm:text-lg font-mono font-extrabold text-orange-400">
                ~{totalBeneficiaries.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="space-y-3">
            {scoredProjects.map((project, index) => {
              const isFunded = fundedProjects.some(f => f.id === project.id);
              return (
                <div
                  key={project.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                    isFunded
                      ? 'bg-white border-orange-300 shadow-sm'
                      : 'bg-stone-50/70 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-extrabold text-xs shrink-0 ${
                        index === 0 ? 'bg-amber-500 text-stone-950 shadow-xs' :
                        index === 1 ? 'bg-stone-300 text-stone-900' :
                        index === 2 ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-xs text-[#1c1109]">{project.title}</div>
                        <div className="text-[11px] text-[#5c4638] font-mono font-semibold">
                          {project.code} • {project.district}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-mono font-extrabold text-orange-700">
                          Score: {project.calculatedScore}/100
                        </div>
                        <div className="text-[10px] font-mono text-[#5c4638]">
                          ${(project.costUSD / 1000000).toFixed(2)}M USD
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                        isFunded
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {isFunded ? '✅ FUNDED' : 'DEFERRED'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Score Factor Bar */}
                  <div className="w-full bg-[#f2e6d8] rounded-full h-2 overflow-hidden flex">
                    <div style={{ width: `${(project.severityScore * weights.severity) / 100}%` }} className="bg-orange-500 h-full" title="Severity" />
                    <div style={{ width: `${(project.popDensityScore * weights.population) / 100}%` }} className="bg-amber-500 h-full" title="Population" />
                    <div style={{ width: `${(project.vulnerabilityScore * weights.vulnerability) / 100}%` }} className="bg-rose-500 h-full" title="Vulnerability" />
                    <div style={{ width: `${(project.serviceGapScore * weights.serviceGap) / 100}%` }} className="bg-emerald-500 h-full" title="Service Gap" />
                    <div style={{ width: `${(project.costEfficiencyScore * weights.costEfficiency) / 100}%` }} className="bg-cyan-500 h-full" title="Cost Fit" />
                    <div style={{ width: `${(project.sdgScore * weights.sdgAlignment) / 100}%` }} className="bg-purple-500 h-full" title="SDG Fit" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-right">
            <Link
              href="/planning"
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-orange-700 hover:text-orange-900 hover:underline"
            >
              <span>Open Full Policy Intelligence Desk →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
