import { Request, Response } from 'express';
import { timesheetService } from '../services/timesheet.service.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await timesheetService.getProjects();
    res.json({ success: true, data: projects });
  } catch (error: any) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const getMyTimesheets = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const timesheets = await timesheetService.getMyTimesheets(employeeId);
    res.json({ success: true, data: timesheets });
  } catch (error: any) {
    console.error('Error in getMyTimesheets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timesheets' });
  }
};

export const getTimesheetById = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const id = String(req.params.id);
    const timesheet = await timesheetService.getTimesheetById(id, employeeId);
    
    if (!timesheet) {
      return res.status(404).json({ success: false, message: 'Timesheet not found' });
    }

    res.json({ success: true, data: timesheet });
  } catch (error: any) {
    console.error('Error in getTimesheetById:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timesheet details' });
  }
};

export const saveTimesheet = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const { startDate, endDate, status, totalHours, entries, id } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const result = await timesheetService.saveTimesheet(employeeId, { id, startDate, endDate, status, totalHours, entries });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in saveTimesheet:', error);
    res.status(500).json({ success: false, message: 'Failed to save timesheet' });
  }
};
