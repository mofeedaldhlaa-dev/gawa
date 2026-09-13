# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية. Public window = GAWAD NET.

## Routing & PWA
- `/` → GAWAD NET (PublicOrder). `manifest.json` name=GAWAD NET, start_url=`/`.
- `/mof30` → Admin login. `manifest-mof30.json` start_url=`/mof30` (separate installable app).

## Latest Delivery (2026-02, iter 16 — GAWAD NET polish + Admin broadcast UI)
### GAWAD NET (`/`)
- Header: Bell moved next to the "GAWAD NET" gold pill at the top (`data-testid="po-bell"`); unread badge counter.
- Welcome card restored to large size (matches pre-login welcome) with `data-testid="po-welcome"`.
- Removed auto-popup "مبروك! لديك حوافز مستحقة" card — access moved to bell notifications only.
- Redesigned **بيانات الحساب** card (`data-testid="po-account-info"`):
  اسم الحساب • رقم الهاتف • تغيير كلمة المرور • نوع الحساب • السقف • الرصيد الحالي • زر «طباعة كشف حساب».
- Balance display uses correct accounting sign without inverting semantics:
  balance > 0 → "X ريال عليه" (red); balance < 0 → "X ريال له" (emerald); 0 → "متعادل".
- Fixed print-statement button: now opens `po-stmt-dialog` with 4 modes: يومي / شهري / سنوي / مخصص → calls `/public/card-order/statement`.

### Admin (`/mof30` → Settings)
- New section **إرسال إشعار** (`data-testid="broadcast-card"`) — visible only to users with `settings` permission.
  Fields: عنوان الإشعار, نص الإشعار, المستلمون (جميع الحسابات / حساب-حسابات محددة with search + checkboxes),
  زر «إرسال الإشعار» → `POST /notifications/broadcast`.
- New **سجل الإشعارات المرسلة** grouped by `group_id` → `GET /notifications/broadcast-log`.
  Shows title, message, sender, timestamp, total recipients, read count, unread count. Read state is per-customer.
- Duplicate-prevention: each notification has a unique `id`; broadcast creates one doc per recipient in a single transaction; mark-read is per (notif_id, customer_id).

### Defaults
- `CustomerIn.credit_limit` default → **500** (backend + `Customers.jsx` form + `Notifications.jsx` approve form).
  Existing customers untouched.

### WhatsApp message unification
- `AccountDetail.jsx` (شاشة الحسابات) now uses `buildReceiptMessage()` from `lib/utils.js` — identical to Receipts screen (شاشة السندات). Same format, ordering, amounts, account name, receipt number, date, type.

## Previous Delivery (iter 15) — kept
- تحويل لمشترك (POS commission 10%, recipient gets full).
- Cumulative incentives with baseline reset per category on redeem.
- Special prices exclude from incentives.
- Bank accounts (visibility toggle in invoices/receipts/payment-requests/over-limit).
- Cascade-safe deletion with audit log.
- Unified UTC+03 daily reporting.

## Auth
- Admins exempt from device-binding. Customers device-bound (5 failed = block).

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions, incl. `settings`)
- Test customer: 771234567 / 1234 (balance=250, limit=500)

## Backlog
- P1: Refactor server.py (~4200 lines) into `routers/`.
- P2: WebAuthn/Passkey login.
- P2: MongoDB Atlas migration (BLOCKED on IP whitelist).
