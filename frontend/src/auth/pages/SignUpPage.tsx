import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../../security/roles/roles';
import '../styles/ModernAuth.css';

interface RoleOption {
  label: string;
  role: Role;
}

const SIGNUP_ROLE_OPTIONS: RoleOption[] = [
  { label: 'Employee — Self-Service', role: Role.EMPLOYEE },
  { label: 'Team Lead — Operations', role: Role.TEAM_LEAD },
  { label: 'Manager — Department', role: Role.MANAGER },
  { label: 'HR — People Operations', role: Role.HR },
  { label: 'Admin — System Administrator', role: Role.ADMIN },
];

export const SignUpPage: React.FC = () => {
  const { signup, setSession } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.EMPLOYEE);
  const [mfaChannel, setMfaChannel] = useState<'email' | 'sms'>('email');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms & Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const signupRes: any = await signup({
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        department: 'Operations',
      });

      if (signupRes && (signupRes.token || signupRes.user)) {
        if (signupRes.user && signupRes.token) {
          setSession({ user: signupRes.user, token: signupRes.token });
        }
        const target = ROLE_HOME_PATHS[selectedRole] || '/employee/dashboard';
        navigate(target, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
      <main className="auth-single-card" id="signup-card-main">
        {/* Brand Header */}
        <header className="stackly-brand-header">
          <div className="stackly-logo-icon">
            <svg className="stackly-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C23.18 29 29 23.18 29 16" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M22 8C19.5 5.5 15 5.5 12 8.5C9 11.5 9 16 12.5 19C16 22 23 21 23 26C23 29 19.5 30 16 29" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            <span className="stackly-wordmark">STACKLY</span>
          </div>
          <h1 className="auth-card-title">Create Account</h1>
          <p className="auth-card-subtitle">Register your enterprise workspace credentials</p>
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

        {/* Registration Form */}
        <form onSubmit={handleSignUp} noValidate>
          {/* Full Name */}
          <div className="stackly-form-group">
            <label htmlFor="signup-name-input" className="stackly-label">
              Full Name
            </label>
            <input
              id="signup-name-input"
              type="text"
              className="stackly-input"
              placeholder="e.g. Sarah Connor"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div className="stackly-form-group">
            <label htmlFor="signup-email-input" className="stackly-label">
              Email / Employee ID
            </label>
            <input
              id="signup-email-input"
              type="email"
              className="stackly-input"
              placeholder="name@thestackly.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          {/* Roles Dropdown */}
          <div className="stackly-form-group">
            <label htmlFor="signup-role-select" className="stackly-label">
              Role
            </label>
            <select
              id="signup-role-select"
              className="stackly-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              disabled={isLoading}
            >
              {SIGNUP_ROLE_OPTIONS.map((opt) => (
                <option key={opt.role} value={opt.role}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* MFA Delivery Channel */}
          <div className="stackly-form-group">
            <span className="stackly-label">MFA Delivery Channel</span>
            <div className="stackly-radio-group">
              <label className="stackly-radio-label">
                <input
                  type="radio"
                  name="signupMfaChannel"
                  className="stackly-radio-input"
                  checked={mfaChannel === 'email'}
                  onChange={() => setMfaChannel('email')}
                />
                <span>Email</span>
              </label>
              <label className="stackly-radio-label">
                <input
                  type="radio"
                  name="signupMfaChannel"
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
            <label htmlFor="signup-password-input" className="stackly-label">
              Password
            </label>
            <div className="stackly-password-wrapper">
              <input
                id="signup-password-input"
                type={showPassword ? 'text' : 'password'}
                className="stackly-input"
                placeholder="Enter password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="stackly-form-group">
            <label htmlFor="signup-confirm-password" className="stackly-label">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              className="stackly-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="stackly-options-row">
            <label className="stackly-checkbox-label">
              <input
                type="checkbox"
                className="stackly-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            id="signup-submit-btn"
            className="stackly-primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="stackly-spinner" />
                <span>Registering Account...</span>
              </>
            ) : (
              <span>Create Account</span>
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

        {/* Footer Link to Login */}
        <div className="stackly-card-footer">
          <span>Already have an account?</span>
          <Link to="/login" id="back-to-login-link">
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
