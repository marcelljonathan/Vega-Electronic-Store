-- Vega: resolved conversations are final; a customer with more questions
-- starts a follow-up, linked to the conversation it continues.
-- Run once in Supabase → SQL Editor (vega project), after 006_support.sql.

alter table public.support_threads
  add column follow_up_of uuid references public.support_threads (id) on delete set null;
