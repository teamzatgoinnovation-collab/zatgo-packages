import type { AuthCredentials, AuthStore } from "@zatgo/sdk";

export type { AuthCredentials, AuthStore };

/** In-memory auth store for scaffolds / tests. Apps should swap for secure storage. */
export class MemoryAuthStore implements AuthStore {
  private credentials: AuthCredentials | null = null;

  async read(): Promise<AuthCredentials | null> {
    return this.credentials;
  }

  async write(credentials: AuthCredentials): Promise<void> {
    this.credentials = credentials;
  }

  async clear(): Promise<void> {
    this.credentials = null;
  }
}
