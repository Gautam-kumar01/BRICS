'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  Send, 
  CheckCheck, 
  MessageSquare, 
  Radio, 
  Sparkles, 
  PhoneCall, 
  RotateCcw, 
  ExternalLink, 
  Check,
  Globe2
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  metadata?: {
    refCode?: string;
    category?: string;
    district?: string;
    actionLink?: string;
  };
}

export default function WhatsAppUSSDSimulator() {
  const [activeMode, setActiveMode] = useState<'whatsapp' | 'ussd'>('whatsapp');
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en' | 'pt' | 'zu'>('hi');
  const [inputMessage, setInputMessage] = useState('');
  const [ussdStep, setUssdStep] = useState<number>(1);
  const [ussdInput, setUssdInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // WhatsApp Chat History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '🏛️ नमस्ते! BRICS CivicPulse जन-शिकायत सेवा में आपका स्वागत है।\n\nअपनी समस्या यहाँ लिखें या वॉयस मैसेज भेजें (उदा: "काको में पानी की पाइप 8 दिन से टूटी है")।',
      timestamp: '10:42 AM',
    }
  ]);

  // Pre-configured instant test prompts
  const samplePrompts = {
    hi: [
      { label: '💧 जहानाबाद पेयजल संकट', text: 'जहानाबाद के काको ब्लॉक (पिन 804408) में मुख्य पानी की पाइपलाइन टूटी है, 500 घरों में पानी नहीं आ रहा है।' },
      { label: '🚗 धुले पुलिया मरम्मत', text: 'धुले (पिन 424001) के मोहाडी रोड पर पुलिया धंस गई है, कृपया तुरंत मरम्मत करवाएं।' },
      { label: '🔍 स्थिति ट्रैक करें', text: 'स्थिति ट्रैक करें CP-IN-2026-8041' },
    ],
    en: [
      { label: '💧 Water Crisis Jehanabad', text: 'Potable water main pipeline burst in Kako Block, Jehanabad PIN 804408. 500+ households affected.' },
      { label: '⚡ Tshwane Power Outage', text: 'Severe power substation outage in Mamelodi East Ward 14 (PIN 0122). Clinic on generator.' },
      { label: '🔍 Track Status', text: 'Track status CP-IN-2026-8041' },
    ],
    pt: [
      { label: '🌊 Recife Drenagem', text: 'Canal de drenagem transbordando no bairro Boa Viagem em Recife. Risco de enchente.' },
      { label: '🔍 Rastrear Protocolo', text: 'Rastrear status CP-BR-2026-0042' },
    ],
    zu: [
      { label: '💧 Tshwane Amanzi', text: 'Awekho amanzi eMamelodi East Ward 14 izinsuku eziyisithupha manje.' },
      { label: '🔍 Landelela Isikhalo', text: 'Landelela isikhalo CP-ZA-2026-0012' },
    ]
  };

  const handleSendWhatsApp = (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Realistic bot AI classification response
    setTimeout(() => {
      setIsTyping(false);
      const isTracking = textToSend.toLowerCase().includes('track') || textToSend.toLowerCase().includes('ट्रैक') || textToSend.toLowerCase().includes('cp-');
      
      let botResponse: ChatMessage;
      if (isTracking) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `📋 *शिकायत स्थिति रिपोर्ट (Status)*\n\nसंदर्भ कोड: *CP-IN-2026-8041*\nश्रेणी: *पेयजल आपूर्ति (Water Supply)*\nस्थान: *काको ब्लॉक, जहानाबाद (पिन 804408)*\n\nवर्तमान स्थिति: 🟢 *प्राधिकरण समीक्षा में (Triaged & Dispatched)*\nसंबंधित विभाग: *लोक स्वास्थ्य अभियंत्रण विभाग (PHED)*\n\nलाइव GIS मैप पर देखने के लिए नीचे क्लिक करें।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            refCode: 'CP-IN-2026-8041',
            district: 'Jehanabad',
            actionLink: '/citizen?track=CP-IN-2026-8041'
          }
        };
      } else {
        const randomRef = `CP-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `✅ *शिकायत दर्ज हो गई है!*\n\n📋 संदर्भ संख्या: *${randomRef}*\n📍 स्थान: *जहानाबाद जिला (पिन 804408)*\n🏷️ वर्गीकृत श्रेणी: *जल एवं स्वच्छता अवसंरचना*\n⚠️ प्राथमिकता: *उच्च (High Urgency - 24h SLA)*\n\n📱 आपके मोबाइल पर एसएमएस रसीद भेज दी गई है।\nइस संदर्भ कोड से आप कभी भी स्थिति जान सकते हैं।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            refCode: randomRef,
            category: 'water',
            district: 'Jehanabad',
            actionLink: `/citizen?track=${randomRef}`
          }
        };
      }

      setChatMessages(prev => [...prev, botResponse]);
    }, 900);
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: '1',
        sender: 'bot',
        text: '🏛️ नमस्ते! BRICS CivicPulse जन-शिकायत सेवा में आपका स्वागत है।\n\nअपनी समस्या यहाँ लिखें या वॉयस मैसेज भेजें (उदा: "काको में पानी की पाइप 8 दिन से टूटी है")।',
        timestamp: '10:42 AM',
      }
    ]);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#2b1810] via-[#3a2217] to-[#1e110b] text-white p-6 sm:p-8 border-2 border-orange-500/40 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-500/20 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950 text-orange-300 text-xs font-mono font-extrabold border border-orange-500/30">
            <Smartphone className="w-3.5 h-3.5 text-orange-400" />
            <span>Digital Public Good: Zero-App Barrier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Citizen WhatsApp & 2G USSD Feature Phone Simulator
          </h2>
          <p className="text-xs text-stone-300 font-medium max-w-2xl">
            Simulate how citizens without smartphones or internet access register grievances and receive live SMS updates via official WhatsApp Bots and offline 2G USSD (*99*24#).
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-orange-500/30 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('whatsapp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Bot (Online)</span>
          </button>
          <button
            onClick={() => setActiveMode('ussd')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'ussd'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>2G USSD *99*24# (Offline)</span>
          </button>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Test Scenario Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Test Prompts:</span>
              </span>
              <div className="flex items-center space-x-1 text-[10px] font-mono">
                {(['hi', 'en', 'pt', 'zu'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2 py-0.5 rounded uppercase font-bold transition-all ${
                      selectedLanguage === lang ? 'bg-orange-500 text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {samplePrompts[selectedLanguage].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (activeMode === 'whatsapp') {
                      handleSendWhatsApp(p.text);
                    } else {
                      setUssdStep(2);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 transition-all text-xs space-y-0.5 cursor-pointer group"
                >
                  <div className="font-bold text-white group-hover:text-orange-300">{p.label}</div>
                  <div className="text-[11px] text-stone-400 line-clamp-1 italic">"{p.text}"</div>
                </button>
              ))}
            </div>
          </div>

          {/* DPG Metric Explainer */}
          <div className="p-4 rounded-2xl bg-[#1c1109] border border-orange-500/20 space-y-2 text-xs font-mono text-stone-300">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>DPI Inclusivity Metrics</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              By supporting standard GSM 2G USSD (*99*24#) and WhatsApp Business APIs with local language NLP, BRICS CivicPulse achieves <strong>98.4% population addressability</strong> across rural wards without requiring high-speed 4G/5G or native app downloads.
            </p>
          </div>
        </div>

        {/* Right Side: Visual Mobile Mockup */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm rounded-[36px] bg-[#0c0806] border-4 border-[#523321] p-3 shadow-2xl shadow-black/80 space-y-2">
            
            {/* Phone Top Notch */}
            <div className="flex items-center justify-between px-4 py-1 text-[10px] font-mono text-stone-400">
              <span>9:41</span>
              <div className="w-16 h-3.5 bg-stone-900 rounded-full mx-auto" />
              <div className="flex items-center space-x-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* WHATSAPP MODE SCREEN */}
            {activeMode === 'whatsapp' && (
              <div className="rounded-[28px] bg-[#0b141a] border border-stone-800 h-[420px] flex flex-col overflow-hidden text-stone-100">
                
                {/* WhatsApp Chat Header */}
                <div className="px-3.5 py-2.5 bg-[#202c33] border-b border-stone-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold shadow-xs">
                      🏛️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1">
                        <span>BRICS CivicPulse Bot</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono">VERIFIED</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">Official GovTech Service</div>
                    </div>
                  </div>
                  <button
                    onClick={handleResetChat}
                    title="Reset Chat"
                    className="p-1 rounded-lg bg-stone-700/50 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-2.5 rounded-2xl space-y-1 ${
                          msg.sender === 'user'
                            ? 'bg-[#005c4b] text-white rounded-br-none'
                            : 'bg-[#202c33] text-stone-100 rounded-bl-none border border-stone-700'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-[11px]">{msg.text}</p>
                        
                        {msg.metadata?.actionLink && (
                          <Link
                            href={msg.metadata.actionLink}
                            className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-bold text-amber-300 hover:underline bg-black/30 px-2 py-1 rounded border border-amber-400/30"
                          >
                            <span>Track on Portal Live →</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}

                        <div className="flex items-center justify-end space-x-1 text-[9px] text-stone-400 font-mono">
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] p-2 rounded-xl text-[10px] text-stone-400 font-mono flex items-center space-x-1.5 border border-stone-700">
                        <Sparkles className="w-3 h-3 animate-spin text-emerald-400" />
                        <span>CivicPulse NLP processing grievance...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendWhatsApp();
                  }}
                  className="p-2 bg-[#202c33] border-t border-stone-700 flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type grievance or code in any language..."
                    className="flex-1 bg-[#2a3942] rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-400 focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            )}

            {/* 2G USSD MODE SCREEN */}
            {activeMode === 'ussd' && (
              <div className="rounded-[28px] bg-stone-900 border border-stone-700 h-[420px] p-4 flex flex-col justify-between text-stone-100 font-mono">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                    <span className="text-[11px] text-amber-400 font-bold">📶 2G GSM Telecom Terminal</span>
                    <span className="text-[10px] text-stone-400">Dialed: *99*24#</span>
                  </div>

                  {/* USSD Menu Dialogue Box */}
                  <div className="p-4 rounded-2xl bg-black border-2 border-amber-500/40 text-xs space-y-2 text-amber-300">
                    <div className="font-bold text-white border-b border-stone-800 pb-1">
                      🏛️ BRICS CivicPulse USSD (Gov of India/BRICS)
                    </div>

                    {ussdStep === 1 && (
                      <div className="space-y-1 text-[11px] text-stone-200">
                        <div>1. Register Water Grievance</div>
                        <div>2. Register Road/Bridge Deficit</div>
                        <div>3. Register Power Outage</div>
                        <div>4. Track Status by Ref Code</div>
                        <div className="text-amber-400 pt-1 font-bold">Reply with 1, 2, 3, or 4:</div>
                      </div>
                    )}

                    {ussdStep === 2 && (
                      <div className="space-y-1 text-[11px] text-stone-200">
                        <div className="text-emerald-400 font-bold">✅ Option 1 Selected: Water Deficit</div>
                        <div>Enter 6-digit Pincode (e.g. 804408):</div>
                      </div>
                    )}

                    {ussdStep === 3 && (
                      <div className="space-y-1.5 text-[11px] text-stone-200">
                        <div className="text-emerald-400 font-bold">✅ Grievance Registered Successfully!</div>
                        <div>Ref No: <strong className="text-orange-400 font-bold">CP-IN-2026-8041</strong></div>
                        <div>Assigned: PHED Engineering Division</div>
                        <div className="text-amber-300 text-[10px] pt-1">Free SMS dispatched to your mobile.</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* USSD Keypad Simulation */}
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ussdInput}
                      onChange={(e) => setUssdInput(e.target.value)}
                      placeholder={ussdStep === 1 ? "Enter 1-4..." : ussdStep === 2 ? "Enter PIN..." : "Press OK..."}
                      className="flex-1 bg-black border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (ussdStep === 1) setUssdStep(2);
                        else if (ussdStep === 2) setUssdStep(3);
                        else setUssdStep(1);
                        setUssdInput('');
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
                    >
                      {ussdStep === 3 ? 'Reset' : 'Send'}
                    </button>
                  </div>

                  <div className="text-[10px] text-stone-400 text-center">
                    Simulates standard GSM 112-bit USSD without mobile data subscription.
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
