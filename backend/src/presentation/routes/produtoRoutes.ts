import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const produtoController = new ProdutoController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/produtos - Listar produtos com paginação
router.get('/', (req, res) => produtoController.list(req, res));

// GET /api/produtos/search - Buscar produtos
router.get('/search', (req, res) => produtoController.search(req, res));

// GET /api/produtos/:id - Obter produto por ID
router.get('/:id', (req, res) => produtoController.getById(req, res));

// POST /api/produtos - Criar novo produto
router.post('/', (req, res) => produtoController.create(req, res));

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', (req, res) => produtoController.update(req, res));

export default router;
