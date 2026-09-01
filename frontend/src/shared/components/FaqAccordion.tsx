import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Shield, Clock, BarChart3, Users } from 'lucide-react';

export interface FaqItem {
  id: string;
  category: 'general' | 'security' | 'attendance' | 'analytics';
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'How do role permissions work in Workforce Analytics?',
    answer: 'The platform utilizes Role-Based Access Control (RBAC) across 5 core tiers: Admin, HR Manager, Department Manager, Team Lead, and Employee. Each role has strictly scoped data visibility and operation permissions.'
  },
  {
    id: 'faq-2',
    category: 'security',
    question: 'How do I set up Multi-Factor Authentication (MFA / TOTP)?',
    answer: 'Navigate to your Profile -> Security tab, click "Enable MFA", and scan the generated QR code using Google Authenticator, Microsoft Authenticator, or 1Password. Enter the 6-digit TOTP code to confirm.'
  },
  {
    id: 'faq-3',
    category: 'attendance',
    question: 'What happens if I forget to check - in or check - out on time?',
    answer: 'You can submit an Attendance Correction request under the Attendance section. Your designated Team Lead or Department Manager will receive an automated approval task to verify your punch.'
  },
  {
    id: 'faq-4',
    category: 'attendance',
    question: 'How does geofencing validation work for physical office check-ins?',
    answer: 'When checking in from an onsite work location, the system verifies your device coordinates against the predefined radius (100m default) configured for your assigned office branch.'
  },
  {
    id: 'faq-5',
    category: 'analytics',
    question: 'Can I export attendance and productivity reports to CSV or PDF?',
    answer: 'Yes! Authorized HR Specialists and Managers can use the "Export Report" feature located on any analytics dashboard to download aggregated datasets in CSV, Excel, or PDF format.'
  },
  {
    id: 'faq-6',
    category: 'security',
    question: 'What should I do if my account is temporarily locked due to failed logins?',
    answer: 'Accounts are locked for 15 minutes after 5 consecutive failed login attempts to prevent brute force attacks. You can wait for the cooldown timer or contact your IT Admin to unlock it immediately.'
  }
];

export const FaqAccordion: React.FC<{ faqs?: FaqItem[]; className?: string }> = ({
  faqs = DEFAULT_FAQS,
  className = ''
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: 'all', label: 'All Questions', icon: <HelpCircle size={14} /> },
    { id: 'general', label: 'General', icon: <Users size={14} /> },
    { id: 'security', label: 'Security & MFA', icon: <Shield size={14} /> },
    { id: 'attendance', label: 'Attendance', icon: <Clock size={14} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics, MFA, attendance..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 placeholder-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No matching FAQ articles found for "{search}".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/40 bg-[var(--bg-secondary)]/30 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FaqAccordion;
