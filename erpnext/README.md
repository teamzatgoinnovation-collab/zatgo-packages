# `@zatgo/erpnext`

Node-safe Frappe / ERPNext session helpers for Electron main and Next.js BFF route handlers.

## API

- `erpnextLogin({ baseUrl, usr, pwd })` — password login → session (`sid` + CSRF)
- `erpnextLogout(session)`
- `erpnextRequest(session, { path, method, body, headers })`
- `erpnextPing(baseUrl)` — public ping
- `ErpnextSessionStore` — in-process holder for Electron main

No React or Electron imports.

## Consumers

- Electron: `zatgo-pos`, `admin-console-desktop`, `report-studio-desktop`
- Next.js BFF: `admin-portal` (`/api/erpnext/*`)
