import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Shield, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import '../styles/ModernAuth.css';

/**
 * ChangePasswordPage (authenticated route)
 *
 * Security guarantees:
 * - Requires current password verification
 * - Password policy enforced client-side AND server-side
 * - Invalidates all sessions on success
 * - Clears local auth state and redirects to login
 */

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Number' },
];

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(newPassword)).length;
  const allRulesMet = passwordStrength === PASSWORD_RULES.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isDifferent = currentPassword.length === 0 || newPassword !== currentPassword;

  const canSubmit = currentPassword.length > 0 && allRulesMet && passwordsMatch && isDifferent;
  const strengthColor = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'][passwordStrength - 1] || '#374151';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      if (!isDifferent) {
        setErrorMessage('New password must be different from your current password.');
      }
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (result?.success) {
        setStatus('success');
        // After 2 seconds, redirect to login (session was cleared by service)
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setStatus('error');
        setErrorMessage(result?.message || 'Failed to change password. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.response?.data?.message || 'Failed to change password. Please check your current password and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-single-container" id="change-password-success" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <CheckCircle size={32} color="#fff" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
            Password Changed
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 8px' }}>
            Your password has been updated successfully. All active sessions have been signed out.
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px' }}>
            Redirecting you to sign in...
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={20} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <main className="auth-single-container" id="change-password-form">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <h1 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            Change Password
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Update your account password. All other devices will be signed out.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Current Password */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="current-password-input" style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="current-password-input"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrorMessage(null); }}
                placeholder="Enter current password"
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '12px 44px 12px 14px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="new-password-input" style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="new-password-input"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(null); }}
                placeholder="Enter new password"
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '12px 44px 12px 14px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < passwordStrength ? strengthColor : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
                  {PASSWORD_RULES.map((rule, i) => (
                    <span key={i} style={{ fontSize: '11px', color: rule.test(newPassword) ? '#10b981' : '#64748b' }}>
                      {rule.test(newPassword) ? '✓' : '○'} {rule.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {newPassword && currentPassword && newPassword === currentPassword && (
              <p style={{ color: '#f59e0b', fontSize: '12px', margin: '6px 0 0' }}>
                ⚠ New password must differ from your current password
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="confirm-new-password-input" style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-new-password-input"
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
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && <p style={{ color: '#fca5a5', fontSize: '12px', margin: '6px 0 0' }}>Passwords do not match</p>}
            {confirmPassword && passwordsMatch && <p style={{ color: '#10b981', fontSize: '12px', margin: '6px 0 0' }}>✓ Passwords match</p>}
          </div>

          {errorMessage && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px'
            }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: '#fca5a5', fontSize: '13px', lineHeight: 1.5 }}>{errorMessage}</span>
            </div>
          )}

          <button
            id="change-password-submit"
            type="submit"
            disabled={!canSubmit || status === 'loading'}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: (!canSubmit || status === 'loading') ? 'rgba(99, 102, 241, 0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '15px',
              border: 'none', cursor: (!canSubmit || status === 'loading') ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {status === 'loading' ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Changing password...</>
            ) : 'Change Password'}
          </button>
        </form>

        <div style={{
          background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '8px', padding: '14px 16px', marginTop: '20px'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            🔒 Changing your password will sign you out from all devices and sessions. You'll need to sign in again.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
