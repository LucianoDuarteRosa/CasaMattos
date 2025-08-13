import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const usuarioController = new UsuarioController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para administradores
router.post('/', usuarioController.create.bind(usuarioController));
router.get('/', usuarioController.list.bind(usuarioController));
router.get('/:id', usuarioController.getById.bind(usuarioController));
router.put('/:id', usuarioController.update.bind(usuarioController));
router.put('/:id/senha', usuarioController.updatePassword.bind(usuarioController));
router.delete('/:id', usuarioController.delete.bind(usuarioController));

// Rota para upload de imagem
router.post('/:id/upload-image', upload.single('image'), usuarioController.uploadImage.bind(usuarioController));

// Rota para perfil do usuário logado
router.get('/me/profile', usuarioController.getProfile.bind(usuarioController));

export { router as usuarioRoutes };
