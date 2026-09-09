import { Request, Response } from 'express';
import { employeeLifecycleService } from '../services/employee-lifecycle.service.js';
import { logger } from '../config/logger.js';

const getUser = (req: Request) => (req as any).user;

export const getStatusHistory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = getUser(req);
    const data = await employeeLifecycleService.getStatusHistory(id, user.organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Lifecycle] getStatusHistory: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFieldHistory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = getUser(req);
    const data = await employeeLifecycleService.getFieldHistory(id, user.organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Lifecycle] getFieldHistory: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const transitionStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, reason, effectiveDate } = req.body;
    const user = getUser(req);

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const data = await employeeLifecycleService.transitionStatus(id, status, {
      reason,
      effectiveDate,
      changedBy: user.id,
      organizationId: user.organizationId
    });
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Lifecycle] transitionStatus: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = getUser(req);
    const data = await employeeLifecycleService.getDocuments(id, user.organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Lifecycle] getDocuments: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addDocument = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { documentType, documentUrl, metadata } = req.body;
    const user = getUser(req);

    if (!documentType || !documentUrl) {
      return res.status(400).json({ success: false, message: 'documentType and documentUrl are required' });
    }

    const data = await employeeLifecycleService.addDocument(id, {
      documentType,
      documentUrl,
      metadata,
      uploadedBy: user.id,
      organizationId: user.organizationId
    });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Lifecycle] addDocument: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
