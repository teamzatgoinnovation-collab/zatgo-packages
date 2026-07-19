# `@zatgo/sdk`

Shared TypeScript SDK for Electron and Next.js. Lives in the pnpm workspace under `packages/ts-sdk`.

Use with TanStack Query in apps — this package handles auth headers, envelope unwrap, and errors.

## Generated API maps (Phase 5)

```ts
import { ZatGoCoreApi, TrackerApi, WhitelistMethods } from "@zatgo/sdk";
```

Regenerate:

```bash
pnpm generate:sdk
# or from this package: pnpm --filter @zatgo/sdk generate
```

See [API_GUIDE](../../Docs/API_GUIDE.md), [API_STRATEGY](../../Docs/Foundation/API_STRATEGY.md), and [FRONTEND_STACK](../../Docs/Foundation/FRONTEND_STACK.md).
