-- Migration 018: Fix RLS Privacy (SEC-01 Audit)
--
-- Problem: ratings and user_content_status have SELECT policies with
-- USING (true), exposing all data — including private profiles' activity
-- and private_note — to any authenticated user via direct API queries.
--
-- Fixes applied (atomic):
--   Fix 1 — ratings SELECT policy: restrict to own rows, public profiles,
--            or followers of private profiles.
--   Fix 2 — get_private_note() RPC: add SET search_path for security.
--   Fix 3 — user_content_status SELECT policy: same visibility rules as
--            ratings.
--
-- INSERT/UPDATE/DELETE policies are NOT modified.
-- ---------------------------------------------------------------------------

-- ===== FIX 1: ratings SELECT policy =====

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ratings;
-- Drop in case this migration is re-applied
DROP POLICY IF EXISTS "ratings_select_policy" ON public.ratings;

CREATE POLICY "ratings_select_policy" ON public.ratings
    FOR SELECT USING (
        -- a) Viewer is the author (always see own ratings)
        auth.uid() = user_id
        -- b) Author's profile is NOT private
        OR NOT (SELECT is_private FROM public.profiles WHERE id = user_id)
        -- c) Viewer follows the author
        OR EXISTS (
            SELECT 1 FROM public.follows
            WHERE follower_id = auth.uid()
              AND following_id = ratings.user_id
        )
    );


-- ===== FIX 2: Harden get_private_note() RPC =====

-- Recreate with SET search_path (defense against search_path hijacking)
CREATE OR REPLACE FUNCTION public.get_private_note(p_rating_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
    SELECT private_note
    FROM public.ratings
    WHERE id = p_rating_id
      AND user_id = auth.uid();
$$;

-- Re-issue grants for idempotency
REVOKE ALL ON FUNCTION public.get_private_note(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_private_note(uuid) TO authenticated;


-- ===== FIX 3: user_content_status SELECT policy =====

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_content_status;
-- Drop in case this migration is re-applied
DROP POLICY IF EXISTS "user_content_status_select_policy" ON public.user_content_status;

CREATE POLICY "user_content_status_select_policy" ON public.user_content_status
    FOR SELECT USING (
        -- a) Viewer is the owner
        auth.uid() = user_id
        -- b) Owner's profile is NOT private
        OR NOT (SELECT is_private FROM public.profiles WHERE id = user_id)
        -- c) Viewer follows the owner
        OR EXISTS (
            SELECT 1 FROM public.follows
            WHERE follower_id = auth.uid()
              AND following_id = user_content_status.user_id
        )
    );
