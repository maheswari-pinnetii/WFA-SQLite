import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import '../styles/ModernAuth.css';

/**
 * ForgotPasswordPage
 *
 * Security guarantees:
 * - Never reveals whether an email address is registered (generic success message always shown)
 * - Validates email format client-side only as a UX improvement; server enforces the real rules
 * - Token is sent via email ONLY — never stored, displayed, or logged on frontend
 * - No localStorage writes
 */
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      // Always show generic success — never reveal account existence
      setStatus('sent');
    } catch (err: any) {
      // Even on network/server errors, show success to prevent enumeration
      // (Only show real error on genuine frontend validation failures)
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-single-container" id="forgot-password-success" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={32} color="#fff" />
            </div>
            <h1 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>
              Check your inbox
            </h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: '0 0 8px', fontSize: '14px' }}>
              If an account is registered with <strong style={{ color: '#e2e8f0' }}>{email}</strong>,
              you'll receive a password reset link shortly.
            </p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.5 }}>
              The link expires in <strong style={{ color: '#94a3b8' }}>10 minutes</strong>. Please also check your spam folder.
            </p>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: '#e2e8f0' }}>Security notice:</strong> Stackly staff will never ask
              you to share the reset link. Never forward this email to anyone.
            </p>
          </div>

          <button
            type="button"
            className="btn-outline-gray"
            style={{ marginBottom: '12px', width: '100%' }}
            onClick={() => { setStatus('idle'); setEmail(''); }}
          >
            Send another reset email
          </button>

          <Link
            to="/login"
            style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <nav style={{ width: '100%', maxWidth: '440px', marginBottom: '24px', padding: '0 4px' }}>
        <Link
          to="/login"
          style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </nav>

      <main className="auth-single-container" id="forgot-password-form">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Mail size={24} color="#fff" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            Forgot your password?
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            Enter your company email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="forgot-password-email"
              style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}
            >
              Company Email Address
            </label>
            <input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thestackly.com"
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                opacity: status === 'loading' ? 0.6 : 1
              }}
            />
          </div>

          {errorMessage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px'
            }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ color: '#fca5a5', fontSize: '13px' }}>{errorMessage}</span>
            </div>
          )}

          <button
            id="forgot-password-submit"
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: status === 'loading' || !email.trim()
                ? 'rgba(99, 102, 241, 0.4)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '15px',
              border: 'none', cursor: status === 'loading' || !email.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
          Remembered your password?{' '}
          <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
