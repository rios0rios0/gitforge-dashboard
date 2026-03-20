import { useCallback, useMemo, useState } from "react";
import type { Platform } from "../../domain/entities/platform";
import type { AuthenticationService } from "../../domain/services/authentication_service";

export interface UseAuthenticationResult {
  token: string | null;
  username: string | null;
  sonarToken: string | null;
  platform: Platform | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, sonarToken: string | null, platform: Platform) => void;
  logout: () => void;
}

export const useAuthentication = (authService: AuthenticationService): UseAuthenticationResult => {
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [username, setUsername] = useState<string | null>(() => authService.getUsername());
  const [sonarToken, setSonarToken] = useState<string | null>(() => authService.getSonarToken());
  const [platform, setPlatform] = useState<Platform | null>(
    () => (authService.getPlatform() as Platform) ?? null,
  );

  const login = useCallback(
    (newToken: string, newUsername: string, newSonarToken: string | null, newPlatform: Platform) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      authService.setPlatform(newPlatform);
      setToken(newToken);
      setUsername(newUsername);
      setPlatform(newPlatform);
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
    setPlatform(null);
  }, [authService]);

  const isAuthenticated = useMemo(() => token !== null && username !== null && platform !== null, [token, username, platform]);

  return { token, username, sonarToken, platform, isAuthenticated, login, logout };
};
