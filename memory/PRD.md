# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Timezone: **Asia/Aden (UTC+3)** across all date filters

## Feb 2026 highlights
- Timezone-aware filters (+03:00) across sales/purchases/receipts/expenses/reports/audit/statements
- Device binding + 5-fail lockout + admin unlock/unbind/reset endpoints
- **Admin role is EXEMPT from device binding** (Feb 11, 2026 patch — server.py:515-529)
- Notifications split: separate `UserPlus` bell for `account_request` category
- WhatsApp auto-messages: approve register, reset password, unbind device
- Delete endpoints (hard delete + balance/inventory reversal): sales/purchases/receipts
- Audit log with date filter + Arabic translation
- Statement print picker: يومي / شهري / سنوي
- Routing: `/` → PublicOrder, `/mof30` → login, `/dashboard` → admin panel
- Per-deploy default admin (SHA256 of server.py = release_id, tracked in `deployments`)
- PublicOrder header text "مرحباً بك / قم بتسجيل الدخول" now hidden after successful login (Feb 11, 2026)

## Feb 11, 2026 fixes (this session)
- **Admin account recovery**: users collection wiped by an earlier bulk update — restored MOFEED, admin, MOF admin accounts with all 18 permissions
- **Admin device-binding exemption**: server.py login now branches on `is_admin = user.role == 'admin'` and skips both the mismatch check AND the bound_device write when admin. Normal users still bound.
- **Frontend header hide-after-login**: `{!customer && ...}` wraps the pre-login welcome text (`data-testid=po-header-welcome`)
- **Verified by testing_agent** (iteration_9.json): 100% backend pass, 5/5 pytest cases, no action items

## API cheatsheet
- Routing: `/`, `/mof30`, `/dashboard`, `/order`
- `POST /api/auth/login` — admin role bypasses device binding; regular users still bound
- `POST /api/users/{uid}/unlock|reset-attempts|unbind-device`
- `DELETE /api/sales|purchases|receipts/{id}` — hard delete with reversal
- `GET /api/audit?start=&end=&q=`
- `GET /api/accounts/{type}/{id}/statement?start=&end=`
- `POST /api/register-requests/{rid}/approve` → `whatsapp_url`

## Blockers / Deferred
- P0: Biometric login (WebAuthn/Passkeys)
- P1: Currency picker inside sales/purchase/receipt forms
- P2: Refactor server.py (~3550 lines) into `routers/`
- P2: Consider permission-based `is_privileged(user)` helper instead of hard-coded `role == 'admin'` check
