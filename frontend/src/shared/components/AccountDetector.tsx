import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface AccountDetectorProps {
  email: string;
}

export const AccountDetector: React.FC<AccountDetectorProps> = ({ email }) => {
  const isCorporate = email.includes('@thestackly.com') || email.includes('@company.com');
  const domain = email.split('@')[1] || '';

  if (!email || !email.includes('@')) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border transition-all ${
          isCorporate
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          {isCorporate ? (
            <Building2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck size={16} className="text-slate-500 shrink-0" />
          )}
          <span>
            {isCorporate
              ? `Stackly Enterprise SSO & TOTP Enabled (${domain})`
              : `Domain: ${domain || 'Identifying provider...'}`}
          </span>
        </div>

        {isCorporate && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 size={10} /> Verified Tenant
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
