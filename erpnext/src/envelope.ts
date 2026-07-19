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
  const env = payload as Partial<ApiEnvelope<T>>;
  if (typeof env.success !== "boolean") {
    throw new Error("Invalid API envelope");
  }
  if (!env.success) {
    throw new Error(env.error?.message || "Request failed");
  }
  return {
    success: true,
    data: (env.data ?? null) as T,
    meta: env.meta ?? {},
    error: null,
    request_id: env.request_id ?? "",
  };
}
