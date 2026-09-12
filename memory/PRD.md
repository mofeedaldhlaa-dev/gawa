# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية: accounting, sales, purchases, inventory, suppliers, customers, cards, expenses, reports, and public customer portal.

## Routing
- `/` → PublicOrder (customer portal for card orders)
- `/mof30` (also `/mof`, `/login`) → Admin/Users login
- `/dashboard` → Admin dashboard (post-login landing)

## Auth
- Admins are strictly exempt from device-binding.
- Normal users are strictly bound to `device_id` (5 failed attempts = lockout).
- Customers on the public portal are also device-bound.
- After successful login, admins/users land at `/dashboard`.
- Logout redirects to `/mof30`.

## Recent Bug Fixes (2026-02)
- Fixed: Login redirected to `/` (customer portal) instead of `/dashboard`. Now redirects to `/dashboard` on both existing session load and successful login.
- Logout redirect updated from `/login` → `/mof30`.

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login for admin panel and customer portal.
- P2: MongoDB Atlas migration (blocked on IP whitelist).
