import React, { useState, useEffect } from 'react';
import { PasswordlessLoginPayload } from '../../types/authFlow.types';

interface PasswordlessLoginCardProps {
  onPasskeyLogin: (payload?: PasswordlessLoginPayload) => Promise<void> | void;
  onSkip?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  currentEmail?: string;
  onEmailChange?: (newEmail: string) => void;
}

export const PasswordlessLoginCard: React.FC<PasswordlessLoginCardProps> = ({
  onPasskeyLogin,
  onSkip,
  onBack,
  isLoading = false,
  errorMessage = null,
  currentEmail = 'admin@thestackly.com',
  onEmailChange,
}) => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentEmail);

  // Sync with parent currentEmail
  useEffect(() => {
    if (currentEmail) {
      setEmail(currentEmail);
    }
    setIsEditingEmail(false);
  }, [currentEmail]);

  const handleBiometricClick = async () => {
    setLocalError(null);
    setScanStatus('scanning');

    try {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
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
      {/* Top Step & Method Badge Header */}
      <div className="card-badge-header">
        <span style={{ color: '#10b981', fontWeight: 600 }}>Step 2 of 2: Passwordless</span>
        <span>FIDO2 / WebAuthn</span>
      </div>

      {/* Top Nav Row: Back Arrow + Centered Stackly Logo */}
      <div className="card-top-nav">
        {onBack ? (
          <button
            type="button"
            className="back-arrow-btn"
            aria-label="Go back to password login"
            title="Go back"
            onClick={onBack}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        ) : (
          <div style={{ width: '26px', height: '26px' }} aria-hidden="true" />
        )}

        <div className="brand-logo-container">
          <img src="/assets/images/logo.png" alt="Stackly" className="auth-brand-logo-img" />
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
          <span>{email || currentEmail || 'admin@thestackly.com'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      ) : (
        <div className="input-field-group" style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '300px', alignSelf: 'center' }}>
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

      {/* Biometric Interactive Radar HUD Box */}
      <div
        className="biometric-hud-box"
        id="biometric-scanner-zone"
        role="button"
        tabIndex={0}
        aria-label="Trigger Biometric Verification"
        onClick={handleBiometricClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBiometricClick(); }}
        title="Click to authenticate using local Passkey / Windows Hello / Touch ID"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="hud-scan-beam" />

        {/* High-Fidelity Futuristic Biometric Vector Artwork */}
        <svg className="biometric-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Facial Silhouette Radar Target */}
          <path d="M50 20 C36 20 28 32 28 48 C28 66 38 78 50 82 C62 78 72 66 72 48 C72 32 64 20 50 20 Z" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
          <circle cx="41" cy="45" r="2.5" fill="#10b981" />
          <circle cx="59" cy="45" r="2.5" fill="#10b981" />
          <path d="M44 60 Q50 66 56 60" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          {/* Fingerprint Center Waves */}
          <path d="M42 34 C46 30 54 30 58 34" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <path d="M37 40 C43 35 57 35 63 40" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
          <path d="M38 70 C44 74 56 74 62 70" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </svg>

        {scanStatus === 'scanning' && (
          <div style={{ position: 'absolute', bottom: '10px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
            Scanning Passkey...
          </div>
        )}
      </div>

      {/* Educational Micro-Copy */}
      <p className="biometric-helper-text">
        Use your device&apos;s built-in Windows Hello, Touch ID, Face ID, or security key to sign in securely without passwords.
      </p>

      {/* Dual Action Buttons */}
      <div className="card-actions" style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="btn-solid-blue"
          id="passkey-login-submit-btn"
          onClick={handleBiometricClick}
          disabled={isLoading || scanStatus === 'scanning'}
        >
          {isLoading || scanStatus === 'scanning' ? (
            <>
              <span className="auth-spinner" />
              <span>Verifying Passkey...</span>
            </>
          ) : (
            <span>Next</span>
          )}
        </button>

        <button
          type="button"
          className="btn-outline-gray"
          id="passkey-skip-btn"
          onClick={onSkip}
        >
          Skip for now
        </button>
      </div>
    </article>
  );
};

export default PasswordlessLoginCard;
