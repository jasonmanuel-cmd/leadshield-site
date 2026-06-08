-- ============================================================
-- Add client-read RLS policies so logged-in clients can see
-- their own telephony config, templates, and profile data
-- ============================================================

-- Clients read own telephony config (for dashboard display)
CREATE POLICY IF NOT EXISTS "Clients read own telephony config"
    ON public.telephony_config FOR SELECT
    USING (auth.uid() = client_id);

-- Clients read own text templates (for dashboard display)
CREATE POLICY IF NOT EXISTS "Clients read own templates"
    ON public.text_templates FOR SELECT
    USING (auth.uid() = client_id);
