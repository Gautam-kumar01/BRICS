'use client';

import React, { useState } from 'react';
import { PrioritizationWeights, CandidateRecommendation, PolicyScenario } from '@/types';
import { Sliders, DollarSign, Users, Award, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface ScenarioCompareSliderProps {
  initialWeights?: PrioritizationWeights;
  recommendations: CandidateRecommendation[];
  onWeightsChange?: (weights: PrioritizationWeights, budgetCap: number) => void;
  onSaveScenario?: (scenario: Partial<PolicyScenario>) => void;
}

export default function ScenarioCompareSlider({
  initialWeights = {
    severity: 25,
    affectedPopulation: 20,
    vulnerabilityIndex: 25,
    serviceGap: 15,
    feasibilityCost: 10,
    strategicAlignment: 5,
  },
  recommendations = [],
  onWeightsChange,
  onSaveScenario,
}: ScenarioCompareSliderProps) {
  const [weights, setWeights] = useState<PrioritizationWeights>(initialWeights);
  const [budgetCap, setBudgetCap] = useState<number>(5000000); // $5M USD
  const [scenarioName, setScenarioName] = useState('Dynamic Simulation Plan');

  const updateWeight = (key: keyof PrioritizationWeights, val: number) => {
    const next = { ...weights, [key]: val };
    setWeights(next);
    if (onWeightsChange) onWeightsChange(next, budgetCap);
  };

  // Recalculate dynamic scores based on slider weights
  const scoredRecs = recommendations.map(rec => {
    const rawScore = 
      (rec.scoreBreakdown.severity * (weights.severity / 100)) +
      (rec.scoreBreakdown.population * (weights.affectedPopulation / 100)) +
      (rec.scoreBreakdown.vulnerability * (weights.vulnerabilityIndex / 100)) +
      (rec.scoreBreakdown.serviceGap * (weights.serviceGap / 100)) +
      (rec.scoreBreakdown.costEfficiency * (weights.feasibilityCost / 100)) +
      (rec.scoreBreakdown.alignment * (weights.strategicAlignment / 100));

    return { ...rec, dynamicScore: Math.min(100, Math.max(0, rawScore)) };
  }).sort((a, b) => b.dynamicScore - a.dynamicScore);

  // Calculate budget envelope selection
  let currentCost = 0;
  let totalBeneficiaries = 0;
  const fundedRecs: CandidateRecommendation[] = [];
  const unfundedRecs: CandidateRecommendation[] = [];

  for (const rec of scoredRecs) {
    if (currentCost + rec.estimatedBudgetUsd <= budgetCap) {
      currentCost += rec.estimatedBudgetUsd;
      totalBeneficiaries += rec.beneficiariesCount;
      fundedRecs.push(rec);
    } else {
      unfundedRecs.push(rec);
    }
  }

  const equityScore = Math.round((fundedRecs.reduce((acc, r) => acc + r.scoreBreakdown.vulnerability, 0) / (fundedRecs.length || 1)));

  return (
    <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 space-y-6 text-stone-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Multi-Criteria Scenario Builder & Trade-Off Simulator
            </h3>
            <p className="text-xs text-stone-600">
              Adjust policy weights in real-time to observe dynamic ranking shifts and budgetary trade-offs.
            </p>
          </div>
        </div>

        {/* Budget Envelope Selector */}
        <div className="flex items-center space-x-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-stone-600 font-medium">Budget Cap:</span>
          <select
            value={budgetCap}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBudgetCap(val);
              if (onWeightsChange) onWeightsChange(weights, val);
            }}
            className="bg-transparent text-xs text-emerald-700 font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value={3000000}>$3.0M USD</option>
            <option value={5000000}>$5.0M USD</option>
            <option value={8000000}>$8.0M USD</option>
            <option value={15000000}>$15.0M USD</option>
          </select>
        </div>
      </div>

      {/* Weights Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Severity */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-red-700">Urgency & Severity</span>
            <span className="font-mono text-stone-900 font-bold">{weights.severity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.severity}
            onChange={(e) => updateWeight('severity', Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
        </div>

        {/* Vulnerability */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-purple-700">Marginalized Vulnerability</span>
            <span className="font-mono text-stone-900 font-bold">{weights.vulnerabilityIndex}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.vulnerabilityIndex}
            onChange={(e) => updateWeight('vulnerabilityIndex', Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Population */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-700">Affected Population</span>
            <span className="font-mono text-stone-900 font-bold">{weights.affectedPopulation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.affectedPopulation}
            onChange={(e) => updateWeight('affectedPopulation', Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Service Gap */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-amber-700">Infrastructure Deficit</span>
            <span className="font-mono text-stone-900 font-bold">{weights.serviceGap}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.serviceGap}
            onChange={(e) => updateWeight('serviceGap', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Cost Efficiency */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-700">Cost Feasibility</span>
            <span className="font-mono text-stone-900 font-bold">{weights.feasibilityCost}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.feasibilityCost}
            onChange={(e) => updateWeight('feasibilityCost', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Alignment */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-orange-700">BRICS Strategic Goals</span>
            <span className="font-mono text-stone-900 font-bold">{weights.strategicAlignment}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={weights.strategicAlignment}
            onChange={(e) => updateWeight('strategicAlignment', Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

      </div>

      {/* Real-Time Scenario Projected Outcomes Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
        <div>
          <span className="text-[10px] uppercase font-semibold text-stone-600">Budget Utilized</span>
          <div className="text-base font-mono font-bold text-emerald-700">
            ${(currentCost / 1000000).toFixed(2)}M <span className="text-xs text-stone-500">/ ${(budgetCap / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-stone-600">Total Beneficiaries</span>
          <div className="text-base font-mono font-bold text-stone-900 flex items-center space-x-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{totalBeneficiaries.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-stone-600">Equity Coverage Index</span>
          <div className="text-base font-mono font-bold text-purple-700 flex items-center space-x-1">
            <Award className="w-4 h-4 text-purple-600" />
            <span>{equityScore}%</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-stone-600">Funded Interventions</span>
          <div className="text-base font-mono font-bold text-orange-700">
            {fundedRecs.length} Projects <span className="text-xs text-stone-500">({unfundedRecs.length} deferred)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
