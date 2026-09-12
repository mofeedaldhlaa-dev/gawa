# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing (2026-02)
- `/` (main), `/order`, `/order-card` → PublicOrder (customer card order window).
- `/mof30` → ONLY entry for Admin/Users login.
- `/login` and `/mof` → permanently redirect to `/mof30` (deprecated).
- Any unknown route → redirect to `/`.
- `/dashboard` and all internal admin routes remain behind Guard (require login).

## Auth
- Admins are strictly exempt from device-binding.
- Normal users are device-bound (5 failed attempts = lockout).
- Customers on the public portal are device-bound.
- After successful admin/user login → `/dashboard`.
- Logout & unauthenticated Guard → `/mof30`.
- Axios 401 interceptor → `/mof30`.

## Recent Changes (2026-02)
- Login redirects fixed to `/dashboard` (previously went to `/`).
- `/login` completely deprecated; replaced by `/mof30` everywhere (Guard, api interceptor, App routes).

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn) login.
- P2: MongoDB Atlas migration (blocked on IP whitelist).
