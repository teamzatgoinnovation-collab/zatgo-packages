export interface AuthCredentials {
  apiKey?: string;
  apiSecret?: string;
  token?: string;
}

export interface AuthStore {
  read(): Promise<AuthCredentials | null>;
  write(credentials: AuthCredentials): Promise<void>;
  clear(): Promise<void>;
}

export function authHeaders(creds: AuthCredentials | null): Record<string, string> {
  if (!creds) return {};
  if (creds.token) return { Authorization: `token ${creds.token}` };
  if (creds.apiKey && creds.apiSecret) {
    return { Authorization: `token ${creds.apiKey}:${creds.apiSecret}` };
  }
  return {};
}
