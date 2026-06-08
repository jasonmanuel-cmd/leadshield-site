-- ============================================================
-- LEADSHIELD MULTI-TENANT CORE ENGINE
-- Migrates from localized Android-only to cloud-based CRM
-- Run this in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- 1. CLIENTS / BUSINESSES PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' -- active, suspended, trialing
);

-- 2. TELEPHONY & API CONFIGURATION TABLE (Cloud Routing)
CREATE TABLE IF NOT EXISTS public.telephony_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    provisioned_phone_number VARCHAR(50) UNIQUE NOT NULL, -- The Twilio/Telnyx tracking number
    forwarding_phone_number VARCHAR(50) NOT NULL, -- The client's actual cell phone
    carrier_sid VARCHAR(255), -- For API authentication validation
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMIZABLE CRM TEXT TEMPLATES
CREATE TABLE IF NOT EXISTS public.text_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    trigger_event VARCHAR(100) DEFAULT 'no-answer', -- busy, no-answer, failed
    sms_body TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_client_event UNIQUE (client_id, trigger_event)
);

-- 4. THE CRM LEAD CAPTURE & DISPATCH LOG
CREATE TABLE IF NOT EXISTS public.lead_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    customer_phone VARCHAR(50) NOT NULL,
    call_status VARCHAR(50) NOT NULL, -- no-answer, busy
    sms_sent_status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row-Level Security on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Clients can read their own profile
CREATE POLICY "Clients read own profile"
    ON public.clients FOR SELECT
    USING (auth.uid() = id);

-- RLS: Service role manages all telephony config
CREATE POLICY "Service role manages telephony config"
    ON public.telephony_config FOR ALL
    USING (auth.role() = 'service_role');

-- RLS: Service role manages templates
CREATE POLICY "Service role manages text templates"
    ON public.text_templates FOR ALL
    USING (auth.role() = 'service_role');

-- RLS: Service role manages lead logs
CREATE POLICY "Service role manages lead logs"
    ON public.lead_logs FOR ALL
    USING (auth.role() = 'service_role');

-- RLS: Clients can read their own leads
CREATE POLICY "Clients read own leads"
    ON public.lead_logs FOR SELECT
    USING (auth.uid() = client_id);

-- Indexes for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_telephony_config_phone ON public.telephony_config(provisioned_phone_number) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_telephony_config_client ON public.telephony_config(client_id);
CREATE INDEX IF NOT EXISTS idx_text_templates_client ON public.text_templates(client_id, trigger_event);
CREATE INDEX IF NOT EXISTS idx_lead_logs_client ON public.lead_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_lead_logs_timestamp ON public.lead_logs(timestamp);
