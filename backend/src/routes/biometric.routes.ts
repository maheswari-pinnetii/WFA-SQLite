import { Router } from 'express';
import { handleDeviceInit, handleGetRequest, handleCdata } from '../controllers/biometric.controller.js';

const router = Router();

// ZKTeco devices use GET for handshakes/polling and POST for data pushes.
router.get('/cdata', handleDeviceInit);
router.get('/getrequest', handleGetRequest);
router.post('/cdata', handleCdata);

export default router;
