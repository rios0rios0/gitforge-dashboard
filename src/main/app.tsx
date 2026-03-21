import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthenticationService } from "../domain/services/authentication_service";
import { useAuthentication } from "../presentation/hooks/use_authentication";
import { useAutoRefresh } from "../presentation/hooks/use_auto_refresh";
import { useTheme } from "../presentation/hooks/use_theme";
import { Navigation, type ActivePage } from "../presentation/components/navigation";
import { DashboardPage } from "../presentation/pages/dashboard_page";
import { ContributorsPage } from "../presentation/pages/contributors_page";
import { LoginPage } from "../presentation/pages/login_page";
import { SettingsPage } from "../presentation/pages/settings_page";
import {
  createComplianceRepository,
  createContributorRepository,
  createRepositoryRepository,
  createSonarRepository,
  createWakaTimeRepository,
} from "./factories/repository_factory";
import {
  createAuthenticationService,
  createContributorService,
  createDashboardService,
} from "./factories/service_factory";
import type { SonarConfig } from "../infrastructure/repositories/sonar_repository_impl";

export const App = () => {
  const [authService, setAuthService] = useState<AuthenticationService | null>(null);

  useEffect(() => {
    createAuthenticationService().then(setAuthService);
  }, []);

  if (!authService) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Initializing...</p>
      </div>
    );
  }

  return <AppContent authService={authService} />;
};

const AppContent = ({ authService }: { authService: AuthenticationService }) => {
  const {
    token, username, sonarToken, sonarType, sonarUrl, wakaTimeToken, platform,
    isAuthenticated, login, logout, updateVcsCredentials, updateSonarConfig, updateWakaTimeToken,
  } = useAuthentication(authService);

  const sonarConfig = useMemo((): SonarConfig | undefined => {
    if (!sonarToken || !sonarType) return undefined;
    if (sonarType === "cloud") {
      return { type: "cloud", token: sonarToken, baseUrl: "https://sonarcloud.io", organization: username ?? undefined };
    }
    return { type: "qube", token: sonarToken, baseUrl: sonarUrl ?? "" };
  }, [sonarToken, sonarType, sonarUrl, username]);

  const sonarRepo = useMemo(() => createSonarRepository(sonarConfig), [sonarConfig]);
  const wakaTimeRepo = useMemo(() => createWakaTimeRepository(wakaTimeToken ?? undefined), [wakaTimeToken]);

  const complianceRepo = useMemo(() => {
    if (!platform) return null;
    return createComplianceRepository(platform);
  }, [platform]);

  const dashboardService = useMemo(() => {
    if (!platform || !complianceRepo) return null;
    const repoRepo = createRepositoryRepository(platform);
    return createDashboardService(repoRepo, sonarRepo, complianceRepo);
  }, [platform, sonarRepo, complianceRepo]);

  const contributorService = useMemo(() => {
    if (!platform) return null;
    const contribRepo = createContributorRepository(platform);
    return createContributorService(contribRepo, sonarRepo, wakaTimeRepo);
  }, [platform, sonarRepo, wakaTimeRepo]);

  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dashboardRefetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!dashboardRefetchRef.current) {
      return;
    }

    setIsLoading(true);
    try {
      await dashboardRefetchRef.current();
      setLastFetchedAt(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { interval, setInterval } = useAutoRefresh(handleRefresh);
  const { theme, toggleTheme } = useTheme();

  if (!isAuthenticated || !token || !username || !platform || !dashboardService || !contributorService) {
    return <LoginPage onLogin={login} error={null} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Navigation
          activePage={activePage}
          username={username}
          lastFetchedAt={lastFetchedAt}
          refreshInterval={interval}
          isLoading={isLoading}
          theme={theme}
          onPageChange={setActivePage}
          onRefresh={handleRefresh}
          onIntervalChange={setInterval}
          onToggleTheme={toggleTheme}
          onLogout={logout}
        />

        {activePage === "dashboard" && (
          <DashboardPage
            dashboardService={dashboardService}
            token={token}
            username={username}
            onRefetchRef={(refetch) => {
              dashboardRefetchRef.current = refetch;
            }}
          />
        )}

        {activePage === "contributors" && (
          <ContributorsPage
            contributorService={contributorService}
            token={token}
            username={username}
          />
        )}

        {activePage === "settings" && (
          <SettingsPage
            token={token}
            username={username}
            platform={platform}
            sonarToken={sonarToken}
            sonarType={sonarType}
            sonarUrl={sonarUrl}
            wakaTimeToken={wakaTimeToken}
            onUpdateVcs={updateVcsCredentials}
            onUpdateSonar={updateSonarConfig}
            onUpdateWakaTime={updateWakaTimeToken}
          />
        )}
      </div>
    </div>
  );
};
