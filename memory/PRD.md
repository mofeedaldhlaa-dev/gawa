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
  - Cash Box on Dashboard, Expenses screen, Receipts filters
- **2026-02 Phase 2 (Accounts & Reports)**:
  - Unified Accounts screen + Transfers + Opening balances report + Item movement + Currency dropdown
- **2026-02 Phase 3 (Full accounting integration)**:
  - Dashboard Accounts panel + Account detail page + Currency CRUD + Payment requests + Item-movement includes direct additions (`stock_ops`)
- **2026-02 Phase 4 (Dashboard UX + Prefill)**:
  - **Cashbox** and **Accounts** on Dashboard are now **collapsible sections** — icon + main title header, expand to view details
  - **Removed** the standalone "الحسابات" entry from the sidebar (route `/accounts` still available for internal navigation from account cards)
  - **Add invoice from account detail** auto-prefills the customer via `?customer=<id>` query param in `/sales/new`

## API cheatsheet
- Accounts: `GET /api/accounts`, `GET /api/accounts/{type}/{id}/statement?start&end`
- Currencies: `GET/POST/PUT/DELETE /api/currencies`
- Payment Requests: `GET/POST /api/payment-requests`, `POST /api/payment-requests/{id}/status?new_status=..`
- Transfers: `POST /api/transfers`, `GET /api/transfers`
- Cash: `GET /api/cash/summary`, `GET /api/cash/statement`
- Reports: `GET /api/reports/opening-balances`, `GET /api/reports/item-movement?category_id&start&end`

## Blockers / Deferred
- Atlas migration BLOCKED
- P0: Biometric login (WebAuthn/Passkeys)
- P1: Currency picker inside sales/purchase/receipt forms (backend ready)
- P2: Refactor server.py (~3300 lines) into `routers/`
