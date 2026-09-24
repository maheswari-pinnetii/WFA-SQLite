import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { apiClient } from '../../../api/client';
import { Settings, Eye, EyeOff, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const { user } = useAuth();
const [mfaStatus, setMfaStatus] = useState<{ enabled: boolean; verifiedAt: string | null }>({ enabled: false, verifiedAt: null });
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string } | null>(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isDisableMode, setIsDisableMode] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');
  const [showRegenPassword, setShowRegenPassword] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Trusted Devices States
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const fetchTrustedDevices = async () => {
    try {
      setLoadingDevices(true);
      const res = await fetch(`/api/auth/trusted-devices?userId=${user?.id || ''}&email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.devices) {
          setTrustedDevices(data.devices);
          return;
        }
      }
      // Fallback to local storage if API didn't return devices
      const local = localStorage.getItem('wfa_trusted_device');
      if (local) {
        const parsed = JSON.parse(local);
        setTrustedDevices([{ id: 'local_device', device_name: parsed.deviceName, auth_method: parsed.authMethod, trusted_until: '30 days', last_used_at: parsed.savedAt }]);
      }
    } catch {
      try {
        const local = localStorage.getItem('wfa_trusted_device');
        if (local) {
          const parsed = JSON.parse(local);
          setTrustedDevices([{ id: 'local_device', device_name: parsed.deviceName, auth_method: parsed.authMethod, trusted_until: '30 days', last_used_at: parsed.savedAt }]);
        }
      } catch {}
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleRevokeDevice = async (id: string) => {
    try {
      if (id !== 'local_device') {
        await fetch(`/api/auth/trusted-devices/${id}`, { method: 'DELETE' });
      }
      setTrustedDevices((prev) => prev.filter((d) => d.id !== id));
      localStorage.removeItem('wfa_trusted_device');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMfaStatus = async () => {
    try {
      const res = await apiClient.get('/v1/auth/mfa/totp/status');
      if (res.data && res.data.success) {
        setMfaStatus(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStartSetup = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/enroll');
      if (res.data && res.data.success) {
        setSetupData(res.data.data);
        setIsSetupMode(true);
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to initiate MFA setup.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifyEnroll = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/enroll/verify', { code: enrollCode });
      if (res.data && res.data.success) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setMfaStatus({ enabled: true, verifiedAt: new Date().toISOString() });
        setIsSetupMode(false);
        setEnrollCode('');
        setSecuritySuccess('Two-Factor Authentication enabled successfully! Store your recovery codes safely.');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/disable', {
        password: disablePassword,
        code: disableCode
      });
      if (res.data && res.data.success) {
        setMfaStatus({ enabled: false, verifiedAt: null });
        setIsDisableMode(false);
        setDisablePassword('');
        setDisableCode('');
        setSecuritySuccess('Two-Factor Authentication disabled successfully.');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Disable request failed.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleRegenCodes = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/recovery-codes/regenerate', { password: regenPassword });
      if (res.data && res.data.success) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setRegenPassword('');
        setShowRegenModal(false);
        setSecuritySuccess('New recovery codes generated successfully!');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to regenerate recovery codes.');
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    fetchMfaStatus();
    fetchTrustedDevices();
  }, []);

  return (

          <div className="space-y-6 text-xs animate-fadeIn text-[var(--text-primary)]">
            <h4 className="text-sm font-extrabold border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
              <Settings size={16} className="text-emerald-500" /> Two-Factor Authentication (2FA)
            </h4>

            {securityError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold">
                {securityError}
              </div>
            )}

            {securitySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                {securitySuccess}
              </div>
            )}

            {/* Recovery Codes Display Box */}
            {recoveryCodes.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/10 border border-emerald-500/20 space-y-3">
                <p className="font-extrabold text-emerald-500 text-xs">⚠️ IMPORTANT: Store these 10 one-time recovery codes safely!</p>
                <p className="text-[10px] text-slate-400">If you lose your authenticator app access, you can use these codes to log in. Each code can be used only once.</p>
                <div className="grid grid-cols-2 gap-2 font-mono font-bold text-center">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const text = recoveryCodes.join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Recovery codes copied to clipboard.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}

            {!isSetupMode && !isDisableMode ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <div>
                    <p className="font-extrabold text-xs">MFA via Authenticator Application</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {mfaStatus.enabled
                        ? `Enabled (Verified on ${new Date(mfaStatus.verifiedAt!).toLocaleDateString()})`
                        : 'Disabled'}
                    </p>
                  </div>
                  {mfaStatus.enabled ? (
                    <button
                      onClick={() => {
                        setIsDisableMode(true);
                        setSecurityError('');
                        setSecuritySuccess('');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleStartSetup}
                      disabled={securityLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                    >
                      {securityLoading ? 'Loading...' : 'Enable 2FA'}
                    </button>
                  )}
                </div>

                {mfaStatus.enabled && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                    <p className="font-extrabold text-xs">Backup Recovery Actions</p>
                    <p className="text-[10px] text-slate-400">Regenerate a new set of 10 one-time recovery codes. Generating new codes makes all previous recovery codes invalid.</p>
                    {showRegenModal ? (
                      <div className="space-y-3 mt-2 max-w-sm">
                        <label className="text-[10px] text-slate-400 font-bold block">Confirm Password</label>
                        <div className="relative flex items-center">
                          <input
                            type={showRegenPassword ? "text" : "password"}
                            value={regenPassword}
                            onChange={(e) => setRegenPassword(e.target.value)}
                            placeholder="Enter your account password"
                            className="auth-input text-xs w-full pr-8"
                            style={{ padding: '0.5rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegenPassword(!showRegenPassword)}
                            className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                            aria-label={showRegenPassword ? "Hide password" : "Show password"}
                          >
                            {showRegenPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRegenCodes}
                            disabled={securityLoading || !regenPassword}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 text-xs cursor-pointer"
                          >
                            {securityLoading ? 'Generating...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setShowRegenModal(false)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowRegenModal(true);
                          setSecurityError('');
                          setSecuritySuccess('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[var(--border-color)] hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] font-bold border border-[var(--border-color)] cursor-pointer"
                      >
                        Regenerate Recovery Codes
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : isSetupMode ? (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4 max-w-md mx-auto animate-fadeIn">
                <p className="font-extrabold text-center text-xs">MFA Setup Procedure</p>
                {setupData && (
                  <div className="space-y-4 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 text-center">Scan this QR code using Google Authenticator or Microsoft Authenticator.</p>
                    <img src={setupData.qrCodeDataUrl} alt="Setup QR Code" className="w-40 h-40 border border-[var(--border-color)] p-2 rounded-lg bg-white" />
                    <div className="w-full text-center">
                      <p className="text-[10px] text-slate-400">Manual Setup Secret Key:</p>
                      <code className="text-xs font-mono font-bold block bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-color)] mt-1 select-all">{setupData.secret}</code>
                    </div>
                    <div className="w-full space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold block">Enter Verification Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enrollCode}
                        onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP code"
                        className="auth-input text-center text-sm"
                        style={{ padding: '0.5rem', letterSpacing: '0.1em' }}
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleVerifyEnroll}
                        disabled={securityLoading || enrollCode.length !== 6}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        {securityLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                      <button
                        onClick={() => {
                          setIsSetupMode(false);
                          setSetupData(null);
                          setEnrollCode('');
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--border-color)] text-[var(--text-secondary)] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4 max-w-md mx-auto animate-fadeIn">
                <p className="font-extrabold text-center text-xs text-rose-500">Disable Two-Factor Authentication</p>
                <p className="text-[10px] text-slate-400 text-center">Confirm with your password and a current authenticator/recovery code to disable 2FA.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showDisablePassword ? "text" : "password"}
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Enter account password"
                        className="auth-input text-xs w-full pr-8"
                        style={{ padding: '0.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDisablePassword(!showDisablePassword)}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                        aria-label={showDisablePassword ? "Hide password" : "Show password"}
                      >
                        {showDisablePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">MFA/Recovery Code</label>
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      placeholder="Authenticator code or Recovery code"
                      className="auth-input text-xs"
                      style={{ padding: '0.5rem' }}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleConfirmDisable}
                      disabled={securityLoading || !disablePassword || !disableCode}
                      className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      {securityLoading ? 'Disabling...' : 'Confirm Disable'}
                    </button>
                    <button
                      onClick={() => {
                        setIsDisableMode(false);
                        setDisablePassword('');
                        setDisableCode('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--border-color)] text-[var(--text-secondary)] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Trusted Devices & Biometric Locks Management Section */}
            <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Trusted Devices & Biometric Locks</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Devices authorized for instant sign-in using Face Recognition, Biometrics, or Homescreen Lock.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {trustedDevices.length} Active {trustedDevices.length === 1 ? 'Device' : 'Devices'}
                </span>
              </div>

              {loadingDevices ? (
                <div className="text-[11px] text-slate-400 py-3 text-center">Loading trusted devices...</div>
              ) : trustedDevices.length === 0 ? (
                <div className="text-[11px] text-slate-400 py-4 text-center bg-black/20 rounded-xl border border-dashed border-[var(--border-color)]">
                  No trusted devices registered yet. When signing in, check <strong>&quot;Save as trusted device&quot;</strong> to enable fast 1-click biometric sign-in.
                </div>
              ) : (
                <div className="space-y-2">
                  {trustedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="p-3 rounded-xl bg-black/25 border border-[var(--border-color)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm">
                          {device.auth_method === 'face' ? '👤' : device.auth_method === 'screen_lock' ? '📱' : device.auth_method === 'device_pin' ? '🔢' : device.auth_method === 'pattern' ? '🔮' : '👆'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {device.device_name || 'Personal Device'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {device.auth_method === 'face' ? 'Face ID / Windows Hello' : device.auth_method === 'screen_lock' ? 'Homescreen Lock / PIN' : device.auth_method === 'device_pin' ? 'Device PIN' : device.auth_method === 'pattern' ? 'Pattern Lock' : 'Fingerprint / Touch ID'} • Trusted for 30 days
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeDevice(device.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
};
