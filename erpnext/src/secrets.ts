/**
 * Session encryption secret resolution and ERPNext proxy path guards.
 * Safe to import from Electron renderer typecheck (no Node built-ins).
 */

/** Documented development-only placeholder — never use in production. */
export const DEV_SESSION_SECRET_PLACEHOLDER =
  "zatgo-dev-erpnext-session-secret-change-me";

type ProcessLike = {
  env?: Record<string, string | undefined>;
};

function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: ProcessLike }).process;
  return proc?.env?.[name]?.trim() || undefined;
}

export function resolveSessionSecret(): string {
  const fromEnv = readEnv("ERPNEXT_SESSION_SECRET");
  if (fromEnv) {
    if (
      readEnv("NODE_ENV") === "production" &&
      fromEnv === DEV_SESSION_SECRET_PLACEHOLDER
    ) {
      throw new Error(
        "ERPNEXT_SESSION_SECRET must not use the documented development placeholder in production",
      );
    }
    return fromEnv;
  }

  if (readEnv("NODE_ENV") === "production") {
    throw new Error(
      "ERPNEXT_SESSION_SECRET is required in production. Set a long random value (e.g. openssl rand -base64 48).",
    );
  }

  if (readEnv("ALLOW_INSECURE_DEV_SECRETS") === "1") {
    return DEV_SESSION_SECRET_PLACEHOLDER;
  }

  throw new Error(
    "ERPNEXT_SESSION_SECRET is not set. For local development only, set ALLOW_INSECURE_DEV_SECRETS=1 or provide ERPNEXT_SESSION_SECRET (see .env.example).",
  );
}

/**
 * Reject absolute URLs and path traversal in BFF/Electron ERPNext proxies.
 * Paths must be site-relative (e.g. /api/method/...).
 */
export function assertSafeErpnextPath(path: string): string {
  const raw = (path || "").trim();
  if (!raw) {
    throw new Error("path is required");
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("//")) {
    throw new Error("Absolute URLs are not allowed in erpnextRequest path");
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  if (normalized.includes("\\") || normalized.split("/").includes("..")) {
    throw new Error("Path traversal is not allowed in erpnextRequest path");
  }
  return normalized;
}
