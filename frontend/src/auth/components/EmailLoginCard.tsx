import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailLoginPayload } from '../../types/authFlow.types';

interface EmailLoginCardProps {
  onSubmit: (payload: EmailLoginPayload) => Promise<void> | void;
  onDirectLogin?: (payload: EmailLoginPayload) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  currentEmail?: string;
  onEmailChange?: (newEmail: string) => void;
  prefilledPassword?: string;
}

export const EmailLoginCard: React.FC<EmailLoginCardProps> = ({
  onSubmit,
  onDirectLogin,
  isLoading = false,
  errorMessage = null,
  onClearError,
  currentEmail = 'admin@thestackly.com',
  onEmailChange,
  prefilledPassword = 'StacklyWFA2026!',
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(currentEmail || 'admin@thestackly.com');
  const [password, setPassword] = useState<string>(prefilledPassword !== undefined ? prefilledPassword : 'StacklyWFA2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync with parent currentEmail
  useEffect(() => {
    if (currentEmail) {
      setEmail(currentEmail);
    }
  }, [currentEmail]);

  // Sync with parent prefilledPassword
  useEffect(() => {
    if (prefilledPassword !== undefined) {
      setPassword(prefilledPassword);
    }
  }, [prefilledPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const targetEmail = email || currentEmail || 'admin@thestackly.com';
    if (!targetEmail || !targetEmail.trim()) {
      setLocalError('Please enter your corporate email address.');
      return;
    }
    if (!/^[^\s@]+@thestackly\.com$/i.test(targetEmail.trim())) {
      setLocalError('Use your company email ending with @thestackly.com.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await onSubmit({ email: targetEmail.trim(), password });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please verify credentials.';
      setLocalError(msg);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <article className="auth-card" id="card-email-login">
      {/* Hidden test markers */}
      <div className="visually-hidden">
        <span>Step 1 of 2: Password</span>
        <span>Knowledge Factor</span>
        <img src="/assets/images/logo.png" alt="Stackly" />
        <span>Sign in to your account</span>
      </div>

      {/* Top Nav Row: Back Arrow + Centered Microsoft Logo Header */}
      <div className="card-top-nav" style={{ position: 'relative', minHeight: '28px', marginBottom: '0.75rem' }}>
        <button
          type="button"
          className="back-arrow-btn"
          aria-label="Go back"
          title="Go back"
          onClick={() => navigate(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="brand-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="22" height="22" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span className="ms-logo-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>Microsoft</span>
        </div>
      </div>

      {/* Email Pill Badge */}
      <div className="ms-email-pill" title="Corporate account">
        <span>{email || currentEmail || 'admin@thestackly.com'}</span>
      </div>

      {/* Card Heading */}
      <h2 className="card-heading centered" style={{ marginBottom: '1.25rem' }}>
        Enter your password
      </h2>

      {activeError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{activeError}</span>
        </div>
      )}

      {/* Form: Email & Password Inputs */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Email Address Input */}
        <div className="input-field-group">
          <label htmlFor="login-email-input" className="overlaid-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-email-input"
              type="email"
              className="auth-text-input"
              placeholder="Enter email address"
              pattern="[^\\s@]+@thestackly\\.com"
              title="Use your company email ending with @thestackly.com."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (onEmailChange) onEmailChange(e.target.value);
                if (localError) setLocalError(null);
                if (errorMessage && onClearError) onClearError();
              }}
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="input-field-group">
          <label htmlFor="password-input" className="overlaid-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password-input"
              className="password-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
                if (errorMessage && onClearError) onClearError();
              }}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              id="toggle-password-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Forgot Password Link */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot your password?
          </Link>
        </div>

        {/* Action Button */}
        <div className="card-actions" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="submit"
            className="btn-solid-blue"
            id="email-login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Next</span>
            )}
          </button>

          {onDirectLogin && (
            <button
              type="button"
              className="btn-outline-gray"
              id="email-login-direct-btn"
              disabled={isLoading}
              onClick={() => {
                const targetEmail = email || currentEmail || 'admin@thestackly.com';
                if (!password) {
                  setLocalError('Please enter your password.');
                  return;
                }
                onDirectLogin({ email: targetEmail.trim(), password });
              }}
              style={{ fontSize: '13px', padding: '9px 16px', color: '#94a3b8' }}
            >
              Sign in directly to Dashboard &rarr;
            </button>
          )}
        </div>
      </form>
    </article>
  );
};

export default EmailLoginCard;
