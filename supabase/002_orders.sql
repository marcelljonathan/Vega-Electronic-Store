-- Vega: orders and the items in each order.
-- Run once in Supabase → SQL Editor (vega project).

-- Order numbers count up from VG-10001.
create sequence public.order_number_seq start 10001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('VG-' || nextval('public.order_number_seq')),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'processing'
    check (status in ('processing', 'shipped', 'delivered', 'cancelled')),
  email text not null,
  address jsonb not null,
  delivery text not null check (delivery in ('standard', 'express')),
  payment text not null check (payment in ('card', 'bank', 'ewallet')),
  subtotal bigint not null,
  shipping_fee bigint not null,
  total bigint not null,
  created_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

-- What was bought, with the price at the moment of purchase.
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  kind text not null,
  name text not null,
  color_name text not null,
  option text not null default '',
  screen_a text not null,
  screen_b text not null,
  unit_price bigint not null,
  quantity int not null check (quantity > 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- Grants (this project doesn't add them automatically):
-- buyers may only READ; only the Vega server (secret key = service_role) writes.
grant select on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.orders, public.order_items to service_role;
grant usage, select on sequence public.order_number_seq to service_role;

-- Row Level Security: buyers see only their own orders and their items.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can read their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read items of their own orders"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );
