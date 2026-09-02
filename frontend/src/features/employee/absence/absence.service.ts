import { 
  LeaveTypeConfig, 
  HolidayItem, 
  TeamMemberAbsence, 
  LeavePolicyRule, 
  EmployeeLeaveBalance,
  LeaveDurationType,
  LeaveRecord
} from './absence.types';

export const LEAVE_TYPE_CONFIGS: LeaveTypeConfig[] = [
  {
    id: 'cl',
    name: 'Casual Leave',
    code: 'CL',
    annualQuota: 12,
    accrualRate: '1 day / month',
    maxConsecutiveDays: 3,
    paid: true,
    requiresDocument: false,
    description: 'For personal affairs, urgent matters, or unplanned short absences.',
    color: 'purple'
  },
  {
    id: 'sl',
    name: 'Sick Leave',
    code: 'SL',
    annualQuota: 12,
    accrualRate: '1 day / month',
    maxConsecutiveDays: 10,
    paid: true,
    requiresDocument: true,
    documentNotice: 'Medical certificate required for more than 2 consecutive days.',
    description: 'For medical appointments, recovery from illness, or mental health rest.',
    color: 'rose'
  },
  {
    id: 'pl',
    name: 'Annual / Privilege Leave',
    code: 'PL',
    annualQuota: 18,
    accrualRate: '1.5 days / month',
    maxConsecutiveDays: 14,
    paid: true,
    requiresDocument: false,
    documentNotice: 'Requires 7 days advance application for manager scheduling.',
    description: 'For vacations, extended travel, family holidays, or planned downtime.',
    color: 'emerald'
  },
  {
    id: 'compoff',
    name: 'Compensatory Off',
    code: 'COMP-OFF',
    annualQuota: 6,
    accrualRate: 'On-demand against approved weekend/holiday work',
    maxConsecutiveDays: 2,
    paid: true,
    requiresDocument: true,
    documentNotice: 'Provide date of weekend or statutory holiday worked.',
    description: 'Earned when an employee works on official rest days or project deadlines.',
    color: 'amber'
  },
  {
    id: 'lwp',
    name: 'Leave Without Pay',
    code: 'LWP',
    annualQuota: 30,
    accrualRate: 'Subject to management discretion',
    maxConsecutiveDays: 30,
    paid: false,
    requiresDocument: true,
    documentNotice: 'Salary deduction is computed pro-rata per day of absence.',
    description: 'Unpaid leave when all paid balances have been exhausted.',
    color: 'indigo'
  },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    code: 'ML',
    annualQuota: 182,
    accrualRate: '26 weeks total benefit',
    maxConsecutiveDays: 182,
    paid: true,
    requiresDocument: true,
    documentNotice: 'Medical confirmation and anticipated delivery certificate required.',
    description: 'Statutory maternity support with full benefits and continuity.',
    color: 'cyan'
  },
  {
    id: 'paternity',
    name: 'Paternity Leave',
    code: 'PL-PAT',
    annualQuota: 10,
    accrualRate: '10 working days',
    maxConsecutiveDays: 10,
    paid: true,
    requiresDocument: true,
    documentNotice: 'To be availed within 6 months of child arrival.',
    description: 'Parental bonding leave for fathers upon childbirth or legal adoption.',
    color: 'blue'
  },
  {
    id: 'marriage',
    name: 'Marriage Leave',
    code: 'ML-MAR',
    annualQuota: 5,
    accrualRate: '1-time allowance',
    maxConsecutiveDays: 5,
    paid: true,
    requiresDocument: true,
    documentNotice: 'Invitation card or marriage registration certificate.',
    description: 'Special celebration leave granted once during tenure with the company.',
    color: 'teal'
  },
  {
    id: 'bereavement',
    name: 'Bereavement Leave',
    code: 'BL',
    annualQuota: 5,
    accrualRate: 'Per occurrence',
    maxConsecutiveDays: 5,
    paid: true,
    requiresDocument: false,
    description: 'Compassionate leave granted in the unfortunate event of loss in immediate family.',
    color: 'rose'
  }
];

export const HOLIDAYS_2026: HolidayItem[] = [
  { id: 'h1', name: "New Year's Day", date: '2026-01-01', dayOfWeek: 'Thursday', type: 'MANDATORY', description: 'Celebration of the first day of the calendar year.' },
  { id: 'h2', name: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', type: 'NATIONAL', description: 'National observance of the Constitution adoption.' },
  { id: 'h3', name: 'Maha Shivratri', date: '2026-02-16', dayOfWeek: 'Monday', type: 'OPTIONAL', description: 'Restricted religious holiday.' },
  { id: 'h4', name: 'Holi (Festival of Colors)', date: '2026-03-04', dayOfWeek: 'Wednesday', type: 'MANDATORY', description: 'Spring cultural harvest and color celebration.' },
  { id: 'h5', name: 'Eid al-Fitr', date: '2026-03-21', dayOfWeek: 'Saturday', type: 'MANDATORY', description: 'Islamic holiday marking the end of Ramadan.' },
  { id: 'h6', name: 'Good Friday', date: '2026-04-03', dayOfWeek: 'Friday', type: 'MANDATORY', description: 'Christian holiday commemorating the passion of Christ.' },
  { id: 'h7', name: 'May Day / International Labor Day', date: '2026-05-01', dayOfWeek: 'Friday', type: 'MANDATORY', description: 'Global celebration of workers and labor rights.' },
  { id: 'h8', name: 'Bakrid / Eid al-Adha', date: '2026-05-28', dayOfWeek: 'Thursday', type: 'OPTIONAL', description: 'Feast of the Sacrifice observance.' },
  { id: 'h9', name: 'Independence Day', date: '2026-08-15', dayOfWeek: 'Saturday', type: 'NATIONAL', description: 'National celebration of Independence.' },
  { id: 'h10', name: 'Raksha Bandhan', date: '2026-08-28', dayOfWeek: 'Friday', type: 'OPTIONAL', description: 'Restricted festival celebrating familial bonds.' },
  { id: 'h11', name: 'Janmashtami', date: '2026-09-04', dayOfWeek: 'Friday', type: 'OPTIONAL', description: 'Restricted festive observance.' },
  { id: 'h12', name: 'Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', type: 'NATIONAL', description: 'National holiday commemorating Mahatma Gandhi birthday.' },
  { id: 'h13', name: 'Dussehra / Vijayadashami', date: '2026-10-20', dayOfWeek: 'Tuesday', type: 'MANDATORY', description: 'Celebration of the victory of good over evil.' },
  { id: 'h14', name: 'Deepavali / Diwali', date: '2026-11-08', dayOfWeek: 'Sunday', type: 'MANDATORY', description: 'Festival of Lights.' },
  { id: 'h15', name: 'Christmas Day', date: '2026-12-25', dayOfWeek: 'Friday', type: 'MANDATORY', description: 'Christian celebration of the birth of Jesus Christ.' }
];

export const LEAVE_POLICY_RULES: LeavePolicyRule[] = [
  {
    id: 'p1',
    title: 'Leave Year Cycle & Accrual Schedule',
    category: 'Accrual',
    description: 'The standard leave accounting year runs from January 1st to December 31st.',
    details: [
      'Casual and Sick Leaves accrue at the rate of 1.0 day at the start of each calendar month.',
      'Privilege Leave accrues at the rate of 1.5 days per month (18 days/annum).',
      'New employees joining mid-year will receive pro-rata entitlement based on their joining date.'
    ]
  },
  {
    id: 'p2',
    title: 'Weekend & Holiday Intervening Policy (Sandwich Rule)',
    category: 'Sandwich',
    description: 'Guidelines on how statutory weekends and company holidays are counted when bridging leave days.',
    details: [
      'Casual and Sick Leave: Intervening weekends/holidays are NOT counted as leave days.',
      'Leave Without Pay (LWP) and Maternity Leave: Continuous days including intervening weekends are counted.',
      'Taking leave on Friday and Monday consecutively will deduct 2 working days (Sat/Sun are excluded for standard paid leaves).'
    ]
  },
  {
    id: 'p3',
    title: 'Advance Notice & Application Timelines',
    category: 'Notice',
    description: 'Mandatory notice windows for planning team workload and coverage.',
    details: [
      'Privilege Leave (PL > 3 days): Submit at least 7 calendar days in advance.',
      'Casual Leave (CL): Submit at least 24 hours in advance or by 10:00 AM on the day of emergency.',
      'Sick Leave (SL): Notify team lead before shift start; submit medical certificate if extending beyond 2 days.'
    ]
  },
  {
    id: 'p4',
    title: 'Year-End Rollover & Encashment',
    category: 'Rollover',
    description: 'Rules governing unutilized balances at the end of the calendar year.',
    details: [
      'Up to 10 days of unused Privilege Leave (PL) can be carried forward into the next calendar year.',
      'Excess PL beyond 10 days can be encashed at base salary rate during the January payroll run.',
      'Casual Leave (CL) and Sick Leave (SL) balances expire on December 31 and cannot be carried over or encashed.'
    ]
  },
  {
    id: 'p5',
    title: 'Compensatory Off (Comp-Off) Policy',
    category: 'General',
    description: 'Compensatory rest for authorized overtime or weekend work.',
    details: [
      'Eligible when pre-approved by the department manager for weekend sprint releases or maintenance windows.',
      'Must be availed within 60 calendar days from the date of overtime worked, after which it lapses automatically.',
      'Maximum 2 consecutive Comp-Off days can be clubbed together.'
    ]
  }
];

export const MOCK_TEAM_ABSENCES: TeamMemberAbsence[] = [
  {
    id: 'ta-1',
    employeeId: 'emp-102',
    employeeName: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    department: 'Engineering & Technology',
    team: 'Frontend Squad',
    leaveType: 'Annual / Privilege Leave',
    startDate: '2026-09-07',
    endDate: '2026-09-11',
    daysCount: 5,
    status: 'APPROVED'
  },
  {
    id: 'ta-2',
    employeeId: 'emp-105',
    employeeName: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    department: 'Engineering & Technology',
    team: 'Backend Core',
    leaveType: 'Sick Leave',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    daysCount: 2,
    status: 'APPROVED'
  },
  {
    id: 'ta-3',
    employeeId: 'emp-108',
    employeeName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    department: 'Engineering & Technology',
    team: 'DevOps & Cloud',
    leaveType: 'Casual Leave',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    daysCount: 1,
    status: 'APPROVED'
  },
  {
    id: 'ta-4',
    employeeId: 'emp-112',
    employeeName: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    department: 'Engineering & Technology',
    team: 'Frontend Squad',
    leaveType: 'Compensatory Off',
    startDate: '2026-09-25',
    endDate: '2026-09-25',
    daysCount: 1,
    status: 'APPROVED'
  }
];

export const absenceService = {
  getLeaveTypeConfigs(): LeaveTypeConfig[] {
    return LEAVE_TYPE_CONFIGS;
  },

  getHolidays(): HolidayItem[] {
    return HOLIDAYS_2026;
  },

  getPolicyRules(): LeavePolicyRule[] {
    return LEAVE_POLICY_RULES;
  },

  getTeamAbsences(): TeamMemberAbsence[] {
    return MOCK_TEAM_ABSENCES;
  },

  /**
   * Calculates working days count between two dates, excluding weekends and official statutory holidays.
   */
  calculateWorkingDays(startDateStr: string, endDateStr: string, duration: LeaveDurationType = 'FULL_DAY'): number {
    if (!startDateStr || !endDateStr) return 0;
    if (duration === 'FIRST_HALF' || duration === 'SECOND_HALF') return 0.5;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (end < start) return 0;

    const holidayDateStrings = new Set(HOLIDAYS_2026.map(h => h.date));
    let workingDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateIso = current.toISOString().split('T')[0];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDateStrings.has(dateIso);

      if (!isWeekend && !isHoliday) {
        workingDays += 1;
      }
      current.setDate(current.getDate() + 1);
    }

    return Math.max(1, workingDays);
  },

  /**
   * Calculates leave balances dynamically from leave requests history and standard quotas.
   */
  computeLeaveBalances(requests: LeaveRecord[]): EmployeeLeaveBalance[] {
    return LEAVE_TYPE_CONFIGS.map(config => {
      const matchingApproved = requests.filter(
        r => r.type.toLowerCase().includes(config.name.toLowerCase()) || 
             r.type.toLowerCase().includes(config.code.toLowerCase())
      );

      const used = matchingApproved
        .filter(r => r.status === 'APPROVED')
        .reduce((sum, r) => {
          const days = (r as any).daysCount || 
                       Math.max(1, Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86400000) + 1);
          return sum + days;
        }, 0);

      const pending = matchingApproved
        .filter(r => r.status === 'PENDING')
        .reduce((sum, r) => {
          const days = (r as any).daysCount || 
                       Math.max(1, Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86400000) + 1);
          return sum + days;
        }, 0);

      const available = Math.max(0, config.annualQuota - used);

      return {
        leaveTypeId: config.id,
        leaveTypeName: config.name,
        code: config.code,
        totalQuota: config.annualQuota,
        used,
        pending,
        available,
        color: config.color
      };
    });
  }
};

export const INITIAL_SAMPLE_REQUESTS: LeaveRecord[] = [
  {
    id: 'leave-req-94821',
    employeeId: 'usr-emp-01',
    employeeName: 'Maheswari P',
    department: 'Engineering',
    team: 'Frontend Platform',
    type: 'Casual Leave',
    startDate: '2026-09-18',
    endDate: '2026-09-19',
    reason: 'Attending family function out of town.',
    status: 'PENDING',
    createdAt: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'leave-req-82014',
    employeeId: 'usr-emp-01',
    employeeName: 'Maheswari P',
    department: 'Engineering',
    team: 'Frontend Platform',
    type: 'Sick Leave',
    startDate: '2026-08-10',
    endDate: '2026-08-11',
    reason: 'Severe seasonal flu and medical rest.',
    status: 'APPROVED',
    reviewedBy: 'Alex Morgan (Engineering Lead)',
    reviewComment: 'Approved. Take care and get well soon!',
    createdAt: '2026-08-09T14:15:00.000Z'
  }
];
