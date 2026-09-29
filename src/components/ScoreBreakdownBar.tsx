'use client';

import React from 'react';
import { CandidateRecommendation } from '@/types';

interface ScoreBreakdownBarProps {
  scoreBreakdown: CandidateRecommendation['scoreBreakdown'];
  compositeScore: number;
}

export default function ScoreBreakdownBar({ scoreBreakdown, compositeScore }: ScoreBreakdownBarProps) {
  const metrics = [
    { label: 'Severity', value: scoreBreakdown.severity, weight: '25%', color: 'bg-red-500' },
    { label: 'Population', value: scoreBreakdown.population, weight: '20%', color: 'bg-blue-500' },
    { label: 'Vulnerability', value: scoreBreakdown.vulnerability, weight: '20%', color: 'bg-purple-500' },
    { label: 'Service Gap', value: scoreBreakdown.serviceGap, weight: '15%', color: 'bg-amber-500' },
    { label: 'Cost-Efficiency', value: scoreBreakdown.costEfficiency, weight: '10%', color: 'bg-emerald-500' },
    { label: 'Alignment', value: scoreBreakdown.alignment, weight: '10%', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-600 font-medium">Explainable Multi-Criteria Composite Score</span>
        <span className="font-mono font-bold text-sm text-orange-600">
          {compositeScore.toFixed(1)} / 100
        </span>
      </div>

      {/* Multi-segment stacked progress bar */}
      <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex p-0.5 border border-stone-200 shadow-inner">
        {metrics.map((m, idx) => {
          const widthPct = (m.value / 600) * 100;
          return (
            <div
              key={idx}
              className={`h-full ${m.color} first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all`}
              style={{ width: `${Math.max(6, widthPct)}%` }}
              title={`${m.label}: ${m.value.toFixed(1)} (Weight: ${m.weight})`}
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-[10px]">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex flex-col bg-stone-50 p-1.5 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-1 text-stone-600">
              <span className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
              <span className="truncate">{m.label}</span>
            </div>
            <span className="font-mono font-bold text-stone-900 mt-0.5">
              {m.value.toFixed(0)} <span className="text-stone-400 text-[9px]">({m.weight})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
