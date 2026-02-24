-- Migration: Rename 'custom' content_type to 'anything' for consistency
-- This aligns the database with the app's type definitions and UI Guidelines

-- 1. Update ratings table
alter table public.ratings 
    drop constraint if exists ratings_content_type_check;

update public.ratings 
    set content_type = 'anything' 
    where content_type = 'custom';

alter table public.ratings 
    add constraint ratings_content_type_check 
    check (content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'anything'));

-- 2. Update user_content_status table
alter table public.user_content_status 
    drop constraint if exists user_content_status_content_type_check;

update public.user_content_status 
    set content_type = 'anything' 
    where content_type = 'custom';

alter table public.user_content_status 
    add constraint user_content_status_content_type_check 
    check (content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'anything'));
