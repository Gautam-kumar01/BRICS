<div align="center">

# 🏛️ BRICS CivicPulse
### AI-Powered Digital Public Infrastructure (DPI) for Citizen Demand-Driven Governance & Capital Policy Intelligence

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![DPG Standard](https://img.shields.io/badge/DPG-Compliant_v1.0-orange?style=for-the-badge)](https://digitalpublicgoods.net/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)](LICENSE)

*A sovereign, multilateral GovTech platform bridging the gap between grassroots multilingual citizen grievances and evidence-based municipal capital budget allocation.*

---

[🚀 Quick Start](#-getting-started) • [✨ Key Modules](#-core-platform-modules) • [🌐 Pilot Jurisdictions](#-live-pilot-jurisdictions) • [🛡️ RBAC & Security](#-server-side-rbac--territory-isolation) • [📊 System Architecture](#-system-architecture)

</div>

---

## 📌 Executive Summary & Problem Statement

Across the BRICS+ economies, municipal infrastructure authorities face a critical disconnect:
1. **Unstructured & Multilingual Ingestion**: Millions of citizen demand signals across regional dialects (Hindi, Marathi, Zulu, Portuguese, etc.) remain trapped in isolated call centers, paper petitions, and messaging silos.
2. **Top-Down Budgeting Without Evidence**: Capital projects are frequently planned without ground-truth spatial validation, leading to under-served vulnerable populations and misallocated municipal spending.
3. **Data Sovereignty & Privacy**: Sovereign public sector institutions require transparent, explainable AI architectures with 100% data residency, offline fallback resilience, and strict role-based territory isolation.

**BRICS CivicPulse** solves this challenge by serving as an open, multilingual **Digital Public Infrastructure (DPI)** engine. It converts raw voice recordings and text into standardized geospatial demand clusters, matches them with multi-criteria vulnerability indices, and provides municipal authorities with quantifiable capital prioritization briefs.

---

## ✨ Core Platform Modules

### 1. 🎙️ Citizen Voice Studio & Live Ingestion (`/citizen`, `/`)
- **Multilingual Voice-to-Text Pipeline**: Instant transcription and translation across Hindi, Marathi, Zulu, Portuguese, Russian, Chinese, and English.
- **Automated Entity Extraction & Pincode Geocoding**: High-precision AI classification of infrastructure domain (Water, Roads, Energy, Health), specific deficit, and location coordinates.
- **300m Spatial Privacy Buffer**: Automatic noise perturbation ensuring citizen physical privacy while preserving municipal spatial aggregation.
- **Instant Bilingual SMS / WhatsApp Dispatch**: Generates official complaint receipts with tracking reference codes in both Hindi and English upon submission.
- **Instant Status Stepper on Homepage**: 4-stage live progress timeline (`Submitted` → `AI Geocoded` → `Nodal Triage` → `Dispatched`) directly on the homepage.

### 2. ⚡ Operations Triage & Deduplication Desk (`/operations`)
- **Semantic Similarity Clustering**: Deduplicates overlapping citizen complaints into unified infrastructure demand clusters.
- **Confidence Scoring & Anomaly Detection**: Highlights extraction confidence with full transparency on uncertain fields.
- **Human-in-the-Loop Authority Verification**: Authorized district nodal officers review AI taxonomy, assign accountable engineering departments, and dispatch work orders.
- **Territory-Scoped Scoping**: District Collectors access only complaints originating within their designated municipal territory (e.g., Jehanabad DM sees only Jehanabad complaints).

### 3. 📊 Policy Intelligence & Prioritization Engine (`/planning`)
- **Multi-Criteria Decision Analysis (MCDA)**: Mathematical weighting combining:
  - *Citizen Demand Density* (Aggregated verified complaint count)
  - *Demographic Vulnerability Index* (Marginalized population coverage)
  - *Fiscal Cost Efficiency* (Cost per citizen beneficiary served)
- **Interactive Scenario Builder**: Real-time slider simulation comparing *Equity-Focused*, *Balanced Efficiency*, and *Cost-Constrained* budget allocations.
- **Traceable Evidence Drawer**: Verbatim citizen demand samples linked directly to recommended capital projects.
- **1-Click Executive Decision Brief**: Generates publication-ready Markdown/CSV policy briefs for municipal legislative councils.

### 4. 🏆 Infrastructure Impact & Delivery Registry (`/impact`)
- **End-to-End Lifecycle Tracking**: Auditable chain from initial citizen voice recording to completed contractor delivery.
- **Measurable Public Value**: Tracks citizen beneficiaries served, average SLA resolution time, and public trust scores.
- **Interactive Before / After Verification**: Photographic inspection records for verified public works.

### 5. 🛡️ Sovereign Governance & Model Ethics Hub (`/governance`)
- **AI Model Cards (§10 PRD)**: Formal documentation of training datasets, hallucination limits, and ethical bias benchmarks.
- **Multi-Provider AI Switchboard**: Real-time dynamic routing and automatic fallback:
  - `Groq LPU` (Ultra-low latency Llama 3.3, ~85ms)
  - `Google Gemini 1.5 Flash` (Multimodal and deep contextual analysis, ~210ms)
  - `Local NLP Engine` (Zero-latency offline edge resilience, ~12ms)
- **Go/No-Go Readiness Gates (§15 PRD)**: Automated system audits validating latency, safety filters, and cryptographic hash integrity.

---

## 🌐 Live Pilot Jurisdictions

| Territory | Flag | Assigned Authority | Primary Focus Domain | Capital Budget |
| :--- | :---: | :--- | :--- | :--- |
| **Jehanabad (Bihar)** | 🇮🇳 | **Shri Alok Ranjan (IAS)** | Potable Water Pipeline & Open Storm Drainage | `$1,800,000 USD` |
| **Dhule (Maharashtra)** | 🇮🇳 | **Dr. Vivek Deshmukh (IAS)** | Culvert Bridge Subsidence & Rural Power Grid | `$2,200,000 USD` |
| **City of Tshwane (Gauteng)** | 🇿🇦 | **Dr. Thabo Mokoena** | Municipal Water Pressure & Township Clinics | `$3,500,000 USD` |
| **Recife Metropolitan** | 🇧🇷 | **Dr. Maria Santos** | Coastal Flood Mitigation & Canalization | `$4,100,000 USD` |
| **Central National Oversight** | 🏛️ | **Gautam Kumar (IAS)** | Omniscient All-Territory Multi-District Scope | `$50,000,000 USD` |

---

## 🔒 Server-Side RBAC & Security Architecture

```mermaid
graph TD
    A[User / Visitor] --> B{Authentication Check}
    B -->|Unauthenticated Citizen| C[Public Mode]
    C --> C1[Submit Grievance via Voice / Text]
    C --> C2[Track Status by Reference Code]
    C --> C3[Read-Only Governance & Model Cards]
    
    B -->|Official Sign-In| D[Sovereign RBAC Engine]
    D -->|super_admin| E[Central Super Admin]
    E --> E1[Multi-District Omniscient Visibility]
    E --> E2[Provision Officials & Dispatch Invites]
    E --> E3[Allocate Multi-Million Capital Budgets]
    
    D -->|district_collector| F[District Magistrate]
    F --> F1[Territory-Partitioned Triage Desk]
    F --> F2[Assign Municipal Work Orders]
    F --> F3[Approve Capital Projects in Plan]
```

### Key Security Safeguards:
- **Zero Citizen Privilege Escalation**: Triage modification, status updates, official provisioning, and project approval buttons are completely hidden and blocked for citizens.
- **Invitation-Driven Onboarding**: Public self-registration for official accounts is disabled. Super Admin provisions officials and dispatches cryptographic activation tokens.
- **Sanitized Login**: No hardcoded or evaluator credentials exposed in client bundles.

---

## 🛠️ Technology Stack

- **Frontend Core**: Next.js 14 (App Router), React 18, TypeScript
- **Styling & Aesthetics**: TailwindCSS, Vanilla CSS Tokens, Lucide Icons, Glassmorphic HUDs
- **AI Switchboard**: Google Gemini 1.5 Flash, Groq LPU, Local NLP Edge Switchboard
- **Database & Storage**: In-Memory Sovereign Store + Neon Serverless PostgreSQL
- **Notifications**: Resend Transactional Email Gateway + Bilingual SMS Generator

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Gautam-kumar01/BRICS.git
cd BRICS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# AI Switchboard Providers (Optional - Local NLP works automatically without keys)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Transactional Email Gateway (Optional - Simulated dispatch active by default)
RESEND_API_KEY=your_resend_api_key_here

# PostgreSQL Database (Optional - In-memory store active by default)
DATABASE_URL=your_neon_postgres_url_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Built with Excellence

Developed as a Digital Public Good (DPG) submission for multilateral governance and public infrastructure intelligence.

**Lead Architect & Central Governance Admin:** Gautam Kumar (`gautamkr192007@gmail.com`)
