-- ============================================================
-- Migration 024: Streak Freezes
--
-- Registra las fechas en que un usuario ha consumido un freeze.
-- La lógica de cuántos freezes disponibles tiene un usuario
-- se calcula en el cliente: máximo 2 por semana (lunes a domingo),
-- contando cuántos registros existen en la semana en curso.
-- No requiere cron job — cálculo puramente a partir de datos.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.streak_freezes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freeze_date date NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, freeze_date)  -- un freeze por día máximo
);

-- Índice para queries por usuario ordenadas por fecha
CREATE INDEX IF NOT EXISTS streak_freezes_user_date_idx
    ON public.streak_freezes (user_id, freeze_date DESC);

-- RLS
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

-- SELECT: cada usuario solo ve sus propios freezes
CREATE POLICY "Users can view own streak freezes"
    ON public.streak_freezes
    FOR SELECT
    USING ((select auth.uid()) = user_id);

-- INSERT: cada usuario solo puede insertar sus propios freezes
CREATE POLICY "Users can insert own streak freezes"
    ON public.streak_freezes
    FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

-- DELETE: no permitido desde el cliente (los freezes son permanentes)
-- (Sin política DELETE = denegado por RLS)

COMMENT ON TABLE public.streak_freezes IS
    'Dates on which a user has consumed a streak freeze slot. Max 2 per calendar week (Mon–Sun), enforced client-side.';
