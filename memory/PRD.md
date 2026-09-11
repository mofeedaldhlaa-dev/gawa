# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons
- Timezone: **Asia/Aden (UTC+3)** — used for all date-range filters & dashboard

## Implemented (Feb 2026 batch — Big scope)
- **Timezone in reports**: all server date filters use `+03:00`. Dashboard `sales_today` computed over `[YYYY-MM-DDT00:00+03:00, T23:59+03:00]`. Sales include cash + credit + electronic.
- **User login + device binding + 5-fail lockout** (server-enforced). Admin endpoints: `/users/{uid}/unlock|reset-attempts|unbind-device`.
- **Notifications split**: `UserPlus` amber bell for `account_request` category — separate counter, mark-category-read persisted.
- **Register-request full validation** (frontend + backend): name (2+ words), phone (7-15 digits), address — all required with `*`.
- **Approve register-request**: returns `whatsapp_url` with welcome message (name + phone + password + welcome text). Notifications page auto-opens it.
- **Reset customer password**: returns `whatsapp_url` (change notification) for admin to send.
- **Unbind customer device**: returns `whatsapp_url` (unbind notification).
- **PublicOrder welcome text**: "مرحباً بك — قم بتسجيل الدخول" under the "طلب كرت" title with a modernized rounded gradient badge.
- **Send card to another phone**: added SMS/WhatsApp radio picker inside PublicOrder.
- **Audit log**: new endpoint filters (`start`, `end`, `q`) + AuditLog UI with date range + search + human-readable Arabic action/entity labels.
- **Admin auto-seed disabled**: startup no longer creates/updates the default `admin` account. First real user created through the UI/API becomes the admin.

## API cheatsheet (delta)
- `GET /api/audit?start=&end=&q=` — Yemen TZ, admin-only
- `POST /api/register-requests/{rid}/approve` — response now includes `whatsapp_url`, `phone`, `password`
- `POST /api/customers/{cid}/password` — response includes `whatsapp_url`
- `POST /api/customers/{cid}/unbind-device` — response includes `whatsapp_url`
- `POST /api/users/{uid}/unlock|reset-attempts|unbind-device` — admin lock/device management
- `POST /api/notifications/mark-category-read?category=account_request`
- `POST /api/auth/login` — body accepts `device_id`

## Domain routing (out of Emergent scope)
- `gawad.cc/` → PublicOrder page (`/order` route) as landing
- `gawad.cc/mof30` → user/admin login (`/login` route)
- These require reverse-proxy config on the Spaceship host (not doable from this sandbox). Route the domain root to the SPA and let the React router handle the paths.

## Blockers / Deferred
- P0: Biometric login (WebAuthn/Passkeys)
- P1: Currency picker inside sales/purchase/receipt forms (backend ready)
- P2: Refactor server.py into `routers/`
