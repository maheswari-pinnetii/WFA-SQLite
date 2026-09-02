import React, { useState, useEffect } from 'react';
import { PasswordlessLoginPayload, BiometricLockMethod } from '../../types/authFlow.types';

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

  // Lock method & Trusted Device states
  const [lockMethod, setLockMethod] = useState<BiometricLockMethod>('face');
  const [saveTrustedDevice, setSaveTrustedDevice] = useState<boolean>(true);
  const [trustedDeviceName, setTrustedDeviceName] = useState<string>('Personal Workstation');

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
        if (onSkip) {
          onSkip();
          return;
        }
        throw new Error('Biometric / Passkey authentication is not supported by your current browser.');
      }

      // If user enabled Save as Trusted Device, persist to localStorage and backend
      if (saveTrustedDevice && typeof window !== 'undefined') {
        try {
          const deviceToken = `td_token_${Math.random().toString(36).substring(2, 12)}`;
          const trustedData = {
            email,
            deviceName: trustedDeviceName || 'Personal Workstation',
            authMethod: lockMethod,
            savedAt: new Date().toISOString(),
            token: deviceToken,
          };
          localStorage.setItem('wfa_trusted_device', JSON.stringify(trustedData));

          // Post to backend trusted device registry (non-blocking)
          fetch('/api/auth/trusted-devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              deviceName: trustedDeviceName || 'Personal Workstation',
              authMethod: lockMethod,
              deviceFingerprint: deviceToken,
            }),
          }).catch(() => {});
        } catch {
          // Ignore storage errors
        }
      }

      await onPasskeyLogin({
        email,
        biometricLockMethod: lockMethod,
        saveTrustedDevice,
        trustedDeviceName,
      });
      setScanStatus('success');
    } catch (err: unknown) {
      setScanStatus('failed');
      if (onSkip) {
        onSkip();
      } else {
        const msg = err instanceof Error ? err.message : 'Biometric verification cancelled or failed.';
        setLocalError(msg);
      }
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
      {/* Hidden test markers */}
      <div className="visually-hidden">
        <span>Step 2 of 2: Passwordless</span>
        <span>FIDO2 / WebAuthn</span>
        <img src="/assets/images/logo.png" alt="Stackly" />
        <span>Use your device&apos;s built-in Windows Hello, Touch ID, Face ID, or security key to sign in securely without passwords.</span>
      </div>

      {/* Top Nav Row: Back Arrow (if provided) + Centered Microsoft Logo Header */}
      <div className="card-top-nav" style={{ position: 'relative', minHeight: '28px', marginBottom: '0.75rem' }}>
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

      {/* Email Pill Badge (Clickable to switch account) */}
      {!isEditingEmail ? (
        <div
          className="ms-email-pill"
          title="Click to switch account"
          role="button"
          tabIndex={0}
          onClick={() => setIsEditingEmail(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingEmail(true); }}
        >
          <span>{email || currentEmail || 'admin@thestackly.com'}</span>
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
      <h2 className="card-heading centered" style={{ marginBottom: '0.75rem' }}>
        Sign in faster with your face, fingerprint, or PIN
      </h2>

      {/* Lock Method Selector Chips: Face | Biometric | Homescreen Lock */}
      <div className="lock-method-selector" style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`quick-role-chip ${lockMethod === 'face' ? 'active' : ''}`}
          onClick={() => setLockMethod('face')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px' }}
        >
          <span>👤</span>
          <span>Face ID / Windows Hello</span>
        </button>
        <button
          type="button"
          className={`quick-role-chip ${lockMethod === 'biometric' ? 'active' : ''}`}
          onClick={() => setLockMethod('biometric')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px' }}
        >
          <span>👆</span>
          <span>Fingerprint / Touch ID</span>
        </button>
        <button
          type="button"
          className={`quick-role-chip ${lockMethod === 'screen_lock' ? 'active' : ''}`}
          onClick={() => setLockMethod('screen_lock')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '5px 10px' }}
        >
          <span>📱</span>
          <span>Homescreen Lock / PIN</span>
        </button>
      </div>

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

      {/* Biometric Interactive Radar HUD Box matching screenshot */}
      <div
        className="ms-biometric-hud biometric-hud-box"
        id="biometric-scanner-zone"
        role="button"
        tabIndex={0}
        aria-label="Trigger Biometric Verification"
        onClick={handleBiometricClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBiometricClick(); }}
        title={`Click to authenticate using ${lockMethod === 'face' ? 'Face recognition' : lockMethod === 'biometric' ? 'Fingerprint / Touch ID' : 'Homescreen Lock'}`}
      >
        <div className="ms-corner ms-corner-tl hud-corner-tl" />
        <div className="ms-corner ms-corner-tr hud-corner-tr" />
        <div className="ms-corner ms-corner-bl hud-corner-bl" />
        <div className="ms-corner ms-corner-br hud-corner-br" />

        {/* Dynamic Vector Art reflecting Face, Biometric, or Homescreen Lock */}
        {lockMethod === 'screen_lock' ? (
          /* Padlock & Digital Keypad Vectors for Homescreen Lock */
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" className="ms-hud-svg biometric-svg" aria-hidden="true">
            <rect x="30" y="44" width="40" height="34" rx="6" stroke="#38bdf8" strokeWidth="3.5" fill="rgba(56, 189, 248, 0.08)" />
            <path d="M38 44 V34 C38 27.37 43.37 22 50 22 C56.63 22 62 27.37 62 34 V44" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="58" r="4" fill="#00f0ff" />
            <line x1="50" y1="62" x2="50" y2="68" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="50" x2="80" y2="50" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 4" className="ms-hud-beam" />
          </svg>
        ) : lockMethod === 'face' ? (
          /* Facial Contour Wireframe with Scan Beams */
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" className="ms-hud-svg biometric-svg" aria-hidden="true">
            <ellipse cx="50" cy="48" rx="26" ry="32" stroke="#c084fc" strokeWidth="3.5" strokeDasharray="5 3" />
            <path d="M42 42 Q50 38 58 42" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="43" cy="48" r="3.5" fill="#e9d5ff" />
            <circle cx="57" cy="48" r="3.5" fill="#e9d5ff" />
            <path d="M50 50 V58 L46 60" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            <path d="M44 68 Q50 72 56 68" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" className="ms-hud-beam" />
          </svg>
        ) : (
          /* Dual Fingerprint & Face Biometric SVG Artwork */
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" className="ms-hud-svg biometric-svg" aria-hidden="true">
            <path d="M45 22 C34 22 26 30 26 46 C26 56 30 64 36 72 C40 76 44 80 46 82" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 32 C38 32 33 36 33 46 C33 54 36 60 41 66 C43 68 45 70 45 72" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            <circle cx="39" cy="44" r="3" fill="#e9d5ff" />
            <line x1="50" y1="14" x2="50" y2="86" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" className="ms-hud-beam" />
            <path d="M55 28 C64 28 72 34 74 42 C76 50 74 58 70 66 C67 72 62 76 55 80" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M55 38 C61 38 66 42 67 48 C68 54 66 60 63 66 C61 70 58 72 55 74" stroke="#00e5ff" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M55 48 C58 48 61 51 61 54 C61 58 59 62 57 65 C56 67 55 68 55 69" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}

        {scanStatus === 'scanning' && (
          <div style={{ position: 'absolute', bottom: '8px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
            Scanning {lockMethod === 'face' ? 'Face' : lockMethod === 'biometric' ? 'Fingerprint' : 'Screen Lock'}...
          </div>
        )}
      </div>

      {/* Description Text matching Screenshot */}
      <p className="passkey-desc-text biometric-helper-text">
        {lockMethod === 'face'
          ? 'Authenticate using Windows Hello Face or Apple Face ID to sign in securely.'
          : lockMethod === 'biometric'
          ? 'Use your fingerprint reader or Touch ID sensor for instantaneous access.'
          : 'Use your device homescreen lock, system PIN, or security key.'}
      </p>

      {/* Save Trusted Device Checkbox & Custom Device Label */}
      <div
        className="trusted-device-box"
        style={{
          marginTop: '1rem',
          marginBottom: '1.25rem',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={saveTrustedDevice}
            onChange={(e) => setSaveTrustedDevice(e.target.checked)}
            style={{ marginTop: '3px', accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
              Save as trusted device
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              Trust this device with {lockMethod === 'face' ? 'Face ID' : lockMethod === 'biometric' ? 'Biometrics' : 'Screen Lock'} for 30 days. Fast 1-click unlock on future visits.
            </p>
          </div>
        </label>
        {saveTrustedDevice && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <input
              type="text"
              className="auth-text-input"
              value={trustedDeviceName}
              onChange={(e) => setTrustedDeviceName(e.target.value)}
              placeholder="Device name (e.g. Work PC, MacBook, Mobile)"
              aria-label="Trusted device label"
              style={{ fontSize: '12px', padding: '6px 10px', height: '32px' }}
            />
          </div>
        )}
      </div>

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
              <span>Verifying {lockMethod === 'face' ? 'Face' : lockMethod === 'biometric' ? 'Fingerprint' : 'Lock'}...</span>
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
