-- ============================================================
-- Migration 011: Notification Triggers
-- Creates DB-level triggers to auto-populate notifications
-- table on follow and review_like events.
-- ============================================================

-- ── Trigger 1: Follow Notification ──────────────────────────
-- Fires AFTER INSERT on follows
-- sender  = the follower (new row's follower_id)
-- recipient = the person being followed (new row's following_id)

create or replace function public.handle_follow_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Avoid self-follow notifications (constraint already prevents this,
    -- but defensive check)
    if new.follower_id = new.following_id then
        return new;
    end if;

    insert into public.notifications (recipient_id, sender_id, type, reference_id)
    values (new.following_id, new.follower_id, 'follow', null);

    return new;
end;
$$;

-- Drop trigger if exists (idempotent)
drop trigger if exists on_follow_create_notification on public.follows;

create trigger on_follow_create_notification
    after insert on public.follows
    for each row
    execute function public.handle_follow_notification();


-- ── Trigger 2: Like Notification ────────────────────────────
-- Fires AFTER INSERT on review_likes
-- sender    = the user who liked (new row's user_id)
-- recipient = the author of the rated content (fetched from ratings)
-- reference = the rating_id that was liked

create or replace function public.handle_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_rating_author_id uuid;
begin
    -- Get the author of the rating
    select user_id
    into v_rating_author_id
    from public.ratings
    where id = new.rating_id;

    -- Do nothing if rating not found
    if v_rating_author_id is null then
        return new;
    end if;

    -- Avoid self-like notifications
    if new.user_id = v_rating_author_id then
        return new;
    end if;

    insert into public.notifications (recipient_id, sender_id, type, reference_id)
    values (v_rating_author_id, new.user_id, 'like', new.rating_id);

    return new;
end;
$$;

-- Drop trigger if exists (idempotent)
drop trigger if exists on_like_create_notification on public.review_likes;

create trigger on_like_create_notification
    after insert on public.review_likes
    for each row
    execute function public.handle_like_notification();
