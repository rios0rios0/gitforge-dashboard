import { useCallback, useMemo, useRef, useState } from "react";
import { useAuthentication } from "../presentation/hooks/use_authentication";
import { useAutoRefresh } from "../presentation/hooks/use_auto_refresh";
import { useTheme } from "../presentation/hooks/use_theme";
import { Navigation, type ActivePage } from "../presentation/components/navigation";
import { DashboardPage } from "../presentation/pages/dashboard_page";
import { ContributorsPage } from "../presentation/pages/contributors_page";
import { LoginPage } from "../presentation/pages/login_page";
import {
  createContributorRepository,
  createRepositoryRepository,
  createSonarRepository,
} from "./factories/repository_factory";
import {
  createAuthenticationService,
  createContributorService,
  createDashboardService,
} from "./factories/service_factory";
import type { SonarConfig } from "../infrastructure/repositories/sonar_repository_impl";

const authService = createAuthenticationService();

export const App = () => {
  const { token, username, sonarToken, sonarType, sonarUrl, platform, isAuthenticated, login, logout } =
    useAuthentication(authService);

  const sonarConfig = useMemo((): SonarConfig | undefined => {
    if (!sonarToken || !sonarType) return undefined;
    if (sonarType === "cloud") {
      return { type: "cloud", token: sonarToken, baseUrl: "https://sonarcloud.io", organization: username ?? undefined };
    }
    return { type: "qube", token: sonarToken, baseUrl: sonarUrl ?? "" };
  }, [sonarToken, sonarType, sonarUrl, username]);

  const sonarRepo = useMemo(() => createSonarRepository(sonarConfig), [sonarConfig]);

  const dashboardService = useMemo(() => {
    if (!platform) return null;
    const repoRepo = createRepositoryRepository(platform);
    return createDashboardService(repoRepo, sonarRepo);
  }, [platform, sonarRepo]);

  const contributorService = useMemo(() => {
    if (!platform) return null;
    const contribRepo = createContributorRepository(platform);
    return createContributorService(contribRepo, sonarRepo);
  }, [platform, sonarRepo]);

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
      </div>
    </div>
  );
};
