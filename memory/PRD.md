# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder (customer card window). Only entry for customers.
- `/mof30` → ONLY entry for Admin/Users login.
- `/login`, `/mof`, unknown → redirect to `/`.

## Recent Delivery (2026-02, iter 11)
### ✅ Statement cleanup (Item 1 of the big update)
- Editing / deleting a sale, purchase, or receipt no longer inserts extra "تعديل / حذف / عكس" rows into the customer/supplier ledger.
- Uses new helper `_remove_ledger_by_op(party_type, party_id, op_number)` — removes the original ledger entry(ies) and adjusts the party balance in place.
- Applied to: `delete_sale`, `delete_purchase`, `delete_receipt`, `edit_sale` (full + quick), `edit_receipt`.
- Audit log still records the operation (who + when + before/after) — statement remains clean.

### ✅ Bank Accounts (Items 9-11)
- New collection `bank_accounts` and CRUD endpoints (`/api/bank-accounts`, GET filter `show_in=`).
- New admin page `/bank-accounts`.
- Per-bank visibility flags: `invoices` / `receipts` / `payment_requests` / `over_limit`.
- Print output (Sales/Purchases invoices + Receipts) now appends a "للسداد عبر:" section with all active banks whose `show_in` matches — gold-accent card style, works in browser print.
- Inactive banks or banks not tagged for a location never appear.
- Sales.jsx / Purchases.jsx / Receipts.jsx now fetch `/bank-accounts` and pass `banks` to the print helpers.

## Backlog from the big update (still to do — Phase 2 of this request)
- **Item 2**: Special sale prices per customer / POS (independent price maps + toggle "تفعيل سعر خاص").
- **Items 3-8**: Incentives system (rules per customer / POS, auto-earning on sale, exclude special-price accounts, redeem as card or credit from PublicOrder).

## Auth
- Admins strictly exempt from device-binding.
- Login → /dashboard. Logout & 401 → /mof30.
- Customers device-bound (5 failed = block).

## PWA
- /manifest.json + /service-worker.js + icons — installable on Android.

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)
- admin / admin123, MOF / admin123
- Per-deploy admin auto-created (see backend.err.log `[DEPLOY-SEED]`).

## Test Reports
- /app/test_reports/iteration_10.json — 13/13 PASS
