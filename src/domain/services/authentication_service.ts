export interface AuthenticationService {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  getUsername(): string | null;
  setUsername(username: string): void;
  getSonarToken(): string | null;
  setSonarToken(token: string): void;
}
