-- ============================================================
-- Migration 022: RLS Performance Fixes
--
-- Fixes two categories of Supabase database linter warnings:
--
-- 1. auth_rls_initplan — Replace auth.uid() with (select auth.uid())
--    and auth.role() with (select auth.role()) in ALL RLS policies.
--    This prevents PostgreSQL from re-evaluating the auth function
--    for every row, using a single initplan evaluation instead.
--
-- 2. multiple_permissive_policies — profiles has two permissive
--    SELECT policies that are merged into one.
--
-- 3. Missing index — notifications.sender_id lacks an index.
--
-- Tables affected: profiles, ratings, user_content_status,
--   pinned_items, follows, review_likes, notifications,
--   anything_items, reports, bookmarks, annual_challenges
--
-- NO column/type changes. NO business logic changes.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────

-- Merge two SELECT policies into one (fixes multiple_permissive_policies)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile." ON public.profiles;
-- Drop in case this migration is re-applied
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        is_private = false
        OR (select auth.uid()) = id
    );

-- UPDATE policy — fix auth.uid() → (select auth.uid())
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING ( (select auth.uid()) = id );


-- ─────────────────────────────────────────────────────────────
-- 2. RATINGS
-- ─────────────────────────────────────────────────────────────

-- SELECT (already renamed to ratings_select_policy in migration 018)
DROP POLICY IF EXISTS "ratings_select_policy" ON public.ratings;

CREATE POLICY "ratings_select_policy" ON public.ratings
    FOR SELECT USING (
        -- a) Viewer is the author (always see own ratings)
        (select auth.uid()) = user_id
        -- b) Author's profile is NOT private
        OR NOT (SELECT is_private FROM public.profiles WHERE id = user_id)
        -- c) Viewer follows the author
        OR EXISTS (
            SELECT 1 FROM public.follows
            WHERE follower_id = (select auth.uid())
              AND following_id = ratings.user_id
        )
    );

-- INSERT
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.ratings;

CREATE POLICY "Enable insert for users based on user_id" ON public.ratings
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- UPDATE
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.ratings;

CREATE POLICY "Enable update for users based on user_id" ON public.ratings
    FOR UPDATE USING ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.ratings;

CREATE POLICY "Enable delete for users based on user_id" ON public.ratings
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 3. USER_CONTENT_STATUS
-- ─────────────────────────────────────────────────────────────

-- SELECT (already renamed in migration 018)
DROP POLICY IF EXISTS "user_content_status_select_policy" ON public.user_content_status;

CREATE POLICY "user_content_status_select_policy" ON public.user_content_status
    FOR SELECT USING (
        -- a) Viewer is the owner
        (select auth.uid()) = user_id
        -- b) Owner's profile is NOT private
        OR NOT (SELECT is_private FROM public.profiles WHERE id = user_id)
        -- c) Viewer follows the owner
        OR EXISTS (
            SELECT 1 FROM public.follows
            WHERE follower_id = (select auth.uid())
              AND following_id = user_content_status.user_id
        )
    );

-- INSERT
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_content_status;

CREATE POLICY "Enable insert for users based on user_id" ON public.user_content_status
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- UPDATE
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_content_status;

CREATE POLICY "Enable update for users based on user_id" ON public.user_content_status
    FOR UPDATE USING ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_content_status;

CREATE POLICY "Enable delete for users based on user_id" ON public.user_content_status
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 4. PINNED_ITEMS
-- ─────────────────────────────────────────────────────────────

-- SELECT uses USING (true) — no auth.uid(), no fix needed, skip.

-- INSERT
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.pinned_items;

CREATE POLICY "Enable insert for users based on user_id" ON public.pinned_items
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- UPDATE
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.pinned_items;

CREATE POLICY "Enable update for users based on user_id" ON public.pinned_items
    FOR UPDATE USING ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.pinned_items;

CREATE POLICY "Enable delete for users based on user_id" ON public.pinned_items
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 5. FOLLOWS
-- ─────────────────────────────────────────────────────────────

-- SELECT uses USING (true) — no auth.uid(), skip.

-- INSERT
DROP POLICY IF EXISTS "Enable insert for users based on follower_id" ON public.follows;

CREATE POLICY "Enable insert for users based on follower_id" ON public.follows
    FOR INSERT WITH CHECK ( (select auth.uid()) = follower_id );

-- DELETE
DROP POLICY IF EXISTS "Enable delete for users based on follower_id" ON public.follows;

CREATE POLICY "Enable delete for users based on follower_id" ON public.follows
    FOR DELETE USING ( (select auth.uid()) = follower_id );


-- ─────────────────────────────────────────────────────────────
-- 6. REVIEW_LIKES
-- ─────────────────────────────────────────────────────────────

-- SELECT uses USING (true) — no auth.uid(), skip.

-- INSERT
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.review_likes;

CREATE POLICY "Enable insert for users based on user_id" ON public.review_likes
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.review_likes;

CREATE POLICY "Enable delete for users based on user_id" ON public.review_likes
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 7. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────

-- SELECT
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING ( (select auth.uid()) = recipient_id );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING ( (select auth.uid()) = recipient_id );

-- INSERT (recommendation notifications, from migration 012)
DROP POLICY IF EXISTS "Users can insert recommendation notifications" ON public.notifications;

CREATE POLICY "Users can insert recommendation notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        (select auth.uid()) = sender_id
        AND type = 'recommendation'
    );


-- ─────────────────────────────────────────────────────────────
-- 8. ANYTHING_ITEMS
-- ─────────────────────────────────────────────────────────────

-- SELECT — uses auth.role(), fix to (select auth.role())
DROP POLICY IF EXISTS "Anyone can view anything items" ON public.anything_items;

CREATE POLICY "Anyone can view anything items" ON public.anything_items
    FOR SELECT USING ( (select auth.role()) = 'authenticated' );

-- INSERT
DROP POLICY IF EXISTS "Users can create their own anything items" ON public.anything_items;

CREATE POLICY "Users can create their own anything items" ON public.anything_items
    FOR INSERT WITH CHECK ( (select auth.uid()) = created_by );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own anything items" ON public.anything_items;

CREATE POLICY "Users can update their own anything items" ON public.anything_items
    FOR UPDATE USING ( (select auth.uid()) = created_by );

-- DELETE
DROP POLICY IF EXISTS "Users can delete their own anything items" ON public.anything_items;

CREATE POLICY "Users can delete their own anything items" ON public.anything_items
    FOR DELETE USING ( (select auth.uid()) = created_by );


-- ─────────────────────────────────────────────────────────────
-- 9. REPORTS
-- ─────────────────────────────────────────────────────────────

-- SELECT
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;

CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING ( (select auth.uid()) = reporter_id );

-- INSERT
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK ( (select auth.uid()) = reporter_id );


-- ─────────────────────────────────────────────────────────────
-- 10. BOOKMARKS
-- ─────────────────────────────────────────────────────────────

-- SELECT
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING ( (select auth.uid()) = user_id );

-- INSERT
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 11. ANNUAL_CHALLENGES
-- ─────────────────────────────────────────────────────────────

-- SELECT uses USING (true) — no auth.uid(), skip.

-- INSERT
DROP POLICY IF EXISTS "Users can insert their own annual challenges" ON public.annual_challenges;

CREATE POLICY "Users can insert their own annual challenges" ON public.annual_challenges
    FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own annual challenges" ON public.annual_challenges;

CREATE POLICY "Users can update their own annual challenges" ON public.annual_challenges
    FOR UPDATE USING ( (select auth.uid()) = user_id );

-- DELETE
DROP POLICY IF EXISTS "Users can delete their own annual challenges" ON public.annual_challenges;

CREATE POLICY "Users can delete their own annual challenges" ON public.annual_challenges
    FOR DELETE USING ( (select auth.uid()) = user_id );


-- ─────────────────────────────────────────────────────────────
-- 12. MISSING INDEX: notifications.sender_id
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_sender_id
    ON public.notifications(sender_id);
