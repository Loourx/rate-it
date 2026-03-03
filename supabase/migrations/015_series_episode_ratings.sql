-- Migration 015: Add episode-level ratings for series
-- Same pattern as 009_album_track_ratings (track_ratings JSONB)
-- Stores per-episode scores inside a series rating entry

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ratings' AND column_name = 'episode_ratings'
    ) THEN
        ALTER TABLE ratings
        ADD COLUMN episode_ratings jsonb DEFAULT NULL;
    END IF;
END $$;

-- Index for querying series ratings that have episode data
CREATE INDEX IF NOT EXISTS idx_ratings_episode_ratings 
ON ratings USING gin(episode_ratings)
WHERE episode_ratings IS NOT NULL;

COMMENT ON COLUMN ratings.episode_ratings IS 
'Per-episode scores for series ratings. Format: 
[{"episodeId": "S01E01", "episodeName": "Pilot", 
  "seasonNumber": 1, "episodeNumber": 1, "score": 8.5}]';
