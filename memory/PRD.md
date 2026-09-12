# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية: accounting, sales, purchases, inventory, suppliers, customers, cards, expenses, reports.

## Routing (2026-02 - Restricted Mode)
- ONLY `/mof30` (also `/mof`, `/login`) is a public entry — Admin/Users login.
- `/`, `/order`, `/order-card` → redirect to `/mof30` (customer portal is closed).
- Any unknown route → redirect to `/mof30`.
- `/dashboard` and all internal admin routes remain behind Guard (require login).

## Auth
- Admins are strictly exempt from device-binding.
- Normal users are device-bound (5 failed attempts = lockout).
- After successful login → `/dashboard`. Logout → `/mof30`.

## Recent Changes (2026-02)
- Fixed: Login used to redirect to `/` (customer portal). Now redirects to `/dashboard`.
- Closed public customer portal routes; only `/mof30` open.

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn) login.
- P2: MongoDB Atlas migration (blocked on IP whitelist).
- P3: Re-enable public customer portal (optional).
