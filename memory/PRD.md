# شبكة جواد نت اللاسلكية - PRD

## Owner
mofeedaldhlaa@gmail.com • Phone: 784225716 • Location: المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT (bcrypt admin) + IndexedDB offline + wa.me.

## Delivered v1.2 (2026-02-05) — 46/46 backend tests pass
### Admin panel (behind /login):
- JWT auth (admin/admin123), 17 granular permissions, **route guards + hasPerm enforced on every URL**
- Dashboard KPIs + chart + quick actions + recent invoices/receipts/orders + pending register requests
- Customers: CRUD + **customer_type (عميل / نقطة بيع)** + password reveal + admin password reset + statement
- Suppliers CRUD + statement
- Categories: add/edit/delete (FK-safe) + **dual pricing (sale_price_customer + sale_price_pos)** + separate low_stock thresholds (numbered + quantity)
- Cards: bulk-paste numbered / quantity / edit / delete (sold cards → soft-cancel)
- Stock report with low-stock alerts
- Sales: multi-item, cash/credit, numbered or qty, GWD auto-numbering, idempotency, credit-limit check, **auto-pricing based on customer_type**
- **Purchases now support numbered cards** — adds cards to inventory on receipt
- Receipts (قبض/صرف) with **success dialog: print + WhatsApp + close**; new WA format includes "من ... / المخاء / 784225716"
- Reports: sales, purchases, electronic-sales, card-order-log (rejections tracked), customer/supplier debts, stock with print
- Users mgmt with permissions
- **Notifications** page includes register-request approve/reject with credit_limit + customer_type + optional password
- Audit log (nested ObjectId fixed via recursive clean_doc)
- **Settings**: general + Backup section (export/restore) + **Reset all data** with admin credential verification

### Public /order (independent, no admin UI):
- Login with **rate limit: 5 failed = 24h block per phone** + support-contact button
- Forgot password → WhatsApp to 784225716
- Create account → WhatsApp request (label: "عنوان العمل أو اسم محلك")
- Change own password (creates notification for admin)
- Success screen: category name + card numbers + copy button + toast "تم نسخ رقم الكرت بنجاح"

### Cross-cutting:
- Print CSS hides sidebar/header, adds print header (Company + المخاء + phone) and footer with "أنشأ الملف: <username>"
- Dialog max-h 90vh + overflow-y-auto for mobile
- IndexedDB queue + sync button + online/offline indicator + idempotency keys
- WhatsApp message format for invoices: "من ... / المخاء / 784225716 / عليكم فاتورة رقم: ..."

## Test coverage: 46/46 backend tests PASSED (100%)

## Deferred (v3 backlog):
- Automatic daily backup email delivery (Resend)
- bcrypt hash for customer passwords
- MongoDB transactions on multi-collection writes
- Server-side Arabic PDF via wkhtmltopdf/weasyprint (currently browser print)
- Backup restore full-collection snapshot symmetry
