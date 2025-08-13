import { Router } from 'express';
import { RuaController } from '../controllers/RuaController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const ruaController = new RuaController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas CRUD para ruas
router.post('/', (req, res) => ruaController.create(req, res));
router.get('/', (req, res) => ruaController.list(req, res));
router.get('/search', (req, res) => ruaController.search(req, res));
router.get('/:id', (req, res) => ruaController.getById(req, res));
router.put('/:id', (req, res) => ruaController.update(req, res));
router.delete('/:id', (req, res) => ruaController.delete(req, res));

export { router as ruaRoutes };
