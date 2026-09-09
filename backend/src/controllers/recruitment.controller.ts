import { Request, Response } from 'express';
import { recruitmentService } from '../services/recruitment.service.js';
import { logger } from '../config/logger.js';

const u = (req: Request) => (req as any).user;

export const listRequisitions = async (req: Request, res: Response) => {
  try {
    const { status, department } = req.query as Record<string, string>;
    const data = await recruitmentService.getRequisitions(u(req).organizationId, { status, department });
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(`[Recruitment] listRequisitions: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createRequisition = async (req: Request, res: Response) => {
  try {
    const { title, department, openings } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const data = await recruitmentService.createRequisition(u(req).organizationId, { title, department, openings });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRequisitionStatus = async (req: Request, res: Response) => {
  try {
    await recruitmentService.updateRequisitionStatus(req.params.id, u(req).organizationId, req.body.status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listApplications = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as Record<string, string>;
    const data = await recruitmentService.getApplications(req.params.reqId, { status });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const { candidateName, candidateEmail } = req.body;
    if (!candidateName || !candidateEmail)
      return res.status(400).json({ success: false, message: 'candidateName and candidateEmail required' });
    const data = await recruitmentService.createApplication({ jobRequisitionId: req.params.reqId, candidateName, candidateEmail });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.message.includes('already applied'))
      return res.status(409).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const { interviewerId, scheduledAt } = req.body;
    const data = await recruitmentService.scheduleInterview({ applicationId: req.params.appId, interviewerId, scheduledAt });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { feedback, status } = req.body;
    await recruitmentService.submitInterviewFeedback(req.params.interviewId, feedback, status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOffer = async (req: Request, res: Response) => {
  try {
    const { salaryOffered } = req.body;
    const data = await recruitmentService.createOffer(req.params.appId, salaryOffered);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const respondToOffer = async (req: Request, res: Response) => {
  try {
    const { response } = req.body;
    const data = await recruitmentService.respondToOffer(req.params.offerId, response);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecruitmentFunnel = async (req: Request, res: Response) => {
  try {
    const data = await recruitmentService.getRecruitmentFunnel(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
