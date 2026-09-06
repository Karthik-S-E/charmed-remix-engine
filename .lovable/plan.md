# Plan: Kandamma Kids — Launch & Secure Admin + Customer Site

## Goal
Transform the current Terra Studios knitwear template into **Kandamma Kids**, a kids-clothing storefront with a Lovable Cloud backend, role-based auth, admin product management, and live publishing.

## Out of scope for this plan
- Real payment gateway integration.
- Full multi-image gallery or order/checkout flow beyond the existing cart.

## Technical foundation
1. **Enable Lovable Cloud** to get PostgreSQL, auth, and edge functions.
2. **Database schema**
   - `profiles` table (linked to `auth.users`, with name, phone, address, role hint optional).
   - Auto-create profile trigger on signup.
   - `user_roles` table + `app_role` enum (`admin`, `customer`).
   - `has_role` security-definer helper for RLS.
   - `products` table with fields: name, design_number, colors, color_images, style, occasion, price, gender, age_range, sizes, in_stock, stock_quantity, description, main_image, meesho_url, flipkart_url.
   - `brand_settings` table for store logo, store name, tagline.
3. **RLS & security**
   - Products: public read for in-stock rows; admin full control via `has_role(..., 'admin')`.
   - Profiles: users read/update own; admins read all.
   - `user_roles`: read for authenticated; write only service-role/admin via secure flow.
   - Input validation with Zod on client forms and edge functions.

## Frontend changes
4. **Rebrand**
   - Update `index.html` title/meta to Kandamma Kids.
   - Replace header logo text with dynamic store name from `brand_settings`.
   - Swap hero/collection images for kids-clothing placeholders (or user-provided assets).
5. **Shop page**
   - Gender filter (Boy/Girl/All) with counts.
   - Age/size range filter (1–4Y, 2–5Y, 4–8Y, 5–8Y).
   - Search bar (searches name, description, color, style, occasion, design number, sizes).
   - Responsive product grid (1/2/3 columns) with matching-count label and empty state.
6. **Product tile**
   - 4:5 image, Boy/Girl badge, age-range badge.
   - Name, INR price, 2-line description.
   - Stock badge: sold-out, low-stock animation (≤3), or in-stock count.
   - Size selector, Add to Bag, View, WhatsApp order link.
   - Marketplace badges (Meesho/Flipkart) when URLs exist.
7. **Product detail page**
   - Update to use Cloud products; add size selector, WhatsApp order, marketplace links.
8. **Admin page (protected)**
   - `/admin` route visible only to users with `admin` role.
   - Product form: all fields from the spec.
   - Main image + optional color-image uploads to storage.
   - Product list with edit and remove-with-confirmation.
   - Brand settings panel: logo upload, store name, tagline.
9. **Auth pages**
   - `/login`, `/signup`, `/reset-password`.
   - Email/password + Google sign-in by default.
   - Customer sign-up assigns `customer` role; first admin must be seeded/promoted via secure edge function.

## Validation & hardening
10. Zod schemas for every form (product, login, signup, brand settings).
11. No role checks in localStorage; all admin checks use server-side `has_role` + protected routes.
12. Enable password HIBP check in Cloud auth settings.
13. WhatsApp and marketplace links use `encodeURIComponent` and never raw user URLs without validation.

## Launch
14. Run security scan, resolve critical findings, then publish.
15. Verify live URL loads, public shop renders, and admin route is blocked for non-admin users.
