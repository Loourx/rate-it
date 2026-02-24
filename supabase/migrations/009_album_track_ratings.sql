-- Migration: Add album/track distinction and track-level ratings
-- Adds content_subtype to distinguish album vs track ratings for music
-- Adds track_ratings JSONB to store per-track scores within an album rating

-- Add content_subtype column (null for non-music, 'album' or 'track' for music)
ALTER TABLE ratings
ADD COLUMN content_subtype text DEFAULT NULL;

-- Add track_ratings JSONB column for album ratings
-- Format: [{"trackId": "123", "trackName": "Song Name", "trackNumber": 1, "score": 7.5}, ...]
ALTER TABLE ratings
ADD COLUMN track_ratings jsonb DEFAULT NULL;

-- Index for querying by content type + subtype
CREATE INDEX idx_ratings_content_subtype ON ratings (content_type, content_subtype)
WHERE content_subtype IS NOT NULL;

-- Add a check constraint for valid subtypes
ALTER TABLE ratings
ADD CONSTRAINT chk_content_subtype
CHECK (content_subtype IS NULL OR content_subtype IN ('album', 'track'));
