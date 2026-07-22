/**
 * ERPNext / Frappe session helpers (Node-safe).
 * Usable from Electron main and Next.js route handlers — no React/Electron imports.
 */

import { assertSafeErpnextPath } from "./secrets";

export type ErpnextSession = {
  baseUrl: string;
  user: string;
  fullName: string;
  cookieHeader: string;
  csrfToken: string;
};

export type ErpnextLoginResult =
  | { ok: true; session: ErpnextSession }
  | { ok: false; message: string };

export type ErpnextRequestResult = {
  ok: boolean;
  status: number;
  bodyText: string;
  session: ErpnextSession;
};

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

/** Drop hop-by-hop / credential headers that must come from the sealed session. */
function sanitizeClientHeaders(
  headers?: Record<string, string>,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const blocked = new Set([
    "cookie",
    "authorization",
    "host",
    "origin",
    "referer",
    "x-frappe-csrf-token",
    "x-csrftoken",
  ]);
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (blocked.has(key.toLowerCase())) continue;
    out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function parseSetCookies(headers: Headers): string[] {
  const anyHeaders = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookieHeader(existing: string, setCookies: string[]): string {
  const map = new Map<string, string>();
  for (const part of existing
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    map.set(part.slice(0, eq), part.slice(eq + 1));
  }

  for (const raw of setCookies) {
    const first = raw.split(";")[0] ?? "";
    const eq = first.indexOf("=");
    if (eq === -1) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    const lower = raw.toLowerCase();
    if (!name) continue;
    if (
      value === "" ||
      lower.includes("max-age=0") ||
      lower.includes("expires=thu, 01 jan 1970")
    ) {
      map.delete(name);
    } else {
      map.set(name, value);
    }
  }

  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function cookieValue(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";").map((s) => s.trim())) {
    if (part.startsWith(`${name}=`)) return part.slice(name.length + 1);
  }
  return null;
}

async function siteFetch(
  baseUrl: string,
  path: string,
  init: RequestInit & { cookieHeader?: string; csrfToken?: string } = {},
): Promise<{ res: Response; cookieHeader: string }> {
  const { cookieHeader = "", csrfToken = "", ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");
  if (cookieHeader) headers.set("Cookie", cookieHeader);
  if (csrfToken && rest.method && rest.method !== "GET") {
    headers.set("X-Frappe-CSRF-Token", csrfToken);
  }

  const res = await fetch(`${baseUrl}${path}`, { ...rest, headers });
  const nextCookies = mergeCookieHeader(cookieHeader, parseSetCookies(res.headers));
  return { res, cookieHeader: nextCookies };
}

/** Ping a Frappe site (public). */
export async function erpnextPing(
  baseUrl: string,
): Promise<{ ok: boolean; message: string }> {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) return { ok: false, message: "Site URL is required" };

  try {
    const res = await fetch(`${url}/api/method/ping`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const body = (await res.json()) as { message?: string };
    return {
      ok: true,
      message: body.message === "pong" ? "Connected (pong)" : "Site reachable",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { ok: false, message };
  }
}

export async function erpnextLogin(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
}): Promise<ErpnextLoginResult> {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  if (!baseUrl) return { ok: false, message: "Site URL is required" };
  if (!input.usr.trim() || !input.pwd) {
    return { ok: false, message: "Email and password are required" };
  }

  try {
    const { res, cookieHeader } = await siteFetch(baseUrl, "/api/method/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        usr: input.usr.trim(),
        pwd: input.pwd,
      }).toString(),
    });

    const body = (await res.json().catch(() => ({}))) as {
      message?: string | { message?: string };
      full_name?: string;
      exc?: string;
      _server_messages?: string;
    };

    if (!res.ok) {
      const msg =
        typeof body.message === "string"
          ? body.message
          : body.message && typeof body.message === "object"
            ? body.message.message
            : `Login failed (HTTP ${res.status})`;
      return { ok: false, message: msg || `Login failed (HTTP ${res.status})` };
    }

    const messageText =
      typeof body.message === "string"
        ? body.message
        : body.message && typeof body.message === "object"
          ? body.message.message
          : "";

    if (messageText && /invalid|incorrect|fail/i.test(messageText)) {
      return { ok: false, message: messageText };
    }

    if (!cookieValue(cookieHeader, "sid") || cookieValue(cookieHeader, "sid") === "Guest") {
      return { ok: false, message: messageText || "Login failed — no session cookie" };
    }

    let cookies = cookieHeader;
    let csrfToken = cookieValue(cookies, "csrf_token") ?? "";

    if (!csrfToken) {
      const csrf = await siteFetch(baseUrl, "/api/method/frappe.sessions.get_csrf_token", {
        method: "GET",
        cookieHeader: cookies,
      });
      cookies = csrf.cookieHeader;
      const csrfBody = (await csrf.res.json().catch(() => ({}))) as { message?: string };
      if (typeof csrfBody.message === "string") csrfToken = csrfBody.message;
      csrfToken = csrfToken || cookieValue(cookies, "csrf_token") || "";
    }

    const me = await siteFetch(baseUrl, "/api/method/frappe.auth.get_logged_user", {
      method: "GET",
      cookieHeader: cookies,
      csrfToken,
    });
    cookies = me.cookieHeader;
    const meBody = (await me.res.json().catch(() => ({}))) as { message?: string };
    const user = typeof meBody.message === "string" ? meBody.message : input.usr.trim();

    if (!me.res.ok || !user || user === "Guest") {
      return { ok: false, message: "Logged in but could not resolve user session" };
    }

    return {
      ok: true,
      session: {
        baseUrl,
        user,
        fullName: body.full_name || user,
        cookieHeader: cookies,
        csrfToken,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { ok: false, message };
  }
}

export async function erpnextLogout(session: ErpnextSession): Promise<void> {
  try {
    await siteFetch(session.baseUrl, "/api/method/logout", {
      method: "POST",
      cookieHeader: session.cookieHeader,
      csrfToken: session.csrfToken,
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {
    /* ignore */
  }
}

export async function erpnextRequest(
  session: ErpnextSession,
  input: {
    path: string;
    method?: string;
    body?: string | null;
    headers?: Record<string, string>;
  },
): Promise<ErpnextRequestResult> {
  const path = assertSafeErpnextPath(input.path);
  const safeHeaders = sanitizeClientHeaders(input.headers);
  const { res, cookieHeader } = await siteFetch(session.baseUrl, path, {
    method: input.method ?? "GET",
    cookieHeader: session.cookieHeader,
    csrfToken: session.csrfToken,
    headers: safeHeaders,
    body: input.body ?? undefined,
  });
  const bodyText = await res.text();
  const nextCsrf =
    cookieValue(cookieHeader, "csrf_token") ?? session.csrfToken;
  return {
    ok: res.ok,
    status: res.status,
    bodyText,
    session: { ...session, cookieHeader, csrfToken: nextCsrf },
  };
}

/** In-process session holder for Electron main (one user per app process). */
export class ErpnextSessionStore {
  private session: ErpnextSession | null = null;

  get(): ErpnextSession | null {
    return this.session;
  }

  set(session: ErpnextSession | null) {
    this.session = session;
  }

  async login(input: {
    baseUrl: string;
    usr: string;
    pwd: string;
  }): Promise<ErpnextLoginResult> {
    const result = await erpnextLogin(input);
    if (result.ok) this.session = result.session;
    else this.session = null;
    return result;
  }

  async logout(): Promise<void> {
    if (!this.session) return;
    try {
      await erpnextLogout(this.session);
    } finally {
      this.session = null;
    }
  }

  async request(input: {
    path: string;
    method?: string;
    body?: string | null;
    headers?: Record<string, string>;
  }): Promise<{ ok: boolean; status: number; bodyText: string }> {
    if (!this.session) {
      return {
        ok: false,
        status: 401,
        bodyText: JSON.stringify({ message: "Not logged in" }),
      };
    }
    const result = await erpnextRequest(this.session, input);
    this.session = result.session;
    return { ok: result.ok, status: result.status, bodyText: result.bodyText };
  }
}
