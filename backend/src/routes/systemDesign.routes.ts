import { Router } from 'express';
import { getPatternsOverview, getBaaSOverview, executePatternDemo } from '../controllers/systemDesign.controller.js';

const router = Router();

router.get('/patterns', getPatternsOverview);
router.get('/baas-apis', getBaaSOverview);
router.post('/execute/:pattern', executePatternDemo);

export default router;
