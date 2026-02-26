-- ============================================================
-- Migration 012: Add 'recommendation' type to notifications
-- Adds nullable content metadata columns for recommendation payloads
-- ============================================================

-- Paso 1: Eliminar el CHECK constraint actual
ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Paso 2: Añadir el nuevo CHECK constraint con los tres tipos
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('follow', 'like', 'recommendation'));

-- Paso 3: Añadir columnas de metadata de contenido (nullable — no rompen filas existentes)
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS rec_content_type  text,
    ADD COLUMN IF NOT EXISTS rec_content_id    text,
    ADD COLUMN IF NOT EXISTS rec_content_title text,
    ADD COLUMN IF NOT EXISTS rec_content_image text;

-- Paso 4: Política RLS — permitir INSERT de recomendaciones por el sender
-- (Las notificaciones de follow/like las crean triggers SECURITY DEFINER)
-- (Las recomendaciones las crea el cliente directamente)
CREATE POLICY "Users can insert recommendation notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND type = 'recommendation'
    );
