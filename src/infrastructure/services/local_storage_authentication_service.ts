import type { AuthenticationService } from "../../domain/services/authentication_service";

const TOKEN_KEY = "gitforge-dashboard:token";
const USERNAME_KEY = "gitforge-dashboard:username";
const SONAR_TOKEN_KEY = "gitforge-dashboard:sonar-token";
const PLATFORM_KEY = "gitforge-dashboard:platform";

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
    this.storage.removeItem(SONAR_TOKEN_KEY);
    this.storage.removeItem(PLATFORM_KEY);
  }

  getUsername(): string | null {
    return this.storage.getItem(USERNAME_KEY);
  }

  setUsername(username: string): void {
    this.storage.setItem(USERNAME_KEY, username);
  }

  getSonarToken(): string | null {
    return this.storage.getItem(SONAR_TOKEN_KEY);
  }

  setSonarToken(token: string): void {
    this.storage.setItem(SONAR_TOKEN_KEY, token);
  }

  getPlatform(): string | null {
    return this.storage.getItem(PLATFORM_KEY);
  }

  setPlatform(platform: string): void {
    this.storage.setItem(PLATFORM_KEY, platform);
  }
}
