import { useCallback, useMemo, useState } from "react";
import type { Platform } from "../../domain/entities/platform";
import type { AuthenticationService } from "../../domain/services/authentication_service";

export type SonarType = "cloud" | "qube";

export interface SonarLoginInfo {
  type: SonarType;
  token: string;
  url?: string;
}

export interface LoginCredentials {
  sonar: SonarLoginInfo | null;
  wakaTimeToken: string | null;
}

export interface UseAuthenticationResult {
  token: string | null;
  username: string | null;
  sonarToken: string | null;
  sonarType: SonarType | null;
  sonarUrl: string | null;
  wakaTimeToken: string | null;
  platform: Platform | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, credentials: LoginCredentials, platform: Platform) => void;
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
  const [wakaTimeToken, setWakaTimeToken] = useState<string | null>(() => authService.getWakaTimeToken());
  const [platform, setPlatform] = useState<Platform | null>(
    () => (authService.getPlatform() as Platform) ?? null,
  );

  const login = useCallback(
    (newToken: string, newUsername: string, credentials: LoginCredentials, newPlatform: Platform) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      authService.setPlatform(newPlatform);
      setToken(newToken);
      setUsername(newUsername);
      setPlatform(newPlatform);
      if (credentials.sonar) {
        authService.setSonarToken(credentials.sonar.token);
        authService.setSonarType(credentials.sonar.type);
        setSonarToken(credentials.sonar.token);
        setSonarType(credentials.sonar.type);
        if (credentials.sonar.url) {
          authService.setSonarUrl(credentials.sonar.url);
          setSonarUrl(credentials.sonar.url);
        }
      }
      if (credentials.wakaTimeToken) {
        authService.setWakaTimeToken(credentials.wakaTimeToken);
        setWakaTimeToken(credentials.wakaTimeToken);
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
    setWakaTimeToken(null);
    setPlatform(null);
  }, [authService]);

  const isAuthenticated = useMemo(() => token !== null && username !== null && platform !== null, [token, username, platform]);

  return { token, username, sonarToken, sonarType, sonarUrl, wakaTimeToken, platform, isAuthenticated, login, logout };
};
