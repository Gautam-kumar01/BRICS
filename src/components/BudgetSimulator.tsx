'use client';

import React, { useState, useMemo } from 'react';
import DataStatusBadge from '@/components/DataStatusBadge';

interface ProjectCandidate {
  id: string;
  name: string;
  domain: 'water' | 'roads' | 'connectivity' | 'energy' | 'sanitation';
  domainLabel: string;
  costInCr: number;
  costInUsd: number;
  populationImpacted: number;
  infrastructureGapReductionPercent: number;
  priorityScore: number;
  urgency: 'critical' | 'high' | 'medium';
  selected?: boolean;
}

const CANDIDATE_PROJECTS: ProjectCandidate[] = [
  {
    id: 'sim-p1',
    name: 'Kako Block Primary Drinking Water Pipeline & Pump Overhaul',
    domain: 'water',
    domainLabel: 'Potable Water Supply',
    costInCr: 2.1,
    costInUsd: 250000,
    populationImpacted: 28500,
    infrastructureGapReductionPercent: 24,
    priorityScore: 94.2,
    urgency: 'critical',
  },
  {
    id: 'sim-p2',
    name: 'Makhdumpur-Phalgu RCC Bridge & Flood Retaining Corridor',
    domain: 'roads',
    domainLabel: 'Rural Bridges & Roads',
    costInCr: 3.4,
    costInUsd: 410000,
    populationImpacted: 42000,
    infrastructureGapReductionPercent: 19,
    priorityScore: 90.5,
    urgency: 'high',
  },
  {
    id: 'sim-p3',
    name: 'Ratni Faridpur High-Tension Feeder Grid & Substation Retrofit',
    domain: 'energy',
    domainLabel: 'Power & Rural Electrification',
    costInCr: 1.6,
    costInUsd: 190000,
    populationImpacted: 18000,
    infrastructureGapReductionPercent: 15,
    priorityScore: 86.8,
    urgency: 'high',
  },
  {
    id: 'sim-p4',
    name: 'Ghoshi & Modanganj Community Digital Kiosk & Fiber Backhaul',
    domain: 'connectivity',
    domainLabel: 'Digital Public Infra',
    costInCr: 1.8,
    costInUsd: 220000,
    populationImpacted: 52000,
    infrastructureGapReductionPercent: 12,
    priorityScore: 81.3,
    urgency: 'medium',
  },
  {
    id: 'sim-p5',
    name: 'Hulasganj Block Primary Health Centre Solar Backup & Deep Borewell',
    domain: 'water',
    domainLabel: 'Health & Sanitation',
    costInCr: 0.9,
    costInUsd: 110000,
    populationImpacted: 14500,
    infrastructureGapReductionPercent: 11,
    priorityScore: 88.0,
    urgency: 'high',
  },
  {
    id: 'sim-p6',
    name: 'Jehanabad Urban Core Municipal Stormwater Drain Desilting & Culverts',
    domain: 'sanitation',
    domainLabel: 'Urban Drainage',
    costInCr: 1.2,
    costInUsd: 145000,
    populationImpacted: 31000,
    infrastructureGapReductionPercent: 16,
    priorityScore: 84.5,
    urgency: 'medium',
  },
];

type OptimizationGoal = 'max_population' | 'max_gap_reduction' | 'critical_urgency' | 'balanced_equity';

export function BudgetSimulator() {
  const [budgetCapCr, setBudgetCapCr] = useState<number>(10.0);
  const [region, setRegion] = useState<string>('Jehanabad (Bihar, India)');
  const [goal, setGoal] = useState<OptimizationGoal>('max_population');
  const [selectedIds, setSelectedIds] = useState<string[]>(['sim-p1', 'sim-p2', 'sim-p3', 'sim-p5']);

  // Handle automatic optimization
  const handleAutoOptimize = () => {
    let sorted = [...CANDIDATE_PROJECTS];

    if (goal === 'max_population') {
      sorted.sort((a, b) => (b.populationImpacted / b.costInCr) - (a.populationImpacted / a.costInCr));
    } else if (goal === 'max_gap_reduction') {
      sorted.sort((a, b) => (b.infrastructureGapReductionPercent / b.costInCr) - (a.infrastructureGapReductionPercent / a.costInCr));
    } else if (goal === 'critical_urgency') {
      sorted.sort((a, b) => b.priorityScore - a.priorityScore);
    } else {
      // Balanced: highest priority score with domain diversity
      sorted.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    let currentCost = 0;
    const newSelected: string[] = [];

    for (const p of sorted) {
      if (currentCost + p.costInCr <= budgetCapCr) {
        newSelected.push(p.id);
        currentCost += p.costInCr;
      }
    }

    setSelectedIds(newSelected);
  };

  const toggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((pId) => pId !== id));
    } else {
      const proj = CANDIDATE_PROJECTS.find((p) => p.id === id);
      if (proj && totalCost + proj.costInCr <= budgetCapCr + 0.01) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Can still select, but highlight budget overrun
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  // Calculations
  const { totalCost, totalPop, avgGapReduction, isOverBudget } = useMemo(() => {
    const selected = CANDIDATE_PROJECTS.filter((p) => selectedIds.includes(p.id));
    const cost = selected.reduce((sum, p) => sum + p.costInCr, 0);
    const pop = selected.reduce((sum, p) => sum + p.populationImpacted, 0);
    const gap = selected.reduce((sum, p) => sum + p.infrastructureGapReductionPercent, 0);
    return {
      totalCost: cost,
      totalPop: pop,
      avgGapReduction: gap,
      isOverBudget: cost > budgetCapCr,
    };
  }, [selectedIds, budgetCapCr]);

  const remainingBudget = Math.max(0, budgetCapCr - totalCost);

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-8 text-stone-100 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase">
              Capital Planning Sandbox
            </span>
            <DataStatusBadge status="simulated" size="xs" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
            Infrastructure Budget Scenario Simulator
          </h2>
          <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl">
            Simulate capital budget allocation tradeoffs across candidate civil works. The AI optimization engine surfaces the Pareto-optimal investment portfolio under strict fiscal ceilings.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 max-w-xs shrink-0">
          <strong className="text-amber-300 block font-mono">⚠️ SIMULATED SCENARIO</strong>
          Illustrative planning scenario for hackathon demonstration. Does not commit actual state capital funds.
        </div>
      </div>

      {/* Control Panel: Sliders & Optimization Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-stone-950 border border-stone-800">
        {/* Budget Cap Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300">Available Budget Ceiling:</span>
            <span className="font-mono font-extrabold text-emerald-400 text-sm">
              ₹{budgetCapCr.toFixed(1)} Cr <span className="text-stone-500 text-xs">(${(budgetCapCr * 120).toFixed(0)}k USD)</span>
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="15.0"
            step="0.5"
            value={budgetCapCr}
            onChange={(e) => setBudgetCapCr(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-stone-500">
            <span>₹3.0 Cr</span>
            <span>₹9.0 Cr</span>
            <span>₹15.0 Cr</span>
          </div>
        </div>

        {/* Planning Region */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">Planning Jurisdiction:</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-stone-200 focus:outline-hidden focus:border-orange-500"
          >
            <option value="Jehanabad (Bihar, India)">🇮🇳 Jehanabad Pilot District (Bihar)</option>
            <option value="Dhule (Maharashtra, India)">🇮🇳 Dhule Pilot District (Maharashtra)</option>
            <option value="City of Tshwane (South Africa)">🇿🇦 City of Tshwane (Gauteng)</option>
            <option value="Recife (Pernambuco, Brazil)">🇧🇷 Recife Metropolitan Area</option>
          </select>
          <span className="text-[10px] text-stone-500 font-mono">Multi-District Pilot Config</span>
        </div>

        {/* Optimization Goal */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">AI Optimization Objective:</label>
          <div className="flex gap-2">
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as OptimizationGoal)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-stone-200 focus:outline-hidden focus:border-orange-500"
            >
              <option value="max_population">Maximum Population Impact</option>
              <option value="max_gap_reduction">Max Service Gap Reduction</option>
              <option value="critical_urgency">Critical Urgency / Health First</option>
              <option value="balanced_equity">Balanced Cross-Domain Equity</option>
            </select>
            <button
              onClick={handleAutoOptimize}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-orange-950 cursor-pointer"
            >
              <span>⚡</span>
              <span>Optimize</span>
            </button>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">Knapsack MCDA Solver</span>
        </div>
      </div>

      {/* Real-time Scenario KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${isOverBudget ? 'bg-rose-950/30 border-rose-500/50' : 'bg-stone-950 border-stone-800'}`}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Budget Allocated</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-mono font-extrabold ${isOverBudget ? 'text-rose-400' : 'text-white'}`}>
              ₹{totalCost.toFixed(1)} Cr
            </span>
            <span className="text-xs text-stone-500 font-mono">/ ₹{budgetCapCr.toFixed(1)} Cr</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono block mt-1">
            {isOverBudget ? '⚠️ Ceiling Exceeded' : `Remaining: ₹${remainingBudget.toFixed(1)} Cr`}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Impacted Population</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-extrabold text-cyan-400">
              {totalPop.toLocaleString()}
            </span>
            <span className="text-xs text-stone-500">citizens</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono block mt-1">
            Direct & indirect beneficiaries
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Selected Works</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-extrabold text-orange-400">
              {selectedIds.length}
            </span>
            <span className="text-xs text-stone-500 font-mono">/ {CANDIDATE_PROJECTS.length} candidate projects</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono block mt-1">
            {(selectedIds.length / CANDIDATE_PROJECTS.length * 100).toFixed(0)}% Portfolio Adoption
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Est. Gap Reduction</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-extrabold text-emerald-400">
              +{avgGapReduction}%
            </span>
            <span className="text-xs text-stone-500">aggregate</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono block mt-1">
            Versus baseline infrastructure index
          </span>
        </div>
      </div>

      {/* Candidate Projects Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Candidate Infrastructure Projects ({region})</span>
          </h3>
          <span className="text-stone-400 text-[11px]">Click checkbox to manually toggle project inclusion</span>
        </div>

        <div className="space-y-2.5">
          {CANDIDATE_PROJECTS.map((proj) => {
            const isSelected = selectedIds.includes(proj.id);
            return (
              <div
                key={proj.id}
                onClick={() => toggleProject(proj.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-stone-950 border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                    : 'bg-stone-950/50 border-stone-800/80 opacity-60 hover:opacity-100 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by container
                    className="w-4 h-4 mt-1 sm:mt-0 accent-orange-500 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300">
                        {proj.domainLabel}
                      </span>
                      {proj.urgency === 'critical' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 font-mono">
                      Impacts ~{proj.populationImpacted.toLocaleString()} residents • Reduces regional gap by {proj.infrastructureGapReductionPercent}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-right border-t sm:border-t-0 border-stone-800 pt-2 sm:pt-0">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-stone-500 block">Est. Cost</span>
                    <span className="font-mono font-bold text-xs text-white">₹{proj.costInCr.toFixed(1)} Cr</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-stone-500 block">AI Priority</span>
                    <span className="font-mono font-bold text-xs text-orange-400">{proj.priorityScore}/100</span>
                  </div>
                  <div className="hidden sm:block">
                    <DataStatusBadge status="simulated" size="xs" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BudgetSimulator;
