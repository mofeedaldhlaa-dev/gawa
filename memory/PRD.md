# شبكة جواد نت اللاسلكية - PRD

Owner: mofeedaldhlaa@gmail.com • 784225716 • المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT + IndexedDB + wa.me

## Delivered v1.4 (2026-02-05) 
### Admin panel:
- JWT auth, 17 permissions, route guards
- Notification bell in header with unread count
- Dashboard KPI + chart + pending register requests
- Customers CRUD + customer_type (عميل/نقطة بيع) + password reveal + admin reset + statement
- Suppliers CRUD + statement
- Categories dual pricing + dual low_stock thresholds
- Cards + Stock report
- Sales: create + PUT edit + **customer_id + sale_type NOW MANDATORY on both frontend and backend**
- Purchases: create + **PUT edit endpoint + edit/print buttons on list**
- Receipts (قبض/صرف) with success dialog + edit + **WhatsApp message includes "إجمالي الرصيد عليكم"**
- Reports: 7 tabs
- Users mgmt, Audit log
- /blocked page: manage blocked phones (unblock button)
- Settings + Backup export/restore + Reset-data
- Print CSS hides shell, adds header/footer

### Public /order:
- Simplified header (company name + gold pill "طلب كرت")
- Uses "كلمة المرور" everywhere (removed "كلمة السر")
- **Rate limit 5 fails = 24h block ALSO for non-existent phones** (server-persisted, immune to browser reload/device change)
- Forgot / Register / Change password via WhatsApp
- Success screen: category + card + copy button

## Deferred (v5):
- WebAuthn/Passkeys biometric login
- Server-side Arabic PDF for invoices/statements
- Full offline-first with conflict resolution
- Automated daily backup email via Resend
- bcrypt for customer passwords
