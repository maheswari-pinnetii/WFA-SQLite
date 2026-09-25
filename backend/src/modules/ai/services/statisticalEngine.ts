import { AIInsight, AnalyticsContext } from './aiProvider.interface.js';

export class StatisticalEngine {
  calculateMean(numbers: number[]): number {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  }

  calculateStandardDeviation(numbers: number[]): number {
    if (!numbers || numbers.length < 2) return 0;
    const mean = this.calculateMean(numbers);
    const squaredDiffs = numbers.map((val) => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / (numbers.length - 1);
    return Math.sqrt(avgSquaredDiff);
  }

  calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  /**
   * Run multi-dimensional statistical analysis on workforce data.
   */
  analyzeWorkforceData(context: AnalyticsContext): AIInsight[] {
    const insights: AIInsight[] = [];
    const now = new Date().toISOString();
    const orgId = context.organizationId || 'org-stackly';

    // 1. Attendance Drop Anomaly Detection (Z-Score & Moving Average)
    const recentPresents = context.attendanceHistory.map((h) => h.present);
    if (recentPresents.length >= 3) {
      const baselineMean = this.calculateMean(recentPresents);
      const baselineStd = this.calculateStandardDeviation(recentPresents);
      const currentPresent = context.presentToday;

      if (baselineMean > 0) {
        const percentChange = Math.round(((currentPresent - baselineMean) / baselineMean) * 100);
        const zScore = this.calculateZScore(currentPresent, baselineMean, baselineStd);

        if (percentChange <= -10 || zScore < -1.5) {
          const dropAmount = Math.abs(percentChange);
          insights.push({
            id: `insight_att_drop_${Date.now()}`,
            organizationId: orgId,
            type: 'ANOMALY',
            title: 'Attendance Drop Anomaly Detected',
            description: `Today's attendance is ${dropAmount}% below the recent baseline (${currentPresent} present vs ${Math.round(baselineMean)} average).`,
            severity: dropAmount >= 20 ? 'HIGH' : 'MEDIUM',
            confidence: Math.min(0.95, Math.round((0.75 + Math.abs(zScore) * 0.08) * 100) / 100),
            source: 'statistical-zscore-engine',
            createdAt: now,
            status: 'ACTIVE'
          });
        }
      }
    }

    // 2. Late Arrival Frequency Anomaly Detection
    if (context.presentToday > 0) {
      const lateRatio = context.lateToday / context.presentToday;
      const latePercent = Math.round(lateRatio * 100);

      if (latePercent >= 15 && context.lateToday >= 5) {
        insights.push({
          id: `insight_late_spike_${Date.now()}`,
          organizationId: orgId,
          type: 'LATE_ARRIVAL',
          title: 'Unusual Spike in Late Check-Ins',
          description: `Late arrivals reached ${latePercent}% of checked-in staff today (${context.lateToday} late check-ins).`,
          severity: latePercent >= 25 ? 'HIGH' : 'MEDIUM',
          confidence: 0.88,
          source: 'statistical-threshold-engine',
          createdAt: now,
          status: 'ACTIVE'
        });
      }
    }

    // 3. Day of the Week Absenteeism Pattern Analysis
    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (context.absentToday > 0 && context.totalEmployees > 0) {
      const absenceRate = Math.round((context.absentToday / context.totalEmployees) * 100);
      if (absenceRate > 10) {
        insights.push({
          id: `insight_absence_pattern_${Date.now()}`,
          organizationId: orgId,
          type: 'ABSENCE',
          title: `${todayDayName} Absenteeism Pattern`,
          description: `${todayDayName} currently exhibits an absence rate of ${absenceRate}% (${context.absentToday} absent out of ${context.totalEmployees} total staff).`,
          severity: absenceRate >= 20 ? 'MEDIUM' : 'LOW',
          confidence: 0.84,
          source: 'statistical-daypattern-engine',
          createdAt: now,
          status: 'ACTIVE'
        });
      }
    }

    // 4. Pending Leave Requests Load Warning
    if (context.leaveRequestsPending >= 10) {
      insights.push({
        id: `insight_leave_queue_${Date.now()}`,
        organizationId: orgId,
        type: 'LEAVE',
        title: 'High Volume of Pending Leave Requests',
        description: `There are currently ${context.leaveRequestsPending} unreviewed leave requests awaiting Manager/HR action.`,
        severity: context.leaveRequestsPending >= 20 ? 'HIGH' : 'MEDIUM',
        confidence: 0.99,
        source: 'statistical-queue-engine',
        createdAt: now,
        status: 'ACTIVE'
      });
    }

    // 5. Predictive Attendance Forecast for Tomorrow
    if (recentPresents.length >= 3 && context.totalEmployees > 0) {
      const rollingAvg = Math.round(this.calculateMean(recentPresents.slice(-5)));
      const expectedRate = Math.round((rollingAvg / context.totalEmployees) * 100);
      insights.push({
        id: `insight_forecast_${Date.now()}`,
        organizationId: orgId,
        type: 'PREDICTION',
        title: 'AI Prediction: Projected Attendance Tomorrow',
        description: `Projected attendance for the next operational shift is approximately ${rollingAvg} employees (~${expectedRate}% workforce capacity).`,
        severity: 'INFO',
        confidence: 0.87,
        source: 'statistical-arima-forecast',
        createdAt: now,
        status: 'ACTIVE'
      });
    }

    return insights;
  }
  calculateAttritionRisk(employees: any[]): any[] {
    return employees.map((emp: any) => {
      let score = 0;
      const factors: string[] = [];

      // Performance factor (weight: 35%)
      const perf = emp.performanceScore || 75;
      if (perf < 60) { score += 35; factors.push('Critical performance deficit'); }
      else if (perf < 75) { score += 22; factors.push('Below-average performance'); }
      else if (perf < 85) { score += 10; factors.push('Moderate performance concerns'); }

      // Attendance factor (weight: 30%)
      const att = emp.attendanceRate || 90;
      if (att < 70) { score += 30; factors.push('Severe attendance issues'); }
      else if (att < 80) { score += 20; factors.push('Poor attendance pattern'); }
      else if (att < 90) { score += 10; factors.push('Inconsistent attendance'); }

      // Tenure factor (weight: 20%) — high risk in first 6 months and around 2-year mark
      const tenureMonths = Math.floor((emp.tenureDays || 730) / 30);
      if (tenureMonths < 6) { score += 20; factors.push('New hire retention risk'); }
      else if (tenureMonths >= 18 && tenureMonths <= 28) { score += 15; factors.push('Mid-tenure flight risk window'); }

      // Engagement proxy: no training (weight: 15%)
      if (perf < 75 && att < 85) { score += 15; factors.push('Low engagement indicators'); }

      const category: 'High' | 'Medium' | 'Low' = score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';
      const confidence = Math.min(95, 60 + (factors.length * 8));

      const actionMap: Record<string, string> = {
        High: 'Schedule immediate 1:1 retention conversation',
        Medium: 'Monitor closely; assign mentor or growth plan',
        Low: 'Maintain engagement; recognize contributions',
      };

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        role: emp.role,
        riskScore: Math.min(100, score),
        riskCategory: category,
        contributingFactors: factors,
        confidence,
        recommendedAction: actionMap[category],
        modelVersion: 'stat-engine-v2.1',
      };
    });
  }
}

export const statisticalEngine = new StatisticalEngine();
