-- Vega: support conversations between signed-in buyers and the Vega team.
-- Run once in Supabase → SQL Editor (vega project).

create table public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  product text not null default '',              -- optional, picked in the form
  -- open = waiting for Vega · replied = Vega answered · resolved = closed
  status text not null default 'open'
    check (status in ('open', 'replied', 'resolved')),
  customer_unread boolean not null default false, -- Vega replied, buyer hasn't looked yet
  admin_unread boolean not null default true,     -- buyer wrote, admin hasn't looked yet
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index support_threads_user_idx on public.support_threads (user_id, last_message_at desc);
create index support_threads_status_idx on public.support_threads (status, last_message_at desc);

create table public.support_messages (
  id bigint generated always as identity primary key,
  thread_id uuid not null references public.support_threads (id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin')),
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index support_messages_thread_idx on public.support_messages (thread_id, created_at);

-- Grants: buyers and admins only READ through the website's public key;
-- every write goes through the Vega server (secret key = service_role),
-- which checks who is writing first.
grant select on public.support_threads, public.support_messages to authenticated;
grant select, insert, update, delete
  on public.support_threads, public.support_messages to service_role;

-- Row Level Security: buyers see only their own conversations; admins see all.
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

create policy "Buyers read their own conversations, admins read all"
  on public.support_threads for select
  to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "Buyers read messages in their conversations, admins read all"
  on public.support_messages for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = (select auth.uid())
    )
  );
