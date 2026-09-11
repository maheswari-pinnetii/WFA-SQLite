import { randomUUID } from 'crypto';
import { Shift, Holiday, WorkConfig, EmployeeShift } from '../models/index.js';
import { AppError, ErrorCode } from '../utils/apiError.js';

export const shiftService = {
  // ─── SHIFTS ───────────────────────────────────────────────────────────────
  async getShifts(orgId: string) {
    return Shift.find({ companyId: orgId });
  },
  
  async createShift(orgId: string, data: any) {
    if (!data.name || !data.start_time || !data.end_time) {
      throw new AppError(ErrorCode.BAD_REQUEST, 'name, start_time, and end_time are required', 400);
    }
    const id = randomUUID();
    const newShift = {
      id,
      companyId: orgId,
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      break_duration: data.break_duration || 60,
      is_overnight: data.is_overnight || 0,
      color_code: data.color_code || '#10b981',
      location_id: data.location_id,
      department_id: data.department_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await Shift.create([newShift]);
    return newShift;
  },

  async updateShift(id: string, orgId: string, data: any) {
    const shift = await Shift.findOne({ id, companyId: orgId });
    if (!shift) throw new AppError(ErrorCode.NOT_FOUND, 'Shift not found', 404);
    
    const updates = { ...data, updated_at: new Date().toISOString() };
    await Shift.update({ id, companyId: orgId }, updates);
    return { ...shift, ...updates };
  },

  async deleteShift(id: string, orgId: string) {
    await Shift.delete({ id, companyId: orgId });
  },

  // ─── HOLIDAYS ─────────────────────────────────────────────────────────────
  async getHolidays(orgId: string) {
    return Holiday.find({ companyId: orgId });
  },

  async createHoliday(orgId: string, data: any) {
    if (!data.name || !data.date) {
      throw new AppError(ErrorCode.BAD_REQUEST, 'name and date are required', 400);
    }
    const id = randomUUID();
    const newHoliday = {
      id,
      companyId: orgId,
      name: data.name,
      date: data.date,
      type: data.type || 'NATIONAL',
      description: data.description,
      location_id: data.location_id,
      department_id: data.department_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await Holiday.create([newHoliday]);
    return newHoliday;
  },

  async updateHoliday(id: string, orgId: string, data: any) {
    const holiday = await Holiday.findOne({ id, companyId: orgId });
    if (!holiday) throw new AppError(ErrorCode.NOT_FOUND, 'Holiday not found', 404);
    
    const updates = { ...data, updated_at: new Date().toISOString() };
    await Holiday.update({ id, companyId: orgId }, updates);
    return { ...holiday, ...updates };
  },

  async deleteHoliday(id: string, orgId: string) {
    await Holiday.delete({ id, companyId: orgId });
  },

  // ─── WORK CONFIGS ─────────────────────────────────────────────────────────
  async getWorkConfigs(orgId: string) {
    return WorkConfig.find({ companyId: orgId });
  },

  async createWorkConfig(orgId: string, data: any) {
    if (!data.name) {
      throw new AppError(ErrorCode.BAD_REQUEST, 'name is required', 400);
    }
    const id = randomUUID();
    const newConfig = {
      id,
      companyId: orgId,
      name: data.name,
      working_days: data.working_days || '[1, 2, 3, 4, 5]',
      standard_hours_per_day: data.standard_hours_per_day || 8.0,
      is_default: data.is_default ? 1 : 0,
      location_id: data.location_id,
      department_id: data.department_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (newConfig.is_default) {
      // If this is set as default, unset other defaults
      await WorkConfig.update({ companyId: orgId }, { is_default: 0 });
    }
    
    await WorkConfig.create([newConfig]);
    return newConfig;
  },

  async updateWorkConfig(id: string, orgId: string, data: any) {
    const config = await WorkConfig.findOne({ id, companyId: orgId });
    if (!config) throw new AppError(ErrorCode.NOT_FOUND, 'Work config not found', 404);
    
    const updates = { ...data, updated_at: new Date().toISOString() };
    if (updates.is_default) {
      await WorkConfig.update({ companyId: orgId }, { is_default: 0 });
    }
    
    await WorkConfig.update({ id, companyId: orgId }, updates);
    return { ...config, ...updates };
  },

  async deleteWorkConfig(id: string, orgId: string) {
    await WorkConfig.delete({ id, companyId: orgId });
  }
};

