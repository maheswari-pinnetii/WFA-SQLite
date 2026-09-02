import React, { useState } from 'react';
import { PasswordlessLoginPayload } from '../../types/authFlow.types';

interface PasswordlessLoginCardProps {
  onPasskeyLogin: (payload?: PasswordlessLoginPayload) => Promise<void> | void;
  onSkip?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  currentEmail?: string;
  onEmailChange?: (newEmail: string) => void;
}

export const PasswordlessLoginCard: React.FC<PasswordlessLoginCardProps> = ({
  onPasskeyLogin,
  onSkip,
  isLoading = false,
  errorMessage = null,
  currentEmail = 'employee@thestackly.com',
  onEmailChange,
}) => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentEmail);

  const handleBiometricClick = async () => {
    setLocalError(null);
    setScanStatus('scanning');

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric / Passkey authentication is not supported by your current browser.');
      }

      await onPasskeyLogin({ email });
      setScanStatus('success');
    } catch (err: unknown) {
      setScanStatus('failed');
      const msg = err instanceof Error ? err.message : 'Biometric verification cancelled or failed.';
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
    <article className="auth-card" id="card-passwordless-login">
      {/* Top Badge Header */}
      <div className="card-badge-header">
        <span style={{ color: '#10b981' }}>Passwordless</span>
        <span>FIDO2 / WebAuthn</span>
      </div>

      {/* Top Nav Row: Centered Microsoft Logo */}
      <div className="card-top-nav">
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

      {/* Email Pill Badge (Clickable to switch account) */}
      {!isEditingEmail ? (
        <div
          className="email-pill-badge"
          title="Click to switch account"
          role="button"
          tabIndex={0}
          onClick={() => setIsEditingEmail(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingEmail(true); }}
        >
          <span>{email || currentEmail || 'employee@thestackly.com'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      ) : (
        <div className="input-field-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="edit-passkey-email" className="overlaid-label">Switch Email</label>
          <input
            id="edit-passkey-email"
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
      <h2 className="card-heading centered">
        Sign in faster with your face, fingerprint, or PIN
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

      {/* Centered Biometric Scan Illustration & HUD Frame */}
      <div
        className="biometric-scan-container"
        onClick={!isLoading ? handleBiometricClick : undefined}
        role="button"
        tabIndex={0}
        title="Click to scan biometrics"
        aria-label="Trigger Biometric Authentication Scan"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBiometricClick();
          }
        }}
      >
        <div className="biometric-hud-frame">
          {/* Neon Corner Brackets */}
          <div className="hud-corner hud-top-left" />
          <div className="hud-corner hud-top-right" />
          <div className="hud-corner hud-bottom-left" />
          <div className="hud-corner hud-bottom-right" />

          {/* Animated Scanning Radar Beam */}
          <div className="hud-scan-beam" />

          {/* Abstract Face & Fingerprint Vector Art */}
          <svg className="biometric-art-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Abstract Facial Wireframe */}
            <ellipse cx="50" cy="46" rx="28" ry="34" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
            <path d="M40 40C42 38 46 38 48 40" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d="M52 40C54 38 58 38 60 40" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <circle cx="44" cy="45" r="3" fill="#60a5fa" />
            <circle cx="56" cy="45" r="3" fill="#60a5fa" />
            <path d="M50 48V56L46 58" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
            <path d="M42 66C46 69 54 69 58 66" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

            {/* Biometric Sensor Fingerprint Arcs */}
            <path d="M50 20C32 20 22 34 22 50" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M50 26C36 26 28 38 28 50" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M50 78C64 78 74 66 74 50" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        <p className="helper-text">
          {scanStatus === 'scanning'
            ? 'Touch your security key or look into your camera...'
            : "Use your device's built-in Windows Hello, Touch ID, Face ID, or security key to sign in securely without passwords."}
        </p>
      </div>

      {/* Dual Stacked Buttons */}
      <div className="card-actions">
        <button
          type="button"
          className="btn-solid-blue"
          id="btn-passwordless-next"
          onClick={handleBiometricClick}
          disabled={isLoading || scanStatus === 'scanning'}
        >
          {isLoading || scanStatus === 'scanning' ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              <span>Scanning Biometrics...</span>
            </>
          ) : (
            <span>Next</span>
          )}
        </button>

        <button
          type="button"
          className="btn-outline-gray"
          id="btn-skip-for-now"
          onClick={onSkip}
          disabled={isLoading}
        >
          Skip for now
        </button>
      </div>
    </article>
  );
};

export default PasswordlessLoginCard;
