import type { Platform } from "../../domain/entities/platform";
import { AuthGate } from "../components/auth_gate";

interface LoginPageProps {
  onLogin: (token: string, username: string, sonarToken: string | null, platform: Platform) => void;
  error: string | null;
}

export const LoginPage = ({ onLogin, error }: LoginPageProps) => (
  <AuthGate onLogin={onLogin} error={error} />
);
