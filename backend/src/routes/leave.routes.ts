import { Router } from 'express';
import { getMyLeaveBalances, runAccruals, validateRequest } from '../controllers/leave.controller.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/balances/me', getMyLeaveBalances);
router.post('/accruals/run', authorizeRoles(['ADMIN', 'HR']), runAccruals);
router.post('/validate', validateRequest);

export default router;
