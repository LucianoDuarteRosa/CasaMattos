import { Router } from 'express';
import { getSettings, getSetting, createSetting, updateSetting, deleteSetting } from '../controllers/settingController';
import { isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', isAdmin, getSettings);
router.get('/:id', isAdmin, getSetting);
router.post('/', isAdmin, createSetting);
router.put('/:id', isAdmin, updateSetting);
router.delete('/:id', isAdmin, deleteSetting);

export { router as settingRoutes };
