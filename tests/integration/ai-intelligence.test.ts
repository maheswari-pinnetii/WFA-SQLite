import { describe, it, expect } from 'vitest';
import { StatisticalEngine, statisticalEngine } from '../../backend/src/services/ai/statisticalEngine.js';
import { AnalyticsContext } from '../../backend/src/services/ai/aiProvider.interface.js';

describe('StatisticalEngine Workforce Analytics', () => {
  const engine = new StatisticalEngine();

  it('computes mean and standard deviation accurately', () => {
    const values = [10, 20, 30, 40, 50];
    const mean = engine.calculateMean(values);
    expect(mean).toBe(30);

    const stdDev = engine.calculateStandardDeviation(values);
    expect(Math.round(stdDev * 100) / 100).toBe(15.81);
  });

  it('computes Z-score accurately', () => {
    const z = engine.calculateZScore(60, 50, 5);
    expect(z).toBe(2);

    const zDrop = engine.calculateZScore(40, 50, 5);
    expect(zDrop).toBe(-2);
  });

  it('detects severe attendance drop anomalies', () => {
    const context: AnalyticsContext = {
      organizationId: 'org-stackly',
      totalEmployees: 100,
      presentToday: 60, // 40% drop compared to 100 average
      absentToday: 40,
      lateToday: 2,
      onBreakToday: 0,
      attendanceHistory: [
        { date: '2026-09-01', present: 98, absent: 2, late: 1 },
        { date: '2026-08-31', present: 97, absent: 3, late: 2 },
        { date: '2026-08-30', present: 99, absent: 1, late: 0 },
        { date: '2026-08-29', present: 96, absent: 4, late: 2 }
      ],
      leaveRequestsPending: 2
    };

    const insights = engine.analyzeWorkforceData(context);
    const dropInsight = insights.find((i) => i.type === 'ANOMALY');

    expect(dropInsight).toBeDefined();
    expect(dropInsight?.severity).toBe('HIGH');
    expect(dropInsight?.title).toContain('Attendance Drop Anomaly');
    expect(dropInsight?.confidence).toBeGreaterThan(0.8);
  });

  it('detects late arrival spikes', () => {
    const context: AnalyticsContext = {
      organizationId: 'org-stackly',
      totalEmployees: 100,
      presentToday: 50,
      absentToday: 50,
      lateToday: 15, // 30% of checked-in employees are late
      onBreakToday: 0,
      attendanceHistory: [
        { date: '2026-09-01', present: 50, absent: 50, late: 2 },
        { date: '2026-08-31', present: 50, absent: 50, late: 1 }
      ],
      leaveRequestsPending: 0
    };

    const insights = engine.analyzeWorkforceData(context);
    const lateInsight = insights.find((i) => i.type === 'LATE_ARRIVAL');

    expect(lateInsight).toBeDefined();
    expect(lateInsight?.severity).toBe('HIGH');
    expect(lateInsight?.description).toContain('30%');
  });

  it('generates next-day workforce predictive capacity forecasts', () => {
    const context: AnalyticsContext = {
      organizationId: 'org-stackly',
      totalEmployees: 100,
      presentToday: 92,
      absentToday: 8,
      lateToday: 1,
      onBreakToday: 0,
      attendanceHistory: [
        { date: '2026-09-01', present: 90, absent: 10, late: 1 },
        { date: '2026-08-31', present: 92, absent: 8, late: 2 },
        { date: '2026-08-30', present: 94, absent: 6, late: 0 }
      ],
      leaveRequestsPending: 1
    };

    const insights = engine.analyzeWorkforceData(context);
    const forecast = insights.find((i) => i.type === 'PREDICTION');

    expect(forecast).toBeDefined();
    expect(forecast?.severity).toBe('INFO');
    expect(forecast?.title).toContain('Projected Attendance Tomorrow');
  });
});
