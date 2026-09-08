# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local; Atlas blocked by IP firewall)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons

## Implemented (recent)
- Cloud backup daily + email download link
- Login by email OR username
- Enable/Disable accounts + disabled UX + WhatsApp CS
- Admin management (role radio, hard delete safeguards)
- Send card to another phone + Contact Picker + auto SMS
- Remember Me in customer portal
- Print customer statement with date range
- Sales page filters (period + type) + report print
- **2026-02 Phase 1 (Accounting core)**:
  - **Cash Box on Dashboard**: `/api/cash/summary` + `/api/cash/statement` — computes balance, in, out, net from cash sales + receipt vouchers + payment vouchers + expenses; period selectors + custom range + print
  - **Expenses screen** (`/expenses`) with account management inline (`/api/expense-accounts` CRUD), CRUD expenses, period filter, totals, print report
  - **Receipts page enhanced**: period filter + kind filter (all/receipt/payment) + summary cards (count/receipts/payments/net) + "طباعة التقرير"
  - **ALL_PERMS** extended with `expenses`; admin seed auto-refreshes on startup

## API cheatsheet
- Cash: `GET /api/cash/summary?start&end`, `GET /api/cash/statement?start&end`
- Expenses: `GET/POST /api/expenses`, `DELETE /api/expenses/{id}`
- Expense accounts: `GET/POST/DELETE /api/expense-accounts`
- Receipts: `GET/POST /api/receipts`, `PUT /api/receipts/{id}`
- Public: `POST /api/public/card-order/statement` — `{phone, password, start?, end?}`

## Deferred (Phase 2 — Accounts & Reports)
- Unified Accounts screen (customers/suppliers/POS/other)
- Account transfers
- Grouped statement prints (compact: name/phone/balance)
- Opening balances report

## Deferred (Phase 3 — Inventory & polish)
- Inventory item movement report
- Card order log filters
- Currencies in settings
- Unified print template polish

## Blockers / Deferred long-term
- Atlas migration BLOCKED (Atlas IP firewall)
- P0: Biometric login (WebAuthn/Passkeys)
- P2: Separate deployment for `/order`
- P2: Refactor server.py (~2700 lines) into `routers/`
