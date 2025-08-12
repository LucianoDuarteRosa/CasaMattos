import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Rota de login
router.post('/login', AuthController.login);

// Rota para obter dados do usuário atual
router.get('/me', AuthController.me);

export default router;
