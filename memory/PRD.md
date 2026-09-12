# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية.

## Routing
- `/` (main), `/order`, `/order-card` → PublicOrder (customer card window)
- `/mof30` → ONLY entry for Admin/Users login form
- `/login`, `/mof`, unknown → fall through to `/`
- `/dashboard` and all internal admin routes behind Guard

## Phase 1-3 Comprehensive Update (2026-02) ✅
### Delete flows (real delete with safety):
- Customer/Supplier: hard-delete refused if any financial history (sales/purchases/receipts/ledger/balance), otherwise deletes cleanly. Arabic audit log ("حذف العميل: ...")
- Sales/Purchases/Receipts/Expenses: existing cascade delete now with Arabic audit log messages ("حذف فاتورة مبيعات 125", "حذف سند قبض 100", etc.)
- Unified confirmation dialog: "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن عملية الحذف."

### Unified date filters:
- Daily/Monthly/Yearly/Custom on Sales, Purchases, Receipts, Expenses.
- Yemen TZ +03:00 boundaries; daily = 00:00:00 to 23:59:59 of selected date.
- Dashboard "sales_today" fixed to include cash+credit+electronic within same TZ window.

### PublicOrder (customer portal):
- Data card now shows: Account Type / Credit Limit / Debt / Available / Change Password / Print Statement.
- Account name displayed ONLY in welcome card ("مرحباً بك <name>").

### Notifications:
- Bell counter shows unread only (existing behavior verified). Two icons: account_request bell + general bell.

### WhatsApp URLs:
- POST /api/customers/{id}/password → returns wa_url
- POST /api/customers/{id}/unbind-device → returns wa_url  
- POST /api/public-blocks/{phone}/unblock → returns wa_url
- Frontend auto-opens WhatsApp on success (window.open).

### PWA (Android installable):
- /manifest.json with name/theme/icons (192/512 + maskable).
- /service-worker.js network-first for API, cache-first for static.
- Auto-registers on load. Works in browser and as installed app.

### Auth:
- Admins strictly exempt from device-binding.
- Login redirects to /dashboard (fixed setState-in-render warning).
- Logout & 401 → /mof30.

## Auth Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)
- admin / admin123
- MOF / admin123
- Per-deploy admin auto-created and logged with [DEPLOY-SEED] prefix.

## Backlog
- P1: Refactor `/app/backend/server.py` (>3500 lines) into modular routers.
- P2: Biometric (WebAuthn/Passkeys) login — pending. HTTPS domain required (works on preview + production deploy).
- P2: Wrap delete_sale/delete_purchase in MongoDB transaction for atomicity.
- P2: MongoDB Atlas migration (blocked on IP whitelist).

## Test Files
- /app/backend/tests/test_admin_device_exempt.py
- /app/backend/tests/test_iteration10_phase123.py — 13/13 PASS
- /app/test_reports/iteration_10.json
