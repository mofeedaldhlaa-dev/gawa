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
  - Opening balances report (`GET /api/reports/opening-balances`)
  - Item movement report (`GET /api/reports/item-movement`)
  - Currency dropdown in Settings
- **2026-02 Phase 3 (Dashboard integration + Full account experience)**:
  - **Accounts panel on Dashboard** below Cashbox — cards with type filter, search, sort by name/balance, quick view
  - **Account detail page** (`/accounts/:type/:id`) — full statement with balance-before, total debit/credit, running balance
    - **Add Voucher** button (creates receipt/payment via `/api/receipts`, auto-updates cashbox & party balance)
    - **Add Invoice** deep-link to `/sales/new?customer=` or `/purchases/new`
    - **Print statement** (day/month/year/custom) using unified template
    - **Payment Request** dialog — creates record + opens SMS/WhatsApp with pre-filled body; does NOT change balance until real payment recorded
  - **Currency CRUD** (`GET/POST/PUT/DELETE /api/currencies`) — with soft-disable when used in operations; each op stores `currency_symbol` + rate at creation time
  - **Payment Requests API** (`GET/POST /api/payment-requests`, `POST /api/payment-requests/:id/status`) — status: new/sent/paid/cancelled
  - **Unified Account Statement** endpoint (`GET /api/accounts/:type/:id/statement?start&end`) — works for customer/pos/supplier/expense/cash
  - **Item movement now includes**: purchases + sales + `db.stock_ops` (direct additions: numbered & quantity) + legacy card creations
    - New collection `stock_ops` logs every non-invoice inventory addition; balance-before correctly includes these

## API cheatsheet
- Cash: `GET /api/cash/summary?start&end`, `GET /api/cash/statement?start&end`
- Expenses: `GET/POST /api/expenses`, `DELETE /api/expenses/{id}`
- Receipts: `GET/POST /api/receipts`, `PUT /api/receipts/{id}`
- Transfers: `POST /api/transfers`, `GET /api/transfers`
- Accounts: `GET /api/accounts` (list), `GET /api/accounts/{type}/{id}/statement`
- Currencies: `GET/POST/PUT/DELETE /api/currencies`
- Payment Requests: `GET/POST /api/payment-requests`, `POST /api/payment-requests/{id}/status?new_status=..`
- Reports: `GET /api/reports/opening-balances`, `GET /api/reports/item-movement?category_id&start&end`

## Deferred (Phase 4)
- Wire up currency selection into Sales/Purchases/Receipts forms UI (backend already stores `currency_symbol` + rate)
- Extend item movement to include cancelled sales/purchases reversals & manual adjustments

## Blockers / Deferred long-term
- Atlas migration BLOCKED (Atlas IP firewall)
- P0: Biometric login (WebAuthn/Passkeys)
- P2: Refactor server.py (~3300 lines) into `routers/`
