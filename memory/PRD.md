# شبكة جواد نت اللاسلكية - PRD

## Owner
mofeedaldhlaa@gmail.com • 784225716 • المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT + IndexedDB + wa.me

## Delivered v1.3 (2026-02-05) — 57/57 backend tests PASS
### Admin panel:
- JWT auth, 17 permissions, route guards + hasPerm on all URLs, unknown routes → /login
- Notification bell in header with unread count (polls every 30s)
- Dashboard + KPI + chart + pending_register_requests
- Customers CRUD + customer_type (عميل/نقطة بيع) + password reveal + admin reset + statement
- Suppliers CRUD + statement
- Categories: dual pricing (sale_price_customer + sale_price_pos) + dual low_stock thresholds
- Cards + Stock report
- Sales: create + **PUT /sales/{id} edit (discount/paid/notes) with credit-limit re-check + auto balance adjust**
- Purchases with numbered card intake
- Receipts (قبض/صرف) with success dialog (print+WA+close) + **PUT /receipts/{id} edit with auto balance adjust**
- Reports: 7 tabs + defensive rendering
- Users mgmt, Audit log (recursive clean_doc)
- **/blocked page**: list of blocked customers (customer_name + blocked_at + blocked_until) with rise-block button
- Settings + Backup export/restore + Reset-data (admin credential gated)
- Print CSS hides shell, includes header "المخاء" and footer with "أنشأ الملف: <user>"

### Public /order:
- Simplified header (just company name + gold pill "طلب كرت", no phone next to it)
- Rate limit 5 fails = 24h block + support contact button
- Forgot / Register (WhatsApp) / Change password (creates admin notification)
- Success screen: category + card number + copy + toast

## Deferred (v4):
- WebAuthn/Passkeys biometric login
- Server-side Arabic PDF (currently browser print)
- Daily automatic email backup (Resend)
- bcrypt for customer passwords
- MongoDB transactions across multi-collection writes
- Conflict resolution on offline sync
