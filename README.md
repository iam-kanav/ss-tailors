# S.S Tailors — Authentic Tibetan Clothing (Majnu Ka Tila, New Delhi)

Minimalist, production-hardened e-commerce storefront and Admin Atelier built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **Supabase** (Postgres + Auth + Storage + Row Level Security), deployed on **Render**.

## Highlights

- **Authentic Tibetan Clothing Categories:** Women's Chuba, Men's Chuba (Phogoe), Handwoven Pangden Aprons, Mulberry Silk Wonju Blouses & Shirts, Brocade Toethung/Khenja Jackets & Vests, Ceremonial & Losar Kinkhab Sets, Kids' Traditional Wear, and Khata / Kagek Sashes.
- **Bespoke Majnu Ka Tila Tailoring:** Standard sizing or complimentary custom-tailored measurements captured at checkout, plus an interactive studio fitting appointment booking form.
- **Admin Atelier (`/admin`):** Create, edit, hide/show, and delete products; upload studio photos directly to Supabase Storage; add new categories; manage customer orders & tailoring inquiries; inspect immutable security audit logs.

## Production Security Hardening

1. **100% Row Level Security (RLS)** on every table in `public` and on the `product-images` Supabase Storage bucket.
2. **Zero Client-Side Role Escalation:** Roles live in `public.profiles` (never trusting editable `user_metadata`), enforced by BOTH an RLS `WITH CHECK` clause and a database `BEFORE UPDATE` trigger (`prevent_role_escalation`) that rejects client role mutations.
3. **Tamper-Proof Server-Side Checkout:** Direct client inserts into `orders` and `order_items` are denied by RLS. Orders execute through an atomic Postgres `SECURITY DEFINER` transaction (`place_order_secure`) with `SET search_path = ''` and `SELECT ... FOR UPDATE` row locking to prevent price tampering and inventory race conditions.
4. **Magic-Byte Media Upload Validation:** Admin image uploads inspect raw JPEG/PNG/WebP magic bytes (blocking spoofed SVG/HTML XSS payloads), enforce a 5 MB cap, randomize UUID object paths, and store via admin-only Storage RLS.
5. **HttpOnly SameSite Cookie Sessions & Server `getUser()` Verification:** Zero `service_role` keys in client bundles; server routes always verify JWTs via `auth.getUser()` rather than trusting raw cookies.
6. **Strict HTTP Security Headers & CSRF/Rate Limiting:** CSP (`frame-ancestors 'none'`, `object-src 'none'`), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, Same-Origin CSRF checks, and sliding-window rate limits across auth, order placement, inquiries, and admin mutations.

## Promoting an Admin User

Client signup always assigns `role = 'customer'`. To grant admin rights to an owner account, run this in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = 'owner@example.com';
```

## Local Development

```bash
npm install
npm run dev
```
