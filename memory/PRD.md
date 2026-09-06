# شبكة جواد نت اللاسلكية - PRD

Owner: mofeedaldhlaa@gmail.com • 784225716 • المخاء

## Stack
FastAPI + MongoDB + React (RTL) + JWT + IndexedDB + wa.me

## Delivered v2.1 (2026-02-06) — Phone-based fingerprint + contact CS button
- **`phoneFingerprint()`** helper in `lib/utils.js`: async SHA-256 hash over hardware-only signals — `navigator.platform`, `screen.WxHxColorDepth`, `devicePixelRatio`, timezone, `hardwareConcurrency`, `deviceMemory`, `maxTouchPoints`, `userAgentData.platform`. Deliberately excludes userAgent and canvas (both vary per browser). Result is stable across DIFFERENT BROWSERS on the SAME phone; changes only when the actual phone changes. Falls back to a DJB2 hash if SubtleCrypto is unavailable.
- **`PublicOrder.jsx`** now uses `phoneFingerprint()` instead of the browser-localStorage `deviceId()`. When the backend returns 403 with a message starting with «الهاتف غير مرتبط» the UI now shows the standard red error AND a large green button **«إرسال لخدمة العملاء»** (`data-testid=po-contact-cs-device`). Clicking it opens WhatsApp to `ADMIN_WHATSAPP` (784225716) with a pre-filled request that includes the account phone and timestamp, and toasts «تم إرسال طلبك إلى خدمة العملاء، وسيتم التواصل معك لإكمال عملية ربط الهاتف».
- **Backend unchanged** — the 403 message it already returns matches what the UI expects. No new endpoints. Zero extra queries per login.
- **Tested:** curl scenarios ↑ 200/200/403 pass; Playwright on 375px shows the error + green button + no page overflow.

## Delivered v2.0 (2026-02-06) — Device binding + customer-service unbind
- **Zero-extra-query bind check** in `POST /api/public/card-order/login`: after the existing password verify, the endpoint reads the `bound_device` field it already has in `customer` and compares to the incoming `device_id`. First login binds silently; matching device → allow; mismatched device → HTTP 403 with the exact required text «الهاتف غير مرتبط بالحساب. إذا قمت باستبدال هاتفك القديم، يرجى التواصل مع خدمة العملاء لطلب كلمة المرور.» A wrong device does NOT count as a password-failed attempt.
- **New admin endpoint** `POST /api/customers/{cid}/unbind-device` (perm `customers`) clears `bound_device`, pushes a `device_history` entry (`unbound_at`/`unbound_by`/`was`), and writes an `audit_log` row (`action=unbind_device`).
- **`PublicOrder.jsx`** sends `device_id: deviceId()` (already-persistent per-browser uuid from `lib/utils`) in the login body — no new client work, no extra request.
- **`Customers.jsx` PasswordDialog** now has two sections: change password + "إلغاء ربط الجهاز الحالي" (with the current bound device shown, a confirm prompt, and disabled state if none). Data-testids: `admin-cust-unbind`, `cust-bound-device`.
- Existing password reset flow (`POST /api/customers/{cid}/password`) unchanged. Existing `audit_log` records password reset as `reset_password`.
- Impact on cost: **1 extra `set` write on first login only, 0 extra reads per login**. No additional API calls, no extra background jobs.

## Delivered v1.9 (2026-02-06) — Public order pricing + history
- **Hide numbered-availability count from customer** while keeping the internal validation intact. The category dropdown now shows only `name - price` (no `متوفر X`), the standalone availability hint was removed, and the client still disables the request button when `quantity > available_numbered` and shows the exact red text «لا تتوفر كمية الكروت المطلوبة». Backend keeps returning `available_numbered` (used only for internal checks).
- **Per-customer-type pricing:** `POST /api/public/card-order/request` now picks `sale_price_pos` for POS-type customers and `sale_price_customer` otherwise (falls back to `sale_price` if not defined). `/api/public/card-order/categories` exposes both `sale_price_customer` and `sale_price_pos`. UI shows a live "السعر (نقطة بيع|عميل)" + "الإجمالي" preview before submit (`data-testid=po-price-preview`).
- **Previous orders section** inside `/order`: toggle (`po-history-toggle`), date-range inputs (`po-history-start`, `po-history-end`), search button (`po-history-search`). New endpoint `POST /api/public/card-order/my-orders` (auth via phone+password + optional `start`/`end` YYYY-MM-DD) returns the caller's orders sorted DESC.
- **Print per order:** every past-order card has its own `printPublicOrder(order, customer)` button (`po-order-print-<id>`) that opens a clean A4 window with that single order — no dashboard UI, no bundling.
- Customer portal remains **numbered-cards-only** — no fallback to quantity stock ever.

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
