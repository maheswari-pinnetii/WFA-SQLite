import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import '../styles/ModernAuth.css';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('No verification token provided in the URL.');
        }
        return;
      }

      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Verification failed. The token may be expired or invalid.');
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="auth-page-wrapper">
      <main className="auth-single-container" style={{ textAlign: 'center' }}>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <h1 className="text-xl font-bold text-slate-100">Verifying your email...</h1>
            <p className="text-sm text-slate-400 mt-2">Please wait while we validate your secure token.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle size={32} color="#fff" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Email Verified</h1>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
              Your email address has been successfully verified. Your account is now fully active.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full sm:w-auto">
              Continue to Login <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
              <XCircle size={32} color="#fff" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Verification Failed</h1>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
              {errorMessage}
            </p>
            <Button onClick={() => navigate('/login')} variant="outline" className="w-full sm:w-auto">
              Return to Login
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};

// Temporary inline Button component if shared one is missing from imports
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 shadow-lg shadow-emerald-900/20",
    outline: "bg-transparent text-slate-300 border border-slate-700 hover:bg-slate-800 focus:ring-slate-500"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
