import { useCallback, useMemo, useState } from "react";
import type { AuthenticationService } from "../../domain/services/authentication_service";

export interface UseAuthenticationResult {
  token: string | null;
  username: string | null;
  sonarToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, sonarToken: string | null) => void;
  logout: () => void;
}

export const useAuthentication = (authService: AuthenticationService): UseAuthenticationResult => {
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [username, setUsername] = useState<string | null>(() => authService.getUsername());
  const [sonarToken, setSonarToken] = useState<string | null>(() => authService.getSonarToken());

  const login = useCallback(
    (newToken: string, newUsername: string, newSonarToken: string | null) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      setToken(newToken);
      setUsername(newUsername);
      if (newSonarToken) {
        authService.setSonarToken(newSonarToken);
        setSonarToken(newSonarToken);
      }
    },
    [authService],
  );

  const logout = useCallback(() => {
    authService.clearToken();
    setToken(null);
    setUsername(null);
    setSonarToken(null);
  }, [authService]);

  const isAuthenticated = useMemo(() => token !== null && username !== null, [token, username]);

  return { token, username, sonarToken, isAuthenticated, login, logout };
};
