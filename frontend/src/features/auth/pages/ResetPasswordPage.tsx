import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, XCircle } from 'lucide-react';
import '../styles/ModernAuth.css';

/**
 * ResetPasswordPage
 *
 * Security guarantees:
 * - Reads reset token from URL query param ONLY (never localStorage/sessionStorage)
 * - Token is consumed once on the server side; reuse is rejected
 * - Validates password policy client-side (same rules as server-side)
 * - Clears the token from the URL after successful submission
 * - Does NOT auto-login after reset (user must re-authenticate)
 * - No token is stored or logged
 */

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Token is read from URL only — never stored
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid_token'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // No token in URL = invalid link
    if (!token) {
      setStatus('invalid_token');
    }
  }, [token]);

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(password)).length;
  const allRulesMet = passwordStrength === PASSWORD_RULES.length;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus('invalid_token');
      return;
    }

    if (!allRulesMet) {
      setErrorMessage('Password does not meet the requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await authService.resetPassword(token, password);
      if (result?.success) {
        setStatus('success');
        // Clear the token from the URL for security
        window.history.replaceState({}, document.title, '/reset-password');
      } else {
        setStatus('error');
        setErrorMessage(result?.message || 'This reset link is invalid or has expired. Please request a new one.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.response?.data?.message || 'This reset link is invalid or has expired. Please request a new one.');
    }
  };

  const strengthColor = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'][passwordStrength - 1] || '#374151';
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || '';

  if (status === 'invalid_token') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-single-container" id="reset-password-invalid" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <XCircle size={32} color="#ef4444" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
            Invalid Reset Link
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
            This password reset link is missing or invalid. Reset links expire after 10 minutes and can only be used once.
          </p>
          <Link
            to="/forgot-password"
            style={{
              display: 'block', width: '100%', padding: '13px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
              textDecoration: 'none', fontWeight: 600, fontSize: '15px', textAlign: 'center', boxSizing: 'border-box'
            }}
          >
            Request New Reset Link
          </Link>
        </main>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-single-container" id="reset-password-success" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <CheckCircle size={32} color="#fff" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
            Password Reset Successfully
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 8px' }}>
            Your password has been updated. All existing sessions have been signed out for your security.
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 28px' }}>
            Please sign in again with your new password.
          </p>
          <button
            type="button"
            id="reset-password-go-to-login"
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '15px',
              border: 'none', cursor: 'pointer'
            }}
          >
            Go to Sign In
          </button>
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

      <main className="auth-single-container" id="reset-password-form">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Lock size={24} color="#fff" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            Set new password
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* New Password */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="reset-new-password"
              style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}
            >
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                placeholder="Enter new password"
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '12px 44px 12px 14px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i < passwordStrength ? strengthColor : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.2s'
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {PASSWORD_RULES.map((rule, i) => (
                    <span key={i} style={{ fontSize: '11px', color: rule.test(password) ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {rule.test(password) ? '✓' : '○'} {rule.label}
                    </span>
                  ))}
                </div>
                {strengthLabel && (
                  <p style={{ color: strengthColor, fontSize: '12px', margin: '4px 0 0', fontWeight: 500 }}>
                    Password strength: {strengthLabel}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="reset-confirm-password"
              style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}
            >
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(null); }}
                placeholder="Confirm new password"
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '12px 44px 12px 14px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${confirmPassword && !passwordsMatch ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p style={{ color: '#fca5a5', fontSize: '12px', margin: '6px 0 0' }}>Passwords do not match</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p style={{ color: '#10b981', fontSize: '12px', margin: '6px 0 0' }}>✓ Passwords match</p>
            )}
          </div>

          {/* Error */}
          {(errorMessage || status === 'error') && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px'
            }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: '#fca5a5', fontSize: '13px', lineHeight: 1.5 }}>
                {errorMessage || 'This reset link is invalid or has expired. Please request a new one.'}
              </span>
            </div>
          )}

          <button
            id="reset-password-submit"
            type="submit"
            disabled={status === 'loading' || !allRulesMet || !passwordsMatch}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: status === 'loading' || !allRulesMet || !passwordsMatch
                ? 'rgba(99, 102, 241, 0.4)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '15px',
              border: 'none',
              cursor: status === 'loading' || !allRulesMet || !passwordsMatch ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {status === 'loading' ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Resetting password...</>
            ) : 'Reset Password'}
          </button>
        </form>

        {status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>
              Request a new reset link →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResetPasswordPage;
