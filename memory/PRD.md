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
- Enable/Disable accounts + WhatsApp CS
- Admin management (role radio, hard delete safeguards)
- Send card to another phone + Contact Picker + auto SMS
- Remember Me in customer portal
- Print customer statement with date range
- Sales page filters + report print
- **2026-02 Phase 1 (Accounting core)**:
  - Cash Box on Dashboard (`/api/cash/summary`, `/api/cash/statement`)
  - Expenses screen (`/expenses`) with account management inline
  - Receipts page enhanced: period + kind filter + summary + print
- **2026-02 Phase 2 (Accounts & Reports)**:
  - Unified Accounts screen (`/accounts`) — customers/POS/suppliers/expense/cash with balances, filter by type, grouped print
  - Transfers between accounts (`POST /api/transfers`, `GET /api/transfers`)
    - Source & Dest of type customer/supplier/cash — deducts source, adds to destination via ledger entries
    - Optional block-negative flag
    - Cash transfers reflect in cash box (in/out)
  - Opening balances report tab in Reports (`/api/reports/opening-balances`)
  - Item movement report tab in Reports (`/api/reports/item-movement?category_id&start&end`)
    - Balance-before/after + all inventory movements (purchases/sales)
  - Card order log filters: period (daily/monthly/yearly/all) + status + summary cards
  - Currency dropdown in Settings (13 currencies)

## API cheatsheet
- Cash: `GET /api/cash/summary?start&end`, `GET /api/cash/statement?start&end`
- Expenses: `GET/POST /api/expenses`, `DELETE /api/expenses/{id}`
- Expense accounts: `GET/POST/DELETE /api/expense-accounts`
- Receipts: `GET/POST /api/receipts`, `PUT /api/receipts/{id}`
- Transfers: `POST /api/transfers` — body `{source_type, source_id?, dest_type, dest_id?, amount, description?, block_negative?, date?, idempotency_key?}`; `GET /api/transfers`
- Accounts (unified): `GET /api/accounts`
- Reports: `GET /api/reports/opening-balances`, `GET /api/reports/item-movement?category_id=..&start=..&end=..`
- Public: `POST /api/public/card-order/statement` — `{phone, password, start?, end?}`

## Deferred (Phase 3 — polish)
- Unified print template polish across ALL screens (footer branding + logo)
- Compact "name + phone + balance only" grouped statement print variants per type — currently /accounts print already outputs this trio; per-type shortcuts can be added

## Blockers / Deferred long-term
- Atlas migration BLOCKED (Atlas IP firewall)
- P0: Biometric login (WebAuthn/Passkeys) — user has re-affirmed this multiple sessions
- P2: Separate deployment for `/order`
- P2: Refactor server.py (~2900 lines) into `routers/`
