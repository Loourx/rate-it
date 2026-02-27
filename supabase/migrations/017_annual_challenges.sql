-- F10a: annual_challenges table
-- Allows users to set yearly reading/watching/playing goals, one per category per year.

CREATE TABLE IF NOT EXISTS public.annual_challenges (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    year            INT         NOT NULL,
    target_count    INT         NOT NULL CHECK (target_count > 0),
    category_filter TEXT        NOT NULL CHECK (category_filter IN (
                                    'movie','series','book','game',
                                    'music','podcast','anything','all'
                                )),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT annual_challenges_user_year_category_unique
        UNIQUE (user_id, year, category_filter)
);

-- Index for fast per-user per-year lookups
CREATE INDEX IF NOT EXISTS idx_annual_challenges_user_year
    ON public.annual_challenges (user_id, year);

-- Row Level Security
ALTER TABLE public.annual_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all annual challenges"
    ON public.annual_challenges
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own annual challenges"
    ON public.annual_challenges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual challenges"
    ON public.annual_challenges
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual challenges"
    ON public.annual_challenges
    FOR DELETE
    USING (auth.uid() = user_id);

-- Reuse the existing update_updated_at_column() function (defined in migration 002)
CREATE TRIGGER update_annual_challenges_updated_at
    BEFORE UPDATE ON public.annual_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
