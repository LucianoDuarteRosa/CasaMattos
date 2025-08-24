import { Router } from 'express';
import { getSettings, getSetting, createSetting, updateSetting, deleteSetting } from '../controllers/SettingController';
import { isAdmin } from '../middlewares/authMiddleware';
import { authenticateToken } from '../middlewares/auth';
import { contextMiddleware } from '../middlewares/contextMiddleware';
import { addExecutorUserId } from '../middlewares/executorUserId';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(contextMiddleware);
router.use(addExecutorUserId);

router.get('/', isAdmin, getSettings);
router.get('/:id', isAdmin, getSetting);
router.post('/', isAdmin, createSetting);
router.put('/:id', isAdmin, updateSetting);
router.delete('/:id', isAdmin, deleteSetting);

export { router as settingRoutes };
