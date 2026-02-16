-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text default '',
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

-- Policy: Public profiles are viewable by everyone (if public)
create policy "Public profiles are viewable by everyone." on profiles
  for select using ( is_private = false );

-- Policy: Users can see their own profile always
create policy "Users can see own profile." on profiles
  for select using ( auth.uid() = id );

-- Policy: Users can insert their own profile.
-- This is technically handled by the trigger, but good to have if we ever manually insert from client for some reason (though usually blocked by architecture).
-- However, per requirements: "INSERT: solo el sistema (trigger)".
-- So we will NOT add a public insert policy. The trigger runs with security definer privileges usually, or we can rely on service_role.
-- Actually, the trigger runs as the postgres role or the role executing the trigger.
-- We'll stick to the requirement: "INSERT: solo el sistema (trigger)". So NO insert policy for public/authenticated.

-- Policy: Users can update own profile.
create policy "Users can update own profile." on profiles
  for update using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- Generate username: email prefix + random 4 digits.
    -- We use split_part to get the part before '@'.
    -- We use floor(random() * 9000 + 1000) to get a 4-digit number.
    split_part(new.email, '@', 1) || cast(floor(random() * 9000 + 1000) as text),
    split_part(new.email, '@', 1), -- default display name same as email prefix
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
