/**
 * Node-only AES key material for Next.js BFF session cookies.
 * Do not import from Electron renderer bundles.
 */

import { createHash } from "node:crypto";
import { resolveSessionSecret } from "./secrets";

/** SHA-256 digests of the secret for AES-256 key material. */
export function sessionSecretKey(): Buffer {
  return createHash("sha256").update(resolveSessionSecret()).digest();
}
