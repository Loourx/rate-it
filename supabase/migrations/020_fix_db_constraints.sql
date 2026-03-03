-- ============================================================
-- Migration 020: Fix DB constraints (S9 & S10)
--
-- S9  — reports.reason has no length limit.
--       A user could insert megabytes of text.
--       Fix: add CHECK (char_length(reason) <= 500).
--
-- S10 — anything_items.title has a global UNIQUE constraint.
--       Title-squatting: one user registers "Star Wars" and
--       nobody else can use that title.
--       Fix: replace global UNIQUE with per-user UNIQUE
--            (created_by, title).
-- ============================================================

-- --------------------------------------------------------
-- S9: Limit reports.reason to 500 characters
-- --------------------------------------------------------

-- Truncate any existing rows that exceed 500 chars so the
-- constraint can be added without violating existing data.
UPDATE public.reports
SET reason = left(reason, 500)
WHERE char_length(reason) > 500;

ALTER TABLE public.reports
ADD CONSTRAINT reports_reason_length
CHECK (char_length(reason) <= 500);

-- --------------------------------------------------------
-- S10: Replace global UNIQUE(title) with per-user UNIQUE
-- --------------------------------------------------------

-- Drop the global unique constraint on title
ALTER TABLE public.anything_items
DROP CONSTRAINT IF EXISTS anything_items_title_key;

-- Add composite unique: same user cannot repeat a title,
-- but different users CAN have the same title.
ALTER TABLE public.anything_items
ADD CONSTRAINT anything_items_title_per_user
UNIQUE (created_by, title);
