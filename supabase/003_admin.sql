-- Vega: admin access to orders.
-- Run once in Supabase → SQL Editor (vega project).

-- When each status change happened (shown on the buyer's tracker).
alter table public.orders
  add column updated_at timestamptz not null default now(),
  add column shipped_at timestamptz,
  add column delivered_at timestamptz,
  add column cancelled_at timestamptz;

-- True when the signed-in account carries the "admin" label. The label lives
-- in app_metadata, which only the database owner can set — users can't give
-- it to themselves.
create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to authenticated;

-- Admins can read every order and its items.
create policy "Admins can read all orders"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can read all order items"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin()));

-- Admins can update orders — and only the status columns (see the grant).
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant update (status, updated_at, shipped_at, delivered_at, cancelled_at)
  on public.orders to authenticated;
