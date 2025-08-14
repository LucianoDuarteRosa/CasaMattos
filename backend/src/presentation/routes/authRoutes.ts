import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/auth';
import { logLogout } from '../middlewares/logging';

const router = Router();

// Rota de login
router.post('/login', AuthController.login);

// Rota de logout (com logging)
router.post('/logout', authenticateToken, logLogout, AuthController.logout);

// Rota para obter dados do usuário atual
router.get('/me', AuthController.me);

export default router;
