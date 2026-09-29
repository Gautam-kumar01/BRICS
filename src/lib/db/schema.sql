-- ============================================================================
-- BRICS CivicPulse - PostgreSQL / Neon Database Schema
-- Digital Public Good: AI for Public Infrastructure & Governance
-- ============================================================================

CREATE TABLE IF NOT EXISTS citizen_submissions (
    id VARCHAR(64) PRIMARY KEY,
    reference_code VARCHAR(32) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    channel VARCHAR(32) NOT NULL,
    language VARCHAR(10) NOT NULL,
    raw_input TEXT NOT NULL,
    translated_text TEXT,
    audio_duration_seconds INT,
    category VARCHAR(32) NOT NULL,
    subcategory VARCHAR(128) NOT NULL,
    urgency VARCHAR(16) NOT NULL,
    affected_population_estimate INT,
    
    -- Geospatial details
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    district VARCHAR(128) NOT NULL,
    sub_district VARCHAR(128),
    ward VARCHAR(64),
    landmark VARCHAR(256),
    country VARCHAR(64) NOT NULL,
    uncertainty_radius_meters INT DEFAULT 500,
    formatted_address TEXT,
    
    -- AI & Review Metadata
    extracted_entities JSONB DEFAULT '[]'::jsonb,
    ai_confidence_score NUMERIC(4, 3),
    status VARCHAR(32) DEFAULT 'submitted',
    cluster_id VARCHAR(64),
    assigned_department VARCHAR(128),
    is_assisted BOOLEAN DEFAULT FALSE,
    assisted_by_officer_id VARCHAR(64),
    
    -- Consent & Privacy
    citizen_consent JSONB DEFAULT '{"dataAnalytics": true, "publicMapAggregation": true, "contactForUpdates": false}'::jsonb,
    resolution_notes TEXT,
    citizen_feedback JSONB,
    ai_provider_used VARCHAR(32),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demand_clusters (
    id VARCHAR(64) PRIMARY KEY,
    cluster_code VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(256) NOT NULL,
    domain VARCHAR(32) NOT NULL,
    country VARCHAR(64) NOT NULL,
    district VARCHAR(128) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    member_submission_ids JSONB DEFAULT '[]'::jsonb,
    submission_count INT DEFAULT 1,
    severity_score NUMERIC(5, 2) NOT NULL,
    unmet_need_score NUMERIC(5, 2) NOT NULL,
    vulnerability_index NUMERIC(5, 2) NOT NULL,
    affected_population INT NOT NULL,
    estimated_cost_usd NUMERIC(14, 2) NOT NULL,
    first_reported_at TIMESTAMPTZ DEFAULT NOW(),
    last_reported_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) DEFAULT 'active',
    summary_rationale TEXT,
    ai_suggested_intervention TEXT
);

CREATE TABLE IF NOT EXISTS infrastructure_indicators (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    domain VARCHAR(32) NOT NULL,
    district VARCHAR(128) NOT NULL,
    country VARCHAR(64) NOT NULL,
    current_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    target_value NUMERIC(10, 2) NOT NULL,
    baseline_year INT NOT NULL,
    vulnerability_weight NUMERIC(4, 3) NOT NULL,
    source_dataset VARCHAR(256) NOT NULL,
    data_freshness_date DATE NOT NULL,
    quality_rating VARCHAR(32) DEFAULT 'verified_official'
);

CREATE TABLE IF NOT EXISTS candidate_recommendations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    domain VARCHAR(32) NOT NULL,
    district VARCHAR(128) NOT NULL,
    country VARCHAR(64) NOT NULL,
    cluster_id VARCHAR(64),
    rank INT NOT NULL,
    composite_score NUMERIC(5, 2) NOT NULL,
    score_breakdown JSONB NOT NULL,
    estimated_budget_usd NUMERIC(14, 2) NOT NULL,
    timeline_months INT NOT NULL,
    beneficiaries_count INT NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL,
    assumptions JSONB DEFAULT '[]'::jsonb,
    evidence_links JSONB DEFAULT '[]'::jsonb,
    equity_notes TEXT,
    do_not_use_warning TEXT,
    approved_status VARCHAR(32) DEFAULT 'pending_review',
    decision_rationale TEXT,
    decided_by_officer VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS policy_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    country VARCHAR(64) NOT NULL,
    budget_cap_usd NUMERIC(14, 2) NOT NULL,
    weights JSONB NOT NULL,
    selected_recommendation_ids JSONB NOT NULL,
    total_cost_usd NUMERIC(14, 2) NOT NULL,
    total_beneficiaries INT NOT NULL,
    equity_coverage_score NUMERIC(5, 2) NOT NULL,
    unresolved_demand_count INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_registry (
    id VARCHAR(64) PRIMARY KEY,
    project_code VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(256) NOT NULL,
    domain VARCHAR(32) NOT NULL,
    country VARCHAR(64) NOT NULL,
    district VARCHAR(128) NOT NULL,
    lead_agency VARCHAR(256) NOT NULL,
    allocated_budget_usd NUMERIC(14, 2) NOT NULL,
    spent_budget_usd NUMERIC(14, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    current_milestone VARCHAR(256),
    milestones JSONB NOT NULL,
    baseline_metric JSONB NOT NULL,
    target_metric JSONB NOT NULL,
    current_metric JSONB NOT NULL,
    citizen_satisfaction_average NUMERIC(3, 2) DEFAULT 0,
    total_citizen_reviews INT DEFAULT 0,
    live_status VARCHAR(32) DEFAULT 'planning',
    last_status_update TIMESTAMPTZ DEFAULT NOW(),
    public_evidence_url VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    ai_provider_used VARCHAR(32),
    details TEXT,
    previous_value TEXT,
    new_value TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sub_category ON citizen_submissions(category);
CREATE INDEX IF NOT EXISTS idx_sub_urgency ON citizen_submissions(urgency);
CREATE INDEX IF NOT EXISTS idx_sub_status ON citizen_submissions(status);
CREATE INDEX IF NOT EXISTS idx_sub_district ON citizen_submissions(district, country);
CREATE INDEX IF NOT EXISTS idx_clusters_domain ON demand_clusters(domain, country);
