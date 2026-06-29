
-- 1. stretch_logs: owner-only SELECT
DROP POLICY IF EXISTS "Logs viewable by everyone" ON public.stretch_logs;
CREATE POLICY "Users read own logs" ON public.stretch_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 2. profiles: add is_private
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- 3. follows: add status (accepted | pending)
DO $$ BEGIN
  CREATE TYPE public.follow_status AS ENUM ('pending','accepted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS status public.follow_status NOT NULL DEFAULT 'accepted';

-- Helper: is the given owner viewable by the current auth user?
CREATE OR REPLACE FUNCTION public.can_view_user_media(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _owner AND p.is_private = false)
    OR EXISTS (
      SELECT 1 FROM public.follows f
      WHERE f.followee_id = _owner
        AND f.follower_id = auth.uid()
        AND f.status = 'accepted'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.can_view_user_media(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_user_media(uuid) TO authenticated, anon;

-- 4. storage.objects: replace permissive read policy with owner-aware one
DROP POLICY IF EXISTS "stretch_media read" ON storage.objects;
CREATE POLICY "stretch_media read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'stretch-media'
    AND public.can_view_user_media( ((storage.foldername(name))[1])::uuid )
  );
