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
- Enable/Disable accounts (users + customers) — 403 everywhere
- Disabled account UX (portal banner + WhatsApp CS button + statement banner)
- Admin management (role radio, hard delete with last-admin + self safety)
- Send card to another phone + Contact Picker + auto SMS delivery
- Recipient info in all invoices, orders, sale view dialog, and history cards
- Contact name shown under phone in card-order screen
- Remember Me + auto-fill on customer portal (localStorage base64) with explicit clear button
- **2026-02: Print account statement from customer portal**
  - New public endpoint `POST /api/public/card-order/statement` — phone+password auth, returns customer + ledger entries; password removed from response; enforces disabled=403
  - Reuses existing `printStatement` A4 template — header, customer info, ledger table, totals, footer
  - Purple outlined button "طباعة كشف الحساب" placed inside customer info card, shown right after login
  - Loading state and toast error handling

## API cheatsheet
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/public/card-order/login`
- `POST /api/public/card-order/request` — `{phone, password, category_id, quantity, recipient_phone?}`
- `POST /api/public/card-order/statement` — `{phone, password}` → `{customer, entries[]}`
- `POST /api/public/card-order/my-orders` — history
- `POST /api/users/{uid}/toggle-status` • `DELETE /api/users/{uid}/permanent`
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` • `GET /api/backup/latest` • `POST /api/backup/restore-latest`

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED (Atlas IP firewall). Replaced by cloud backup.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2540 lines) into `routers/`
- Automatic (Twilio) SMS — deferred; user chose free client-side option
