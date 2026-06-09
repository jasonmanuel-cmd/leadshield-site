-- ============================================================
-- Add client-read RLS policies so logged-in clients can see
-- their own telephony config, templates, and profile data
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients read own telephony config'
  ) THEN
    CREATE POLICY "Clients read own telephony config"
      ON public.telephony_config FOR SELECT
      USING (auth.uid() = client_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients read own templates'
  ) THEN
    CREATE POLICY "Clients read own templates"
      ON public.text_templates FOR SELECT
      USING (auth.uid() = client_id);
  END IF;
END;
$$;
