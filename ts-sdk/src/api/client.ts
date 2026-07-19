import { authHeaders, type AuthStore } from "../auth/auth";
import type { ZatGoConfig } from "../config/config";
import { ZatGoApiError } from "../models/error";
import { parseEnvelope, type ApiEnvelope } from "../models/envelope";

export class ZatGoClient {
  constructor(
    private readonly config: ZatGoConfig,
    private readonly authStore: AuthStore,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async call<T = unknown>(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<ApiEnvelope<T>> {
    const creds = await this.authStore.read();
    const url = `${this.config.baseUrl.replace(/\/$/, "")}/api/method/${method}`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders(creds),
      },
      body: JSON.stringify(args),
    });

    const body = (await res.json()) as { message?: unknown } & Record<string, unknown>;
    const payload = body.message && typeof body.message === "object" ? body.message : body;
    const envelope = parseEnvelope<T>(payload);

    if (!envelope.success) {
      throw new ZatGoApiError(
        envelope.error?.code ?? "REQUEST_FAILED",
        envelope.error?.message ?? "Request failed",
        envelope.error?.details,
        envelope.request_id,
      );
    }
    return envelope;
  }
}
