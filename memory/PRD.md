# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Timezone: **Asia/Aden (UTC+3)** across all date filters

## Feb 2026 highlights
- Timezone-aware date filters (+03:00) across sales/purchases/receipts/expenses/reports/audit/statements
- User login + device binding + 5-fail lockout + admin unlock/unbind/reset endpoints
- Notifications split: `UserPlus` bell for `account_request` category (server-persisted read state)
- WhatsApp auto-messages: approve register, reset customer password, unbind device
- Delete endpoints (hard delete + full balance/inventory reversal): `/sales/{id}`, `/purchases/{id}`, `/receipts/{id}`
- Audit log with date filter + Arabic action/entity translation
- Statement print picker: يومي / شهري / سنوي (Arabic month names)
- Register-request full validation (name-4-parts + phone + address)

## Feb 2026 latest — Routing + Per-Deploy Admin Seeding
- **Routing rewrite** (frontend `/app/frontend/src/App.js`):
  - `/` → `PublicOrder` (طلب كرت) — public landing
  - `/mof30` (and legacy `/mof`, `/login`) → staff/admin login
  - `/dashboard` → protected admin dashboard (moved from `/`)
  - Sidebar "لوحة التحكم" link now points to `/dashboard`
  - Unknown paths → `/` (was `/login`)
- **Per-deploy default admin** (backend `startup()`):
  - Release identified by SHA256(server.py)[:16] — changes on every code update
  - `db.deployments` records `{release_id, seeded_at, admin_username, admin_user_id}`
  - Same release restart → skip (idempotent). New release → new admin.
  - Username: `admin_r<release6>_<hex4>`, random 12-char password
  - Password printed to server logs (`[DEPLOY-SEED]` prefix) — never returned to client, never in JS bundle
  - **Existing admins NEVER modified/deleted/reset** (verified: `admin` and `MOF` untouched after 2 deploys)

## Verified test cases (2026-02-11)
- ✅ `/` HTTP 200 → PublicOrder
- ✅ `/mof30` HTTP 200 → Login
- ✅ Same release restart: `deployments.count = 1` unchanged (idempotent)
- ✅ File hash change (simulated deploy) → new admin `admin_rfe7811_c79c` created + `deployments.count = 2`
- ✅ Pre-existing `admin`/`admin123` still logs in (18 perms)
- ✅ New deploy admin `admin_rfe7811_c79c`/`PnRlQEBHO4PM` logs in (18 perms, name: "مدير النظام (إصدار fe7811)")
- ✅ All 4 admins co-exist: `MOF`, `admin`, `admin_r54abc3_90ff`, `admin_rfe7811_c79c`

## API cheatsheet
- Routing: `/`, `/mof30`, `/dashboard`, `/order`, `/customers/:id`, `/accounts/:type/:id`, `/audit`
- `POST /api/auth/login` — accepts `device_id`
- `POST /api/users/{uid}/unlock|reset-attempts|unbind-device`
- `DELETE /api/sales|purchases|receipts/{id}` — hard delete with reversal
- `GET /api/audit?start=&end=&q=`
- `POST /api/register-requests/{rid}/approve` → `whatsapp_url`
- `GET /api/accounts/{type}/{id}/statement?start=&end=`

## Blockers / Deferred
- P0: Biometric login (WebAuthn/Passkeys)
- P1: Currency picker inside sales/purchase/receipt forms
- P2: Refactor server.py (~3500 lines) into `routers/`
