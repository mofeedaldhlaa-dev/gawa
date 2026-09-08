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
- Database: MongoDB (local; Atlas blocked by IP firewall)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons (`.emergent/crons.yml`)

## Implemented (recent)
- 2026-02: **Automated daily cloud backup + email** (P1 done)
  - Endpoints: `/api/cron/daily-backup`, `/api/backup/run-now`, `/api/backup/list`,
    `/api/backup/latest`, `/api/backup/restore-latest`, `/api/backup/download/{token}`
  - Cron: daily 02:00 Asia/Aden; retention: last 14 records
- 2026-02: **Login by email or username** (case-insensitive; multi-user shared
  email supported, admins matched first)
- 2026-02: **User email field** in Users management (form + table + mobile card)
- 2026-02: **Enable/Disable accounts**
  - Users: `POST /api/users/{uid}/toggle-status` — protects self
  - Customers: `POST /api/customers/{cid}/toggle-status`
  - Enforced across `/api/auth/login` (403 when disabled), `/api/public/card-order/login`, and `/api/public/card-order/request`
  - UI: Power/PowerOff icon buttons in Users and Customers pages (desktop + mobile)
- Emergent Object Storage integration
- Customer portal enhancements
- Full edit mode Sales & Purchases invoices
- Mobile responsiveness

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup strategy.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2490 lines) into `routers/`

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/users/{uid}/toggle-status`
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` / `GET /api/backup/latest` / `POST /api/backup/restore-latest`
- `POST /api/cron/daily-backup` — Bearer WEBHOOK_CRON_SECRET

## Env keys (backend/.env)
- `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`
- `WEBHOOK_CRON_SECRET`, `PUBLIC_BASE_URL`
- `EMERGENT_LLM_KEY`
- Preserved but unused: `MONGODB_ATLAS_URI/USERNAME/PASSWORD`
