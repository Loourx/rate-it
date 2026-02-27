-- Migration 013: Add pinned_mode to profiles
-- Idempotent: uses DO $$ block to check existence before adding column

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'pinned_mode'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN pinned_mode TEXT NOT NULL DEFAULT 'manual'
        CHECK (pinned_mode IN ('manual', 'auto'));
    END IF;
END $$;
