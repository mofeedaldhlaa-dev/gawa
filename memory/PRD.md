# شبكة جواد نت اللاسلكية - PRD

## Overview
تطبيق محاسبة ومبيعات ومخزون متكامل عربي RTL. Owner: mofeedaldhlaa@gmail.com. Phone: 784225716.

## Stack
FastAPI + MongoDB + React (RTL) + JWT (bcrypt) + IndexedDB offline + wa.me.

## Delivered v1.1 (2026-02-04)
### Admin panel (behind /login):
- JWT auth (admin/admin123), 17 granular permissions, user CRUD, audit log
- Dashboard: 8 KPIs, sales chart, quick actions, recent sales/receipts/orders
- Customers CRUD + edit + admin password reset dialog + credit limit enforcement + statement page
- Suppliers CRUD + statement
- Categories: add/edit/delete (FK-safe soft-disable if used)
- Cards: bulk-paste numbered (dedup/invalid report) + quantity-only + edit/delete (block edits on sold cards, soft-cancel on delete if sold)
- Stock report with low-stock alerts (numbered + quantity views)
- Sales: multi-item, cash/credit, numbered or qty, GWD auto-numbering, idempotency, credit-limit check, ledger update, WhatsApp share
- Purchases with supplier ledger + stock replenish
- Receipts (قبض/صرف) with ledger update
- Reports: sales, purchases, electronic-sales (public_order source), card-order-log (with rejection tracking), customer/supplier debts, stock — with print
- Notifications + Audit log + Settings

### Public /order (independent, no admin UI):
- Customer login (phone + password), auto card reservation
- Forgot password → opens WhatsApp to 784225716 with pre-filled request
- Create account → sends WhatsApp request to admin (does NOT auto-create)
- Change own password (verify current)
- Cards shown with copy button + toast
- Balance after operation shown; invoice number hidden from customer
- Rejection tracking: over-limit / no-stock / not-found (all logged in card_order_attempts)

### Offline first:
IndexedDB queue + sync button + online/offline indicator + idempotency keys.

## Backend test coverage: 29/29 PASSED (100%)

## Deferred (v2 backlog):
- Automatic daily backup + email delivery (Resend)
- Backup upload/restore with pre-restore snapshot
- Hash customer passwords with bcrypt (currently plaintext)
- MongoDB transactions around multi-collection sale writes
- Brute-force lockout on public login
- Arabic PDF generation via server-side lib (currently uses browser print with RTL styles)
- Explicit CORS origin whitelist (currently regex .*)
