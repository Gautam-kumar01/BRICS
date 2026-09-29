'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Radio, 
  Layers, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Languages, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Database
} from 'lucide-react';
import AISwitchboardModal from './AISwitchboardModal';
import PrototypeDisclosure from './PrototypeDisclosure';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [isSwitchboardOpen, setIsSwitchboardOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeAI, setActiveAI] = useState<{ provider: string; latency: number; healthy: boolean }>({
    provider: 'Local AI Engine',
    latency: 18,
    healthy: true
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/ai/health');
        if (res.ok) {
          const data = await res.json();
          if (data.activeProvider === 'gemini') {
            setActiveAI({ provider: 'Gemini 1.5 Flash', latency: 210, healthy: true });
          } else if (data.activeProvider === 'groq') {
            setActiveAI({ provider: 'Groq LPU (Llama 3.3)', latency: 85, healthy: true });
          } else if (data.activeProvider === 'openrouter') {
            setActiveAI({ provider: 'OpenRouter AI', latency: 310, healthy: true });
          } else {
            setActiveAI({ provider: 'Local NLP Engine', latency: 12, healthy: true });
          }
        }
      } catch (e) {}
    }
    checkHealth();
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.overview'), icon: Radio },
    { href: '/citizen', label: t('nav.citizen'), icon: Compass },
    { href: '/data', label: 'Data Fusion', icon: Database },
    { href: '/operations', label: t('nav.operations'), icon: Layers },
    { href: '/planning', label: t('nav.planning'), icon: SlidersHorizontal },
    { href: '/impact', label: t('nav.impact'), icon: CheckCircle2 },
    { href: '/governance', label: t('nav.governance'), icon: ShieldCheck },
  ];

  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-orange-200/90 bg-white/95 backdrop-blur-md transition-all shadow-[0_2px_16px_rgba(249,115,22,0.05)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-17 gap-2">
            
            {/* Authentic BRICS Multilateral DPI Emblem Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 p-0.5 shadow-md shadow-orange-500/25 transition-transform group-hover:scale-105 shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-stone-900 to-stone-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden relative">
                  {/* SVG Multi-node BRICS Nexus Emblem */}
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 min-w-[24px] min-h-[24px] shrink-0">
                    <circle cx="24" cy="24" r="18" stroke="rgba(249, 115, 22, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="24" cy="24" r="12" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
                    <circle cx="24" cy="8" r="3.5" fill="#f97316" />
                    <circle cx="39" cy="19" r="3.5" fill="#f59e0b" />
                    <circle cx="33" cy="38" r="3.5" fill="#10b981" />
                    <circle cx="15" cy="38" r="3.5" fill="#0284c7" />
                    <circle cx="9" cy="19" r="3.5" fill="#e11d48" />
                    <path d="M24 8L39 19L33 38L15 38L9 19Z" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
                    <path d="M24 8L33 38M39 19L15 38M9 19L24 24" stroke="rgba(254, 215, 170, 0.35)" strokeWidth="1" />
                    <circle cx="24" cy="24" r="4.5" fill="#ffffff" className="animate-pulse" />
                    <circle cx="24" cy="24" r="2" fill="#ea580c" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-stone-900">BRICS</span>
                  <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-orange-600">CivicPulse</span>
                  <PrototypeDisclosure variant="badge" />
                </div>
                <span className="text-[10px] text-stone-500 font-semibold hidden 2xl:block leading-tight">
                  {t('header.subtitle')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (All 6 Primary Modules) */}
            <nav className="hidden xl:flex items-center space-x-0.5 shrink-0">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-1.5 2xl:px-2 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs'
                        : 'text-stone-700 hover:text-orange-600 hover:bg-orange-50/50 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-600' : 'text-stone-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Medium/Tablet Navigation (Top 4 links) */}
            <nav className="hidden lg:flex xl:hidden items-center space-x-0.5 shrink-0">
              {navLinks.slice(0, 4).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-1.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-stone-700 hover:text-orange-600 hover:bg-orange-50/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-600' : 'text-stone-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Bar: Official Sign In, Notifications, Language Selector, Citizen Voice */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">

              {/* Notification Bell with Badge Count */}
              <button
                onClick={() => setIsSwitchboardOpen(true)}
                className="hidden sm:flex relative p-1.5 sm:p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-orange-600 hover:border-orange-300 shadow-2xs transition-all"
                title="System Notifications & Telemetry"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[15px] h-3.5 px-1 rounded-full bg-orange-600 text-white text-[9px] font-bold shadow-xs">
                  2
                </span>
              </button>

              {/* High-Visibility Language Selector Dropdown */}
              <div className="relative">
                <button
                  id="header-language-toggle"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 hover:border-orange-500 text-xs text-stone-900 font-bold transition-all shadow-2xs whitespace-nowrap active:scale-95"
                  title="Choose Language"
                >
                  <Languages className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="text-sm">{currentLangObj.flag}</span>
                  <span className="uppercase text-[11px] font-mono font-extrabold text-stone-900">{language}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {isLangOpen && (
                  <div 
                    id="header-language-dropdown"
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border-2 border-orange-200 shadow-2xl p-2 z-[999] animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-orange-800 uppercase tracking-wider border-b border-orange-100 mb-1.5 flex items-center justify-between">
                      <span>🌐 BRICS Pilot Languages</span>
                      <span className="text-[9px] font-mono bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-bold">7 Live</span>
                    </div>
                    <div className="space-y-1">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          id={`lang-select-${lang.code}`}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            language === lang.code
                              ? 'bg-orange-600 text-white font-bold shadow-xs'
                              : 'text-stone-800 hover:bg-orange-50 hover:text-orange-700 font-semibold'
                          }`}
                        >
                          <span className="flex items-center space-x-2.5">
                            <span className="text-base">{lang.flag}</span>
                            <span className="text-left font-sans">{lang.label}</span>
                          </span>
                          {language === lang.code && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Official Role Login / User Badge & Authority Workspace Launcher */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 bg-orange-50/90 hover:bg-orange-100/90 px-2.5 py-1.5 rounded-xl border-2 border-orange-300 hover:border-orange-500 shadow-2xs transition-all whitespace-nowrap cursor-pointer text-left"
                    title="Click to open Authority Dashboard & Profile"
                  >
                    <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[11px] font-extrabold text-stone-900 leading-none truncate max-w-[95px] sm:max-w-[125px]">
                        {user.name}
                      </span>
                      <span className="text-[9px] font-mono text-orange-700 uppercase leading-none mt-0.5 font-bold truncate max-w-[95px] sm:max-w-[125px]">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-orange-700 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Interactive GovTech Authority Profile Dropdown Card */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-3xl bg-white border-2 border-orange-300 shadow-2xl p-5 z-[999] animate-in fade-in slide-in-from-top-2 duration-150 space-y-4 text-stone-900">
                      
                      {/* Dropdown Header */}
                      <div className="flex items-start justify-between border-b border-orange-100 pb-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-base shrink-0 shadow-xs ${
                            user.role === 'super_admin' ? 'bg-purple-600' :
                            user.role === 'district_collector' ? 'bg-orange-600' : 'bg-emerald-600'
                          }`}>
                            {user.role === 'super_admin' ? '🏛️' : user.role === 'district_collector' ? '🏢' : '👷'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-stone-950 text-sm leading-tight">{user.name}</h4>
                            <p className="text-[11px] font-mono text-stone-500 mt-0.5">{user.email}</p>
                            <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${
                              user.role === 'super_admin' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                              user.role === 'district_collector' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                              'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Official Jurisdiction & Scope Badges */}
                      <div className="space-y-2 text-xs bg-orange-50/50 p-3 rounded-2xl border border-orange-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-500 font-medium">Territory Scope:</span>
                          <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-orange-200 text-right truncate max-w-[160px]">
                            {user.assignedDistrict ? `${user.assignedDistrict} (${user.assignedCountry})` : 'All BRICS Districts'}
                          </span>
                        </div>

                        {user.allocatedBudgetUsd && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 font-medium">Allocated Budget:</span>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ${user.allocatedBudgetUsd.toLocaleString()} USD
                            </span>
                          </div>
                        )}

                        {user.assignedDepartment && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 font-medium">Department:</span>
                            <span className="font-bold text-stone-800 text-right truncate max-w-[160px]">
                              {user.assignedDepartment}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Primary Authority Dashboard CTA */}
                      <Link
                        href={
                          user.role === 'super_admin' ? '/governance' :
                          user.role === 'district_collector' ? '/operations' :
                          '/operations'
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {user.role === 'super_admin' ? 'Open Central Governance Console' :
                           user.role === 'district_collector' ? `Open ${user.assignedDistrict || 'District'} Operations` :
                           'Open Field Work Orders'}
                        </span>
                      </Link>

                      {/* Quick Module Shortcuts */}
                      <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-1.5 text-xs">
                        <Link
                          href="/operations"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="p-2 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-700 text-stone-700 font-bold transition-colors flex items-center space-x-1.5"
                        >
                          <Layers className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span className="text-[11px]">Triage Desk</span>
                        </Link>

                        <Link
                          href="/planning"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="p-2 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-700 text-stone-700 font-bold transition-colors flex items-center space-x-1.5"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span className="text-[11px]">Policy Intel</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-mono">CivicPulse RBAC</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-900 text-xs font-extrabold shadow-2xs transition-all whitespace-nowrap active:scale-95"
                >
                  <User className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Citizen Voice Action Button */}
              <Link
                href="/citizen"
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all whitespace-nowrap active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('hero.voice_report_btn')}</span>
                <span className="sm:hidden">Report</span>
              </Link>

              {/* Mobile Menu Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-orange-600 shadow-2xs"
                title="Open Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white/98 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-xl">
            {/* Mobile Language Pill Selector */}
            <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-200">
              <div className="text-[10px] font-mono font-bold text-orange-900 uppercase tracking-wider mb-2">
                🌐 Select Language / भाषा चुनें
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                    }}
                    className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                      language === lang.code
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-800 border border-stone-200 font-medium'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                      isActive
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'text-stone-800 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-orange-600" />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="pt-2 border-t border-stone-200">
              <Link
                href="/citizen"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('hero.voice_report_btn')}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Safe AI Telemetry & Neon Database Status Modal */}
      <AISwitchboardModal
        isOpen={isSwitchboardOpen}
        onClose={() => setIsSwitchboardOpen(false)}
      />
    </>
  );
}
