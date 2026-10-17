-- Vega: one saved cart per signed-in user.
-- Run once in Supabase → SQL Editor.

create table public.carts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Signed-in users may use the table at all (new Supabase projects don't
-- grant this automatically). Visitors who aren't signed in get nothing.
grant select, insert, update on public.carts to authenticated;

-- Row Level Security: each user can only see and change their own cart.
alter table public.carts enable row level security;

create policy "Users can read their own cart"
  on public.carts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own cart"
  on public.carts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own cart"
  on public.carts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
