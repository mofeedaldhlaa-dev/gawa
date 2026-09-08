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
- 2026-02: **Enable/Disable accounts** (users + customers) with 403 enforcement everywhere
- 2026-02: **Disabled account UX** (portal banner + CS WhatsApp button + statement banner)
- 2026-02: **Admin management** (role radio, hard delete `/api/users/{uid}/permanent` with last-admin + self safety)
- 2026-02: **Send card to another phone (Card order screen)**
  - Backend: `CardOrderRequest.recipient_phone` optional; stored on `orders`, `sales.recipient_phone`, `card_order_attempts`; validated (min 6 digits/+); ignored when equals sender phone
  - Frontend: checkbox "إرسال الكرت لرقم آخر" + tel input + "جهات الاتصال" button using Web Contact Picker API (`navigator.contacts.select`) with graceful fallback message for non-supporting browsers
  - Result screen shows an amber banner "تم التحويل إلى: <number>"
  - Notifications for admin include the recipient phone

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup strategy.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2500 lines) into `routers/`

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/public/card-order/request` — `{phone, password, category_id, quantity, recipient_phone?}`
- `POST /api/users/{uid}/toggle-status` • `DELETE /api/users/{uid}/permanent`
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` • `GET /api/backup/latest` • `POST /api/backup/restore-latest`

## Env keys
- `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`
- `WEBHOOK_CRON_SECRET`, `PUBLIC_BASE_URL`, `EMERGENT_LLM_KEY`
- Preserved but unused: `MONGODB_ATLAS_URI/USERNAME/PASSWORD`
