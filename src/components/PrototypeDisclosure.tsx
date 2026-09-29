'use client';

import React, { useState } from 'react';

interface PrototypeDisclosureProps {
  variant?: 'banner' | 'badge' | 'card' | 'inline';
  className?: string;
}

export function PrototypeDisclosure({
  variant = 'banner',
  className = '',
}: PrototypeDisclosureProps) {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'badge') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono font-black text-[10px] tracking-wider shadow-sm hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer border border-amber-400 shrink-0 ${className}`}
          title="Click to view Prototype Environment & Synthetic Data Disclosure"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping shrink-0" />
          <span>PROTOTYPE</span>
        </button>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl space-y-4 text-stone-200">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <span>🏛️</span>
                  <span>Prototype Demonstration Disclosure</span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-stone-300">
                <p className="font-semibold text-white">
                  This platform is a hackathon innovation prototype built for the Hack2Skills BRICS Innovation Challenge (Track 1: AI for Digital Public Infrastructure & Governance).
                </p>
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30 text-amber-200/90 space-y-1">
                  <p className="font-bold text-amber-300">Data & Official Integrity Statement:</p>
                  <p>
                    This demonstration uses synthetic, illustrative civic records and simulated infrastructure datasets. It does not represent live government systems, active public budgets, ongoing civil works, or real public officials.
                  </p>
                </div>
                <p className="text-stone-400">
                  All administrative identities (e.g. Demo District Authority) are role archetypes for Role-Based Access Control (RBAC) validation. All metrics are clearly labeled with provenance and status indicators (MEASURED / PROJECTED / SIMULATED).
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-stone-900 border-2 border-amber-500/40 text-xs text-stone-200 space-y-2 shadow-md ${className}`}>
        <div className="flex items-center justify-between font-bold text-amber-400">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Prototype Environment & Synthetic Data Disclosure</span>
          </div>
          <span className="font-mono text-[10px] uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
            Hack2Skills Pilot
          </span>
        </div>
        <p className="leading-relaxed text-stone-300">
          This demonstration uses synthetic and illustrative civic records and simulated infrastructure datasets. It does not represent live government systems, government officials, public budgets or active public works.
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-300 text-[11px] font-mono font-medium ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>Prototype Demonstration • Synthetic & Simulated Datasets</span>
      </span>
    );
  }

  // Default: banner
  return (
    <div className={`w-full py-2.5 px-4 bg-stone-900 border-b border-amber-500/30 text-stone-100 text-xs flex items-center justify-between gap-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono font-black text-[10px] uppercase tracking-wider shadow-2xs shrink-0">
          PROTOTYPE
        </span>
        <span className="text-[11px] text-stone-200 font-medium hidden sm:inline leading-relaxed">
          This demonstration uses synthetic and illustrative civic records and simulated infrastructure datasets. It does not represent live government systems, government officials, public budgets or active public works.
        </span>
        <span className="text-[11px] text-stone-200 font-medium sm:hidden">
          Prototype demonstration with simulated civic datasets.
        </span>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline font-mono shrink-0 cursor-pointer whitespace-nowrap"
      >
        Learn More →
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl space-y-4 text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <span>🏛️</span>
                <span>Prototype Demonstration Disclosure</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-300">
              <p className="font-semibold text-white">
                This platform is a hackathon innovation prototype built for the Hack2Skills BRICS Innovation Challenge (Track 1: AI for Digital Public Infrastructure & Governance).
              </p>
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/20 text-amber-200/90 space-y-1">
                <p className="font-bold text-amber-300">Data & Official Integrity Statement:</p>
                <p>
                  This demonstration uses synthetic, illustrative civic records and simulated infrastructure datasets. It does not represent live government systems, active public budgets, ongoing civil works, or real public officials.
                </p>
              </div>
              <p className="text-stone-400">
                All administrative identities (e.g. Demo District Authority) are role archetypes for Role-Based Access Control (RBAC) validation. All metrics are clearly labeled with provenance and status indicators (MEASURED / PROJECTED / SIMULATED).
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrototypeDisclosure;
