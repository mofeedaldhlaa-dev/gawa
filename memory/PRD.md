# Jawad Net Wireless — ERP (Arabic RTL)

## Stack
- Frontend: React + TailwindCSS + Shadcn UI (RTL)
- Backend: FastAPI + Motor (async MongoDB)
- Database: MongoDB (local)
- Object Storage: Emergent Object Storage
- Email: Emergent-managed Resend
- Scheduler: Emergent platform crons
- Timezone: Asia/Aden (UTC+3) — used for all date-range filters

## Implemented (recent — Feb 2026)
- **Daily reports timezone fix**: All server-side date filters now use `+03:00` (Yemen) offset. Client daily period end changed to end-of-day (23:59:59.999). Operations at 00:00 count in the new day.
- **User login: device binding + 5-fail lockout**:
  - `LoginIn` accepts `device_id`. First success binds; later logins from different device → HTTP 403.
  - 5 wrong passwords → account locked (HTTP 423) with clear Arabic message.
  - Successful login resets `failed_attempts` and `locked_until`.
  - New admin endpoints (require `users` perm):
    - `POST /api/users/{uid}/unlock`
    - `POST /api/users/{uid}/reset-attempts`
    - `POST /api/users/{uid}/unbind-device`
  - Users list UI shows failed_attempts, bound_device, locked status + action buttons.
- **Separate notifications icon for account requests**:
  - New `UserPlus` amber bell next to system bell in header.
  - Notification `category` field: `account_request`, `user_lock`, `general`/none.
  - New endpoint `POST /api/notifications/mark-category-read?category=account_request` (server-persisted).
  - Notifications page has 3 tabs (all/requests/general) and auto-marks on view.
- **Register-request full validation (frontend + backend)**:
  - `full_name` (≥2 words), `phone` (7-15 digits), `address` — all required.
  - Frontend: asterisks + inline error toasts.
  - Backend: pydantic-required fields + additional Arabic error messages.

## API cheatsheet (delta)
- `POST /api/auth/login` — body includes optional `device_id`
- `POST /api/users/{uid}/unlock` — clears failed_attempts + locked_until
- `POST /api/users/{uid}/reset-attempts`
- `POST /api/users/{uid}/unbind-device`
- `POST /api/notifications/mark-category-read?category=...` — bulk mark read
- `GET /api/notifications` — returns `category` on each item

## Blockers / Deferred
- P0: Biometric login (WebAuthn/Passkeys) — user still wants this
- P1: Currency picker inside sales/purchase/receipt forms (backend ready)
- P2: Refactor server.py into `routers/`
