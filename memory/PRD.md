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
- Enable/Disable accounts (users + customers) with 403 enforcement everywhere
- Disabled account UX (portal banner + CS WhatsApp button + statement banner)
- Admin management (role radio, hard delete with last-admin + self safety)
- Send card to another phone from card-order screen
  - `CardOrderRequest.recipient_phone` optional, stored on orders/sales/attempts
  - Frontend: checkbox + tel input + Contact Picker API
- SMS delivery for cards (free, client-side): `openSMS` in `lib/utils.js`; auto-opens on success; manual retry button
- **2026-02: Recipient visibility everywhere**
  - Printed sale invoice: highlighted "📤 المرسل إلى" row (`printSaleInvoice`)
  - Printed public order receipt: same row (`printPublicOrder`)
  - Admin Sales view dialog: amber highlighted row when `recipient_phone` present
  - Customer portal previous-orders card: amber "📤 المرسل إلى" banner per order
- **2026-02: Contact name under phone in card-order screen**
  - Contact Picker returns tel + name; name is displayed below the phone in a green banner
  - On result screen and toast, the name is preferred over the number when available
  - Manual edits clear the name automatically

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/public/card-order/request` — `{phone, password, category_id, quantity, recipient_phone?}`
- `POST /api/users/{uid}/toggle-status` • `DELETE /api/users/{uid}/permanent`
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` • `GET /api/backup/latest` • `POST /api/backup/restore-latest`

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2500 lines) into `routers/`
- Automatic (Twilio) SMS — deferred; user chose free client-side option
