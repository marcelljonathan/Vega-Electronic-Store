-- Vega: the product catalog.
-- Run once in Supabase → SQL Editor (vega project), then 005_products_seed.sql.

create table public.products (
  slug text primary key,                         -- URL id, e.g. "ember-pro"
  category text not null check (category in ('phone', 'watch', 'audio')),
  position int not null default 0,               -- sort order in lists
  name text not null,
  tagline text not null default '',
  description text not null default '',
  price bigint not null check (price >= 0),      -- base price in Rupiah
  available boolean not null default true,       -- false = sold out
  -- Everything else, depending on the category: colors (with room for an
  -- image link each), storage tiers or case sizes, specs, feature cards…
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_position_idx on public.products (category, position);

-- Grants: anyone (even signed out) can read; signed-in users may try to
-- write, but the RLS rules below only let admins succeed.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Admins can add products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));
