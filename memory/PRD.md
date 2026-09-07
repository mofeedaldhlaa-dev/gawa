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
- Database: MongoDB (local — Atlas migration blocked by network policy; kept
  local per user decision, replaced by cloud backup strategy)
- Object Storage: Emergent Object Storage (integration proxy)
- Email: Emergent-managed Resend (integration proxy) — for daily backup emails
- Scheduler: Emergent platform crons (`.emergent/crons.yml`)

## Implemented (recent)
- 2026-02: **Automated daily cloud backup + email** (P1 done)
  - `POST /api/cron/daily-backup` — Bearer-authed webhook, 2xx-ack, backgrounds work
  - `POST /api/backup/run-now` — admin-triggered manual run
  - `GET /api/backup/list` — last 30 runs metadata (no token exposed)
  - `GET /api/backup/download/{token}` — 14-day magic-link download (gzipped JSON)
  - Retention: keeps last 14 backup records
  - Cron: daily 02:00 Asia/Aden via `.emergent/crons.yml`
  - Email: guardrail gate (`_assert_safe_email`) + Arabic RTL HTML template
  - Settings UI: new "رفع للسحابة وإرسال بالبريد الآن" button in Settings
- Emergent Object Storage integration (files upload/list/download/delete)
- Customer portal: previous orders, device binding, POS pricing, hidden stock
- Full edit mode for Sales & Purchases invoices
- Mobile responsiveness 320–414px, no horizontal scroll
- Low-stock alerts split (numbered vs quantity cards)
- Backup settings UI (email / time / auto toggle) + reveal password on mobile

## Deferred / Alternatives
- **MongoDB Atlas migration**: BLOCKED by Atlas IP-level firewall
  (`TLSV1_ALERT_INTERNAL_ERROR` on all TLS variants). User chose
  **Option C**: keep local Mongo + automated encrypted cloud backup (done).
- P0: Biometric login (WebAuthn/Passkeys) — deferred (2 sessions)
- P2: Separate deployment for `/order` vs admin — needs two Emergent deploys
- P2: Refactor server.py into routers (currently ~2200 lines)

## Backlog (prioritized)
- P0: Biometric login (WebAuthn) admin + customer
- P2: Split `server.py` into `routers/`
- P2: Customer portal separate deployment guidance

## API cheatsheet (backup)
- `POST /api/backup/run-now` (auth: admin, perm=backup)
- `GET  /api/backup/list` (auth: admin, perm=backup)
- `GET  /api/backup/download/{token}` (public, magic-link, 14d expiry)
- `POST /api/cron/daily-backup` (Bearer WEBHOOK_CRON_SECRET, backgrounded)

## Env keys (backend/.env)
- `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`
- `WEBHOOK_CRON_SECRET`, `PUBLIC_BASE_URL`
- `EMERGENT_LLM_KEY` (used for object storage init)
- Preserved (unused now): `MONGODB_ATLAS_URI/USERNAME/PASSWORD`
