import type { Platform } from "../../domain/entities/platform";
import { AuthGate } from "../components/auth_gate";
import type { LoginCredentials } from "../hooks/use_authentication";

interface LoginPageProps {
  onLogin: (token: string, username: string, credentials: LoginCredentials, platform: Platform) => void;
  error: string | null;
}

export const LoginPage = ({ onLogin, error }: LoginPageProps) => (
  <AuthGate onLogin={onLogin} error={error} />
);
