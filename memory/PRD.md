# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder (customer card window). Only entry for customers.
- `/mof30` → ONLY entry for Admin/Users login.

## Latest Fixes (2026-02, iter 14)
### 1) Incentives Dialog in PublicOrder
- Root cause: my earlier `Dialog open={showIncentives}` block ended up outside the main return. Now added correctly next to `showStmtDialog` at line 682.
- Content shows per-category rows (bought/redeemed/pending), rule text, Arabic status, redeem buttons, and history list.

### 2) Incentives Report: Redeemed + Unredeemed Toggle
- `GET /api/reports/incentives?kind=redeemed|pending` (default: redeemed).
- `pending`: iterates all customers with rules, computes pending per category dynamically.
- `redeemed`: filters `incentive_earnings` by date range.
- Frontend Reports page has a toggle (data-testid `inc-kind-redeemed` / `inc-kind-pending`). Table columns adapt to mode.

### 3) Payment Request Message Format
- New format:
  ```
  إجمالي المديونية: 13,250
  المبلغ المطلوب سداده: 5,000

  بيانات السداد:

  Al-Amal Bank
  اسم الحساب: Jawad Net
  رقم الحساب: 9876543
  IBAN test

  شبكة جواد نت اللاسلكية
  ```
- Bank name displayed WITHOUT "البنك:" prefix as requested.
- Debt total + requested amount included automatically.
- Multiple banks appended cleanly.

## Route Bug Fixed
- Removed stray `@api.get("/reports/incentives")` decorator that was stacked on top of `public_banks`, causing `/api/reports/incentives` to return the bank-accounts list.
- Restored `incentive_report` function definition properly.

## Auth
- Admins exempt from device-binding. Login → /dashboard.
- Customers device-bound (5 failed = block).

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)

## Backlog
- P1: Refactor server.py (>3900 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
