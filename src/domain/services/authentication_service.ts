export interface AuthenticationService {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  getUsername(): string | null;
  setUsername(username: string): void;
  getSonarToken(): string | null;
  setSonarToken(token: string): void;
  getSonarType(): string | null;
  setSonarType(type: string): void;
  getSonarUrl(): string | null;
  setSonarUrl(url: string): void;
  getPlatform(): string | null;
  setPlatform(platform: string): void;
}
