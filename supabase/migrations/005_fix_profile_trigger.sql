-- ============================================================
-- Migration 005: Fix profile creation trigger
-- Problem: handle_new_user() does not extract display_name
--          or avatar_url from Google OAuth metadata properly.
-- ============================================================

-- 1. Replace the function with corrected COALESCE logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    is_private,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    -- Username: email prefix + random 4 digits (unchanged)
    split_part(NEW.email, '@', 1)
      || cast(floor(random() * 9000 + 1000) AS text),
    -- Display name: prefer Google OAuth full_name > name > email prefix
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    -- Avatar: prefer avatar_url > picture (Google uses both keys)
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    ),
    '',     -- bio
    false,  -- is_private
    now(),  -- created_at
    now()   -- updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-create the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
