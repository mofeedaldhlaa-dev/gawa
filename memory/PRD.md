# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing (2026-02 - FINAL)
- `/` (main), `/order`, `/order-card` → PublicOrder (customer card order window).
- `/mof30` → **ONLY** entry for Admin/Users login form.
- ANY other route (`/login`, `/mof`, `/admin`, unknown) → falls through `*` and redirects to `/`.
- `/dashboard` and all internal admin routes remain behind Guard (require login).

## Auth
- Admins strictly exempt from device-binding.
- Normal users are device-bound (5 failed attempts = lockout).
- Customers on public portal are device-bound.
- Successful admin/user login → `/dashboard`.
- Logout & unauthenticated Guard & axios 401 → `/mof30`.

## Recent Changes (2026-02)
- `/login` and `/mof` removed entirely from routes. Only `/mof30` opens login form.
- Login redirect fixed to `/dashboard`.

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn) login.
- P2: MongoDB Atlas migration (blocked on IP whitelist).
