import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { authService } from '../services/auth.service';

export const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usePasskey, setUsePasskey] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!usePasskey && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    if (!usePasskey && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await authService.signup({ fullName, email, password: usePasskey ? undefined : password });
      if (usePasskey) {
        await authService.registerPasskey(email, fullName);
        setSuccess('Account created and passkey registered.');
        navigate('/employee/dashboard', { replace: true });
      } else {
        setSuccess('Account created successfully. You can now sign in.');
        setTimeout(() => navigate('/login', { replace: true }), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
            JOIN THE <br/><span className="text-blue-500">WORKFORCE</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-md">
            Secure access to your enterprise operations.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Stackly Global Enterprise Inc.
        </div>
        
        {/* Subtle visual */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* RIGHT: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Create an account</h2>
            <p className="text-slate-500 text-sm font-medium">
              Register for your enterprise workspace.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5">✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-secondary)]">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] p-3 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={usePasskey} onChange={(e) => setUsePasskey(e.target.checked)} className="mt-1 accent-blue-600" />
              <span><strong className="text-[var(--text-primary)]">Use a passkey on this device</strong><br />Fingerprint, Face ID, Windows Hello, or a security key.</span>
            </label>

            <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-secondary)]">Work Email</label>
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
              <label className="text-sm font-bold text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required={!usePasskey}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-secondary)]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required={!usePasskey}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500 pt-4">
            Already have an account? <a href="/login" className="text-blue-500 font-bold hover:underline">Sign in</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
