-- Bookmarks table: independent from user_content_status
create table public.bookmarks (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    content_type text not null check (
        content_type in ('movie', 'series', 'book', 'game', 'music', 'podcast', 'anything')
    ),
    content_id text not null,
    content_title text not null,
    content_image_url text,
    created_at timestamptz default now(),
    unique(user_id, content_type, content_id)
);

-- Index for efficient user bookmark lookups ordered by date
create index idx_bookmarks_user_created
    on public.bookmarks (user_id, created_at desc);

-- Row Level Security
alter table public.bookmarks enable row level security;

create policy "Users can view own bookmarks" on public.bookmarks
    for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks" on public.bookmarks
    for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks" on public.bookmarks
    for delete using (auth.uid() = user_id);
