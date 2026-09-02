import React, { useEffect, useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  Info, 
  Trash2, 
  Send, 
  ChevronRight, 
  Award,
  CalendarDays,
  Briefcase,
  Search,
  Check,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { 
  absenceService, 
  LEAVE_TYPE_CONFIGS, 
  HOLIDAYS_2026, 
  LEAVE_POLICY_RULES, 
  INITIAL_SAMPLE_REQUESTS
} from '../absence/absence.service';
import { 
  LeaveDurationType, 
  LeaveRequestStatus, 
  LeaveTypeConfig, 
  HolidayItem, 
  LeaveRecord
} from '../absence/absence.types';

export const AbsenceManagementPage: React.FC = () => {
  const { user } = useAuth();
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'history' | 'holidays' | 'policy'>('overview');

  // Client-side mock state (Pure frontend data, zero backend dependency)
  const [requests, setRequests] = useState<LeaveRecord[]>(INITIAL_SAMPLE_REQUESTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveRequestStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [holidayMonthFilter, setHolidayMonthFilter] = useState('ALL');

  // Leave Form state
  const [formType, setFormType] = useState<string>('Casual Leave');
  const [formDuration, setFormDuration] = useState<LeaveDurationType>('FULL_DAY');
  const [formStartDate, setFormStartDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formCompOffDate, setFormCompOffDate] = useState<string>('');
  const [formReason, setFormReason] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelModalItem, setCancelModalItem] = useState<LeaveRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadRequests = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setRequests(prev => (prev.length > 0 ? prev : INITIAL_SAMPLE_REQUESTS));
      setIsLoading(false);
    }, 200);
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  // Computed balances
  const balances = useMemo(() => {
    return absenceService.computeLeaveBalances(requests);
  }, [requests]);

  const totalAvailableDays = useMemo(() => {
    return balances.reduce((sum, b) => (b.code !== 'LWP' && b.code !== 'ML' ? sum + b.available : sum), 0);
  }, [balances]);

  const totalUsedDays = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.used, 0);
  }, [balances]);

  const pendingRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'PENDING').length;
  }, [requests]);

  // Selected leave type config
  const selectedTypeConfig = useMemo(() => {
    return LEAVE_TYPE_CONFIGS.find(c => c.name === formType) || LEAVE_TYPE_CONFIGS[0];
  }, [formType]);

  // Selected type balance
  const selectedTypeBalance = useMemo(() => {
    return balances.find(b => b.leaveTypeName === formType);
  }, [balances, formType]);

  // Auto-calculated working days
  const calculatedDays = useMemo(() => {
    if (!formStartDate || !formEndDate) return 0;
    return absenceService.calculateWorkingDays(formStartDate, formEndDate, formDuration);
  }, [formStartDate, formEndDate, formDuration]);

  // Next upcoming holiday
  const nextHoliday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = HOLIDAYS_2026.filter(h => h.date >= todayStr);
    return upcoming.length > 0 ? upcoming[0] : HOLIDAYS_2026[0];
  }, []);

  // Filtered requests history
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesSearch = !searchQuery || 
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.startDate.includes(searchQuery) ||
        r.endDate.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  // Filtered holidays
  const filteredHolidays = useMemo(() => {
    if (holidayMonthFilter === 'ALL') return HOLIDAYS_2026;
    return HOLIDAYS_2026.filter(h => {
      const monthNum = parseInt(h.date.split('-')[1], 10).toString();
      return monthNum === holidayMonthFilter;
    });
  }, [holidayMonthFilter]);

  // Form Submission Handler
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    if (!formStartDate || !formEndDate) {
      setFormValidationError('Please select both start and end dates.');
      return;
    }

    if (new Date(formEndDate) < new Date(formStartDate)) {
      setFormValidationError('End date cannot be earlier than start date.');
      return;
    }

    if (!formReason.trim()) {
      setFormValidationError('Please provide a reason for the leave request.');
      return;
    }

    if (formType === 'Compensatory Off' && !formCompOffDate) {
      setFormValidationError('Please specify the date of weekend/holiday worked for Comp-Off.');
      return;
    }

    // Check balance if paid leave
    if (selectedTypeBalance && selectedTypeConfig.paid && selectedTypeConfig.code !== 'ML' && selectedTypeConfig.code !== 'PL-PAT') {
      if (calculatedDays > selectedTypeBalance.available) {
        setFormValidationError(`Requested ${calculatedDays} days exceeds your available ${selectedTypeBalance.available} days of ${formType}.`);
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const reasonWithMetadata = formDuration !== 'FULL_DAY'
        ? `[${formDuration === 'FIRST_HALF' ? 'First Half (0.5d)' : 'Second Half (0.5d)'}] ${formReason.trim()}`
        : formType === 'Compensatory Off' && formCompOffDate
        ? `[Comp-Off for worked date: ${formCompOffDate}] ${formReason.trim()}`
        : formReason.trim();

      const newRecord: LeaveRecord = {
        id: `leave-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
        employeeId: user?.id || 'usr-emp-01',
        employeeName: user?.name || 'Maheswari P',
        department: user?.department || 'Engineering',
        team: user?.team || 'Frontend Platform',
        type: formType,
        startDate: formStartDate,
        endDate: formEndDate,
        reason: reasonWithMetadata,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      // Update state locally for immediate feedback
      setRequests(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
      
      showToast(`Leave request for ${calculatedDays} day(s) submitted successfully!`, 'success');
      setFormReason('');
      setFormStartDate('');
      setFormEndDate('');
      setFormCompOffDate('');
      setFormDuration('FULL_DAY');
      setActiveTab('history');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit leave request.';
      setFormValidationError(msg);
      showToast(msg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Leave Cancellation Handler
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setIsCancelling(true);
    try {
      // Simulate/perform cancellation
      setRequests(prev => prev.map(r => r.id === cancelModalItem.id ? { ...r, status: 'CANCELLED' as any } : r));
      showToast(`Leave request for ${cancelModalItem.type} (${cancelModalItem.startDate}) has been cancelled.`, 'success');
      setCancelModalItem(null);
    } catch (err) {
      showToast('Failed to cancel leave request.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold transition-all duration-300 animate-slideUp ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' 
            : toastMessage.type === 'error'
            ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
            : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #022c22 100%)',
          borderColor: 'rgba(52, 211, 153, 0.35)' 
        }} 
        className="p-6 lg:p-8 rounded-3xl border text-white shadow-2xl relative overflow-hidden flex flex-col justify-between gap-4"
      >
        {/* Subtle decorative glow overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2.5 z-10">
          <div 
            style={{ display: 'inline-flex', width: 'fit-content', color: '#a7f3d0' }} 
            className="items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 text-xs font-bold backdrop-blur-md border border-emerald-400/50 shadow-sm"
          >
            <Sparkles size={14} className="text-emerald-400 shrink-0" /> 
            <span className="text-emerald-200 font-bold">Stackly Absence Management Suite</span>
          </div>

          <h1 
            style={{ color: '#ffffff' }} 
            className="text-2xl lg:text-3xl font-black tracking-tight drop-shadow-md"
          >
            Leave & Time-Off Command Center
          </h1>

          <p 
            style={{ color: '#e2e8f0' }} 
            className="text-xs max-w-2xl font-medium leading-relaxed drop-shadow-sm opacity-95"
          >
            Manage your annual PTO balances, submit full/half-day leave requests, coordinate with peer team schedules, and explore the 2026 holiday calendar.
          </p>
        </div>
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between shadow-xl">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider whitespace-nowrap block">Available PTO</span>
            <p className="text-2xl font-black text-emerald-500">{totalAvailableDays} <span className="text-xs font-semibold text-[var(--text-muted)]">Days</span></p>
            <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">Standard paid allowances</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 ml-3">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between shadow-xl">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider whitespace-nowrap block">Leaves Taken</span>
            <p className="text-2xl font-black text-blue-500">{totalUsedDays} <span className="text-xs font-semibold text-[var(--text-muted)]">Days</span></p>
            <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">Calendar year 2026</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 ml-3">
            <CalendarDays size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between shadow-xl">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider whitespace-nowrap block">Pending Approvals</span>
            <p className="text-2xl font-black text-amber-500">{pendingRequestsCount} <span className="text-xs font-semibold text-[var(--text-muted)]">Requests</span></p>
            <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">Waiting for approval</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 ml-3">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between shadow-xl">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider whitespace-nowrap block">Next Holiday</span>
            <p className="text-sm font-black text-[var(--text-primary)] truncate max-w-[140px]">{nextHoliday.name}</p>
            <p className="text-[11px] text-purple-400 font-bold whitespace-nowrap">{nextHoliday.date} ({nextHoliday.dayOfWeek})</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 ml-3">
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[var(--border-color)] pb-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Layers size={15} /> Leave Balances & Overview
        </button>

        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'apply'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Plus size={15} /> Apply For Leave
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <FileText size={15} /> My Requests & History {pendingRequestsCount > 0 && <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">{pendingRequestsCount}</span>}
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'holidays'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Calendar size={15} /> 2026 Holiday Schedule
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'policy'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Info size={15} /> Policy Guidelines
        </button>
      </div>

      {/* Global Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadRequests}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & LEAVE BALANCES */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Detailed Balances Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={18} className="text-emerald-500" /> Your Entitled Leave Balances (CY 2026)
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-medium">Updated real-time with pending requests</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="glass-panel p-5 rounded-2xl h-36 animate-pulse bg-[var(--bg-tertiary)]/50"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances.map(b => {
                  const percentUsed = b.totalQuota > 0 ? Math.min(100, Math.round((b.used / b.totalQuota) * 100)) : 0;
                  return (
                    <div 
                      key={b.leaveTypeId}
                      className="glass-panel p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/40 transition-all shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-[var(--text-primary)]">{b.leaveTypeName}</span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            {b.code}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-black text-[var(--text-primary)]">{b.available}</span>
                            <span className="text-xs text-[var(--text-muted)] font-semibold ml-1">/ {b.totalQuota} Days</span>
                          </div>
                          <span className="text-xs font-bold text-[var(--text-secondary)]">{b.available} Available</span>
                        </div>

                        {/* Progress Meter */}
                        <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]/50">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${100 - percentUsed}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>Used: <strong className="text-[var(--text-primary)]">{b.used}d</strong></span>
                        {b.pending > 0 && <span className="text-amber-400 font-semibold">Pending: {b.pending}d</span>}
                        <button 
                          onClick={() => {
                            setFormType(b.leaveTypeName);
                            setActiveTab('apply');
                          }}
                          className="text-emerald-500 hover:text-emerald-400 font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          Apply <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info & Upcoming Leaves Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Leave Requests List */}
            <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Recent Leave Activity
                </h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  View All ({requests.length})
                </button>
              </div>

              {isLoading ? (
                <p className="text-xs text-[var(--text-muted)] py-4">Loading leave records...</p>
              ) : requests.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">No leave requests submitted yet.</p>
                  <button 
                    onClick={() => setActiveTab('apply')} 
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Apply for Time-Off
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 4).map(req => (
                    <div 
                      key={req.id} 
                      className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)]">{req.type}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            req.status === 'CANCELLED' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">{req.startDate} to {req.endDate}</p>
                      </div>

                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => setCancelModalItem(req)}
                          className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming 2026 Holidays Widget */}
            <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar size={18} className="text-purple-500" /> Upcoming 2026 Holidays
                </h3>
                <button 
                  onClick={() => setActiveTab('holidays')}
                  className="text-xs text-purple-400 hover:underline font-bold cursor-pointer"
                >
                  Full Holiday Calendar
                </button>
              </div>

              <div className="space-y-3">
                {HOLIDAYS_2026.slice(0, 3).map(h => (
                  <div key={h.id} className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)] flex items-center justify-between text-xs hover:border-purple-500/30 transition-all">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[var(--text-primary)]">{h.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {h.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">{h.dayOfWeek}</p>
                    </div>
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      {h.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLY FOR LEAVE (INDUSTRY-LEVEL ENTERPRISE DESIGN) */}
      {/* ========================================================================= */}
      {activeTab === 'apply' && (
        <div className="w-full max-w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
            
            {/* Left Column: Clean Enterprise Form (8 Columns) */}
            <div className="lg:col-span-7 xl:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-6 w-full min-w-0 overflow-hidden">
              
              {/* Form Header */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                    <Plus size={22} className="text-emerald-500" /> Apply For Time-Off
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Self-Service
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                  Submit your absence request. Statutory weekends & national holidays are automatically exempt from paid quotas.
                </p>
              </div>

              {/* Error Banner */}
              {formValidationError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <form onSubmit={handleLeaveSubmit} className="space-y-5">
                
                {/* 1. Leave Type Selection (All Leave Types with Scrollbar) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      1. Select Leave Category & Type ({LEAVE_TYPE_CONFIGS.length} Types Available) <span className="text-rose-400">*</span>
                    </label>
                    {selectedTypeBalance && (
                      <span className="text-[11px] font-bold text-emerald-500">
                        Balance: <strong>{selectedTypeBalance.available} Days Available</strong>
                      </span>
                    )}
                  </div>

                  {/* Scrollable Container with All 9 Leave Types */}
                  <div className="max-h-[210px] overflow-y-auto pr-1.5 space-y-2 rounded-2xl border border-[var(--border-color)]/70 bg-[var(--bg-tertiary)]/20 p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {LEAVE_TYPE_CONFIGS.map(c => {
                        const balance = balances.find(b => b.leaveTypeName === c.name);
                        const isSelected = formType === c.name;
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => setFormType(c.name)}
                            className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-xl ring-2 ring-emerald-400 transform -translate-y-0.5'
                                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-emerald-500/50 hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5 gap-2">
                              <span className={`font-extrabold text-xs truncate max-w-[130px] ${isSelected ? 'text-white font-black' : 'text-[var(--text-primary)]'}`}>
                                {c.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono border ${
                                  isSelected 
                                    ? 'bg-white/20 text-white border-white/40' 
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]'
                                }`}>
                                  {c.code}
                                </span>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black shadow-sm">
                                    <Check size={11} strokeWidth={3.5} />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] mt-1 pt-1.5 border-t border-white/15">
                              <span className={`font-semibold ${
                                isSelected ? 'text-emerald-100' : (c.paid ? 'text-emerald-400' : 'text-amber-400')
                              }`}>
                                {c.paid ? 'Paid Leave' : 'Unpaid'}
                              </span>
                              <span className={`font-mono font-bold ${
                                isSelected ? 'text-white font-extrabold text-[11px]' : 'text-emerald-500'
                              }`}>
                                {balance?.available ?? c.annualQuota}d left
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Duration Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    2. Duration Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormDuration('FULL_DAY')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formDuration === 'FULL_DAY'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-[var(--bg-tertiary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      Full Day
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDuration('FIRST_HALF')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formDuration === 'FIRST_HALF'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-[var(--bg-tertiary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      1st Half (0.5d)
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDuration('SECOND_HALF')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formDuration === 'SECOND_HALF'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-[var(--bg-tertiary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      2nd Half (0.5d)
                    </button>
                  </div>
                </div>

                {/* 3. Date Range Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    3. Select Absence Schedule <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] font-semibold block mb-1">From Date</span>
                      <input
                        type="date"
                        required
                        value={formStartDate}
                        onChange={(e) => {
                          setFormStartDate(e.target.value);
                          if (formDuration !== 'FULL_DAY') setFormEndDate(e.target.value);
                        }}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] font-semibold block mb-1">To Date</span>
                      <input
                        type="date"
                        required
                        disabled={formDuration !== 'FULL_DAY'}
                        value={formDuration !== 'FULL_DAY' ? formStartDate : formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:opacity-50 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Contextual Box: Comp-off worked date */}
                {formType === 'Compensatory Off' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-amber-300">
                      Date of Weekend / Public Holiday Worked <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formCompOffDate}
                      onChange={(e) => setFormCompOffDate(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-amber-500/40 text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <p className="text-[11px] text-amber-200/80">
                      Comp-off must be availed within 60 days of the overtime date worked.
                    </p>
                  </div>
                )}

                {/* Contextual Box: Leave Without Pay */}
                {formType === 'Leave Without Pay' && (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <ShieldAlert size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold mb-0.5">Leave Without Pay (LWP) Advisory</h5>
                      <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                        LWP will reflect as an uncompensated absence during monthly payroll calculations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Contextual Box: Document Proof */}
                {selectedTypeConfig.requiresDocument && selectedTypeConfig.documentNotice && (
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)]/60 border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <Info size={16} className="text-blue-400 shrink-0" />
                    <span>{selectedTypeConfig.documentNotice}</span>
                  </div>
                )}

                {/* 4. Reason Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    4. Reason for Absence <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Briefly describe the reason for your time-off request..."
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium leading-relaxed"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormReason('');
                      setFormStartDate('');
                      setFormEndDate('');
                      setFormCompOffDate('');
                      setActiveTab('overview');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    Reset & Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formSubmitting || calculatedDays <= 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Submit Leave Request
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Live Projection & Approver Summary (4-5 Columns) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4 w-full min-w-0">
              
              {/* Card 1: Live Leave Calculator */}
              <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                    <Layers size={16} className="text-emerald-500" /> Leave Balance Impact
                  </h3>
                  <span className="font-mono text-[10px] font-bold bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-md border border-[var(--border-color)] text-[var(--text-muted)]">
                    {selectedTypeConfig.code}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/60">
                    <span className="text-[var(--text-muted)] font-medium">Selected Category</span>
                    <strong className="text-[var(--text-primary)]">{selectedTypeConfig.name}</strong>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/60">
                    <span className="text-[var(--text-muted)] font-medium">Current Available</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {selectedTypeBalance?.available ?? selectedTypeConfig.annualQuota} Days
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/60 bg-emerald-500/10 px-2 rounded-lg text-emerald-400">
                    <span className="font-bold">Days to Deduct</span>
                    <span className="font-mono font-black text-sm">{calculatedDays} Day(s)</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/60">
                    <span className="text-[var(--text-muted)] font-medium">Balance After Request</span>
                    <span className="font-mono font-bold text-blue-400">
                      {Math.max(0, (selectedTypeBalance?.available ?? selectedTypeConfig.annualQuota) - calculatedDays)} Days
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)]/80 text-[11px] text-[var(--text-muted)] space-y-1">
                  <p className="font-bold text-[var(--text-secondary)]">📅 Calculation Rule</p>
                  <p className="leading-relaxed">
                    Saturdays, Sundays, and public holidays in 2026 are automatically excluded from working day deductions.
                  </p>
                </div>
              </div>

              {/* Card 2: Approval Route Preview */}
              <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-3 w-full min-w-0">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> Approval Routing Flow
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</div>
                    <span>Team Lead / Shift Supervisor</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</div>
                    <span>Department Manager (Engineering)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</div>
                    <span>HR Operations Sync & Attendance Update</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY REQUESTS & HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* Header Controls & Filter Pills */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input with Proper Padding & Icon Centering */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search size={15} />
              </div>
              <input
                type="text"
                placeholder="Search by type, date or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl pr-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold transition-all"
              />
            </div>
          </div>

          {/* Request Table / List */}
          <div className="glass-panel rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
            
            {isLoading ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-3">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading your leave records...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                  <FileText size={28} />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-base font-extrabold text-[var(--text-primary)]">No Leave Requests Found</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {searchQuery || statusFilter !== 'ALL'
                      ? 'No requests match your current filters. Try resetting the search query or status filter.'
                      : 'You have not submitted any leave requests yet. Click below to submit your first leave application.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearchQuery('');
                    setActiveTab('apply');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Apply For Leave
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-[130px]">Request ID</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Duration & Dates</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Reviewer</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/80">
                    {filteredRequests.map(r => (
                      <tr key={r.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[var(--text-muted)]">{r.id.slice(0, 12)}...</td>
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{r.type}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.startDate}</span>
                          <span className="text-[var(--text-muted)] mx-1">to</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.endDate}</span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] font-medium max-w-[220px] truncate" title={r.reason}>
                          {r.reason}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                            r.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                            r.status === 'CANCELLED' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                            'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {r.reviewedBy ? (
                            <div>
                              <p className="font-bold text-[var(--text-secondary)]">{r.reviewedBy}</p>
                              {r.reviewComment && <p className="text-[10px] italic">"{r.reviewComment}"</p>}
                            </div>
                          ) : (
                            <span className="italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.status === 'PENDING' ? (
                            <button
                              onClick={() => setCancelModalItem(r)}
                              className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)] font-semibold">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 2026 HOLIDAY SCHEDULE */}
      {/* ========================================================================= */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-500" /> Official Holiday Calendar (Year 2026)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Statutory public holidays, national celebrations, and optional restricted cultural days.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold">Filter Month:</span>
                <select
                  value={holidayMonthFilter}
                  onChange={(e) => setHolidayMonthFilter(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="ALL">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHolidays.map(h => (
                <div 
                  key={h.id} 
                  className="p-4 rounded-2xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)] flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        h.type === 'NATIONAL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        h.type === 'MANDATORY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {h.type}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-secondary)] font-bold">{h.dayOfWeek}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[var(--text-primary)] pt-1">{h.name}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{h.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)]/60 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-black">
                    📅 {h.date}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: POLICY GUIDELINES */}
      {/* ========================================================================= */}
      {activeTab === 'policy' && (
        <div className="space-y-6">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-6">
            
            <div className="border-b border-[var(--border-color)] pb-4">
              <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <Info size={22} className="text-blue-500" /> Enterprise Leave Policy & Guidelines (CY 2026)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Comprehensive reference for leave entitlements, accrual frequencies, rollover limitations, sandwich rules, and document requirements.
              </p>
            </div>

            {/* Policy Category Cards */}
            <div className="space-y-4">
              {LEAVE_POLICY_RULES.map(rule => (
                <div key={rule.id} className="p-5 rounded-2xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                      {rule.category}
                    </span>
                    <h4 className="font-black text-sm text-[var(--text-primary)]">{rule.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                    {rule.description}
                  </p>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-[var(--text-muted)]">
                    {rule.details.map((d, idx) => (
                      <li key={idx} className="leading-relaxed">{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Leave Type Catalog Table */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">Leave Type Entitlement Summary</h4>
              <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Leave Name</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Annual Quota</th>
                      <th className="py-3 px-4">Accrual Frequency</th>
                      <th className="py-3 px-4">Max Consecutive</th>
                      <th className="py-3 px-4">Paid Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/80">
                    {LEAVE_TYPE_CONFIGS.map(c => (
                      <tr key={c.id} className="hover:bg-[var(--bg-hover)]">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{c.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-500">{c.code}</td>
                        <td className="py-3 px-4 font-semibold">{c.annualQuota} Days</td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{c.accrualRate}</td>
                        <td className="py-3 px-4 font-semibold">{c.maxConsecutiveDays} Days</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {c.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCELLATION MODAL */}
      {/* ========================================================================= */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[var(--text-primary)]">Cancel Leave Request?</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Are you sure you want to cancel your <strong>{cancelModalItem.type}</strong> request for {cancelModalItem.startDate} to {cancelModalItem.endDate}?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
              >
                Keep Request
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
