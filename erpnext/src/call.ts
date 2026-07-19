/** Invoke a Frappe method and unwrap the standard ZatGo API envelope. */

import type { WhitelistArgs, WhitelistMethod } from "./generated/args";
import { unwrapEnvelope, type ApiEnvelope } from "./envelope";

export type ErpnextMethodInvoker = (
  method: string,
  args?: Record<string, unknown>,
) => Promise<unknown>;

/**
 * Shared client helper used by Next.js and Electron apps.
 * Pass the app's existing `erpnextApi` (BFF or Electron IPC).
 */
export async function callZatGoMethod<T = unknown>(
  invoke: ErpnextMethodInvoker,
  method: string,
  args: Record<string, unknown> = {},
): Promise<ApiEnvelope<T>> {
  const message = await invoke(method, args);
  return unwrapEnvelope<T>(message);
}

/**
 * Bind an app's `erpnextApi` invoker once — replaces per-app `call-zatgo-api.ts`.
 *
 * @example
 * export const callZatGoApi = createCallZatGoApi(erpnextApi);
 */
export function createCallZatGoApi(invoke: ErpnextMethodInvoker) {
  return function callZatGoApi<T = unknown>(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<ApiEnvelope<T>> {
    return callZatGoMethod<T>(invoke, method, args);
  };
}

/**
 * Typed whitelist call — method string must be a generated OpenAPI path;
 * args are checked against `WhitelistArgs` (Phase 5 SDK).
 */
export async function callWhitelistMethod<
  M extends WhitelistMethod,
  T = unknown,
>(
  invoke: ErpnextMethodInvoker,
  method: M,
  args: WhitelistArgs[M] = {} as WhitelistArgs[M],
): Promise<ApiEnvelope<T>> {
  return callZatGoMethod<T>(
    invoke,
    method,
    args as Record<string, unknown>,
  );
}
