-- Enable pgcrypto for UUID generation if not already enabled (standard in Supabase)
create extension if not exists "pgcrypto";

-- Function to handle updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- 1. Ratings Table
create table public.ratings (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    content_type text not null check (content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'custom')),
    content_id text not null,
    content_title text not null,
    content_image_url text,
    score numeric(3,1) not null check (score >= 1 and score <= 10),
    review_text text,
    has_spoiler boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, content_type, content_id)
);

-- RLS for ratings
alter table public.ratings enable row level security;

create policy "Enable read access for all users" on public.ratings
    for select using (true);

create policy "Enable insert for users based on user_id" on public.ratings
    for insert with check (auth.uid() = user_id);

create policy "Enable update for users based on user_id" on public.ratings
    for update using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id" on public.ratings
    for delete using (auth.uid() = user_id);

-- Trigger for updated_at on ratings
create trigger update_ratings_updated_at
    before update on public.ratings
    for each row execute function public.update_updated_at_column();


-- 2. User Content Status Table
create table public.user_content_status (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    content_type text not null check (content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'custom')),
    content_id text not null,
    content_title text not null,
    content_image_url text,
    status text not null check (status in ('want', 'doing', 'done', 'dropped')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, content_type, content_id)
);

-- RLS for user_content_status
alter table public.user_content_status enable row level security;

create policy "Enable read access for all users" on public.user_content_status
    for select using (true);

create policy "Enable insert for users based on user_id" on public.user_content_status
    for insert with check (auth.uid() = user_id);

create policy "Enable update for users based on user_id" on public.user_content_status
    for update using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id" on public.user_content_status
    for delete using (auth.uid() = user_id);

-- Trigger for updated_at on user_content_status
create trigger update_user_content_status_updated_at
    before update on public.user_content_status
    for each row execute function public.update_updated_at_column();


-- 3. Pinned Items Table
create table public.pinned_items (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    content_type text not null check (content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'custom')),
    content_id text not null,
    content_title text not null,
    content_image_url text,
    position integer not null check (position >= 1 and position <= 5),
    created_at timestamptz default now(),
    unique(user_id, position)
);

-- RLS for pinned_items
alter table public.pinned_items enable row level security;

create policy "Enable read access for all users" on public.pinned_items
    for select using (true);

create policy "Enable insert for users based on user_id" on public.pinned_items
    for insert with check (auth.uid() = user_id);

create policy "Enable update for users based on user_id" on public.pinned_items
    for update using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id" on public.pinned_items
    for delete using (auth.uid() = user_id);


-- Indexes for performance
create index idx_ratings_user_id on public.ratings(user_id);
create index idx_ratings_content on public.ratings(content_type, content_id);
create index idx_user_content_status_user_id on public.user_content_status(user_id);
create index idx_pinned_items_user_id on public.pinned_items(user_id);
