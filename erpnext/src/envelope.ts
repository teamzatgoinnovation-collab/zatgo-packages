/** Standard zatgo_core / custom-app response envelope. */

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  data: T;
  meta: Record<string, unknown>;
  error: ApiErrorBody | null;
  request_id: string;
};

export function unwrapEnvelope<T>(payload: unknown): ApiEnvelope<T> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid API response");
  }
  const raw = payload as Partial<ApiEnvelope<T>> & { ok?: boolean };
  // chat_ai uses `{ ok }` ; zatgo_core uses `{ success }`.
  const success =
    typeof raw.success === "boolean"
      ? raw.success
      : typeof raw.ok === "boolean"
        ? raw.ok
        : undefined;
  if (typeof success !== "boolean") {
    throw new Error("Invalid API envelope");
  }
  if (!success) {
    throw new Error(raw.error?.message || "Request failed");
  }
  return {
    success: true,
    data: (raw.data ?? null) as T,
    meta: raw.meta ?? {},
    error: null,
    request_id: raw.request_id ?? "",
  };
}
