# شبكة جواد نت اللاسلكية - PRD

Owner: mofeedaldhlaa@gmail.com • 784225716 • المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT + IndexedDB + wa.me

## Delivered v1.8 (2026-02-05) — Public order = numbered cards only
- `POST /api/public/card-order/request` no longer falls back to quantity stock. It counts available numbered cards for the requested category; if `numbered_avail < quantity` it rejects with exact message **"لا تتوفر كمية الكروت المطلوبة"** and logs a `rejected_no_stock` attempt.
- `GET /api/public/card-order/categories` now returns `available_numbered` per category so the UI can prevent the user before submitting.
- Order/sale docs written by the public flow now always store `use_numbered: true` and `quantity_stock_taken: 0`.
- `PublicOrder.jsx` shows the per-category numbered count in the dropdown, an inline availability line under the category field, a red inline warning + disabled submit button when `quantity > available_numbered`, and no longer renders the "من المخزون" hint after success.
- Same-page error remains inline (no redirect on 400/401/403/404/429).

## Delivered v1.7 (2026-02-05) — Full mobile-responsive overhaul
- Global CSS (`index.css`): `html, body` locked at `max-width:100vw` with `overflow-x:hidden`; `main` gets `min-width:0` so wide tables scroll INSIDE their card container instead of pushing the page; inputs forced to `font-size:16px` on <640px to prevent iOS zoom; ≥44px touch targets on coarse pointers; sonner toaster capped inside viewport.
- Viewport meta (`public/index.html`): removed `maximum-scale=1` (accessibility) and added `viewport-fit=cover`.
- Shell (`App.js`): header now truncates title, hides labels on tiny screens, keeps `menu-btn / sync-btn / bell-btn / logout-btn` always accessible; main is `min-w-0 w-full`; content padding scales `p-3 sm:p-4 md:p-6`.
- Mobile card views (in addition to hidden md-table) added to: Sales, Purchases, Receipts, Orders, Users, Suppliers, BlockedCustomers, CustomerStatement.
- Forms converted to `grid-cols-1 sm:grid-cols-2` on: Customers, Users (+permissions), Suppliers, Categories.
- Sale/Purchase item rows: category takes a full row on <sm, quantity/price/total/remove on the same row → readable on 320px.
- Reports & Cards filter bars: `flex-col sm:flex-row` with `w-full sm:w-auto` inputs.
- AuditLog & Cards tables use `min-w-[720px]` / `min-w-[560px]` to trigger internal horizontal scroll cleanly (user's Option 3).
- Recharts `ResponsiveContainer` gets `minWidth={0}` to silence -1 width warnings on narrow viewports.
- Tests: iteration_6.json — 17 pages @ 320/375/414/1920 all pass, zero page-level overflow, all mobile card views verified, desktop regression clean.

## Delivered v1.6 (2026-02-05) — Customer/Admin auth isolation
- Root cause: `api.js` interceptor redirected ANY 401 to `/login`; the guard only excluded `/order-card` so `/order` was leaking failed customer logins to the admin login page.
- Fix (frontend only, no backend change):
  - `/app/frontend/src/lib/api.js`: interceptor now skips redirect when (a) the failing request is a `/public/*` endpoint OR (b) the current pathname is `/order`, `/order-card`, or sub-paths.
  - `/app/frontend/src/pages/PublicOrder.jsx`: login form wrapped in `<form onSubmit>`, new `loginError` state renders inline red alert with `data-testid=po-login-error` ("كلمة المرور غير صحيحة" for 401, generic message for 404) — never navigates.
- Backend `/api/public/card-order/login` unchanged: 401 wrong password, 404 unknown phone, 429 blocked, block-after-5-fails works for unknown phones too.
- Tests: `/app/backend/tests/test_public_order_auth.py` (7/7) + Playwright cases 1-10 all pass — iteration_5.json.

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
