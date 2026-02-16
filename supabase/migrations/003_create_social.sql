-- 1. Follows Table
create table public.follows (
    id uuid not null primary key default gen_random_uuid(),
    follower_id uuid not null references public.profiles(id) on delete cascade,
    following_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz default now(),
    unique(follower_id, following_id),
    check(follower_id != following_id)
);

-- RLS for follows
alter table public.follows enable row level security;

create policy "Enable read access for all users" on public.follows
    for select using (true);

create policy "Enable insert for users based on follower_id" on public.follows
    for insert with check (auth.uid() = follower_id);

create policy "Enable delete for users based on follower_id" on public.follows
    for delete using (auth.uid() = follower_id);

-- Indexes for follows
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);


-- 2. Review Likes Table
create table public.review_likes (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    rating_id uuid not null references public.ratings(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, rating_id)
);

-- RLS for review_likes
alter table public.review_likes enable row level security;

create policy "Enable read access for all users" on public.review_likes
    for select using (true);

create policy "Enable insert for users based on user_id" on public.review_likes
    for insert with check (auth.uid() = user_id);

create policy "Enable delete for users based on user_id" on public.review_likes
    for delete using (auth.uid() = user_id);

-- Indexes for review_likes
create index idx_review_likes_rating_id on public.review_likes(rating_id);
create index idx_review_likes_user_id on public.review_likes(user_id);


-- 3. Notifications Table
create table public.notifications (
    id uuid not null primary key default gen_random_uuid(),
    recipient_id uuid not null references public.profiles(id) on delete cascade,
    sender_id uuid not null references public.profiles(id) on delete cascade,
    type text not null check (type in ('follow', 'like')),
    reference_id uuid,
    is_read boolean default false,
    created_at timestamptz default now()
);

-- RLS for notifications
alter table public.notifications enable row level security;

create policy "Users can view their own notifications" on public.notifications
    for select using (auth.uid() = recipient_id);

create policy "Users can update their own notifications" on public.notifications
    for update using (auth.uid() = recipient_id);

-- Note: Insert policy is generally not needed for clients for notifications as they are system/trigger generated.
-- But if we wanted to allow users to trigger them (not recommended), we would add one.
-- Following requirements: "INSERT: el sistema puede crear notificaciones (via functions o triggers)"
-- So no public insert policy.

-- Indexes for notifications
create index idx_notifications_recipient_is_read on public.notifications(recipient_id, is_read);


-- 4. Profiles with Counts View (Recommended optional)
-- Using security_invoker = true so RLS on underlying tables is respected
create or replace view public.profiles_with_counts 
with (security_invoker = true)
as
select
    p.*,
    (select count(*) from public.follows f where f.following_id = p.id) as followers_count,
    (select count(*) from public.follows f where f.follower_id = p.id) as following_count,
    (select count(*) from public.ratings r where r.user_id = p.id) as ratings_count
from public.profiles p;
