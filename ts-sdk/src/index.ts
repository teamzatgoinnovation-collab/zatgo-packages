export type { ZatGoConfig } from "./config/config";
export type { AuthCredentials, AuthStore } from "./auth/auth";
export { authHeaders } from "./auth/auth";
export type { ApiEnvelope, ApiErrorBody } from "./models/envelope";
export { parseEnvelope } from "./models/envelope";
export { ZatGoApiError } from "./models/error";
export { ZatGoClient } from "./api/client";
export { can } from "./permissions/permissions";
export { NotificationBridge } from "./notifications/notifications";
export { FileUploader } from "./upload/upload";
export { RealtimeClient } from "./realtime/realtime";

/** Generated from OpenAPI whitelist (Phase 5). */
export {
  TrackerApi,
  WhitelistMethods,
  ZatGoCoreApi,
  type WhitelistMethodName,
} from "./generated/methods";
export type { WhitelistArgs, WhitelistMethod } from "./generated/args";
