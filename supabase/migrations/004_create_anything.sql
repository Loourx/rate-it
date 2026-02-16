-- Create anything_items table
create table public.anything_items (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 200),
  description text check (char_length(description) <= 500),
  category_tag text,
  created_at timestamptz default now() not null,
  constraint anything_items_title_key unique (title)
);

-- Enable RLS for anything_items
alter table public.anything_items enable row level security;

-- Policies for anything_items
create policy "Anyone can view anything items"
  on public.anything_items for select
  using ( auth.role() = 'authenticated' );

create policy "Users can create their own anything items"
  on public.anything_items for insert
  with check ( auth.uid() = created_by );

create policy "Users can update their own anything items"
  on public.anything_items for update
  using ( auth.uid() = created_by );

create policy "Users can delete their own anything items"
  on public.anything_items for delete
  using ( auth.uid() = created_by );

-- Create reports table
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  anything_item_id uuid references public.anything_items(id) on delete cascade not null,
  reason text not null,
  created_at timestamptz default now() not null,
  constraint reports_reporter_item_key unique (reporter_id, anything_item_id)
);

-- Enable RLS for reports
alter table public.reports enable row level security;

-- Policies for reports
-- SELECT: Only the reporter can see their own reports (and presumably admins, but we stick to MVP reqs: "solo el reporter puede ver sus propios reportes")
create policy "Users can view their own reports"
  on public.reports for select
  using ( auth.uid() = reporter_id );

-- INSERT: Any authenticated user can create a report for themselves
create policy "Users can create reports"
  on public.reports for insert
  with check ( auth.uid() = reporter_id );

-- No UPDATE or DELETE policies as per requirements (immutable)

-- Create indexes
create index anything_items_created_by_idx on public.anything_items(created_by);
create index anything_items_category_tag_idx on public.anything_items(category_tag);
create index reports_anything_item_id_idx on public.reports(anything_item_id);
