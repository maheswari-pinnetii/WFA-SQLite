import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { ROLE_HOME_PATHS } from '../../security/roles/roles';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [authenticatedRole, setAuthenticatedRole] = useState<string | null>(null);
  const [loadingMethod, setLoadingMethod] = useState<'password' | 'passkey' | 'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMethod('password');
    setError(null);

    try {
      const result = await login(email, password);
      setAuthenticatedRole(result.user.role);
      setCurrentStep(2);
    } catch (err: any) {
      setError('Email or password is incorrect.');
    } finally {
      setLoadingMethod(null);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoadingMethod('passkey');
    setError(null);
    
    try {
      const result = await authService.passkeyLogin(email || undefined);
      navigate(ROLE_HOME_PATHS[result.user.role as keyof typeof ROLE_HOME_PATHS] || '/employee/dashboard', { replace: true });
    } catch (err: any) {
      if (err.message?.includes('cancel')) {
        setError('Passkey sign-in was cancelled.');
      } else {
        setError("Passkey sign-in isn't available on this device or browser.");
      }
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoadingMethod(provider === 'google' ? 'google' : 'microsoft');
    setError(null);
    try {
      const url = provider === 'google'
        ? await authService.getGoogleLoginUrl()
        : await authService.getMicrosoftLoginUrl();
      window.location.assign(url);
    } catch (err: any) {
      setError('Unable to complete sign-in. Please try again.');
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] font-sans">
      
      {/* LEFT: Brand / Product Identity */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <ShieldCheck size={28} className="text-blue-500" />
            <span className="text-2xl font-bold tracking-tight">Stackly WFA</span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
            WORKFORCE <br/><span className="text-blue-500">ANALYTICS</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-md">
            Secure access to your workforce operations.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Stackly Global Enterprise Inc.
        </div>
        
        {/* Subtle visual */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* RIGHT: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Welcome back</h2>
            <p className="text-slate-500 text-sm font-medium">
              Step {currentStep} of 2: {currentStep === 1 ? 'Password' : 'Passwordless'}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              {error}
            </div>
          )}

          {currentStep === 2 && <div className="space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Secure your sign-in</h3>
            <button
              onClick={handlePasskeyLogin}
              disabled={loadingMethod !== null}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMethod === 'passkey' ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound size={20} />
              )}
              {loadingMethod === 'passkey' ? 'Authenticating with passkey...' : 'Sign in with a passkey'}
            </button>
            <p className="text-xs text-center text-slate-500 px-4">
              Use your fingerprint, Face ID, Windows Hello, device PIN, or security key.
            </p>
            <button type="button" onClick={() => setCurrentStep(1)} className="w-full text-sm font-semibold text-blue-500 hover:underline">
              Use password instead
            </button>
            <button
              type="button"
              onClick={() => navigate(ROLE_HOME_PATHS[authenticatedRole as keyof typeof ROLE_HOME_PATHS] || '/employee/dashboard', { replace: true })}
              className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Continue with password only
            </button>
          </div>}

          {currentStep === 1 && <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-[var(--border-color)]"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold uppercase text-slate-400">or</span>
            <div className="flex-grow border-t border-[var(--border-color)]"></div>
          </div>}

          {/* Secondary Method: Password */}
          {currentStep === 1 && <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Password</label>
                <a href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600">
                  Forgot password?
                </a>
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loadingMethod !== null}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 p-3 rounded-xl font-bold transition-opacity disabled:opacity-50"
            >
              {loadingMethod === 'password' ? 'Checking credentials...' : 'Continue'}
            </button>
          </form>}

          {currentStep === 1 && <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-[var(--border-color)]"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold uppercase text-slate-400">or</span>
            <div className="flex-grow border-t border-[var(--border-color)]"></div>
          </div>}

          {/* OAuth Providers */}
          {currentStep === 1 && <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loadingMethod !== null}
              className="flex items-center justify-center gap-2 p-2.5 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-bold text-[var(--text-primary)]"
            >
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleOAuthLogin('azure')}
              disabled={loadingMethod !== null}
              className="flex items-center justify-center gap-2 p-2.5 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-bold text-[var(--text-primary)]"
            >
              Microsoft
            </button>
          </div>}

          <p className="text-center text-sm font-medium text-slate-500 pt-4">
            Don't have an account? <a href="/signup" className="text-blue-500 font-bold hover:underline">Create account</a>
          </p>

          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Security:</strong> Your authentication credentials and device biometrics remain protected by your authentication provider and device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
