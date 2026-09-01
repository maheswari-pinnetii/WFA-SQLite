import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowLeft, Shield, Clock, Users, BarChart3, X, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';

export interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
}

const STEPS = [
  {
    title: 'Welcome to Stackly WFA',
    description: 'Your intelligent enterprise workforce analytics & attendance command platform.',
    icon: <Sparkles size={32} className="text-blue-400" />,
    badge: 'Step 1 of 4: Introduction',
    features: [
      'Real-time live attendance check-ins & shift tracking',
      'Encrypted TOTP 2-Factor Authentication & Zero-Trust security',
      'Interactive workforce distribution & skill matrix analytics'
    ]
  },
  {
    title: 'Marking Attendance & Shifts',
    description: 'Easily check in from approved office locations or remote designated zones.',
    icon: <Clock size={32} className="text-emerald-400" />,
    badge: 'Step 2 of 4: Attendance',
    features: [
      'One-click "Check - In Now" with automatic geofence radius check',
      'Seamless break & resume session control',
      'Submit correction requests if you miss a punch'
    ]
  },
  {
    title: 'Team & Leave Management',
    description: 'Streamlined approval workflows and real-time team availability roster.',
    icon: <Users size={32} className="text-purple-400" />,
    badge: 'Step 3 of 4: Collaboration',
    features: [
      'Submit PTO, sick leave, and casual leave with real-time balance',
      'Team Lead & Manager automated approval queues',
      'Organization directory with 500+ employee records'
    ]
  },
  {
    title: 'Analytics & Insights Hub',
    description: 'Deep workforce metrics, attendance compliance, and productivity charts.',
    icon: <BarChart3 size={32} className="text-amber-400" />,
    badge: 'Step 4 of 4: Analytics',
    features: [
      'Interactive department headcount & retention trends',
      'Executive KPI summaries with exportable CSV audit logs',
      'Instant keyboard shortcuts (Press Ctrl+K anywhere)'
    ]
  }
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  userName = 'Employee',
  userRole = 'EMPLOYEE'
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('has_completed_onboarding', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('has_completed_onboarding', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              {step.badge}
            </span>
          </div>

          {/* Step Icon & Title */}
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
            </div>
          </div>

          {/* Feature List */}
          <div className="my-5 space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {step.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft size={14} className="mr-1" /> Back
                </Button>
              )}
              <Button variant="gradient" size="sm" onClick={handleNext}>
                {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
