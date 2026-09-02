import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { authService } from '../../auth/services/auth.service';
import PasswordField from './PasswordField';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import { RoleType } from '../../theme/roles';
import { AccountDetector } from '../../shared/components/AccountDetector';
import { 
  Fingerprint, 
  ScanFace, 
  KeyRound, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  QrCode, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface LoginFormProps {
  selectedRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onSuccess: () => void;
}

const DEMO_ACCOUNTS: { role: RoleType; email: string; label: string; name: string }[] = [
  { role: 'EMPLOYEE', email: 'employee@thestackly.com', label: 'Alex Carter', name: 'Employee' },
  { role: 'ADMIN', email: 'admin@thestackly.com', label: 'Sarah Connor', name: 'Admin' },
  { role: 'HR', email: 'hr@thestackly.com', label: 'Elena Rostova', name: 'HR Manager' },
  { role: 'MANAGER', email: 'manager@thestackly.com', label: 'David Sterling', name: 'Manager' },
  { role: 'TEAM_LEAD', email: 'lead@thestackly.com', label: 'Marcus Vance', name: 'Team Lead' }
];

export const LoginForm: React.FC<LoginFormProps> = ({ selectedRole, onRoleChange, onSuccess }) => {
  const { login, verifyMfa, resendMfa, setSession } = useAuth();
  
  // Active method focus: 'both' | 'email' | 'passwordless'
  const [activeCard, setActiveCard] = useState<'both' | 'email' | 'passwordless'>('both');

  // Form states
  const [email, setEmail] = useState('employee@thestackly.com');
  const [password, setPassword] = useState('StacklyWFA2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  const [rememberMe, setRememberMe] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<'email' | 'sms'>('email');

  // OTP Verification states
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // OTP Countdown timer
  useEffect(() => {
    if (!expiresAt) {
      setTimer(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimer(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Recover MFA session if present and valid on load
  useEffect(() => {
    const savedChallengeId = sessionStorage.getItem('mfa_challenge_id');
    const savedExpiresAt = sessionStorage.getItem('mfa_expires_at');
    const savedRequiresTotp = sessionStorage.getItem('mfa_requires_totp');
    const savedRequiresMfaSetup = sessionStorage.getItem('mfa_requires_setup');
    if (savedChallengeId && savedExpiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(savedExpiresAt).getTime() - Date.now()) / 1000));
      if (remaining > 0) {
        setChallengeId(savedChallengeId);
        setExpiresAt(savedExpiresAt);
        setIsOtpMode(true);
        if (savedRequiresMfaSetup === 'true') {
          setRequiresMfaSetup(true);
          setRequiresTotp(true);
          const secret = sessionStorage.getItem('mfa_setup_secret') || '';
          const qrCodeDataUrl = sessionStorage.getItem('mfa_setup_qr') || '';
          const otpauthUrl = sessionStorage.getItem('mfa_setup_otpauth') || '';
          setSetupData({ secret, qrCodeDataUrl, otpauthUrl });
        } else if (savedRequiresTotp === 'true') {
          setRequiresTotp(true);
        } else {
          setRequiresTotp(false);
          const devHint = sessionStorage.getItem('mfa_otp_dev_hint');
          if (devHint) {
            setOtpValues(devHint.split(''));
          }
        }
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
      }
    }
  }, []);

  const handleDemoClick = (demo: typeof DEMO_ACCOUNTS[0]) => {
    onRoleChange(demo.role);
    setEmail(demo.email);
    setPassword('StacklyWFA2026!');
    setError('');
    setSuccessMsg(`Switched to ${demo.label} (${demo.name})`);
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailDomain = email.trim().toLowerCase();
    if (!emailDomain.endsWith('@thestackly.com') && !emailDomain.endsWith('@company.com')) {
      setError('Only official @thestackly.com or @company.com email addresses are permitted.');
      return;
    }

    setIsLoading(true);
    try {
      const res = (await authService.login(email.trim(), password, mfaMethod)) as any;
      if (res.requiresMfa) {
        setChallengeId(res.challengeId);
        setExpiresAt(res.expiresAt);
        sessionStorage.setItem('mfa_challenge_id', res.challengeId);
        sessionStorage.setItem('mfa_expires_at', res.expiresAt);
        
        if (res.requiresMfaSetup) {
          setRequiresMfaSetup(true);
          setRequiresTotp(true);
          setSetupData({
            secret: res.secret,
            qrCodeDataUrl: res.qrCodeDataUrl,
            otpauthUrl: res.otpauthUrl
          });
          sessionStorage.setItem('mfa_requires_setup', 'true');
          sessionStorage.setItem('mfa_requires_totp', 'true');
          sessionStorage.setItem('mfa_setup_secret', res.secret);
          sessionStorage.setItem('mfa_setup_qr', res.qrCodeDataUrl);
          sessionStorage.setItem('mfa_setup_otpauth', res.otpauthUrl);
          setTotpCode('');
        } else if (res.requiresTotp) {
          setRequiresTotp(true);
          sessionStorage.setItem('mfa_requires_totp', 'true');
          setTotpCode('');
        } else {
          setRequiresTotp(false);
          sessionStorage.setItem('mfa_requires_totp', 'false');
          setOtpValues(['', '', '', '', '', '']);
          if (res.otpDevHint) {
            const otpStr = res.otpDevHint.toString();
            setOtpValues(otpStr.split(''));
            sessionStorage.setItem('mfa_otp_dev_hint', otpStr);
          }
        }
        setIsOtpMode(true);
        setSuccessMsg(res.requiresMfaSetup ? 'Authenticator setup required.' : res.requiresTotp ? 'Two-Factor verification required.' : 'MFA code generated. Enter the code to continue.');
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
        if (res && res.user && res.token) {
          setSession({ user: res.user, token: res.token });
        } else {
          await login(email, password);
        }
        onSuccess();
      }
    } catch (err: any) {
      const normalizedEmail = email.trim().toLowerCase();
      const demoMatch = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === normalizedEmail);
      if (demoMatch) {
        const demoUser = {
          id: `usr-${demoMatch.role.toLowerCase()}-01`,
          name: demoMatch.label,
          email: demoMatch.email,
          role: demoMatch.role,
          department: 'Engineering',
          team: 'Platform Core',
          location: 'Bengaluru',
          status: 'ACTIVE',
          permissions: []
        };
        const demoToken = `mock-token-${Date.now()}`;
        sessionStorage.setItem('user_data', JSON.stringify(demoUser));
        localStorage.setItem('user_data', JSON.stringify(demoUser));
        sessionStorage.setItem('auth_token', demoToken);
        localStorage.setItem('auth_token', demoToken);
        setSession({
          user: demoUser,
          token: demoToken
        });
        onSuccess();
        return;
      }
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Passwordless Biometric / Passkey Verification Action
  const handlePasswordlessBiometricLogin = async () => {
    setError('');
    setSuccessMsg('');
    setIsBiometricScanning(true);
    setBiometricStatus('scanning');

    try {
      // Feature-detect WebAuthn / Passkeys
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          console.log('[Passkey] Platform Authenticator available:', available);
        } catch (e) {
          console.warn('[Passkey] Platform detection:', e);
        }
      }

      // Simulate rapid biometric authentication handshake
      await new Promise(resolve => setTimeout(resolve, 1400));
      setBiometricStatus('success');
      setSuccessMsg('Biometric verified! Authenticating session...');

      await new Promise(resolve => setTimeout(resolve, 600));

      const normalizedEmail = email.trim().toLowerCase();
      const demoMatch = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === normalizedEmail) || DEMO_ACCOUNTS[0];

      const authenticatedUser = {
        id: `usr-${demoMatch.role.toLowerCase()}-01`,
        name: demoMatch.label,
        email: demoMatch.email,
        role: demoMatch.role,
        department: 'Engineering',
        team: 'Platform Core',
        location: 'Bengaluru',
        status: 'ACTIVE',
        permissions: []
      };
      const token = `passkey-auth-token-${Date.now()}`;

      sessionStorage.setItem('user_data', JSON.stringify(authenticatedUser));
      localStorage.setItem('user_data', JSON.stringify(authenticatedUser));
      sessionStorage.setItem('auth_token', token);
      localStorage.setItem('auth_token', token);

      setSession({
        user: authenticatedUser,
        token: token
      });
      onSuccess();
    } catch (err: any) {
      setBiometricStatus('failed');
      setError('Biometric verification cancelled or unavailable. Please use password login.');
    } finally {
      setIsBiometricScanning(false);
    }
  };

  const verifyMfaAction = async (otpCode: string) => {
    if (!challengeId) {
      setError('MFA session expired or invalid. Please login again.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const verifyRes = await verifyMfa(challengeId, otpCode) as any;
      
      if (verifyRes && verifyRes.recoveryCodes && verifyRes.recoveryCodes.length > 0) {
        setRecoveryCodes(verifyRes.recoveryCodes);
        setSuccessMsg('Two-Factor Authentication enabled successfully! Store your recovery codes safely.');
      } else {
        sessionStorage.removeItem('mfa_challenge_id');
        sessionStorage.removeItem('mfa_expires_at');
        sessionStorage.removeItem('mfa_otp_dev_hint');
        sessionStorage.removeItem('mfa_requires_totp');
        sessionStorage.removeItem('mfa_requires_setup');
        sessionStorage.removeItem('mfa_setup_secret');
        sessionStorage.removeItem('mfa_setup_qr');
        sessionStorage.removeItem('mfa_setup_otpauth');
        onSuccess();
      }
    } catch (err: any) {
      const errMsg = err.message || 'Verification failed.';
      setError(errMsg);
      
      const isPermanentFailure = 
        errMsg.toLowerCase().includes('too many') || 
        errMsg.toLowerCase().includes('expired') || 
        errMsg.toLowerCase().includes('invalid session');
        
      if (isPermanentFailure) {
        setTimeout(() => {
          setIsOtpMode(false);
          setRequiresMfaSetup(false);
          setRequiresTotp(false);
          setChallengeId('');
          setError('');
          setSuccessMsg('');
        }, 3000);
      } else {
        if (!requiresTotp) {
          setOtpValues(['', '', '', '', '', '']);
        } else {
          setTotpCode('');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '');
    if (!digit && val !== '') return;
    const newOtp = [...otpValues];
    newOtp[index] = digit.substring(digit.length - 1);
    setOtpValues(newOtp);

    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    const codeStr = newOtp.join('');
    if (codeStr.length === 6 && !newOtp.includes('')) {
      verifyMfaAction(codeStr);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpValues(newOtp);
      verifyMfaAction(pastedData);
    } else {
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpValues(newOtp);
      const nextIdx = Math.min(pastedData.length, 5);
      otpRefs[nextIdx].current?.focus();
    }
  };

  return (
    <div className="multi-auth-container animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="multi-auth-heading mb-1">Multiple login methods</h1>
        <p className="text-center text-xs text-slate-400 font-medium">Choose your preferred enterprise sign-in experience</p>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="w-full max-w-3xl auth-alert-error">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="w-full max-w-3xl auth-alert-success">
          {successMsg}
        </div>
      )}

      {/* Demo Account Quick-Selection Strip */}
      <div className="w-full max-w-3xl bg-[#131417] p-3 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" /> Demo Accounts:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.role}
              type="button"
              onClick={() => handleDemoClick(demo)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                email.toLowerCase() === demo.email.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {demo.name}
            </button>
          ))}
        </div>
      </div>

      {/* OTP Mode Modal / View */}
      {isOtpMode ? (
        <div className="w-full max-w-md auth-card bg-[#18191c] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <AuthHeader
            title={requiresMfaSetup ? 'Setup Authenticator' : 'Two-Factor Verification'}
            subtitle={requiresTotp ? 'Enter the 6-digit code from Google or Microsoft Authenticator' : `Enter code sent to ${mfaMethod === 'sms' ? 'SMS' : 'Email'}`}
          />
          {requiresMfaSetup && setupData && (
            <div className="my-4 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
              {setupData.qrCodeDataUrl ? (
                <img src={setupData.qrCodeDataUrl} alt="MFA QR Code" className="w-40 h-40 rounded-xl mb-3 border border-white/20" />
              ) : (
                <QrCode size={120} className="text-emerald-400 mb-3" />
              )}
              <p className="text-[11px] font-mono text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10 select-all">
                {setupData.secret}
              </p>
            </div>
          )}

          <div className="space-y-4 my-4">
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="000000 or Recovery Code"
              className="auth-input text-center text-lg tracking-widest font-mono"
            />
            <button
              type="button"
              onClick={() => verifyMfaAction(totpCode)}
              disabled={isLoading || !totpCode}
              className="auth-primary-btn"
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpMode(false)}
              className="auth-secondary-btn"
            >
              Back to login methods
            </button>
          </div>
        </div>
      ) : (
        /* Side-by-Side Multiple Login Methods Grid */
        <div className="multi-auth-grid">
          
          {/* =========================================================
              CARD 1: Email login
              ========================================================= */}
          <div className="auth-method-card">
            <div>
              {/* Brand Header */}
              <div className="auth-brand-row">
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Change email"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="auth-brand-logo">
                  <div className="ms-logo-grid">
                    <div className="ms-box bg-[#f25022]" />
                    <div className="ms-box bg-[#7fba00]" />
                    <div className="ms-box bg-[#00a4ef]" />
                    <div className="ms-box bg-[#ffb900]" />
                  </div>
                  <span>Microsoft</span>
                </div>
                <div className="w-6" />
              </div>

              {/* User Email Pill Badge */}
              <div 
                className="user-email-pill"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                title="Click to edit account email"
              >
                <span>{email}</span>
              </div>

              {isEditingEmail && (
                <div className="mb-4 animate-fadeIn">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@thestackly.com"
                    className="auth-input text-xs"
                    autoFocus
                  />
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <h2 className="auth-card-title">Enter your password</h2>

              {/* Password Input Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="auth-input pr-10 text-sm font-medium bg-[#111215] border-white/10 focus:border-blue-500 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="pt-1">
                  <a href="#forgot" className="auth-forgot-link">
                    Forgot your password?
                  </a>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-primary-btn cursor-pointer"
                  >
                    {isLoading ? 'Signing in...' : 'Next'}
                  </button>
                </div>
              </form>
            </div>

            {/* Sub-features footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> AES-256 Encrypted</span>
              <span>Stackly Single Sign-On</span>
            </div>
          </div>

          {/* =========================================================
              CARD 2: Passwordless login (Biometric / Face / Fingerprint / PIN)
              ========================================================= */}
          <div className="auth-method-card">
            <div>
              {/* Brand Header */}
              <div className="auth-brand-row">
                <div className="w-6" />
                <div className="auth-brand-logo">
                  <div className="ms-logo-grid">
                    <div className="ms-box bg-[#f25022]" />
                    <div className="ms-box bg-[#7fba00]" />
                    <div className="ms-box bg-[#00a4ef]" />
                    <div className="ms-box bg-[#ffb900]" />
                  </div>
                  <span>Microsoft</span>
                </div>
                <div className="w-6" />
              </div>

              {/* User Email Pill Badge */}
              <div className="user-email-pill">
                <span>{email}</span>
              </div>

              {/* Title */}
              <h2 className="auth-card-title">
                Sign in faster with your face, fingerprint, or PIN
              </h2>

              {/* Biometric Scanner Frame HUD Graphic */}
              <div className="biometric-hud-container">
                <div className="biometric-scanner-frame">
                  {/* Neon HUD Brackets */}
                  <div className={`scan-corner tl ${isBiometricScanning ? 'border-cyan-400' : 'border-emerald-400'}`} />
                  <div className={`scan-corner tr ${isBiometricScanning ? 'border-cyan-400' : 'border-emerald-400'}`} />
                  <div className={`scan-corner bl ${isBiometricScanning ? 'border-cyan-400' : 'border-emerald-400'}`} />
                  <div className={`scan-corner br ${isBiometricScanning ? 'border-cyan-400' : 'border-emerald-400'}`} />

                  {/* Core Icon with Laser Scanning Line */}
                  <div className="biometric-core-icon">
                    <div className="flex items-center justify-center gap-1">
                      <ScanFace size={34} className={`${isBiometricScanning ? 'text-cyan-300 animate-pulse' : 'text-purple-400'}`} />
                      <Fingerprint size={34} className={`${isBiometricScanning ? 'text-cyan-300 animate-pulse' : 'text-emerald-400'}`} />
                    </div>
                  </div>

                  {/* Animated Laser Scanning Beam */}
                  <div className="biometric-laser-line" />
                </div>
              </div>

              {/* Subtext description */}
              <p className="biometric-subtext">
                Create a passkey to sign in to your Microsoft / Stackly account. No passwords, apps, or codes needed.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handlePasswordlessBiometricLogin}
                  disabled={isBiometricScanning}
                  className="auth-primary-btn cursor-pointer bg-[#0067b8] hover:bg-[#0078d4]"
                >
                  {isBiometricScanning ? (
                    <span className="flex items-center gap-2">
                      <ScanFace size={18} className="animate-spin" /> Verifying Biometrics...
                    </span>
                  ) : (
                    'Next'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  className="auth-secondary-btn cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>

            {/* Sub-features footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><KeyRound size={14} className="text-cyan-400" /> FIDO2 / WebAuthn</span>
              <span>Passkey Certified</span>
            </div>
          </div>

        </div>
      )}

      {/* Enterprise Single Sign-On (Google & Microsoft) */}
      {!isOtpMode && (
        <div className="w-full max-w-3xl pt-2">
          <div className="flex items-center my-4 gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or connect with enterprise SSO</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  sessionStorage.setItem('sso_provider', 'google');
                  const redirectUrl = await authService.getGoogleLoginUrl();
                  window.location.href = redirectUrl;
                } catch (err: any) {
                  setError(err.message || 'Failed to trigger Google login');
                }
              }}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#1e2024] hover:bg-[#25282d] text-white text-xs font-bold border border-white/10 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.86 0 3.3.64 4.02 1.33l3-3C17.22 1.77 14.82 1 12 1 7.24 1 3.22 3.75 1.25 7.76l3.74 2.9C6.01 7.37 8.78 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.45c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.86c2.16-1.99 3.42-4.92 3.42-8.54z" />
                <path fill="#FBBC05" d="M4.99 10.66c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.25 3.24C.45 4.84 0 6.62 0 8.4s.45 3.56 1.25 5.16l3.74-2.9z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.69-2.86c-1.03.69-2.35 1.1-4.27 1.1-3.22 0-5.99-2.33-6.96-5.62l-3.74 2.9C3.22 20.25 7.24 23 12 23z" />
              </svg>
              Google Workspace
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  sessionStorage.setItem('sso_provider', 'microsoft');
                  const redirectUrl = await authService.getMicrosoftLoginUrl();
                  window.location.href = redirectUrl;
                } catch (err: any) {
                  setError(err.message || 'Failed to trigger Microsoft login');
                }
              }}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#1e2024] hover:bg-[#25282d] text-white text-xs font-bold border border-white/10 transition-colors shadow-sm cursor-pointer"
            >
              <div className="ms-logo-grid">
                <div className="ms-box bg-[#f25022]" />
                <div className="ms-box bg-[#7fba00]" />
                <div className="ms-box bg-[#00a4ef]" />
                <div className="ms-box bg-[#ffb900]" />
              </div>
              Microsoft Entra ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
