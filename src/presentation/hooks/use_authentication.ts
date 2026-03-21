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
  updateVcsCredentials: (token: string, username: string, platform: Platform) => void;
  updateSonarConfig: (sonar: SonarLoginInfo | null) => void;
  updateWakaTimeToken: (token: string | null) => void;
}

const isValidSonarType = (value: string | null): value is SonarType => value === "cloud" || value === "qube";

const isValidPlatform = (value: string | null): value is Platform => value === "github" || value === "azure-devops";

export const useAuthentication = (authService: AuthenticationService): UseAuthenticationResult => {
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [username, setUsername] = useState<string | null>(() => authService.getUsername());
  const [sonarToken, setSonarToken] = useState<string | null>(() => authService.getSonarToken());
  const [sonarType, setSonarType] = useState<SonarType | null>(() => {
    const stored = authService.getSonarType();
    return isValidSonarType(stored) ? stored : null;
  });
  const [sonarUrl, setSonarUrl] = useState<string | null>(() => authService.getSonarUrl());
  const [wakaTimeToken, setWakaTimeToken] = useState<string | null>(() => authService.getWakaTimeToken());
  const [platform, setPlatform] = useState<Platform | null>(() => {
    const stored = authService.getPlatform();
    return isValidPlatform(stored) ? stored : null;
  });

  const login = useCallback(
    (newToken: string, newUsername: string, credentials: LoginCredentials, newPlatform: Platform) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      authService.setPlatform(newPlatform);
      setToken(newToken);
      setUsername(newUsername);
      setPlatform(newPlatform);
      if (credentials.sonar) {
        if (credentials.sonar.url) {
          authService.setSonarUrl(credentials.sonar.url);
        } else {
          authService.clearSonar();
        }
        authService.setSonarToken(credentials.sonar.token);
        authService.setSonarType(credentials.sonar.type);
        setSonarToken(credentials.sonar.token);
        setSonarType(credentials.sonar.type);
        setSonarUrl(credentials.sonar.url ?? null);
      } else {
        authService.clearSonar();
        setSonarToken(null);
        setSonarType(null);
        setSonarUrl(null);
      }
      if (credentials.wakaTimeToken) {
        authService.setWakaTimeToken(credentials.wakaTimeToken);
        setWakaTimeToken(credentials.wakaTimeToken);
      } else {
        authService.clearWakaTimeToken();
        setWakaTimeToken(null);
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

  const updateVcsCredentials = useCallback(
    (newToken: string, newUsername: string, newPlatform: Platform) => {
      authService.setToken(newToken);
      authService.setUsername(newUsername);
      authService.setPlatform(newPlatform);
      setToken(newToken);
      setUsername(newUsername);
      setPlatform(newPlatform);
    },
    [authService],
  );

  const updateSonarConfig = useCallback(
    (sonar: SonarLoginInfo | null) => {
      if (sonar) {
        if (sonar.url) {
          authService.setSonarUrl(sonar.url);
        } else {
          authService.clearSonar();
        }
        authService.setSonarToken(sonar.token);
        authService.setSonarType(sonar.type);
        setSonarToken(sonar.token);
        setSonarType(sonar.type);
        setSonarUrl(sonar.url ?? null);
      } else {
        authService.clearSonar();
        setSonarToken(null);
        setSonarType(null);
        setSonarUrl(null);
      }
    },
    [authService],
  );

  const updateWakaTimeToken = useCallback(
    (newToken: string | null) => {
      if (newToken) {
        authService.setWakaTimeToken(newToken);
        setWakaTimeToken(newToken);
      } else {
        authService.clearWakaTimeToken();
        setWakaTimeToken(null);
      }
    },
    [authService],
  );

  const isAuthenticated = useMemo(() => token !== null && username !== null && platform !== null, [token, username, platform]);

  return {
    token, username, sonarToken, sonarType, sonarUrl, wakaTimeToken, platform,
    isAuthenticated, login, logout, updateVcsCredentials, updateSonarConfig, updateWakaTimeToken,
  };
};
