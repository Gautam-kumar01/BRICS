'use client';

import React from 'react';
import { DataStatusType } from '@/types';

interface DataStatusBadgeProps {
  status?: DataStatusType | string;
  size?: 'xs' | 'sm' | 'md';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DataStatusBadge({
  status = 'simulated',
  size = 'xs',
  interactive = false,
  onClick,
  className = '',
}: DataStatusBadgeProps) {
  const normalized = (status || 'simulated').toLowerCase() as DataStatusType;

  const config = {
    measured: {
      label: 'MEASURED',
      dotColor: 'bg-emerald-600',
      bgColor: 'bg-emerald-100/90 text-emerald-950 border-emerald-300',
      description: 'Observed and ground-verified administrative or sensor data.',
    },
    projected: {
      label: 'PROJECTED',
      dotColor: 'bg-cyan-600',
      bgColor: 'bg-cyan-100/90 text-cyan-950 border-cyan-300',
      description: 'AI model forecast or engineering post-intervention estimate.',
    },
    simulated: {
      label: 'SIMULATED',
      dotColor: 'bg-amber-600',
      bgColor: 'bg-amber-100/90 text-amber-950 border-amber-300',
      description: 'Illustrative synthetic dataset generated for prototype demonstration.',
    },
    not_available: {
      label: 'DATA NOT AVAILABLE',
      dotColor: 'bg-stone-500',
      bgColor: 'bg-stone-200/90 text-stone-800 border-stone-300',
      description: 'Dataset unavailable for this jurisdiction; no values fabricated.',
    },
  }[normalized] || {
    label: 'SIMULATED',
    dotColor: 'bg-amber-600',
    bgColor: 'bg-amber-100/90 text-amber-950 border-amber-300',
    description: 'Illustrative prototype dataset.',
  };

  const sizeClasses = {
    xs: 'text-[9px] px-2 py-0.5 tracking-wider gap-1 font-extrabold',
    sm: 'text-[10px] px-2.5 py-0.5 tracking-wider gap-1.5 font-extrabold',
    md: 'text-xs px-3 py-1 tracking-wider gap-1.5 font-extrabold',
  }[size];

  return (
    <span
      onClick={interactive ? onClick : undefined}
      title={config.description}
      className={`inline-flex items-center font-mono uppercase rounded-md border shadow-2xs ${config.bgColor} ${sizeClasses} ${
        interactive ? 'cursor-pointer hover:brightness-105 transition-all' : ''
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0 animate-pulse`} />
      <span>{config.label}</span>
    </span>
  );
}

export default DataStatusBadge;
