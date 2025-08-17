import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Apenas administradores podem acessar logs (pode adicionar middleware de perfil se necessário)
router.use(authenticateToken);

router.get('/', LogController.list);

export { router as logRoutes };
