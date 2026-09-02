import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../../security/roles/roles';
import { EmailLoginCard } from '../components/EmailLoginCard';
import { PasswordlessLoginCard } from '../components/PasswordlessLoginCard';
import { EmailLoginPayload, PasswordlessLoginPayload } from '../../types/authFlow.types';
import '../styles/ModernAuth.css';

export const LoginPage: React.FC = () => {
  const { login, role, isAuthenticated, setSession } = useAuth();
  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState<string>('employee@thestackly.com');
  const [loadingMethod, setLoadingMethod] = useState<'email' | 'passkey' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate role dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const target = ROLE_HOME_PATHS[role] || '/employee/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  /**
   * Handle Standard Email + Password Login
   */
  const handleEmailLogin = async (payload: EmailLoginPayload) => {
    setLoadingMethod('email');
    setErrorMessage(null);

    try {
      const res: any = await login(payload.email, payload.password);

      if (res && res.error) {
        throw new Error(res.payload || res.error.message || 'Invalid email or password credentials.');
      }

      const userRole = (res?.payload?.user?.role || res?.user?.role || role || Role.EMPLOYEE) as Role;
      const target = ROLE_HOME_PATHS[userRole] || '/employee/dashboard';
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password credentials.';
      setErrorMessage(msg);
    } finally {
      setLoadingMethod(null);
    }
  };

  /**
   * Handle Passwordless / Passkey Login (WebAuthn + SQLite Backend Verification)
   */
  const handlePasskeyLogin = async (payload?: PasswordlessLoginPayload) => {
    setLoadingMethod('passkey');
    setErrorMessage(null);

    try {
      const targetEmail = payload?.email || currentEmail;

      // 1. Fetch challenge/options from SQLite backend
      const optionsRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!optionsRes.ok) {
        throw new Error('Failed to obtain passkey challenge from security server.');
      }

      const { options } = await optionsRes.json();

      // Safe base64url decoding
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
        throw new Error('Biometric assertion was not returned by authenticator.');
      }

      // 2. Send assertion to SQLite backend verification endpoint
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
        throw new Error(verifyData.error || 'Passkey verification failed.');
      }

      // Successful passkey authentication
      if (verifyData.token && verifyData.user) {
        setSession({ user: verifyData.user, token: verifyData.token });
        const userRole = (verifyData.user.role || role || Role.EMPLOYEE) as Role;
        const target = ROLE_HOME_PATHS[userRole] || '/employee/dashboard';
        navigate(target, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey authentication encountered an error.';
      setErrorMessage(msg);
    } finally {
      setLoadingMethod(null);
    }
  };

  /**
   * Handle Skip action from Biometric card
   */
  const handleSkipPasskey = () => {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.focus();
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Navbar / Navigation Header */}
      <nav style={{ width: '100%', maxWidth: '940px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
        <Link to="/signup" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Create Account &rarr;
        </Link>
      </nav>


      {/* Side-by-Side Dual Card Layout (Stacking on mobile) */}
      <main className="auth-container" id="auth-dual-cards-container">
        {/* Card 1: Email / Password Login */}
        <EmailLoginCard
          onSubmit={handleEmailLogin}
          isLoading={loadingMethod === 'email'}
          errorMessage={loadingMethod === 'email' ? errorMessage : null}
          onClearError={() => setErrorMessage(null)}
          currentEmail={currentEmail}
          onEmailChange={setCurrentEmail}
        />

        {/* Card 2: Passwordless / WebAuthn Passkey Login */}
        <PasswordlessLoginCard
          onPasskeyLogin={handlePasskeyLogin}
          onSkip={handleSkipPasskey}
          isLoading={loadingMethod === 'passkey'}
          errorMessage={loadingMethod === 'passkey' ? errorMessage : null}
          currentEmail={currentEmail}
          onEmailChange={setCurrentEmail}
        />
      </main>


      {/* Bottom Switch Link */}
      <footer className="auth-page-footer">
        <div>
          Don&apos;t have an enterprise account?{' '}
          <Link to="/signup" id="create-account-link">
            Create an account
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
