# شبكة جواد نت اللاسلكية - PRD

Owner: mofeedaldhlaa@gmail.com • 784225716 • المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT + IndexedDB + wa.me

## Delivered v1.5 (2026-02-05) — 67/67 backend tests pass

### v1.5 highlights (print system rebuilt):
- New `/app/frontend/src/lib/print.js` — opens standalone A4 window per document; NEVER prints admin shell
- Sales invoices print: RTL A4 template, brand header (شبكة جواد نت اللاسلكية / المخاء / 784225716), invoice info grid, items table with card numbers, totals block, footer "أنشأ الملف: <user>"
- Purchases print: same template with supplier info
- Receipts print: قبض/صرف label, لكم/عليكم direction, balance-after highlighted, description block
- Customer statement print: header + info-grid + full ledger table with page-break-inside:avoid + totals (مدين/دائن/رصيد)
- Reports print (all 7 tabs): sales/purchases/electronic/card_order_log/customer_debts/supplier_debts/stock with per-report headers and totals
- All prints use Cairo/Tajawal from Google Fonts (loaded in the print window) so Arabic renders correctly regardless of user device
- CSS: `@page { size: A4; margin: 12mm }`, tr break-inside:avoid, table thead repeats on new page
- Empty state: "لا توجد بيانات لعرضها" instead of blank/error

### Prior v1.4 (still active):
- Rate limit 5 fails = 24h block on ALL phones (registered or not)
- Sale POST requires customer_id + sale_type ('cash'|'credit')
- PUT /api/purchases/{id} edit endpoint
- Receipt WA message ends with "إجمالي الرصيد عليكم: X"

## Deferred (v6):
- WebAuthn/Passkeys biometric login (fingerprint/Face ID)
- Server-side PDF generation with jsPDF/wkhtmltopdf for archive quality
- Offline-first with conflict resolution
- Daily email backup via Resend
- bcrypt for customer passwords

## Test coverage: Backend 67/67 sequential (100%)
