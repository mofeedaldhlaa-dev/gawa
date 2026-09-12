# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder (customer card window). Only entry for customers.
- `/mof30` → ONLY entry for Admin/Users login.

## Latest Fixes (2026-02, iter 13)
- **Incentives button now ALWAYS visible** in PublicOrder data card (styled amber when enabled/history, muted otherwise).
- **Incentives Report Tab** added to `/reports` with daily/monthly/yearly/custom filters, print support, `data-testid="rep-incentives"`, `inc-table`, `inc-period-day|month|year|custom`.
- **Payment request auto-injects banks** — frontend now uses `r.data.message` returned by the backend which already contains the "بيانات السداد" block with all banks tagged `payment_requests`. Verified: `message includes bank: True`.

## Cumulative Incentive System
- Pending earnings computed dynamically per (customer, category) from all active sales.
- Multiple invoices, multiple days, cash+credit+electronic — all counted together.
- Remainder carries forward. Categories independent.
- Redemption creates permanent history in `incentive_earnings`.
- `exclude_special_price` skips accounts with `special_prices_enabled=true`.

## Public Endpoints
- `POST /public/card-order/incentives` — dynamic summary + history for logged-in customer.
- `POST /public/card-order/incentives/redeem` — mode: card|credit, category_id.
- `GET /public/card-order/banks?show_in=over_limit` — public list for over-limit banner.

## Admin Endpoints
- `GET /customers/{id}/incentives`, `POST /customers/{id}/incentives/redeem`.
- `GET /reports/incentives?start&end&customer_id&category_id&status_filter`.
- `bank_accounts` CRUD with show_in flags (`invoices`, `receipts`, `payment_requests`, `over_limit`).

## Auth
- Admins exempt from device-binding. Customers device-bound (5 failed = block).
- Login → /dashboard. Logout & 401 → /mof30.

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)
- admin / admin123, MOF / admin123

## Backlog
- P1: Refactor server.py (>3900 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
- P2: Admin "حوافز" icon inside customers list row to redeem on behalf.
- P2: MongoDB Atlas migration.
