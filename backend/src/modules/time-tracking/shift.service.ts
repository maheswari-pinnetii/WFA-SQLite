import { randomUUID } from 'crypto';
import { AppError, ErrorCode } from '../../utils/apiError.js';
import { getDb } from '../../config/db.js';

export const shiftService = {
  // ─── SHIFTS ───────────────────────────────────────────────────────────────
  async getShifts(orgId: string) {
    const db = getDb();
    return db.prepare(`SELECT * FROM shifts WHERE organizationId = ?`).all(orgId);
  },
  
  async createShift(orgId: string, data: any) {
    if (!data.name || !data.startTime || !data.endTime) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'name, startTime, and endTime are required', 400);
    }
    const db = getDb();
    const id = `sh-${randomUUID()}`;
    const newShift = {
      id,
      organizationId: orgId,
      name: data.name,
      shiftType: data.shiftType || 'fixed',
      startTime: data.startTime,
      endTime: data.endTime,
      breakDurationMinutes: data.breakDurationMinutes || 60,
      gracePeriodMinutes: data.gracePeriodMinutes || 0,
      workHoursPerDay: data.workHoursPerDay || 8,
      weekOffDays: JSON.stringify(data.weekOffDays || ['Saturday', 'Sunday']),
      isFlexible: data.isFlexible ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.prepare(`
      INSERT INTO shifts (id, name, shiftType, startTime, endTime, breakDurationMinutes, gracePeriodMinutes, workHoursPerDay, weekOffDays, isFlexible, organizationId, createdAt, updatedAt)
      VALUES (@id, @name, @shiftType, @startTime, @endTime, @breakDurationMinutes, @gracePeriodMinutes, @workHoursPerDay, @weekOffDays, @isFlexible, @organizationId, @createdAt, @updatedAt)
    `).run(newShift);
    
    return newShift;
  },

  async updateShift(id: string, orgId: string, data: any) {
    const db = getDb();
    const shift = db.prepare(`SELECT * FROM shifts WHERE id = ? AND organizationId = ?`).get(id, orgId);
    if (!shift) throw new AppError(ErrorCode.NOT_FOUND, 'Shift not found', 404);
    
    const updates = { ...shift, ...data, updatedAt: new Date().toISOString() };
    if (Array.isArray(updates.weekOffDays)) updates.weekOffDays = JSON.stringify(updates.weekOffDays);
    updates.isFlexible = updates.isFlexible ? 1 : 0;
    
    db.prepare(`
      UPDATE shifts SET 
        name = @name, shiftType = @shiftType, startTime = @startTime, endTime = @endTime, 
        breakDurationMinutes = @breakDurationMinutes, gracePeriodMinutes = @gracePeriodMinutes, 
        workHoursPerDay = @workHoursPerDay, weekOffDays = @weekOffDays, isFlexible = @isFlexible, 
        updatedAt = @updatedAt
      WHERE id = @id AND organizationId = @organizationId
    `).run(updates);
    
    return updates;
  },

  async deleteShift(id: string, orgId: string) {
    const db = getDb();
    db.prepare(`DELETE FROM shifts WHERE id = ? AND organizationId = ?`).run(id, orgId);
  },

  // ─── HOLIDAYS ─────────────────────────────────────────────────────────────
  async getHolidays(orgId: string) {
    const db = getDb();
    try {
      return db.prepare(`SELECT * FROM holidays WHERE companyId = ?`).all(orgId);
    } catch {
      return [];
    }
  },

  async createHoliday(orgId: string, data: any) {
    if (!data.name || !data.date) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'name and date are required', 400);
    }
    const db = getDb();
    const id = randomUUID();
    const newHoliday = {
      id,
      companyId: orgId,
      name: data.name,
      date: data.date,
      type: data.type || 'NATIONAL',
      description: data.description || '',
      location_id: data.location_id || null,
      department_id: data.department_id || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      db.prepare(`
        INSERT INTO holidays (id, companyId, name, date, type, description, location_id, department_id, createdAt, updatedAt)
        VALUES (@id, @companyId, @name, @date, @type, @description, @location_id, @department_id, @createdAt, @updatedAt)
      `).run(newHoliday);
    } catch (e: any) {
      console.warn("Could not insert holiday:", e.message);
    }
    return newHoliday;
  },

  async updateHoliday(id: string, orgId: string, data: any) {
    const db = getDb();
    let holiday;
    try {
      holiday = db.prepare(`SELECT * FROM holidays WHERE id = ? AND companyId = ?`).get(id, orgId);
    } catch {
      throw new AppError(ErrorCode.NOT_FOUND, 'Holiday not found', 404);
    }
    if (!holiday) throw new AppError(ErrorCode.NOT_FOUND, 'Holiday not found', 404);
    
    const updates = { ...holiday, ...data, updatedAt: new Date().toISOString() };
    db.prepare(`
      UPDATE holidays SET 
        name = @name, date = @date, type = @type, description = @description, 
        location_id = @location_id, department_id = @department_id, updatedAt = @updatedAt
      WHERE id = @id AND companyId = @companyId
    `).run(updates);
    return updates;
  },

  async deleteHoliday(id: string, orgId: string) {
    const db = getDb();
    try {
      db.prepare(`DELETE FROM holidays WHERE id = ? AND companyId = ?`).run(id, orgId);
    } catch {}
  },

  // ─── WORK CONFIGS ─────────────────────────────────────────────────────────
  async getWorkConfigs(orgId: string) {
    const db = getDb();
    try {
      return db.prepare(`SELECT * FROM work_configurations WHERE organizationId = ?`).all(orgId);
    } catch {
      return [];
    }
  },

  async createWorkConfig(orgId: string, data: any) {
    if (!data.name) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'name is required', 400);
    }
    const db = getDb();
    const id = randomUUID();
    const newConfig = {
      id,
      organizationId: orgId,
      name: data.name,
      workMode: data.workMode || 'HYBRID',
      weeklyHours: data.weeklyHours || 40,
      flexibleHours: data.flexibleHours || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.prepare(`
      INSERT INTO work_configurations (id, organizationId, name, workMode, weeklyHours, flexibleHours, createdAt, updatedAt)
      VALUES (@id, @organizationId, @name, @workMode, @weeklyHours, @flexibleHours, @createdAt, @updatedAt)
    `).run(newConfig);
    return newConfig;
  },

  async updateWorkConfig(id: string, orgId: string, data: any) {
    const db = getDb();
    const config = db.prepare(`SELECT * FROM work_configurations WHERE id = ? AND organizationId = ?`).get(id, orgId);
    if (!config) throw new AppError(ErrorCode.NOT_FOUND, 'Work config not found', 404);
    
    const updates = { ...config, ...data, updatedAt: new Date().toISOString() };
    db.prepare(`
      UPDATE work_configurations SET 
        name = @name, workMode = @workMode, weeklyHours = @weeklyHours, flexibleHours = @flexibleHours, updatedAt = @updatedAt
      WHERE id = @id AND organizationId = @organizationId
    `).run(updates);
    return updates;
  },

  async deleteWorkConfig(id: string, orgId: string) {
    const db = getDb();
    db.prepare(`DELETE FROM work_configurations WHERE id = ? AND organizationId = ?`).run(id, orgId);
  }
};

