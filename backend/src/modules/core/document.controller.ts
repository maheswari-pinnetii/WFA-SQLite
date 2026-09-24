import { Request, Response } from 'express';
import { employeeLifecycleService } from '../users/employee-lifecycle.service.js';
import { logger } from '../../config/logger.js';

const getUser = (req: Request) => (req as any).user;

export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    
    // Employee looks up their own documents
    const employeeId = user.employeeId || user.id; 
    
    const data = await employeeLifecycleService.getDocuments(employeeId, user.organizationId);
    
    // Map data to expected frontend format (frontend expects 'title', 'type', 'fileUrl')
    const mappedData = data.map((doc: any) => ({
      id: doc.id,
      title: doc.metadata ? JSON.parse(doc.metadata).title : doc.documentType,
      type: doc.documentType,
      fileUrl: doc.documentUrl,
      createdAt: doc.uploadedAt
    }));

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    logger.error(`[DocumentController] getMyDocuments: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { title, type, fileUrl } = req.body;

    if (!type || !fileUrl) {
      return res.status(400).json({ success: false, message: 'type and fileUrl are required' });
    }

    const employeeId = user.employeeId || user.id;

    const data = await employeeLifecycleService.addDocument(employeeId, {
      documentType: type,
      documentUrl: fileUrl,
      metadata: JSON.stringify({ title: title || type }),
      uploadedBy: user.id,
      organizationId: user.organizationId
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    logger.error(`[DocumentController] uploadDocument: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
