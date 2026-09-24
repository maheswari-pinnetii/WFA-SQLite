import { execute, query, transaction } from '../../database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../config/logger.js';

export class BiometricService {
  /**
   * Processes ZKTeco ADMS CData payload.
   * Format of each line: PIN\tTime\tState\tVerifyMethod\t... 
   */
  async processAttendanceData(rawData: string, sn: string) {
    if (!rawData || rawData.trim() === '') return { count: 0 };

    const lines = rawData.split('\n');
    let processedCount = 0;

    await transaction(async () => {
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split('\t');
        if (parts.length < 4) continue;

        const pin = parts[0];
        const timeStr = parts[1]; // e.g. 2026-09-23 09:00:00
        const state = parts[2];
        const verifyMethod = parts[3];

        // Map PIN to Employee UUID
        const empRows = await query('SELECT id, organizationId FROM employees WHERE employeeCode = ? LIMIT 1', [pin]);
        if (!empRows || empRows.length === 0) {
          logger.warn('biometric.unmapped_pin', `Unmapped biometric PIN: ${pin} from SN: ${sn}`);
          continue;
        }

        const employeeId = empRows[0].id;
        const orgId = empRows[0].organizationId;
        const timestamp = new Date(timeStr.replace(' ', 'T') + 'Z').toISOString();

        // Determine event type based on state
        // ZKTeco states usually: 0=Check-in, 1=Check-out, 4=Overtime-in, 5=Overtime-out
        let eventType = 'UNKNOWN';
        if (state === '0' || state === '4') eventType = 'CHECK_IN';
        if (state === '1' || state === '5') eventType = 'CHECK_OUT';

        await execute(`
          INSERT INTO attendance_events (
            id, organizationId, employeeId, eventType, eventTimestamp, 
            source, deviceId, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          orgId,
          employeeId,
          eventType,
          timestamp,
          'biometric',
          sn,
          new Date().toISOString()
        ]);

        processedCount++;
      }
    });

    return { count: processedCount };
  }
}

export const biometricService = new BiometricService();
