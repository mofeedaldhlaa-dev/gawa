# Jawad Net Wireless ERP - PRD

## Product
Arabic (RTL) full-stack ERP for شبكة جواد نت اللاسلكية. Public window = GAWAD NET.

## Routing & PWA
- `/` → GAWAD NET (PublicOrder). `manifest.json` name=GAWAD NET, start_url=`/`.
- `/mof30` → Admin login. `manifest-mof30.json` start_url=`/mof30` (separate installable app).

## Latest Delivery (2026-02, iter 15)
### GAWAD NET
- Renamed pill from "طلب كرت" → **"GAWAD NET"**.
- Removed incentives icon from data card. Access is now via 🔔 Bell → tap notification.
- Bell icon in header shows unread count from `/public/card-order/notifications`.
- Two operation tabs: **شراء كرت** / **تحويل لمشترك**.

### تحويل لمشترك (public wallet transfer)
- Endpoints: `/public/card-order/transfer/lookup` → returns preview with commission. `/public/card-order/transfer/confirm` with `idempotency_key` → executes.
- **POS commission rule (final):** if sender is POS, commission = 10% of amount, recipient gets FULL amount, sender is debited `amount - commission` (as per user spec). Regular customers: no commission.
- Guards: recipient existence check, self-transfer blocked, credit-limit enforcement, idempotency dedup.

### Incentives — cycle reset
- Field `customers.incentive_baseline: [{category_id, bought_at_redeem, reset_at}]`.
- `_customer_incentive_summary` subtracts baseline from cumulative bought → displays 0 after redeem.
- Only card redemption resets baseline (and after successful record insert).
- Redemption creates an "incentive" notification for the customer.

### Simplified incentive dialog
- Shows only: bought, remaining_for_next. Single button: **استلم كروت**. Credit option removed.

### Notifications
- New collection fields: `customer_id`, `kind` (transfer / incentive / admin_broadcast).
- Public: `POST /public/card-order/notifications` (list + unread) and `.../mark-read`.
- Admin broadcast: `POST /notifications/broadcast` (title, message, recipients or all).
- Log: `GET /notifications/broadcast-log` (grouped by group_id, count + read_count).

### Customer defaults
- `CustomerIn.credit_limit` default → **500** (only for new records; existing untouched).

## Auth
- Admins exempt from device-binding. Customers device-bound (5 failed = block).

## Credentials
- MOFEED / EeFSWtdsFRBmb3p (18 permissions)

## Backlog
- P1: Refactor server.py (~4200 lines).
- P2: WebAuthn/Passkey login.
- P2: Admin UI to send broadcasts (endpoint ready, page TBD).
