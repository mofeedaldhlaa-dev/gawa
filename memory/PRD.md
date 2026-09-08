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
- Cloud backup daily + email download link (`/api/backup/*`, `/api/cron/daily-backup`)
- Login by email OR username (case-insensitive)
- User email field in Users management
- Enable/Disable accounts (users + customers) with 403 enforcement
- Disabled account UX (portal banner + WhatsApp CS button + statement banner)
- Admin management (role radio, hard delete with last-admin + self safety)
- **Send card to another phone from card-order screen**
  - Backend: `CardOrderRequest.recipient_phone` optional, stored on orders/sales/attempts
  - Frontend: checkbox + tel input + "جهات الاتصال" (Web Contact Picker API)
- **2026-02: SMS delivery for cards (free, client-side)**
  - `openSMS(phone, body)` helper in `lib/utils.js` uses `sms:<phone>?body=<encoded>`
  - After a successful order with `recipient_phone`, the device SMS app is auto-opened with the card number(s) pre-filled (one tap to send from the customer's own SIM)
  - Manual blue "إرسال الكرت رسالة نصية" button on result screen for fallback / retry
  - Message body: greeting + sender name + card category + card numbers + brand footer

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2500 lines) into `routers/`
- Automatic (Twilio) SMS — deferred; user chose free client-side option

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
