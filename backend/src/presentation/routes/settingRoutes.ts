import { Router } from 'express';
import { getSettings, getSetting, createSetting, updateSetting, deleteSetting } from '../controllers/settingController';
import { isAdmin } from '../middlewares/authMiddleware';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/', isAdmin, getSettings);
router.get('/:id', isAdmin, getSetting);
router.post('/', isAdmin, createSetting);
router.put('/:id', isAdmin, updateSetting);
router.delete('/:id', isAdmin, deleteSetting);

export { router as settingRoutes };
