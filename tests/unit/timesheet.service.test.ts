vi.mock('@sqlitecloud/drivers', () => { return { Database: vi.fn().mockImplementation(() => ({ sql: vi.fn().mockResolvedValue([]) })) }; });
vi.mock('../../backend/src/database/sqlite-cloud', () => ({
  query: vi.fn(),
  execute: vi.fn()
}));
vi.mock('../../backend/src/database/sqlite-cloud.js', () => ({
  query: vi.fn(),
  execute: vi.fn()
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timesheetService } from '../../backend/src/modules/time-tracking/timesheet.service.js';
import { ORGANIZATION_ID } from '../../backend/src/config/db.js';
import * as sqliteCloud from '../../backend/src/database/sqlite-cloud.js';
import { workflowService } from '../../backend/src/modules/core/workflow.service.js';

vi.mock('../../backend/src/database/sqlite-cloud.ts', () => ({
  query: vi.fn(),
  execute: vi.fn(),
}));

vi.mock('../../backend/src/modules/core/workflow.service.js', () => ({
  workflowService: {
    createRequest: vi.fn(),
  },
}));

describe.skip('TimesheetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return active projects for the organization', async () => {
      const mockProjects = [{ id: 'p1', name: 'Project 1' }];
      vi.mocked(sqliteCloud.query).mockResolvedValue(mockProjects);

      const result = await timesheetService.getProjects();

      expect(sqliteCloud.query).toHaveBeenCalledWith(
        `SELECT * FROM projects WHERE organizationId = ? AND status = 'ACTIVE'`,
        [ORGANIZATION_ID]
      );
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getMyTimesheets', () => {
    it('should return timesheets for an employee', async () => {
      const employeeId = 'emp1';
      const mockTimesheets = [{ id: 'ts1' }];
      vi.mocked(sqliteCloud.query).mockResolvedValue(mockTimesheets);

      const result = await timesheetService.getMyTimesheets(employeeId);

      expect(sqliteCloud.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM timesheets'),
        [employeeId, ORGANIZATION_ID]
      );
      expect(result).toEqual(mockTimesheets);
    });
  });

  describe('getTimesheetById', () => {
    it('should return null if timesheet is not found', async () => {
      vi.mocked(sqliteCloud.query).mockResolvedValue([]);
      
      const result = await timesheetService.getTimesheetById('id', 'emp1');
      expect(result).toBeNull();
    });

    it('should return timesheet with entries', async () => {
      const mockTimesheet = { id: 'ts1', employeeId: 'emp1' };
      const mockEntries = [{ id: 'e1', hours: 8 }];
      
      vi.mocked(sqliteCloud.query)
        .mockResolvedValueOnce([mockTimesheet]) // first call for timesheet
        .mockResolvedValueOnce(mockEntries); // second call for entries

      const result = await timesheetService.getTimesheetById('ts1', 'emp1');

      expect(result).toEqual({ ...mockTimesheet, entries: mockEntries });
      expect(sqliteCloud.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('saveTimesheet', () => {
    it('should insert a new timesheet and entries', async () => {
      const employeeId = 'emp1';
      const data = {
        startDate: '2023-01-01',
        endDate: '2023-01-07',
        status: 'DRAFT',
        totalHours: 40,
        entries: [
          { projectId: 'p1', date: '2023-01-01', hours: 8, description: 'Work' }
        ]
      };

      const result = await timesheetService.saveTimesheet(employeeId, data);

      expect(result.success).toBe(true);
      expect(result.timesheetId).toBeDefined();
      expect(sqliteCloud.execute).toHaveBeenCalledTimes(2); // 1 for timesheet, 1 for entry
    });

    it('should update an existing timesheet', async () => {
      const employeeId = 'emp1';
      const data = {
        id: 'ts1',
        startDate: '2023-01-01',
        endDate: '2023-01-07',
        status: 'DRAFT',
        totalHours: 40,
        entries: []
      };

      const result = await timesheetService.saveTimesheet(employeeId, data);

      expect(result.success).toBe(true);
      expect(result.timesheetId).toBe('ts1');
      expect(sqliteCloud.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE timesheets SET'),
        expect.any(Array)
      );
      expect(sqliteCloud.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM timesheet_entries'),
        ['ts1']
      );
    });

    it('should trigger workflow if status is PENDING', async () => {
      const employeeId = 'emp1';
      const data = {
        startDate: '2023-01-01',
        endDate: '2023-01-07',
        status: 'PENDING',
        totalHours: 40,
        entries: []
      };

      vi.mocked(sqliteCloud.query).mockResolvedValue([{ id: 'wf1' }]);

      await timesheetService.saveTimesheet(employeeId, data);

      expect(sqliteCloud.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM approval_workflows')
      );
      expect(workflowService.createRequest).toHaveBeenCalledWith({
        workflowId: 'wf1',
        entityId: expect.any(String),
        requesterId: employeeId
      });
    });
  });
});

