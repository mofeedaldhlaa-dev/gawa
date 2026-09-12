# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder (customer card window). Only entry for customers.
- `/mof30` → ONLY entry for Admin/Users login.
- `/login`, `/mof`, unknown → redirect to `/`.

## Cumulative Incentive System (2026-02, iter 12)
- Pending earnings are **computed dynamically** on read from the sum of all active sales quantities per (customer, category). No per-sale insert.
- Rules per category, per account_type (customer / pos), independent.
- Cumulative: multiple invoices, multiple days, cash + credit + electronic — all counted together.
- Remainder carries forward across cycles: bought=23 with buy=10/reward=1 → earned 2, remaining 3 for next.
- Categories tracked independently — no cross-category mixing.
- `exclude_special_price` toggle skips accounts with `special_prices_enabled=true`.
- Sale edit/delete automatically recomputes because logic reads from live sales.
- Redemption creates a permanent `incentive_earnings` history record (`redeemed_card` or `redeemed_credit`) — never re-runnable.
- History preserved forever even after new redemption cycles start.

## Incentive UI
- PublicOrder data card has a **🎁 حوافز** button with red badge if pending > 0.
- Modal shows per-category rows: `bought / redeemed / pending`, rule text, Arabic status string, and two buttons on pending rows: "استلام كرت الحافز" / "تقييد المبلغ في حسابي". History list at bottom.
- Alert banner at top when pending exist.

## Incentive Report
- `GET /api/reports/incentives?start&end&customer_id&category_id&status_filter` returns `{items, count, total_qty, total_value}`.
- Redemption history only (redeemed_card / redeemed_credit).
- Yemen +03:00 boundaries.

## Bank Accounts in Public
- `GET /api/public/card-order/banks?show_in=over_limit` — public (no auth).
- PublicOrder over-limit error banner auto-shows those banks with bank_name / holder / account / details.
- `POST /api/payment-requests` auto-appends "بيانات السداد" block for every active bank with `show_in=payment_requests`.

## Delivered Earlier
- Statement cleanup (no تعديل/حذف noise in ledger).
- Bank Accounts CRUD + admin page + invoice/receipt print integration.
- Special Prices per customer/POS.
- Login redirects, PWA (manifest + service worker + icons).

## Auth
- Admins exempt from device-binding. Login → /dashboard. Logout & 401 → /mof30.
- Customers device-bound (5 failed = block).

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)
- admin / admin123, MOF / admin123
- Per-deploy admin auto-created.

## Backlog
- P1: Refactor server.py (>3900 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
- P2: Incentive report UI page (backend endpoint is ready).
- P2: MongoDB Atlas migration.
