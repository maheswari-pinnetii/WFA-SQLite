import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  HelpCircle,
  Palmtree,
  HeartPulse,
  Award,
  Baby,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Button, MotionButton } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { AnimatedTabs } from '../../../components/ui/tabs';
import { DeltaBadge, Callout, ProgressBar } from '../../../components/ui/tremor-kpi';
import { Avatar } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';

// Types
export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'COMP_OFF' | 'MATERNITY' | 'PATERNITY' | 'LWP' | 'BEREAVEMENT';
export type LeaveDuration = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF' | 'MULTIPLE_DAYS';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: LeaveType;
  duration: LeaveDuration;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  avatar?: string;
  casual: { total: number; used: number; pending: number };
  sick: { total: number; used: number; pending: number };
  earned: { total: number; used: number; pending: number };
  compOff: { total: number; used: number; pending: number };
  lwp: { total: number; used: number; pending: number };
}

export interface LeavePolicy {
  type: LeaveType;
  title: string;
  annualAllocation: number;
  carryoverLimit: number;
  requiresProofAfterDays: number;
  isPaid: boolean;
  color: string;
  description: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'MANDATORY' | 'OPTIONAL';
  day: string;
}

const INITIAL_POLICIES: LeavePolicy[] = [
  { type: 'CASUAL', title: 'Casual Leave (CL)', annualAllocation: 12, carryoverLimit: 0, requiresProofAfterDays: 3, isPaid: true, color: 'blue', description: 'For personal matters, unplanned events, or short family emergencies.' },
  { type: 'SICK', title: 'Sick / Medical Leave (SL)', annualAllocation: 12, carryoverLimit: 5, requiresProofAfterDays: 2, isPaid: true, color: 'emerald', description: 'For health recovery, doctor consultations, and hospitalization.' },
  { type: 'EARNED', title: 'Earned / Privilege Leave (EL)', annualAllocation: 18, carryoverLimit: 15, requiresProofAfterDays: 0, isPaid: true, color: 'purple', description: 'Planned vacations, extended travel, and work-life rejuvenation.' },
  { type: 'COMP_OFF', title: 'Compensatory Off (Comp-Off)', annualAllocation: 8, carryoverLimit: 2, requiresProofAfterDays: 0, isPaid: true, color: 'amber', description: 'Credits earned for weekend overtime or critical deployment shifts.' },
  { type: 'MATERNITY', title: 'Maternity Leave', annualAllocation: 180, carryoverLimit: 0, requiresProofAfterDays: 1, isPaid: true, color: 'rose', description: 'Paid parental leave for expecting and new mothers.' },
  { type: 'PATERNITY', title: 'Paternity Leave', annualAllocation: 15, carryoverLimit: 0, requiresProofAfterDays: 1, isPaid: true, color: 'cyan', description: 'Paid leave for new fathers.' },
  { type: 'LWP', title: 'Leave Without Pay (LWP)', annualAllocation: 30, carryoverLimit: 0, requiresProofAfterDays: 1, isPaid: false, color: 'slate', description: 'Unpaid leaves requested when all paid leave balances are exhausted.' },
  { type: 'BEREAVEMENT', title: 'Bereavement Leave', annualAllocation: 5, carryoverLimit: 0, requiresProofAfterDays: 0, isPaid: true, color: 'indigo', description: 'Compassionate leave for family loss.' }
];

const INITIAL_HOLIDAYS: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", type: 'MANDATORY', day: 'Thursday' },
  { date: '2026-01-26', name: 'Republic Day', type: 'MANDATORY', day: 'Monday' },
  { date: '2026-03-25', name: 'Holi Festival of Colors', type: 'MANDATORY', day: 'Wednesday' },
  { date: '2026-05-01', name: 'International Labor Day', type: 'MANDATORY', day: 'Friday' },
  { date: '2026-08-15', name: 'Independence Day', type: 'MANDATORY', day: 'Saturday' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'MANDATORY', day: 'Friday' },
  { date: '2026-10-20', name: 'Dussehra / Vijayadashami', type: 'MANDATORY', day: 'Tuesday' },
  { date: '2026-11-08', name: 'Diwali / Festival of Lights', type: 'MANDATORY', day: 'Sunday' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'MANDATORY', day: 'Friday' },
];

const INITIAL_REQUESTS: LeaveRecord[] = [
  { id: 'LR-1001', employeeId: 'EMP-001', employeeName: 'Sarah Connor', department: 'Engineering', type: 'EARNED', duration: 'MULTIPLE_DAYS', startDate: '2026-09-10', endDate: '2026-09-15', totalDays: 4, reason: 'Annual family vacation to coastal retreat.', status: 'APPROVED', appliedOn: '2026-08-28', approvedBy: 'David Sterling', approvedOn: '2026-08-29' },
  { id: 'LR-1002', employeeId: 'EMP-004', employeeName: 'Ananya Sharma', department: 'Product', type: 'SICK', duration: 'FULL_DAY', startDate: '2026-09-02', endDate: '2026-09-02', totalDays: 1, reason: 'Viral fever and doctor-advised bed rest.', status: 'PENDING', appliedOn: '2026-09-01' },
  { id: 'LR-1003', employeeId: 'EMP-012', employeeName: 'Vikram Malhotra', department: 'Marketing', type: 'CASUAL', duration: 'FIRST_HALF', startDate: '2026-09-05', endDate: '2026-09-05', totalDays: 0.5, reason: 'Personal banking and vehicle registration work.', status: 'PENDING', appliedOn: '2026-08-30' },
  { id: 'LR-1004', employeeId: 'EMP-018', employeeName: 'Rohit Verma', department: 'Engineering', type: 'COMP_OFF', duration: 'FULL_DAY', startDate: '2026-09-08', endDate: '2026-09-08', totalDays: 1, reason: 'Comp-off against Sunday maintenance deployment (Aug 30).', status: 'PENDING', appliedOn: '2026-08-31' },
  { id: 'LR-1005', employeeId: 'EMP-025', employeeName: 'Elena Rostova', department: 'Human Resources', type: 'LWP', duration: 'FULL_DAY', startDate: '2026-08-20', endDate: '2026-08-20', totalDays: 1, reason: 'Personal matter after casual leave quota exhausted.', status: 'APPROVED', appliedOn: '2026-08-18', approvedBy: 'Sarah Connor', approvedOn: '2026-08-19' },
  { id: 'LR-1006', employeeId: 'EMP-031', employeeName: 'Marcus Vance', department: 'Engineering', type: 'CASUAL', duration: 'FULL_DAY', startDate: '2026-08-12', endDate: '2026-08-12', totalDays: 1, reason: 'Home renovation emergency.', status: 'REJECTED', appliedOn: '2026-08-11', approvedBy: 'Sarah Connor', approvedOn: '2026-08-11', rejectionReason: 'Critical sprint release deadline requires team presence.' },
  { id: 'LR-1007', employeeId: 'EMP-045', employeeName: 'Sneha Patel', department: 'Operations', type: 'MATERNITY', duration: 'MULTIPLE_DAYS', startDate: '2026-10-01', endDate: '2027-03-30', totalDays: 180, reason: 'Maternity leave under company statutory policy.', status: 'APPROVED', appliedOn: '2026-08-15', approvedBy: 'Elena Rostova', approvedOn: '2026-08-16' },
];

const INITIAL_BALANCES: LeaveBalance[] = [
  { employeeId: 'EMP-001', employeeName: 'Sarah Connor', department: 'Engineering', casual: { total: 12, used: 3, pending: 0 }, sick: { total: 12, used: 1, pending: 0 }, earned: { total: 18, used: 4, pending: 0 }, compOff: { total: 4, used: 1, pending: 0 }, lwp: { total: 30, used: 0, pending: 0 } },
  { employeeId: 'EMP-004', employeeName: 'Ananya Sharma', department: 'Product', casual: { total: 12, used: 4, pending: 0 }, sick: { total: 12, used: 2, pending: 1 }, earned: { total: 18, used: 6, pending: 0 }, compOff: { total: 2, used: 0, pending: 0 }, lwp: { total: 30, used: 0, pending: 0 } },
  { employeeId: 'EMP-012', employeeName: 'Vikram Malhotra', department: 'Marketing', casual: { total: 12, used: 2, pending: 0.5 }, sick: { total: 12, used: 0, pending: 0 }, earned: { total: 18, used: 2, pending: 0 }, compOff: { total: 1, used: 0, pending: 0 }, lwp: { total: 30, used: 0, pending: 0 } },
  { employeeId: 'EMP-018', employeeName: 'Rohit Verma', department: 'Engineering', casual: { total: 12, used: 5, pending: 0 }, sick: { total: 12, used: 3, pending: 0 }, earned: { total: 18, used: 8, pending: 0 }, compOff: { total: 3, used: 1, pending: 1 }, lwp: { total: 30, used: 0, pending: 0 } },
  { employeeId: 'EMP-025', employeeName: 'Elena Rostova', department: 'Human Resources', casual: { total: 12, used: 12, pending: 0 }, sick: { total: 12, used: 4, pending: 0 }, earned: { total: 18, used: 10, pending: 0 }, compOff: { total: 2, used: 0, pending: 0 }, lwp: { total: 30, used: 1, pending: 0 } },
  { employeeId: 'EMP-031', employeeName: 'Marcus Vance', department: 'Engineering', casual: { total: 12, used: 1, pending: 0 }, sick: { total: 12, used: 1, pending: 0 }, earned: { total: 18, used: 3, pending: 0 }, compOff: { total: 5, used: 2, pending: 0 }, lwp: { total: 30, used: 0, pending: 0 } },
  { employeeId: 'EMP-045', employeeName: 'Sneha Patel', department: 'Operations', casual: { total: 12, used: 6, pending: 0 }, sick: { total: 12, used: 2, pending: 0 }, earned: { total: 18, used: 12, pending: 0 }, compOff: { total: 0, used: 0, pending: 0 }, lwp: { total: 30, used: 0, pending: 0 } },
];

export const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'calendar' | 'policies' | 'holidays' | 'history'>('requests');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [requests, setRequests] = useState<LeaveRecord[]>(INITIAL_REQUESTS);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);
  const [policies, setPolicies] = useState<LeavePolicy[]>(INITIAL_POLICIES);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [rejectModalRecord, setRejectModalRecord] = useState<LeaveRecord | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // New Request Form state
  const [newRequest, setNewRequest] = useState({
    employeeName: 'Sarah Connor',
    department: 'Engineering',
    type: 'CASUAL' as LeaveType,
    duration: 'FULL_DAY' as LeaveDuration,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const approvedThisMonth = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedThisMonth = requests.filter(r => r.status === 'REJECTED').length;
    const onLeaveToday = requests.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today;
    }).length;
    return { pending, approvedThisMonth, rejectedThisMonth, onLeaveToday };
  }, [requests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || req.department === selectedDept;
      const matchesType = selectedType === 'ALL' || req.type === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
      return matchesSearch && matchesDept && matchesType && matchesStatus;
    });
  }, [requests, searchQuery, selectedDept, selectedType, selectedStatus]);

  // Filtered Balances
  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const matchesSearch = b.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || b.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [balances, searchQuery, selectedDept]);

  // Handle Approve / Reject
  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'APPROVED',
      approvedBy: 'Admin (You)',
      approvedOn: new Date().toISOString().split('T')[0]
    } : r));
  };

  const handleOpenReject = (record: LeaveRecord) => {
    setRejectModalRecord(record);
    setRejectionNote('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalRecord) return;
    setRequests(prev => prev.map(r => r.id === rejectModalRecord.id ? {
      ...r,
      status: 'REJECTED',
      approvedBy: 'Admin (You)',
      approvedOn: new Date().toISOString().split('T')[0],
      rejectionReason: rejectionNote || 'Schedule conflict or business priority requirement.'
    } : r));
    setRejectModalRecord(null);
  };

  // Handle Leave Cancellation / Withdrawal
  const handleCancelLeave = (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and withdraw this leave application?')) return;
    setRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'CANCELLED',
      rejectionReason: 'Withdrawn by employee/manager.'
    } : r));
  };

  // Handle Submit New Leave Request
  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.reason.trim()) {
      alert('Please provide a valid reason for the leave application.');
      return;
    }

    let calculatedDays = 1;
    if (newRequest.duration === 'FIRST_HALF' || newRequest.duration === 'SECOND_HALF') {
      calculatedDays = 0.5;
    } else if (newRequest.duration === 'MULTIPLE_DAYS') {
      const start = new Date(newRequest.startDate).getTime();
      const end = new Date(newRequest.endDate).getTime();
      calculatedDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    const newRecord: LeaveRecord = {
      id: `LR-${1000 + requests.length + 1}`,
      employeeId: 'EMP-001',
      employeeName: newRequest.employeeName,
      department: newRequest.department,
      type: newRequest.type,
      duration: newRequest.duration,
      startDate: newRequest.startDate,
      endDate: newRequest.duration === 'MULTIPLE_DAYS' ? newRequest.endDate : newRequest.startDate,
      totalDays: calculatedDays,
      reason: newRequest.reason,
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setRequests([newRecord, ...requests]);
    setIsApplyModalOpen(false);
    setNewRequest({
      employeeName: 'Sarah Connor',
      department: 'Engineering',
      type: 'CASUAL',
      duration: 'FULL_DAY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: ''
    });
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'CASUAL': return <Badge variant="default">Casual (CL)</Badge>;
      case 'SICK': return <Badge variant="success">Sick (SL)</Badge>;
      case 'EARNED': return <Badge variant="purple">Earned (EL)</Badge>;
      case 'COMP_OFF': return <Badge variant="warning">Comp-Off</Badge>;
      case 'MATERNITY': return <Badge variant="destructive">Maternity</Badge>;
      case 'PATERNITY': return <Badge variant="secondary">Paternity</Badge>;
      case 'LWP': return <Badge variant="outline">LWP (Unpaid)</Badge>;
      case 'BEREAVEMENT': return <Badge variant="secondary">Bereavement</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-bold"><CheckCircle2 size={12} /> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-bold"><XCircle size={12} /> Rejected</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-xs font-bold"><CalendarX size={12} /> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-bold"><Clock size={12} className="animate-spin" /> Pending</span>;
    }
  };

  return (
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Palmtree className="text-blue-400" size={28} />
              Absence & Leave Management Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure enterprise leave policies, track live PTO balances, coordinate team coverage, and manage approval queues.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setIsPolicyModalOpen(true)}>
              <Shield size={14} className="mr-1.5 text-blue-400" /> Leave Policies
            </Button>
            <MotionButton variant="gradient" size="sm" onClick={() => setIsApplyModalOpen(true)}>
              <Plus size={14} className="mr-1.5" /> Apply for Leave
            </MotionButton>
          </div>
        </div>

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-amber-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-2xl font-black text-white mt-1">{metrics.pending}</h3>
                <p className="text-[11px] text-amber-400 mt-0.5">Action required by managers</p>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Clock size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On Leave Today</p>
                <h3 className="text-2xl font-black text-white mt-1">{metrics.onLeaveToday}</h3>
                <p className="text-[11px] text-blue-400 mt-0.5">Active coverage substitutes ready</p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Users size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Requests</p>
                <h3 className="text-2xl font-black text-white mt-1">{metrics.approvedThisMonth}</h3>
                <p className="text-[11px] text-emerald-400 mt-0.5">Processed this month</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Holiday</p>
                <h3 className="text-sm font-black text-white mt-1 truncate max-w-[140px]">Independence Day</h3>
                <p className="text-[11px] text-purple-400 mt-0.5">Aug 15 (Mandatory Off)</p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <Award size={22} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <AnimatedTabs
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          tabs={[
            { id: 'requests', label: 'Leave Requests Inbox', icon: <FileText size={14} />, badge: metrics.pending > 0 ? metrics.pending : undefined },
            { id: 'balances', label: 'Employee Balances', icon: <Users size={14} /> },
            { id: 'calendar', label: 'Team Coverage Calendar', icon: <CalendarIcon size={14} /> },
            { id: 'holidays', label: 'Holiday Calendar', icon: <Award size={14} />, badge: holidays.length },
            { id: 'policies', label: 'Leave Policies & Types', icon: <Shield size={14} /> },
            { id: 'history', label: 'Audit & Approval History', icon: <CalendarCheck size={14} /> }
          ]}
        />

        {/* TAB 1: LEAVE REQUESTS INBOX */}
        {activeTab === 'requests' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle>Pending & Active Leave Applications</CardTitle>
                  <CardDescription>Review, approve, or reject employee PTO and absence submissions.</CardDescription>
                </div>
                {/* Search & Filters Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-56">
                    <Input
                      placeholder="Search employee or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={14} />}
                    />
                  </div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending Only</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Request ID</th>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Leave Type</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Days</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <AlertCircle size={32} className="mx-auto text-slate-600 mb-2" />
                          <p className="font-bold text-sm text-slate-300">No leave requests found</p>
                          <p className="text-xs text-slate-500">Try adjusting your search criteria or filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{req.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{req.employeeName}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Building2 size={10} /> {req.department}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">{getLeaveTypeBadge(req.type)}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-200">
                              {req.startDate} {req.endDate !== req.startDate ? `to ${req.endDate}` : ''}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {req.duration.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-100">{req.totalDays}d</td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-300" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7 px-2.5 text-xs"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2.5 text-xs"
                                  onClick={() => handleOpenReject(req)}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : req.status === 'APPROVED' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-[11px] text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                                onClick={() => handleCancelLeave(req.id)}
                              >
                                Cancel / Withdraw
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">Archived</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: EMPLOYEE LEAVE BALANCES */}
        {activeTab === 'balances' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle>Live Employee Leave Quotas & Balances</CardTitle>
                  <CardDescription>Real-time tracked entitlements, usage, and available days for 500+ employees.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-56">
                    <Input
                      placeholder="Search employee name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={14} />}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert('Exporting live balances CSV...')}>
                    <Download size={14} className="mr-1.5" /> Export Balances
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Casual Leave (CL)</th>
                      <th className="py-3.5 px-4">Sick Leave (SL)</th>
                      <th className="py-3.5 px-4">Earned Leave (EL)</th>
                      <th className="py-3.5 px-4">Comp-Off</th>
                      <th className="py-3.5 px-4">LWP Taken</th>
                      <th className="py-3.5 px-4 text-right">Available Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBalances.map((emp) => {
                      const totalAvailable =
                        (emp.casual.total - emp.casual.used) +
                        (emp.sick.total - emp.sick.used) +
                        (emp.earned.total - emp.earned.used) +
                        (emp.compOff.total - emp.compOff.used);
                      return (
                        <tr key={emp.employeeId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar fallback={emp.employeeName.slice(0, 2).toUpperCase()} size="sm" />
                              <div>
                                <div className="font-bold text-white">{emp.employeeName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId} &bull; {emp.department}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200">{emp.casual.total - emp.casual.used}</span>
                            <span className="text-slate-500"> / {emp.casual.total}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200">{emp.sick.total - emp.sick.used}</span>
                            <span className="text-slate-500"> / {emp.sick.total}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200">{emp.earned.total - emp.earned.used}</span>
                            <span className="text-slate-500"> / {emp.earned.total}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200">{emp.compOff.total - emp.compOff.used}</span>
                            <span className="text-slate-500"> / {emp.compOff.total}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                            {emp.lwp.used} Days
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs">
                              {totalAvailable} Days Left
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: TEAM COVERAGE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Leave & Availability Calendar — September 2026</CardTitle>
                    <CardDescription>Visual availability planner preventing departmental under-staffing.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><ChevronLeft size={14} /> Aug 2026</Button>
                    <Button variant="outline" size="sm">Oct 2026 <ChevronRight size={14} /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="text-rose-400">Sat</span><span className="text-rose-400">Sun</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `2026-09-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                    const dayLeaves = requests.filter(r => r.status === 'APPROVED' && r.startDate <= dateStr && r.endDate >= dateStr);
                    const isWeekend = (dayNum + 1) % 7 === 0 || (dayNum) % 7 === 0;

                    return (
                      <div
                        key={i}
                        className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isWeekend
                            ? 'bg-slate-950/40 border-slate-900 text-slate-600'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={dayLeaves.length > 0 ? 'text-blue-400' : 'text-slate-300'}>{dayNum}</span>
                          {dayLeaves.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-[10px] text-blue-300 font-bold">
                              {dayLeaves.length} off
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 mt-1">
                          {dayLeaves.slice(0, 2).map((l, idx) => (
                            <div key={idx} className="p-1 rounded bg-blue-600/20 border border-blue-500/30 text-[9px] text-blue-200 font-semibold truncate" title={`${l.employeeName} (${l.type})`}>
                              {l.employeeName}
                            </div>
                          ))}
                          {dayLeaves.length > 2 && (
                            <div className="text-[9px] text-slate-400 font-bold pl-1">+{dayLeaves.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: HOLIDAY CALENDAR */}
        {activeTab === 'holidays' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Official Company Holiday Calendar (2026)</CardTitle>
                  <CardDescription>Mandatory statutory public holidays and optional cultural observances.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => alert('Add custom holiday dialog')}>
                  <Plus size={14} className="mr-1.5" /> Add Company Holiday
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {holidays.map((h, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {h.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{h.name}</h4>
                      <p className="text-xs font-mono text-slate-400">{h.date} &bull; {h.day}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                      <Award size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: LEAVE POLICIES & TYPES */}
        {activeTab === 'policies' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configured Leave Types & Statutory Policies</CardTitle>
                  <CardDescription>Define allocation rules, carryover limits, and medical verification thresholds.</CardDescription>
                </div>
                <Button variant="gradient" size="sm" onClick={() => alert('New policy dialog')}>
                  <Plus size={14} className="mr-1.5" /> Create Leave Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {policies.map((p, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-xs">
                          {p.type}
                        </span>
                        <h4 className="font-bold text-white text-sm">{p.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {p.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Annual Quota</span>
                        <span className="font-bold text-white">{p.annualAllocation} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Carryover Limit</span>
                        <span className="font-bold text-white">{p.carryoverLimit} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Proof Required</span>
                        <span className="font-bold text-white">{p.requiresProofAfterDays > 0 ? `>${p.requiresProofAfterDays} Days` : 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 6: APPROVAL HISTORY & AUDIT */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle>Historical Leave Approval Audit Trail</CardTitle>
              <CardDescription>Tamper-evident logs of all approved, rejected, and withdrawn requests.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Request ID</th>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Decision</th>
                      <th className="py-3.5 px-4">Reviewer</th>
                      <th className="py-3.5 px-4">Notes / Rejection Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {requests.filter(r => r.status !== 'PENDING').map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">{r.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{r.employeeName}</td>
                        <td className="py-3 px-4">{getLeaveTypeBadge(r.type)}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{r.startDate} ({r.totalDays}d)</td>
                        <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                        <td className="py-3 px-4 text-slate-300 font-semibold">{r.approvedBy || 'System'}</td>
                        <td className="py-3 px-4 text-slate-400 italic max-w-sm truncate">{r.rejectionReason || 'Approved under standard quota rules.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MODAL: APPLY FOR LEAVE */}
        <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
          <DialogContent onClose={() => setIsApplyModalOpen(false)}>
            <DialogHeader>
              <DialogTitle>Submit Leave Application</DialogTitle>
              <DialogDescription>Apply for casual, sick, earned, comp-off, or leave without pay.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitNewRequest} className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Leave Type</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as LeaveType })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CASUAL">Casual Leave (CL) — Personal matters</option>
                  <option value="SICK">Sick Leave (SL) — Medical / Health</option>
                  <option value="EARNED">Earned / Privilege Leave (EL) — Planned Vacation</option>
                  <option value="COMP_OFF">Compensatory Off (Comp-Off) — Overtime Credit</option>
                  <option value="LWP">Leave Without Pay (LWP) — Unpaid</option>
                  <option value="BEREAVEMENT">Bereavement Leave — Family Compassion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Duration Type</label>
                  <select
                    value={newRequest.duration}
                    onChange={(e) => setNewRequest({ ...newRequest, duration: e.target.value as LeaveDuration })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="FULL_DAY">Full Day (1.0 Day)</option>
                    <option value="FIRST_HALF">First Half (0.5 Day)</option>
                    <option value="SECOND_HALF">Second Half (0.5 Day)</option>
                    <option value="MULTIPLE_DAYS">Multiple Days</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {newRequest.duration === 'MULTIPLE_DAYS' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">End Date</label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    required
                    min={newRequest.startDate}
                    className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Reason / Description</label>
                <textarea
                  rows={3}
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="Explain why you are requesting this leave..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsApplyModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: REJECT REASON */}
        <Dialog open={!!rejectModalRecord} onOpenChange={(open) => !open && setRejectModalRecord(null)}>
          <DialogContent onClose={() => setRejectModalRecord(null)}>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {rejectModalRecord?.employeeName}'s leave application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400">Request:</span> <span className="font-mono font-bold text-blue-400">{rejectModalRecord?.id}</span></p>
                <p><span className="text-slate-400">Dates:</span> {rejectModalRecord?.startDate} to {rejectModalRecord?.endDate} ({rejectModalRecord?.totalDays}d)</p>
                <p><span className="text-slate-400">Reason:</span> {rejectModalRecord?.reason}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Rejection Note</label>
                <textarea
                  rows={3}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="e.g., Sprint deployment conflict, coverage needed..."
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setRejectModalRecord(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleConfirmReject}>
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
};
