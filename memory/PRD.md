# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` (main), `/order`, `/order-card` → PublicOrder (customer card window)
- `/mof30` → ONLY entry for Admin/Users login form
- `/login`, `/mof`, unknown → fall through to `/`
- `/dashboard` and all internal admin routes behind Guard

## PublicOrder (Customer Portal)
- Pre-login: shows unified welcome card ("مرحباً بك / قم بتسجيل الدخول") under the "طلب كرت" pill, same gradient design as post-login welcome.
- Post-login data card: Account Type / Credit Limit / Debt / Available / Change Password / Print Statement (no name — name only in welcome card).
- Previous Orders section: uses same daily/monthly/yearly/custom period picker as "طباعة كشف الحساب".

## Delete flows (real delete with safety)
- Customer/Supplier: hard-delete refused if any financial history, otherwise deletes cleanly.
- Sales/Purchases/Receipts/Expenses: cascade delete reversing balance/inventory with Arabic audit messages.
- Unified confirmation: "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن عملية الحذف."

## Unified Date Filters (Yemen +03:00)
- Daily/Monthly/Yearly/Custom on Sales, Purchases, Receipts, Expenses, and customer statements/orders.
- Dashboard `sales_today` matches daily sales report.

## Notifications
- Bell counter shows unread only.

## WhatsApp URLs (auto-open)
- POST /api/customers/{id}/password → wa_url
- POST /api/customers/{id}/unbind-device → wa_url
- POST /api/public-blocks/{phone}/unblock → wa_url

## PWA
- /manifest.json + /service-worker.js + icons (192/512 + maskable).
- Installable on Android. Works in browser and as installed app.

## Auth
- Admins strictly exempt from device-binding.
- Login → /dashboard. Logout & 401 → /mof30.
- Customers device-bound (5 failed = block).

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)
- admin / admin123, MOF / admin123
- Per-deploy admin auto-created (see backend.err.log `[DEPLOY-SEED]`).

## Backlog
- P1: Refactor server.py (>3600 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login.
- P2: Wrap delete_sale/delete_purchase in MongoDB transaction.
- P2: MongoDB Atlas migration.

## Test Reports
- /app/backend/tests/test_admin_device_exempt.py
- /app/backend/tests/test_iteration10_phase123.py — 13/13 PASS
- /app/test_reports/iteration_10.json
