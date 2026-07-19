import { ZatGoApiError } from "./error";

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiErrorBody;
  request_id?: string;
}

export function parseEnvelope<T>(json: unknown): ApiEnvelope<T> {
  if (!json || typeof json !== "object") {
    throw new ZatGoApiError("BAD_RESPONSE", "Unexpected API body");
  }
  return json as ApiEnvelope<T>;
}
