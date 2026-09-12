# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية: accounting, sales, purchases, inventory, suppliers, customers, cards, expenses, reports, and public customer portal.

## Routing (2026-02)
- `/` (main), `/order`, `/order-card` → PublicOrder (customer card order window).
- ONLY `/mof30` (also `/mof`, `/login`) → Admin/Users login.
- Any unknown route → redirect to `/`.
- `/dashboard` and all internal admin routes remain behind Guard (require login).

## Auth
- Admins are strictly exempt from device-binding.
- Normal users are device-bound (5 failed attempts = lockout).
- Customers on the public portal are device-bound.
- After successful admin/user login → `/dashboard`. Logout → `/mof30`.

## Recent Changes (2026-02)
- Fixed: Login used to redirect to `/` (customer portal). Now redirects to `/dashboard`.
- Confirmed: `/` shows customer portal; `/mof30` is the ONLY admin login entry.

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn) login.
- P2: MongoDB Atlas migration (blocked on IP whitelist).
