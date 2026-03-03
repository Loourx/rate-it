-- ============================================================
-- Migration 019: Fix search_path on SECURITY DEFINER functions
--
-- Problem: handle_new_user() (migrations 001 & 005) uses
--          SECURITY DEFINER without SET search_path, which is a
--          known privilege-escalation vector in PostgreSQL.
--
-- Fix:     Re-create the function adding
--            SET search_path = public, pg_catalog
--          Body logic is unchanged from migration 005.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;
