-- Migration 023: Add imported_from column to ratings
-- Idempotent: uses DO $$ BEGIN / IF NOT EXISTS pattern
--
-- Tags ratings imported from external platforms.
-- NULL = native Rate-it rating.
-- No index needed — not used in WHERE of frequent queries.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'imported_from'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN imported_from TEXT DEFAULT NULL
        CHECK (imported_from IN ('letterboxd', 'goodreads') OR imported_from IS NULL);
    END IF;
END $$;

-- Column documentation
COMMENT ON COLUMN ratings.imported_from IS
    'Source platform for imported ratings: letterboxd, goodreads, or NULL for native';
