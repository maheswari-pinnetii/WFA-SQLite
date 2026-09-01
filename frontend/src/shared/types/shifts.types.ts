export interface ShiftDefinition {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  workHours: number;
  breakHours: number;
  graceMinutes: number;
  days: string;
  assignedDepartment: string;
  allocatedCount: number;
  compliance: string;
}

export const DEFAULT_SHIFTS: ShiftDefinition[] = [
  {
    id: 'SH-01',
    name: 'General Day Shift',
    code: 'GS',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    totalHours: 9,
    workHours: 8,
    breakHours: 1,
    graceMinutes: 15,
    days: 'Mon - Fri',
    assignedDepartment: 'Engineering, Product, Marketing',
    allocatedCount: 215,
    compliance: '99.2%'
  },
  {
    id: 'SH-02',
    name: 'Morning Shift',
    code: 'MS',
    startTime: '07:00 AM',
    endTime: '04:00 PM',
    totalHours: 9,
    workHours: 8,
    breakHours: 1,
    graceMinutes: 15,
    days: 'Mon - Fri',
    assignedDepartment: 'Customer Support & Tier-1 Ops',
    allocatedCount: 58,
    compliance: '98.5%'
  },
  {
    id: 'SH-03',
    name: 'US / Night Core Business Shift',
    code: 'NS',
    startTime: '06:30 PM',
    endTime: '03:30 AM',
    totalHours: 9,
    workHours: 8,
    breakHours: 1,
    graceMinutes: 15,
    days: 'Mon - Fri',
    assignedDepartment: 'Global Sales & Cloud Infra',
    allocatedCount: 28,
    compliance: '100%'
  }
];
