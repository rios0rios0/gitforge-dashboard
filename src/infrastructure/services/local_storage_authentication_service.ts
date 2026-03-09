import type { AuthenticationService } from "../../domain/services/authentication_service";

const TOKEN_KEY = "gitforge-dashboard:token";
const USERNAME_KEY = "gitforge-dashboard:username";

export class LocalStorageAuthenticationService implements AuthenticationService {
  private readonly storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    this.storage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    this.storage.removeItem(TOKEN_KEY);
    this.storage.removeItem(USERNAME_KEY);
  }

  getUsername(): string | null {
    return this.storage.getItem(USERNAME_KEY);
  }

  setUsername(username: string): void {
    this.storage.setItem(USERNAME_KEY, username);
  }
}
