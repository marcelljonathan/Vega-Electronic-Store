-- Vega: a support conversation can be about a specific order.
-- Run once in Supabase → SQL Editor (vega project), after 007.

alter table public.support_threads
  add column order_id uuid references public.orders (id) on delete set null;

create index support_threads_order_idx on public.support_threads (order_id);
