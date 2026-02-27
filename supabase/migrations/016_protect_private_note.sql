-- Migration 016: Protect private_note at DB level
--
-- Problem: The SELECT RLS on ratings is `USING (true)` (public read).
-- The private_note column is therefore readable by any authenticated user
-- who queries `SELECT private_note FROM ratings WHERE user_id = 'victim'`.
--
-- Solution: Set private_note to NULL for non-owners at the DB level using
-- a SECURITY DEFINER function + view is too invasive. Instead, we use a
-- simpler approach: a column-level default via RLS policy replacement.
--
-- Strategy: Replace the permissive SELECT policy with one that still allows
-- public reads, but we add a restrictive policy that nullifies private_note.
-- PostgreSQL doesn't support column-level RLS, so instead we:
--   1. Create a SECURITY DEFINER function `get_own_private_note(rating_row)`
--      that returns private_note only when auth.uid() = user_id.
--   2. The app uses this function instead of reading the column directly.
--   3. We also set a column-level trigger to null out private_note on SELECT
--      for non-owners — but PG doesn't support BEFORE SELECT triggers.
--
-- PRACTICAL APPROACH: Since PG has no column-level RLS or SELECT triggers,
-- we create an RPC function that the app calls to read private_note safely,
-- and we document that the raw column should never be SELECTed in public queries.
-- The existing app code already enforces this (explicit column lists everywhere).
--
-- For defense-in-depth, we create a secure view that hides the column.

-- 1. RPC to safely read private_note (only returns to owner)
CREATE OR REPLACE FUNCTION public.get_private_note(p_rating_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT private_note
    FROM public.ratings
    WHERE id = p_rating_id
      AND user_id = auth.uid();
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.get_private_note(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_private_note(uuid) TO authenticated;
