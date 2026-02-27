-- Migration 014: Add private_note to ratings
-- Idempotent: nullable column, no default — compatible with existing rows
--
-- Privacy strategy: the SELECT policy on ratings remains public (for feed/community).
-- Column-level isolation is enforced at the application layer: all public queries
-- (feed, profile, content detail) explicitly list their columns and never include
-- private_note. Only the rating form (owned-context) queries this field.
-- This is the cleanest approach given the existing permissive SELECT RLS policy.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'private_note'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN private_note TEXT CHECK (char_length(private_note) <= 500);
    END IF;
END $$;
