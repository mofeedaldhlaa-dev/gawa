# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder. `/mof30` → Admin login. Others redirect to `/`.

## Latest Delivery (2026-02, iter 14) — all 8/8 backend tests PASS
### 1) Simplified Incentives Dialog in PublicOrder
- Removed explanations. Now shows per-category: **الكروت المشتراة** + **المتبقي للحافز**.
- Single redeem button: **"استلم كروت"** — "تقييد إلى حساب" removed.
- Uses `remaining_for_next` from summary.

### 2) Statement Button in PublicOrder
- Verified via testing_agent: `/public/card-order/statement` returns `{customer, entries}` with correct UTC+03:00 boundaries for daily/monthly/yearly/custom.
- Button `openStmtDialog` opens dialog; picker `StatementPeriodPicker` handles all modes.

### 3) Per-Customer Incentives Visibility Toggle
- New field `customers.incentives_visible` (default `true`) — backward compatible.
- `_customer_incentive_summary` returns `enabled=false` when:
  - `special_prices_enabled=true` AND settings.exclude_special_price=true (existing), OR
  - `incentives_visible=false` (NEW).
- Admin form has a select: **"الحوافز: إظهار / إخفاء"** (`data-testid="cust-incentives-visible"`).

### 4) Post-Save Actions Dialog in AccountDetail
- After saving a receipt/expense, opens a small dialog with:
  - **طباعة** button (`last-op-print`) — uses `printReceipt` with bank blocks.
  - **إرسال واتساب** button (`last-op-wa`) — uses customer phone. If phone missing → toast error.
- `saveVoucher` now returns the created object and passes it to the dialog.

### 5) Payment Request Bank Format
- Message auto-appends debt total + requested amount + bank blocks WITHOUT "البنك:" prefix.
- Verified: `إجمالي المديونية: 1,500` + `المبلغ المطلوب سداده: 700` + bank fields.

## Backlog
- P1: Refactor server.py (~4000 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
- P2: Aggregation for `/reports/incentives?kind=pending` (currently O(customers × rules)).
- P2: Skip blank bank fields in `/payment-requests` message assembly.
- P3: Uniform 401/404 for `/public/card-order/statement` to prevent phone enumeration.

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)

## Test Reports
- /app/backend/tests/test_iteration14_incentives_statement.py — 8/8 PASS
- /app/test_reports/iteration_14.json
