# Jawad Net Wireless — ERP (Arabic RTL)

## Original problem statement
Comprehensive Arabic (RTL) Web-based ERP for شبكة جواد نت اللاسلكية:
accounting, sales, purchases, inventory, suppliers, customers, card management
(numbered & quantity), offline-first with sync, dedicated hardened customer
portal (`/order`) with device binding, A4 print templates, automated daily
email backups, biometric login, file/media storage.

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local — Atlas migration blocked by Atlas IP firewall)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons (`.emergent/crons.yml`)

## Implemented (recent)
- 2026-02: **Automated daily cloud backup + email** (P1 done)
  - `POST /api/cron/daily-backup` (Bearer WEBHOOK_CRON_SECRET, ack immediately, background work)
  - `POST /api/backup/run-now` (admin manual)
  - `GET /api/backup/list` (last 30 records, tokens hidden)
  - `GET /api/backup/latest` (metadata of most recent backup)
  - `POST /api/backup/restore-latest` (restores latest cloud backup, protects `users`, creates pre-restore snapshot)
  - `GET /api/backup/download/{token}` (14-day public magic-link)
  - Cron schedule: daily 02:00 Asia/Aden via `.emergent/crons.yml`
  - Retention: last 14 records
- 2026-02: **Email OR username login**
  - `POST /api/auth/login` accepts email in `username` field (case-insensitive)
  - Multi-user shared-email support: admins are matched first, then password verified against each candidate
  - Login page label + placeholder updated ("اسم المستخدم أو البريد الإلكتروني")
- 2026-02: Settings page: "رفع للسحابة وإرسال بالبريد الآن" + "استعادة آخر نسخة سحابية" buttons, latest-backup info banner
- Emergent Object Storage integration
- Customer portal enhancements (previous orders, device binding, POS pricing)
- Full edit mode Sales & Purchases invoices
- Mobile responsiveness 320–414px
- Low-stock alerts split (numbered vs quantity)

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED by Atlas IP firewall (TLSV1_ALERT_INTERNAL_ERROR).
  User chose cloud-backup strategy (implemented) as the safer alternative.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2400 lines) into `routers/`

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/backup/run-now`
- `GET  /api/backup/list`
- `GET  /api/backup/latest`
- `POST /api/backup/restore-latest` — body `{confirm: true}`
- `GET  /api/backup/download/{token}`
- `POST /api/cron/daily-backup` — Bearer WEBHOOK_CRON_SECRET, backgrounded

## Env keys (backend/.env)
- `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`
- `WEBHOOK_CRON_SECRET`, `PUBLIC_BASE_URL`
- `EMERGENT_LLM_KEY`
- Preserved but unused: `MONGODB_ATLAS_URI/USERNAME/PASSWORD`
