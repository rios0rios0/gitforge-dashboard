import { useCallback, useMemo, useState } from "react";
import type { AuthenticationService } from "../../domain/services/authentication_service";

export interface UseAuthenticationResult {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthentication = (authService: AuthenticationService): UseAuthenticationResult => {
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [username, setUsername] = useState<string | null>(() => authService.getUsername());

  const login = useCallback(
    (newToken: string, newUsername: string) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      setToken(newToken);
      setUsername(newUsername);
    },
    [authService],
  );

  const logout = useCallback(() => {
    authService.clearToken();
    setToken(null);
    setUsername(null);
  }, [authService]);

  const isAuthenticated = useMemo(() => token !== null && username !== null, [token, username]);

  return { token, username, isAuthenticated, login, logout };
};
