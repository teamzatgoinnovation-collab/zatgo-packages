# packages/

Shared libraries for all React (Next.js + Electron) apps.

| Package | Name | Role |
|---------|------|------|
| [`ui/`](ui/) | `@zatgo/ui` | shadcn/ui + `AppShellLayout` / `ErpnextLoginCard` |
| [`ts-sdk/`](ts-sdk/) | `@zatgo/sdk` | ERPNext API client + generated method maps |
| [`erpnext/`](erpnext/) | `@zatgo/erpnext` | Session/BFF helpers, `ZatGoApi`, `createCallZatGoApi` |
| [`config/`](config/) | `@zatgo/config` | TS / Tailwind presets (incl. `--app-sidebar*`) |
| [`eslint-config/`](eslint-config/) | `@zatgo/eslint-config` | ESLint baseline |
| [`types/`](types/) | `@zatgo/types` | Shared types |
| [`utils/`](utils/) | `@zatgo/utils` | Helpers |
| [`auth/`](auth/) | `@zatgo/auth` | Auth helpers on SDK |
| [`icons/`](icons/) | `@zatgo/icons` | Lucide + brand icons |

Flutter SDK remains at [`../SharedSDK/dart_sdk`](../SharedSDK/dart_sdk/).
