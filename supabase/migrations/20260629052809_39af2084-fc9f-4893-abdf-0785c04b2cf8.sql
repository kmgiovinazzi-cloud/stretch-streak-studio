CREATE TYPE public.routine_kind AS ENUM ('video','list');

CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.routine_kind NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  steps JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routines TO authenticated;
GRANT ALL ON public.routines TO service_role;

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routines viewable per privacy" ON public.routines
  FOR SELECT TO authenticated
  USING (private.can_view_user_media(user_id));

CREATE POLICY "Users insert own routines" ON public.routines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own routines" ON public.routines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own routines" ON public.routines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER routines_touch_updated_at BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX routines_user_id_created_idx ON public.routines (user_id, created_at DESC);