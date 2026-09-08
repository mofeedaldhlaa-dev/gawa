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
- Cloud backup daily + email download link
- Login by email OR username (case-insensitive)
- Enable/Disable accounts (users + customers) with 403 enforcement
- Disabled account UX (portal banner + WhatsApp CS button + statement banner)
- Admin management (role radio, hard delete with last-admin + self safety)
- Send card to another phone from card-order screen (Contact Picker API)
- Auto SMS delivery (client-side, `sms:` URI) + manual retry button
- Recipient info visible everywhere: printed invoices, sale view dialog, previous-orders history, portal result screen
- Contact name shown under phone in card-order screen
- **2026-02: Remember Me in customer portal**
  - Checkbox "حفظ رقم الهاتف وكلمة المرور" on `/order` login form
  - Credentials stored in localStorage as `jwd_portal_saved` (base64-obfuscated JSON)
  - Auto-load on mount when previously saved
  - Explicit "مسح الحساب من هذا الجهاز" button to clear + reset form
  - Un-checking the box on next login clears stored credentials automatically

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
