export type InsightType =
  | 'ATTENDANCE'
  | 'ABSENCE'
  | 'LATE_ARRIVAL'
  | 'OVERTIME'
  | 'LEAVE'
  | 'WORKFORCE_UTILIZATION'
  | 'ANOMALY'
  | 'PREDICTION';

export type InsightSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InsightStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export interface AIInsight {
  id: string;
  organizationId: string;
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;
  source: string;
  department?: string;
  team?: string;
  employeeId?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  createdAt: string;
  expiresAt?: string;
  status: InsightStatus;
}

export interface AnalyticsContext {
  organizationId: string;
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onBreakToday: number;
  attendanceHistory: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    department?: string;
  }>;
  leaveRequestsPending: number;
  recentOvertimeHours?: number;
}

export interface AIProvider {
  name: string;
  generateInsights(context: AnalyticsContext): Promise<AIInsight[]>;
}
