-- Add styles array to profiles and emoji block on display_name
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS styles text[] NOT NULL DEFAULT '{}';

-- Block emojis and non-printable symbols in display_name & username via trigger
CREATE OR REPLACE FUNCTION public.validate_profile_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Reject any character outside basic printable ASCII + common latin letters/whitespace
  IF NEW.display_name ~ '[^\u0020-\u007E\u00A0-\u024F]' THEN
    RAISE EXCEPTION 'Display name cannot contain emojis or special symbols';
  END IF;
  IF NEW.username ~ '[^a-z0-9_]' THEN
    RAISE EXCEPTION 'Username can only contain lowercase letters, numbers and underscores';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS validate_profile_name_trg ON public.profiles;
CREATE TRIGGER validate_profile_name_trg
BEFORE INSERT OR UPDATE OF display_name, username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_name();