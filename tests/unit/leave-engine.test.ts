import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leaveEngineService } from '../../backend/src/modules/leave/leave-engine.service';
import * as db from '../../backend/src/database/sqlite-cloud';

vi.mock('../../backend/src/database/sqlite-cloud.js', () => ({
  query: vi.fn(),
  execute: vi.fn(),
}));
vi.mock('../../backend/src/config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('leaveEngineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should query leave_types for the organization', async () => {
      vi.mocked(db.query).mockResolvedValueOnce([{ id: '1', name: 'Annual' }]);
      const result = await leaveEngineService.getLeaveTypes('org-1');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM leave_types WHERE organizationId = ?'),
        ['org-1']
      );
      expect(result).toEqual([{ id: '1', name: 'Annual' }]);
    });
  });

  describe('createLeaveType', () => {
    it('should execute INSERT and return an id', async () => {
      vi.mocked(db.execute).mockResolvedValueOnce(undefined);
      const data = { name: 'Sick', defaultDays: 10, isPaid: true };
      const result = await leaveEngineService.createLeaveType('org-1', data);
      
      expect(result).toHaveProperty('id');
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO leave_types'),
        [result.id, 'org-1', 'Sick', null, 10, 1]
      );
    });
  });

  describe('getLeaveBalances', () => {
    it('should query leave_balances for the employee and organization', async () => {
      vi.mocked(db.query).mockResolvedValueOnce([{ id: 'bal-1' }]);
      const result = await leaveEngineService.getLeaveBalances('emp-1', 'org-1', 2025);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT lb.*, lt.name as leaveTypeName, lt.isPaid'),
        ['emp-1', 'org-1', 2025]
      );
      expect(result).toEqual([{ id: 'bal-1' }]);
    });
  });
});
