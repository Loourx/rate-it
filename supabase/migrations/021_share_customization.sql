-- Migration 021: Add share customization columns to ratings
-- Idempotent: all columns nullable, no defaults — compatible with existing rows
--
-- These columns persist the metadata used to personalize the shareable card:
-- headline, share_platform, favorite_track, book_format.
-- No indexes needed — fields are only used in SELECT by the rating owner,
-- never in WHERE clauses or joins.

-- 1. headline — gancho emocional de la card ("5 palabras"), max 50 chars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'headline'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN headline VARCHAR(50) CHECK (char_length(headline) <= 50);
    END IF;
END $$;

-- 2. share_platform — plataforma donde vio/jugó el contenido (free text)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'share_platform'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN share_platform TEXT;
    END IF;
END $$;

-- 3. favorite_track — nombre del track favorito (solo música)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'favorite_track'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN favorite_track TEXT;
    END IF;
END $$;

-- 4. book_format — formato de lectura para libros
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'book_format'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN book_format TEXT CHECK (book_format IN ('paper', 'digital', 'audiobook'));
    END IF;
END $$;

-- Column documentation
COMMENT ON COLUMN ratings.headline IS 'Emotional hook for the shareable card (max 50 chars)';
COMMENT ON COLUMN ratings.share_platform IS 'Platform where the user consumed the content (free text)';
COMMENT ON COLUMN ratings.favorite_track IS 'Favorite track name — only applicable for music ratings';
COMMENT ON COLUMN ratings.book_format IS 'Reading format for book ratings: paper, digital, or audiobook';
