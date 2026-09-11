# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local)
- Timezone: **Asia/Aden (UTC+3)** across ALL filters

## Feb 2026 Big Batch
- **Timezone**: `+03:00` everywhere. Dashboard sales_today uses Yemen date. Daily filters use end-of-day.
- **Login + device binding + 5-fail lockout**: `POST /api/auth/login` accepts `device_id`. Admin endpoints: `/users/{uid}/unlock|reset-attempts|unbind-device`.
- **Notifications split**: separate `UserPlus` bell for `account_request` category with server-persisted `mark-category-read`.
- **Register-request**: name (2+ words) + phone (7-15 digits) + address — all required (frontend + backend).
- **WhatsApp auto-messages** (returned as `whatsapp_url`):
  - Approve register-request → welcome with credentials
  - Reset customer password → change notification
  - Unbind customer device → unbind notification
- **PublicOrder UX**:
  - Landing header: "مرحباً بك — قم بتسجيل الدخول" with gold gradient badge
  - After-login welcome banner: "مرحباً بك / {customer.name}" (`data-testid="po-welcome"`)
  - Send card to another phone: SMS ↔ WhatsApp radio
  - Print statement: **daily / monthly / yearly** picker with Arabic month names + last-10 years
- **Delete endpoints (hard delete + balance/inventory reversal)**:
  - `DELETE /api/sales/{sid}` — reverses customer balance + inventory (cards → available, qty stock)
  - `DELETE /api/purchases/{pid}` — reverses supplier balance + removes inserted cards + qty stock
  - `DELETE /api/receipts/{rid}` — reverses customer/supplier balance based on kind (receipt/payment)
  - Customer/supplier deletes already existed
  - All require `delete_ops` (sales/purchases/receipts) permission
  - All logged in audit_log with Arabic-friendly description
- **Audit log**: `GET /api/audit?start=&end=&q=` + Arabic action/entity translation in UI
- **Route aliases**: `/mof` and `/mof30` both route to login page (so `gawad.cc/mof` works after reverse proxy setup)
- **Admin auto-seed permanently disabled** (Feb 2026): first user created via API is the admin

## API cheatsheet (delta)
- `DELETE /api/sales/{sid}` `/purchases/{pid}` `/receipts/{rid}` — hard delete with reversal
- `GET /api/audit?start=&end=&q=`
- `POST /api/register-requests/{rid}/approve` → `whatsapp_url`, `phone`, `password`
- `POST /api/customers/{cid}/password|unbind-device` → `whatsapp_url`
- `POST /api/notifications/mark-category-read?category=`

## Domain routing (Spaceship reverse proxy)
- `gawad.cc/` → `/order` (public card portal)
- `gawad.cc/mof` → `/login` (staff+admin login)
- Both React routes exist; the reverse-proxy needs to serve the SPA for both paths.

## Blockers / Deferred
- P0: Biometric login (WebAuthn/Passkeys)
- P1: Currency picker inside sales/purchase/receipt forms
- P2: Refactor server.py into `routers/`
