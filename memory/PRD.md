# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` → PublicOrder (customer card window). Only entry for customers.
- `/mof30` → ONLY entry for Admin/Users login.
- `/login`, `/mof`, unknown → redirect to `/`.

## Delivered (2026-02)

### Statement cleanup
- Editing / deleting sale/purchase/receipt now removes the ORIGINAL ledger entry (via `_remove_ledger_by_op`) so no "تعديل / حذف / عكس" noise in customer/supplier statements.

### Bank Accounts
- Collection `bank_accounts` + full CRUD + admin page `/bank-accounts`.
- Per-bank visibility flags: `invoices` / `receipts` / `payment_requests` / `over_limit`.
- Auto-appended to printed invoices and receipts in a gold-accent block.

### Special Prices (per customer / per POS)
- Customer form has "تفعيل سعر خاص" toggle + list editor (category + price).
- Backend fields `special_prices_enabled`, `special_prices: [{category_id, price}]`.
- `create_sale` price resolution precedence: special_prices → cat.sale_price_pos/customer → cat.sale_price.
- Independent per account — customer prices never affect POS and vice-versa.

### Incentives System
- Settings section "الحوافز" with 3 toggles: customer_enabled, pos_enabled, exclude_special_price.
- Collection `incentive_rules` per account_type (customer / pos), CRUD, per-rule active flag.
- Auto-earning on sale via `_apply_incentive_on_sale` (non-fatal, per-category qty ÷ buy × reward).
- Pending earnings stored in `incentive_earnings`.
- Deleting a sale drops its pending earnings (redeemed ones are kept forever).
- Public endpoints `/public/card-order/incentives` (list) + `/public/card-order/incentives/{id}/redeem?mode=card|credit`.
- PublicOrder screen shows "🎁 مبروك! لديك حوافز مستحقة" card with two buttons: **استلام كرت الحافز** and **تقييد المبلغ في حسابي**.
- Duplicate-redeem prevented by status transitions (`pending → redeemed_card | redeemed_credit`).

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

## Backlog
- P1: Refactor server.py (>3800 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
- P2: Payment-request notifications & over-limit alerts to consume `bank_accounts` filter for those `show_in` values.
- P2: MongoDB Atlas migration.
