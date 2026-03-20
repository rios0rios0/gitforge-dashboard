import { useCallback, useMemo, useState } from "react";
import type { Platform } from "../../domain/entities/platform";
import type { AuthenticationService } from "../../domain/services/authentication_service";

export type SonarType = "cloud" | "qube";

export interface SonarLoginInfo {
  type: SonarType;
  token: string;
  url?: string;
}

export interface UseAuthenticationResult {
  token: string | null;
  username: string | null;
  sonarToken: string | null;
  sonarType: SonarType | null;
  sonarUrl: string | null;
  platform: Platform | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, sonar: SonarLoginInfo | null, platform: Platform) => void;
  logout: () => void;
}

export const useAuthentication = (authService: AuthenticationService): UseAuthenticationResult => {
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [username, setUsername] = useState<string | null>(() => authService.getUsername());
  const [sonarToken, setSonarToken] = useState<string | null>(() => authService.getSonarToken());
  const [sonarType, setSonarType] = useState<SonarType | null>(
    () => (authService.getSonarType() as SonarType) ?? null,
  );
  const [sonarUrl, setSonarUrl] = useState<string | null>(() => authService.getSonarUrl());
  const [platform, setPlatform] = useState<Platform | null>(
    () => (authService.getPlatform() as Platform) ?? null,
  );

  const login = useCallback(
    (newToken: string, newUsername: string, sonar: SonarLoginInfo | null, newPlatform: Platform) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      authService.setPlatform(newPlatform);
      setToken(newToken);
      setUsername(newUsername);
      setPlatform(newPlatform);
      if (sonar) {
        authService.setSonarToken(sonar.token);
        authService.setSonarType(sonar.type);
        setSonarToken(sonar.token);
        setSonarType(sonar.type);
        if (sonar.url) {
          authService.setSonarUrl(sonar.url);
          setSonarUrl(sonar.url);
        }
      }
    },
    [authService],
  );

  const logout = useCallback(() => {
    authService.clearToken();
    setToken(null);
    setUsername(null);
    setSonarToken(null);
    setSonarType(null);
    setSonarUrl(null);
    setPlatform(null);
  }, [authService]);

  const isAuthenticated = useMemo(() => token !== null && username !== null && platform !== null, [token, username, platform]);

  return { token, username, sonarToken, sonarType, sonarUrl, platform, isAuthenticated, login, logout };
};
