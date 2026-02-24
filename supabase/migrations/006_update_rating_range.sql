-- Update rating system: 1-10 (step 0.1) → 0-10 (step 0.5)
-- Allow score = 0 and constrain to 0.5 increments for NEW ratings.
-- Existing ratings with non-0.5 values are kept as-is (backward compatible).

-- 1. Drop old check constraint
alter table public.ratings drop constraint if exists ratings_score_check;

-- 2. Add new constraint: score between 0 and 10
--    We do NOT enforce 0.5-step at DB level to preserve old ratings (e.g. 7.3).
--    The UI enforces 0.5 steps going forward.
alter table public.ratings add constraint ratings_score_check check (score >= 0 and score <= 10);
