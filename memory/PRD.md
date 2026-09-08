# Jawad Net Wireless — ERP (Arabic RTL)

## Original problem statement
Comprehensive Arabic (RTL) Web-based ERP for شبكة جواد نت اللاسلكية:
accounting, sales, purchases, inventory, suppliers, customers, card management,
offline-first with sync, hardened customer portal (`/order`) with device
binding, A4 print templates, automated daily email backups, biometric login,
file/media storage.

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local; Atlas blocked by IP firewall — replaced by cloud backup)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons (`.emergent/crons.yml`)

## Implemented (recent)
- 2026-02: **Automated daily cloud backup + email** (`/api/backup/*`, `/api/cron/daily-backup`)
- 2026-02: **Login by email or username** (case-insensitive, admin-first)
- 2026-02: **User email field** in Users management
- 2026-02: **Enable/Disable accounts** (users + customers) with 403 enforcement across admin + public login/order endpoints
- 2026-02: **Disabled account UX for customer portal**
  - Special red "⛔ الحساب موقوف" banner replaces generic error
  - Green "تواصل مع خدمة العملاء" button opens WhatsApp with pre-filled Arabic message
  - Prominent "موقوف" badge on customer statement page + full-width red banner explaining consequences
- 2026-02: **Admin management** (change password, create, hard-delete)
  - `DELETE /api/users/{uid}/permanent` — hard delete with two safety guards:
    * cannot delete self (400)
    * cannot delete last active admin (400)
  - UI: role radio (مستخدم عادي / مدير نظام) with red highlight for admin, disables permissions list when admin
  - UI: red trash button with double confirmation (window.confirm + username retype prompt)
  - Password change: existing edit form password field applies to any user including admins
- Emergent Object Storage integration
- Customer portal enhancements (previous orders, device binding, POS pricing)
- Full edit mode Sales & Purchases invoices
- Mobile responsiveness (320–414px)

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup strategy.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2500 lines) into `routers/`

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/users/{uid}/toggle-status`
- `DELETE /api/users/{uid}/permanent` — hard delete with admin-safety
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` • `GET /api/backup/latest` • `POST /api/backup/restore-latest`
- `POST /api/cron/daily-backup` (Bearer WEBHOOK_CRON_SECRET)

## Env keys
- `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`
- `WEBHOOK_CRON_SECRET`, `PUBLIC_BASE_URL`, `EMERGENT_LLM_KEY`
- Preserved but unused: `MONGODB_ATLAS_URI/USERNAME/PASSWORD`
