# Vega — Made to glow.

A full-stack online store for **Vega**, a fictional premium electronics brand: phones, smartwatches and audio, sold in Indonesian Rupiah. It's a portfolio project, built design-first, with a real backend: accounts, orders, test-mode payments, a separate admin site, customer support messaging and an AI shopping assistant.

> Vega is not a real company. Products, prices and checkout are for demonstration only — payments run in Midtrans test mode, so no real money ever moves.

**Live demo:** _coming soon_

## What you can do

### As a shopper
- **Browse 18 products** across three lines — 12 phones (4 families × Base/Plus/Pro), 3 watches and 3 audio products — each with a feature page, specs and a configurator (color, storage, case size).
- **Keep a cart** that works signed out, then follows your account to any device once you sign in.
- **Check out with an Indonesian address** (38 provinces, +62 numbers, kecamatan, postal code) and choose standard or express delivery.
- **Pay through Midtrans** (Sandbox): card, virtual account, QRIS, GoPay, ShopeePay. Unpaid orders can be paid later and are cancelled after 24 hours.
- **Track orders** from Placed → Paid → Shipped → Delivered.
- **Message the support team** from the Support page or straight from an order, and read replies inside your account.
- **Ask the AI assistant** (bottom-right on every page) about products, comparisons with other brands, shipping or returns — no account needed.

### As an admin (separate address, e.g. `admin.localhost:3000`)
- **Manage orders:** filter, search, move orders through their statuses, cancel unpaid ones.
- **Edit the catalog:** every product field, prices, sold-out switch, add (blank or copied) and delete products, with a live preview.
- **Answer customers** in a support inbox with unread counts, order context and follow-ups.

## How it's built

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS v4, light/dark theme; product images are CSS drawings |
| Data & auth | Supabase (Postgres, Auth, Row Level Security) |
| Payments | Midtrans Snap, Sandbox mode |
| AI assistant | Google Gemini (free tier), streamed through a server route |

Some decisions worth a look:

- **Nothing from the browser is trusted for money.** Prices are recalculated from the database when an order is placed, and an order only counts as paid after the server asks Midtrans directly. Payment notifications are verified with Midtrans's SHA-512 signature.
- **Two sites, one app.** `src/proxy.ts` serves the admin pages on their own address. Admin access is enforced twice: on the server (`requireAdmin`) and in the database (RLS policies via `is_admin()`), not by the URL.
- **Least-privilege database access.** Buyers can only read their own rows; writes go through server code with the secret key; the products table isn't writable by the server key at all — only by admins through RLS.
- **AI guardrails.** The assistant gets the live catalog and store policies in its instructions, refuses off-topic requests, can't see any account data, and is rate-limited per visitor with capped input and history.

## Running it locally

1. **Install:** `npm install`
2. **Create a Supabase project** and run the scripts in `supabase/` in the SQL Editor, in order `001` → `009`. `005` seeds the 18 products. To make yourself an admin, put your email into `make_admin.sql` and run it.
3. **Add a `.env.local`:**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SECRET_KEY=...            # server only
   GEMINI_API_KEY=...                 # from Google AI Studio
   GEMINI_MODEL=gemini-3.5-flash      # optional
   MIDTRANS_SERVER_KEY=...            # Midtrans Sandbox, server only
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...
   ```

4. **Start:** `npm run dev` — the store is at `http://localhost:3000`, the admin site at `http://admin.localhost:3000`.

**Test payment:** card `4811 1111 1111 1114`, any future expiry, CVV `123`, OTP `112233`. Other methods can be paid in the [Midtrans payment simulator](https://simulator.sandbox.midtrans.com).

## Project layout

```
src/
  app/(store)/     the shop: products, cart, checkout, orders, account, support
  app/admin/       the admin site: orders, products, messages
  app/api/         AI assistant + Midtrans payment notifications
  lib/             catalog, pricing, orders, payments, AI knowledge, Supabase clients
  proxy.ts         admin address routing + session refresh
supabase/          database scripts (tables, RLS policies, seed data)
```
