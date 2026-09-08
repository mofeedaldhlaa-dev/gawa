# Jawad Net Wireless — ERP (Arabic RTL)

## Original problem statement
Comprehensive Arabic (RTL) Web-based ERP for شبكة جواد نت اللاسلكية.

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
- Enable/Disable accounts (users + customers) with 403 everywhere
- Disabled account UX (portal banner + WhatsApp CS button + statement banner)
- Admin management (role radio, hard delete with last-admin + self safety)
- Send card to another phone + Contact Picker + auto SMS delivery
- Recipient info in invoices, sale view dialog, previous-orders history
- Contact name shown under phone in card-order screen
- Remember Me + auto-fill on customer portal (localStorage base64)
- Print account statement from customer portal
- **2026-02: Date-range statement printing**
  - Backend endpoint now accepts `start` and `end` (YYYY-MM-DD), computes opening balance from prior entries, injects a synthetic "رصيد افتتاحي حتى <start>" row, and recalculates running balance across the window
  - Frontend dialog with two date inputs + presets ("هذا الشهر", "هذا العام", "كل الفترات") + Print button
  - Print template picks up an optional `rangeTitle` for the printed title (e.g., "كشف حساب من 2026-02-01 إلى 2026-02-08")

## API cheatsheet
- `POST /api/public/card-order/statement` — `{phone, password, start?, end?}` → `{customer, entries, range, opening_balance, closing_balance}`
- `POST /api/public/card-order/login` / `request` / `my-orders`
- `POST /api/auth/login` — `{username|email, password}`
- `POST /api/users/{uid}/toggle-status` • `DELETE /api/users/{uid}/permanent`
- `POST /api/customers/{cid}/toggle-status`
- `POST /api/backup/run-now` • `GET /api/backup/latest` • `POST /api/backup/restore-latest`

## Deferred / Alternatives
- MongoDB Atlas migration BLOCKED. Replaced by cloud backup.
- P0: Biometric login (WebAuthn/Passkeys) — deferred
- P2: Separate deployment for `/order` vs admin
- P2: Refactor server.py (~2580 lines) into `routers/`
- Automatic (Twilio) SMS — deferred; user chose free client-side option
