import { useCallback, useRef, useState } from "react";
import { useAuthentication } from "../presentation/hooks/use_authentication";
import { useAutoRefresh } from "../presentation/hooks/use_auto_refresh";
import { Navigation, type ActivePage } from "../presentation/components/navigation";
import { DashboardPage } from "../presentation/pages/dashboard_page";
import { ContributorsPage } from "../presentation/pages/contributors_page";
import { LoginPage } from "../presentation/pages/login_page";
import {
  createContributorRepository,
  createRepositoryRepository,
  createSonarCloudRepository,
} from "./factories/repository_factory";
import {
  createAuthenticationService,
  createContributorService,
  createDashboardService,
} from "./factories/service_factory";

const authService = createAuthenticationService();
const repositoryRepository = createRepositoryRepository();
const contributorRepository = createContributorRepository();
const sonarCloudRepository = createSonarCloudRepository();
const dashboardService = createDashboardService(repositoryRepository);
const contributorService = createContributorService(contributorRepository, sonarCloudRepository);

export const App = () => {
  const { token, username, isAuthenticated, login, logout } = useAuthentication(authService);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [lastFetchedAt] = useState<Date | null>(null);
  const [isLoading] = useState(false);
  const dashboardRefetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleRefresh = useCallback(() => {
    dashboardRefetchRef.current?.();
  }, []);

  const { interval, setInterval } = useAutoRefresh(handleRefresh);

  if (!isAuthenticated || !token || !username) {
    return <LoginPage onLogin={login} error={null} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Navigation
          activePage={activePage}
          username={username}
          lastFetchedAt={lastFetchedAt}
          refreshInterval={interval}
          isLoading={isLoading}
          onPageChange={setActivePage}
          onRefresh={handleRefresh}
          onIntervalChange={setInterval}
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
