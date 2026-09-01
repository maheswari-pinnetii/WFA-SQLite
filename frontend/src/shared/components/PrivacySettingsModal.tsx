import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Download, Trash2, X, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';

export interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({ isOpen, onClose }) => {
  const [essential] = useState(true); // Always required
  const [analytics, setAnalytics] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const consent = JSON.parse(localStorage.getItem('privacy_consent_preferences') || '{}');
    if (consent.analytics !== undefined) setAnalytics(consent.analytics);
    if (consent.telemetry !== undefined) setTelemetry(consent.telemetry);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(
      'privacy_consent_preferences',
      JSON.stringify({ essential: true, analytics, telemetry, updatedAt: new Date().toISOString() })
    );
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleExportData = () => {
    const data = {
      userData: JSON.parse(localStorage.getItem('user') || '{}'),
      tokenFamily: 'Active Session',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stackly-privacy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100 space-y-4"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Privacy & Data Governance</h3>
              <p className="text-xs text-slate-400">Configure your privacy preferences and download your data.</p>
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <Lock size={14} className="text-emerald-400" />
                  <span>Essential Security Cookies</span>
                </div>
                <p className="text-[11px] text-slate-400">Required for authentication, CSRF defense, and session persistence.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">Always Active</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-sm text-white">Performance & Analytics</span>
                <p className="text-[11px] text-slate-400">Enables anonymous usage telemetry to optimize attendance query speeds.</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-sm text-white">Crash Reporting Stream</span>
                <p className="text-[11px] text-slate-400">Automatically uploads isolated UI rendering exceptions for quick resolution.</p>
              </div>
              <Switch checked={telemetry} onCheckedChange={setTelemetry} />
            </div>
          </div>

          {/* Data Export Button */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-200">Export Personal Data Record</span>
              <p className="text-[10px] text-slate-500">Download a full JSON archive of your profile.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={13} className="mr-1.5" /> Download JSON
            </Button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gradient" size="sm" onClick={handleSave}>
              {saved ? (
                <>
                  <CheckCircle2 size={14} className="mr-1.5 text-emerald-300" /> Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
