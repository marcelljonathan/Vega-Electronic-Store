-- Vega: test-mode payments with Midtrans (Snap).
-- Run once in Supabase → SQL Editor (vega project), after 008.

-- New orders wait for payment first: awaiting_payment → processing (paid)
-- → shipped → delivered, or cancelled.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('awaiting_payment', 'processing', 'shipped', 'delivered', 'cancelled'));
alter table public.orders alter column status set default 'awaiting_payment';

-- New orders are paid through Midtrans (older demo orders keep card/bank/ewallet).
alter table public.orders drop constraint orders_payment_check;
alter table public.orders add constraint orders_payment_check
  check (payment in ('card', 'bank', 'ewallet', 'midtrans'));

alter table public.orders
  add column paid_at timestamptz,             -- when Midtrans confirmed the payment
  add column payment_method text,             -- e.g. "BCA virtual account", "QRIS"
  add column payment_token text,              -- the Midtrans payment window for this order
  add column payment_expires_at timestamptz,  -- unpaid after this → cancelled
  add column cancel_reason text;              -- 'payment_expired' when it wasn't paid in time

-- Only the Vega server (secret key) writes these columns; buyers and admins
-- can read them through the existing select policies.
