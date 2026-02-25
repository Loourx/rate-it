-- Migration 010: Add image_url column to anything_items
-- Run this in the Supabase SQL Editor dashboard

ALTER TABLE public.anything_items
ADD COLUMN image_url text;

COMMENT ON COLUMN public.anything_items.image_url IS 'Optional public URL to an image stored in Supabase Storage bucket ''anything-images''';
