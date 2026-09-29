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
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-950/40',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      description: 'Observed and ground-verified administrative or sensor data.',
    },
    projected: {
      label: 'PROJECTED',
      dotColor: 'bg-cyan-500',
      bgColor: 'bg-cyan-950/40',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      description: 'AI model forecast or engineering post-intervention estimate.',
    },
    simulated: {
      label: 'SIMULATED',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-950/40',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      description: 'Illustrative synthetic dataset generated for prototype demonstration.',
    },
    not_available: {
      label: 'DATA NOT AVAILABLE',
      dotColor: 'bg-stone-500',
      bgColor: 'bg-stone-900/60',
      textColor: 'text-stone-400',
      borderColor: 'border-stone-700/50',
      description: 'Dataset unavailable for this jurisdiction; no values fabricated.',
    },
  }[normalized] || {
    label: 'SIMULATED',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-950/40',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    description: 'Illustrative prototype dataset.',
  };

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 tracking-wider gap-1',
    sm: 'text-[10px] px-2 py-0.5 tracking-wider gap-1.5',
    md: 'text-xs px-2.5 py-1 tracking-wider gap-1.5',
  }[size];

  return (
    <span
      onClick={interactive ? onClick : undefined}
      title={config.description}
      className={`inline-flex items-center font-mono font-bold uppercase rounded-md border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} ${
        interactive ? 'cursor-pointer hover:brightness-125 transition-all shadow-xs' : ''
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0 animate-pulse`} />
      <span>{config.label}</span>
    </span>
  );
}

export default DataStatusBadge;
