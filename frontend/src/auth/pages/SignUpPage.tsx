import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthMethod, SignUpFormValues } from '../../types/authFlow.types';
import '../styles/ModernAuth.css';

export const SignUpPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Validate Form Fields
   */
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (authMethod === 'password') {
      if (!password || password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  /**
   * Handle Passkey Creation via WebAuthn API
   */
  const handlePasskeyRegistration = async (userEmail: string, userName: string) => {
    if (!window.PublicKeyCredential) {
      throw new Error('Passkey creation is not supported on this device/browser.');
    }

    // 1. Fetch WebAuthn registration options from security server
    const optionsRes = await fetch('/api/auth/passkey/register-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, fullName: userName }),
    });

    if (!optionsRes.ok) {
      throw new Error('Failed to retrieve registration challenge from security server.');
    }

    const { options } = await optionsRes.json();

    // Convert binary fields
    const challengeBuffer = Uint8Array.from(atob(options.challenge), (c) => c.charCodeAt(0));
    const userIdBuffer = new TextEncoder().encode(options.user.id);

    // 2. Trigger browser passkey creation modal
    const credential = (await navigator.credentials.create({
      publicKey: {
        ...options,
        challenge: challengeBuffer,
        user: {
          ...options.user,
          id: userIdBuffer,
        },
      },
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Passkey generation was cancelled.');
    }

    // 3. Send attestation response to server
    const attestationResponse = {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: credential.type,
      response: {
        clientDataJSON: btoa(
          String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON))
        ),
        attestationObject: btoa(
          String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject))
        ),
      },
    };

    const verifyRes = await fetch('/api/auth/passkey/register-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        fullName: userName,
        attestationResponse,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      throw new Error(verifyData.error || 'Failed to verify passkey on server.');
    }

    return verifyData;
  };

  /**
   * Main Form Submission Handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (authMethod === 'password') {
        // Standard Registration
        await signup({
          name: fullName.trim(),
          email: email.trim(),
          password,
        });

        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Passwordless Passkey Registration
        await handlePasskeyRegistration(email.trim(), fullName.trim());
        setSuccessMessage('Passkey registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Navbar / Navigation Header */}
      <nav style={{ width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
          <span>&larr;</span> Back to Home
        </Link>
        <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Sign In &rarr;
        </Link>
      </nav>

      {/* Brand Header */}
      <header className="auth-page-header">
        <div className="auth-brand-badge">Create Account</div>
        <h1 className="auth-main-title">Get started with Stackly</h1>
        <p className="auth-main-subtitle">
          Join our enterprise workspace. Choose how you want to secure your account.
        </p>
      </header>

      {/* Unified Registration Card */}
      <main className="auth-single-container">
        <div className="auth-card" id="signup-main-card">
          <div className="auth-card-header">
            <span>New Registration</span>
            <span style={{ color: authMethod === 'passkey' ? '#10b981' : '#00a4ef' }}>
              {authMethod === 'passkey' ? 'Passwordless' : 'Password'}
            </span>
          </div>

          <div className="brand-logo-container">
            <div className="brand-logo-grid" aria-hidden="true">
              <div className="logo-sq-red"></div>
              <div className="logo-sq-green"></div>
              <div className="logo-sq-blue"></div>
              <div className="logo-sq-yellow"></div>
            </div>
            <span className="brand-wordmark">Stackly Workforce Identity</span>
          </div>

          <h2 className="auth-card-heading">Register Your Account</h2>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="auth-alert auth-alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert auth-alert-success" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="input-field-group">
              <label htmlFor="signup-name-input" className="overlaid-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="signup-name-input"
                  type="text"
                  className="auth-text-input"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="input-field-group">
              <label htmlFor="signup-email-input" className="overlaid-label">
                Work Email
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="signup-email-input"
                  type="email"
                  className="auth-text-input"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Authentication Method Toggle Tabs */}
            <div className="method-toggle-container" role="tablist" aria-label="Security Method Selection">
              <button
                type="button"
                role="tab"
                aria-selected={authMethod === 'password'}
                className={`method-toggle-btn ${authMethod === 'password' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMethod('password');
                  setErrorMessage(null);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Set a Password</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={authMethod === 'passkey'}
                className={`method-toggle-btn ${authMethod === 'passkey' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMethod('passkey');
                  setErrorMessage(null);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-7.07 17.07l2.83-2.83a6 6 0 1 1 8.48 0l2.83 2.83A10 10 0 0 0 12 2z" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <span>Setup Passkey</span>
              </button>
            </div>

            {/* Method Option A: Password Fields */}
            {authMethod === 'password' && (
              <div id="password-setup-section">
                {/* Password Input */}
                <div className="input-field-group">
                  <label htmlFor="signup-password-input" className="overlaid-label">
                    Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="signup-password-input"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input with-toggle"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="input-field-group">
                  <label htmlFor="signup-confirm-password" className="overlaid-label">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method Option B: Passkey Highlight Box */}
            {authMethod === 'passkey' && (
              <div className="passkey-promo-box" id="passkey-setup-section">
                <div className="passkey-promo-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Fast & Phishing-Resistant</span>
                </div>
                <p className="passkey-promo-desc">
                  When you click &ldquo;Create Account with Passkey&rdquo;, your browser will prompt you to create a secure credential using Touch ID, Face ID, Windows Hello, or a security key. No password required.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="auth-card-actions">
              <button
                type="submit"
                id="signup-submit-btn"
                className="btn-primary-blue"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    <span>Processing Registration...</span>
                  </>
                ) : (
                  <span>
                    {authMethod === 'passkey' ? 'Create Account with Passkey' : 'Create Account'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer link to Login */}
      <footer className="auth-page-footer">
        <div>
          Already have an account?{' '}
          <Link to="/login" id="back-to-login-link">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;
