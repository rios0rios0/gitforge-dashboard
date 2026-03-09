import { useAuthentication } from "../presentation/hooks/use_authentication";
import { DashboardPage } from "../presentation/pages/dashboard_page";
import { LoginPage } from "../presentation/pages/login_page";
import { createRepositoryRepository } from "./factories/repository_factory";
import { createAuthenticationService, createDashboardService } from "./factories/service_factory";

const authService = createAuthenticationService();
const repositoryRepository = createRepositoryRepository();
const dashboardService = createDashboardService(repositoryRepository);

export const App = () => {
  const { token, username, isAuthenticated, login, logout } = useAuthentication(authService);

  if (!isAuthenticated || !token || !username) {
    return <LoginPage onLogin={login} error={null} />;
  }

  return (
    <DashboardPage
      dashboardService={dashboardService}
      token={token}
      username={username}
      onLogout={logout}
    />
  );
};
