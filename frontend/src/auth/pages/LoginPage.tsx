import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../../security/roles/roles';
import '../styles/ModernAuth.css';

interface RoleOption {
  label: string;
  email: string;
  role: Role;
}

const ROLE_OPTIONS: RoleOption[] = [
  { label: 'Admin — Sarah Connor', email: 'admin@thestackly.com', role: Role.ADMIN },
  { label: 'HR — Marcus Vance', email: 'hr@thestackly.com', role: Role.HR },
  { label: 'Manager — Elena Rostova', email: 'manager@thestackly.com', role: Role.MANAGER },
  { label: 'Team Lead — David Kim', email: 'lead@thestackly.com', role: Role.TEAM_LEAD },
  { label: 'Employee — Alex Morgan', email: 'employee@thestackly.com', role: Role.EMPLOYEE },
];

export const LoginPage: React.FC = () => {
  const { login, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [email, setEmail] = useState<string>(ROLE_OPTIONS[0].email);
  const [password, setPassword] = useState<string>('StacklyWFA2026!');
  const [mfaChannel, setMfaChannel] = useState<'email' | 'sms'>('email');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // If already authenticated, redirect to role home
  React.useEffect(() => {
    if (isAuthenticated) {
      const target = ROLE_HOME_PATHS[role] || '/employee/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedRoleIndex(idx);
    setEmail(ROLE_OPTIONS[idx].email);
    setPassword('StacklyWFA2026!');
    setErrorMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email or Employee ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res: any = await login(email.trim(), password);

      if (res && res.error) {
        throw new Error(res.payload || res.error.message || 'Invalid email or password.');
      }

      const userRole = (res?.payload?.user?.role || res?.user?.role || role || Role.EMPLOYEE) as Role;
      const target = ROLE_HOME_PATHS[userRole] || '/employee/dashboard';
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="auth-page-wrapper">
      <main className="auth-single-card" id="login-card-main">
        {/* Brand Header */}
        <header className="stackly-brand-header">
          <div className="stackly-logo-icon">
            <svg className="stackly-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C23.18 29 29 23.18 29 16" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M22 8C19.5 5.5 15 5.5 12 8.5C9 11.5 9 16 12.5 19C16 22 23 21 23 26C23 29 19.5 30 16 29" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            <span className="stackly-wordmark">STACKLY</span>
          </div>
          <h1 className="auth-card-title">Welcome Back</h1>
          <p className="auth-card-subtitle">Sign in to access your dashboard</p>
        </header>

        {/* Error Alert */}
        {errorMessage && (
          <div className="stackly-alert stackly-alert-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} noValidate>
          {/* Roles Dropdown */}
          <div className="stackly-form-group">
            <label htmlFor="role-select" className="stackly-label">
              Roles
            </label>
            <select
              id="role-select"
              className="stackly-select"
              value={selectedRoleIndex}
              onChange={handleRoleChange}
              disabled={isLoading}
            >
              {ROLE_OPTIONS.map((opt, i) => (
                <option key={opt.email} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email / Employee ID */}
          <div className="stackly-form-group">
            <label htmlFor="email-input" className="stackly-label">
              Email / Employee ID
            </label>
            <input
              id="email-input"
              type="text"
              className="stackly-input"
              placeholder="admin@thestackly.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          {/* MFA Delivery Channel */}
          <div className="stackly-form-group">
            <span className="stackly-label">MFA Delivery Channel</span>
            <div className="stackly-radio-group">
              <label className="stackly-radio-label">
                <input
                  type="radio"
                  name="mfaChannel"
                  className="stackly-radio-input"
                  checked={mfaChannel === 'email'}
                  onChange={() => setMfaChannel('email')}
                />
                <span>Email</span>
              </label>
              <label className="stackly-radio-label">
                <input
                  type="radio"
                  name="mfaChannel"
                  className="stackly-radio-input"
                  checked={mfaChannel === 'sms'}
                  onChange={() => setMfaChannel('sms')}
                />
                <span>SMS</span>
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="stackly-form-group">
            <label htmlFor="password-input" className="stackly-label">
              Password
            </label>
            <div className="stackly-password-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="stackly-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="stackly-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="stackly-options-row">
            <label className="stackly-checkbox-label">
              <input
                type="checkbox"
                className="stackly-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="stackly-forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            id="login-submit-btn"
            className="stackly-primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="stackly-spinner" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Card Sub-Meta: Privacy, Terms, Theme */}
        <div className="stackly-card-meta">
          <div className="stackly-meta-links">
            <Link to="/privacy" className="stackly-meta-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="stackly-meta-link">
              Terms
            </Link>
          </div>

          <button type="button" className="stackly-theme-pill" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Footer Link to Sign Up */}
        <div className="stackly-card-footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/signup" id="create-account-link">
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
