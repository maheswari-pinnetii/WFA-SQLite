import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../../security/roles/roles';
import { EmailLoginCard } from '../components/EmailLoginCard';
import { EmailLoginPayload } from '../../types/authFlow.types';
import { authService } from '../services/auth.service';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import '../styles/ModernAuth.css';

export const LoginPage: React.FC = () => {
  const { login, role, setSession, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Authenticate with email and password, then route to the user's dashboard.
  const [currentEmail, setCurrentEmail] = useState<string>('admin@thestackly.com');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Transition to Dashboard based on authenticated role
   */
  const proceedToDashboard = (targetRole?: Role) => {
    const userRole = targetRole || role || Role.ADMIN;
    const target = ROLE_HOME_PATHS[userRole] || '/admin/dashboard';
    navigate(target, { replace: true });
  };

  // A restored session should never leave the user on the login screen.
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      proceedToDashboard(user.role as Role);
    }
  }, [isAuthenticated, user?.role]);

  /**
   * Handle Standard Email + Password Login (Step 1)
   * Validates credentials with backend, then proceeds to Step 2 Verification
   */
  const handleEmailLogin = async (payload: EmailLoginPayload) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res: any = await login(payload.email, payload.password);

      if (res && (res.error || res.meta?.requestStatus === 'rejected')) {
        const errMsg = typeof res.payload === 'string'
          ? res.payload
          : (res.error?.message || 'Invalid email or password credentials.');
        setErrorMessage(errMsg);
        return;
      }

      const userRole = (res?.payload?.user?.role || res?.user?.role || role || Role.ADMIN) as Role;
      setCurrentEmail(payload.email);
      setErrorMessage(null);
      proceedToDashboard(userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Optional Direct Login bypassing Step 2 if user chooses "Sign in directly"
   */
  const handleDirectLogin = async (payload: EmailLoginPayload) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res: any = await login(payload.email, payload.password);
      if (res && (res.error || res.meta?.requestStatus === 'rejected')) {
        const errMsg = typeof res.payload === 'string'
          ? res.payload
          : (res.error?.message || 'Invalid email or password credentials.');
        setErrorMessage(errMsg);
        return;
      }

      const userRole = (res?.payload?.user?.role || res?.user?.role || role || Role.ADMIN) as Role;
      proceedToDashboard(userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await authService.passkeyLogin(currentEmail || undefined);
      setSession({ user: result.user, token: result.token });
      proceedToDashboard(result.user.role as Role);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Passkey sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Navbar / Navigation Header */}
      <nav style={{ width: '100%', maxWidth: '440px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
        <button type="button" className="auth-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Link to="/multiple-login-methods" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Multiple methods</span> &rarr;
        </Link>
        <Link to="/signup" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Create Account &rarr;
        </Link>
      </nav>

      {/* Main Multi-Step Authentication Container */}
      <main className="auth-single-container" id="auth-flow-main">
        <button
          type="button"
          className="btn-outline-gray"
          onClick={handlePasskeyLogin}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign in with a passkey'}
        </button>
        <EmailLoginCard
          onSubmit={handleEmailLogin}
          onDirectLogin={handleDirectLogin}
          isLoading={loading}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          currentEmail={currentEmail}
          onEmailChange={setCurrentEmail}
          prefilledPassword="StacklyWFA2026!"
        />
      </main>

      {/* Bottom Switch Link */}
      <footer className="auth-page-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Don&apos;t have an enterprise account?{' '}
          <Link to="/signup" id="create-account-link" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
