import { AuthGate } from "../components/auth_gate";

interface LoginPageProps {
  onLogin: (token: string, username: string) => void;
  error: string | null;
}

export const LoginPage = ({ onLogin, error }: LoginPageProps) => (
  <AuthGate onLogin={onLogin} error={error} />
);
