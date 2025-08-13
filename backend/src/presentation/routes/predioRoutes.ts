import { Router } from 'express';
import { PredioController } from '../controllers/PredioController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const predioController = new PredioController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas CRUD para prédios
router.post('/', (req, res) => predioController.create(req, res));
router.get('/', (req, res) => predioController.list(req, res));
router.get('/search', (req, res) => predioController.search(req, res));
router.get('/:id', (req, res) => predioController.getById(req, res));
router.put('/:id', (req, res) => predioController.update(req, res));
router.delete('/:id', (req, res) => predioController.delete(req, res));

export { router as predioRoutes };
