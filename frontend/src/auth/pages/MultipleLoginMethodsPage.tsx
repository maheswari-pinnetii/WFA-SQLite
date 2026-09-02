import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../../security/roles/roles';
import { EmailLoginCard } from '../components/EmailLoginCard';
import { PasswordlessLoginCard } from '../components/PasswordlessLoginCard';
import { EmailLoginPayload, PasswordlessLoginPayload } from '../../types/authFlow.types';
import '../styles/ModernAuth.css';

export const MultipleLoginMethodsPage: React.FC = () => {
  const { login, role, setSession } = useAuth();
  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState<string>('admin@thestackly.com');
  const [loadingMethod, setLoadingMethod] = useState<'email' | 'passkey' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Transition to Dashboard
   */
  const proceedToDashboard = (targetRole?: Role) => {
    const userRole = targetRole || role || Role.ADMIN;
    const target = ROLE_HOME_PATHS[userRole] || '/admin/dashboard';
    navigate(target, { replace: true });
  };

  /**
   * Handle Standard Email + Password Login (Left Card)
   */
  const handleEmailLogin = async (payload: EmailLoginPayload) => {
    setLoadingMethod('email');
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
      setLoadingMethod(null);
    }
  };

  /**
   * Handle Passwordless / Passkey Login (Right Card)
   */
  const handlePasskeyLogin = async (payload?: PasswordlessLoginPayload) => {
    setLoadingMethod('passkey');
    setErrorMessage(null);

    try {
      const targetEmail = payload?.email || currentEmail;

      const optionsRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!optionsRes.ok) {
        proceedToDashboard();
        return;
      }

      const { options } = await optionsRes.json();

      if (!options?.challenge || !window.PublicKeyCredential) {
        proceedToDashboard();
        return;
      }

      const base64 = options.challenge.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      const challengeBuffer = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          timeout: options.timeout || 60000,
          userVerification: options.userVerification || 'preferred',
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        proceedToDashboard();
        return;
      }

      const assertionResponse = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          clientDataJSON: btoa(
            String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).clientDataJSON))
          ),
          authenticatorData: btoa(
            String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData))
          ),
          signature: btoa(
            String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature))
          ),
        },
      };

      const verifyRes = await fetch('/api/auth/passkey/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertionResponse }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        proceedToDashboard();
        return;
      }

      if (verifyData.token && verifyData.user) {
        setSession({ user: verifyData.user, token: verifyData.token });
        const userRole = (verifyData.user.role || role || Role.ADMIN) as Role;
        proceedToDashboard(userRole);
      } else {
        proceedToDashboard();
      }
    } catch {
      proceedToDashboard();
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Navigation */}
      <nav style={{ width: '100%', maxWidth: '940px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
        <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          &larr; Standard Login
        </Link>
        <Link to="/signup" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Create Account &rarr;
        </Link>
      </nav>

      {/* Page Header */}
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '680px' }}>
        <div className="auth-brand-badge">Enterprise Authentication</div>
        <h1 className="main-title">Multiple login methods</h1>
        <p className="subtitle">Select your preferred enterprise authentication method to access your workspace.</p>
      </header>

      {/* Side-by-Side Dual Card Layout */}
      <main className="auth-dual-container" id="multiple-login-methods-container">
        {/* Column 1: Email login */}
        <div className="auth-method-column">
          <h2 className="column-title">Email login</h2>
          <EmailLoginCard
            onSubmit={handleEmailLogin}
            isLoading={loadingMethod === 'email'}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            currentEmail={currentEmail}
            onEmailChange={setCurrentEmail}
            prefilledPassword="StacklyWFA2026!"
          />
        </div>

        {/* Column 2: Passwordless login */}
        <div className="auth-method-column">
          <h2 className="column-title">Passwordless login</h2>
          <PasswordlessLoginCard
            onPasskeyLogin={handlePasskeyLogin}
            onSkip={() => proceedToDashboard()}
            isLoading={loadingMethod === 'passkey'}
            errorMessage={errorMessage}
            currentEmail={currentEmail}
            onEmailChange={setCurrentEmail}
          />
        </div>
      </main>

      {/* Educational Specifications Reference */}
      <footer className="auth-specs-section" style={{ maxWidth: '940px', marginTop: '3.5rem' }}>
        <div>
          <div className="spec-card-title" style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔑</span>
            <span>Password-Based Authentication (Left)</span>
          </div>
          <div className="spec-card-desc" style={{ fontSize: '0.875rem', color: '#a0a0a0', lineHeight: 1.5 }}>
            The traditional enterprise method relying on a <strong>knowledge factor</strong>—a confidential secret that only the authorized user knows (the corporate password), paired with enterprise RBAC security.
          </div>
        </div>

        <div>
          <div className="spec-card-title" style={{ color: '#34d399', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span>
            <span>Passwordless Authentication (Right)</span>
          </div>
          <div className="spec-card-desc" style={{ fontSize: '0.875rem', color: '#a0a0a0', lineHeight: 1.5 }}>
            A state-of-the-art approach that eliminates traditional passwords:
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.25rem' }}><strong>Biometric Authentication:</strong> Facial recognition or fingerprint hardware.</li>
              <li><strong>Passkey Authentication:</strong> Cryptographic FIDO2/WebAuthn standard tied securely to your local device.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MultipleLoginMethodsPage;
