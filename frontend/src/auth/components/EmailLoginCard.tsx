import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailLoginPayload } from '../../types/authFlow.types';

interface EmailLoginCardProps {
  onSubmit: (payload: EmailLoginPayload) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  currentEmail?: string;
  onEmailChange?: (newEmail: string) => void;
}

export const EmailLoginCard: React.FC<EmailLoginCardProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onClearError,
  currentEmail = 'employee@thestackly.com',
  onEmailChange,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(currentEmail);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your corporate email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await onSubmit({ email: email.trim(), password });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please verify credentials.';
      setLocalError(msg);
    }
  };

  const handleEmailSave = (newVal: string) => {
    setEmail(newVal);
    if (onEmailChange) onEmailChange(newVal);
    setIsEditingEmail(false);
  };

  const activeError = localError || errorMessage;

  return (
    <article className="auth-card" id="card-email-login">
      {/* Top Badge Header */}
      <div className="card-badge-header">
        <span>Password-Based</span>
        <span>Knowledge Factor</span>
      </div>

      {/* Top Nav Row: Back Arrow + Centered Logo */}
      <div className="card-top-nav">
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

        <div className="brand-logo-container">
          <div className="ms-logo-grid" aria-hidden="true">
            <div className="ms-square-red" />
            <div className="ms-square-green" />
            <div className="ms-square-blue" />
            <div className="ms-square-yellow" />
          </div>
          <span className="brand-wordmark">Microsoft</span>
        </div>
      </div>

      {/* Email Pill Badge (Clickable to switch/edit account) */}
      {!isEditingEmail ? (
        <div
          className="email-pill-badge"
          title="Click to switch account"
          role="button"
          tabIndex={0}
          onClick={() => setIsEditingEmail(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingEmail(true); }}
        >
          <span>{email || 'employee@thestackly.com'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      ) : (
        <div className="input-field-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="edit-email-input" className="overlaid-label">Switch Email</label>
          <input
            id="edit-email-input"
            type="email"
            className="auth-text-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleEmailSave(email)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSave(email); }}
            autoFocus
          />
        </div>
      )}

      {/* Card Heading */}
      <h2 className="card-heading">Enter your password</h2>

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

      {/* Form: Password Input with Overlaid Label & Eye Toggle */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Hidden/accessible Email input for autofill & tests */}
        <div style={{ display: 'none' }}>
          <label htmlFor="login-email-input">Email address</label>
          <input
            id="login-email-input"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (onEmailChange) onEmailChange(e.target.value); }}
            autoComplete="username"
          />
        </div>

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

        <Link to="/forgot-password" className="forgot-password-link">
          Forgot your password?
        </Link>

        {/* Action Button */}
        <div className="card-actions">
          <button
            type="submit"
            className="btn-solid-blue"
            id="btn-email-next"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Next</span>
            )}
          </button>
        </div>
      </form>
    </article>
  );
};

export default EmailLoginCard;
