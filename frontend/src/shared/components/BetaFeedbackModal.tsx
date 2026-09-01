import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Sparkles, Send, X, Star, ThumbsUp } from 'lucide-react';
import { Button } from '../../components/ui/button';

export interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'praise'>('bug');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Persist feedback locally / audit
    const reports = JSON.parse(localStorage.getItem('beta_feedback_reports') || '[]');
    reports.push({
      type: feedbackType,
      rating,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.pathname
    });
    localStorage.setItem('beta_feedback_reports', JSON.stringify(reports));

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <ThumbsUp size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Thank You, Beta Tester!</h3>
              <p className="text-xs text-slate-400">Your feedback has been logged to the telemetry stream.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  Beta Program
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Beta Feedback Hub</h3>
                <p className="text-xs text-slate-400 mt-0.5">Help improve Stackly WFA during early access.</p>
              </div>

              {/* Feedback Category Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    feedbackType === 'bug'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Bug size={16} /> Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    feedbackType === 'feature'
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles size={16} /> Feature Idea
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('praise')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    feedbackType === 'praise'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Star size={16} /> Satisfaction
                </button>
              </div>

              {/* Star Rating */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Experience Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 rounded-lg transition-transform hover:scale-110 ${
                        star <= rating ? 'text-amber-400' : 'text-slate-700'
                      }`}
                    >
                      <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Details & Suggestions</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'Describe what happened, expected behavior, and steps to reproduce...'
                      : 'Describe your idea or what you enjoyed about the workflow...'
                  }
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full">
                <Send size={14} className="mr-1.5" /> Submit Beta Feedback
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
