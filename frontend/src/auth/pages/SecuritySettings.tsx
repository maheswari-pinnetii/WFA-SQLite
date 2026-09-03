import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Smartphone, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegisterPasskey = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user?.email || !user.name) {
        throw new Error('Your account profile is incomplete. Add a name and email before registering a passkey.');
      }
      await authService.registerPasskey(user.email, user.name);

      setSuccess('Passkey registered successfully! You can now use your device biometrics to sign in.');
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('cancel')) {
        setError('Passkey registration was cancelled or not allowed by the browser.');
      } else {
        setError(err.message || 'Unable to register passkey. Ensure your device supports WebAuthn.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn font-sans">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Security Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your authentication methods and passkeys.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Passkeys Panel */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Passkeys</h2>
              <p className="text-xs text-slate-500">Sign in securely with Fingerprint, Face ID, or PIN.</p>
            </div>
          </div>
          
          <button 
            onClick={handleRegisterPasskey}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Add a passkey'}
          </button>
        </div>

        {/* Password Panel */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Password</h2>
              <p className="text-xs text-slate-500">Update your account password.</p>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 bg-[var(--bg-tertiary)] hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] border border-[var(--border-color)] p-3 rounded-xl font-bold transition-colors">
            Change password
          </button>
        </div>
      </div>
      
      {/* Active Sessions */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-6 mt-6">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <Activity size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Active Sessions</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <Smartphone className="text-slate-400" />
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Current Device (Web Browser)</p>
                <p className="text-xs text-emerald-500 font-medium">Active now</p>
              </div>
            </div>
            <button className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg bg-red-500/10">
              Sign out
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecuritySettings;
