-- Migration 015: Fix pinned_items content_type CHECK constraint
-- The migration 007 renamed 'custom' → 'anything' in ratings and
-- user_content_status, but missed the pinned_items table.
-- This migration fixes that oversight.

-- 1. Drop the old constraint
ALTER TABLE public.pinned_items
    DROP CONSTRAINT IF EXISTS pinned_items_content_type_check;

-- 2. Update any existing rows that still have 'custom'
UPDATE public.pinned_items
    SET content_type = 'anything'
    WHERE content_type = 'custom';

-- 3. Add the corrected constraint
ALTER TABLE public.pinned_items
    ADD CONSTRAINT pinned_items_content_type_check
    CHECK (content_type IN ('movie', 'series', 'book', 'game', 'music', 'podcast', 'anything'));
