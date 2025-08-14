import { Router } from 'express';
import { FornecedorController } from '../controllers/FornecedorController';
import { authenticateToken } from '../middlewares/auth';
import { addExecutorUserId } from '../middlewares/executorUserId';

const router = Router();
const fornecedorController = new FornecedorController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Adicionar executorUserId automaticamente para operações que modificam dados
router.use(addExecutorUserId);

// GET /api/fornecedores - Listar fornecedores
router.get('/', (req, res) => fornecedorController.getAll(req, res));

// GET /api/fornecedores/search - Buscar fornecedores
router.get('/search', (req, res) => fornecedorController.search(req, res));

// GET /api/fornecedores/:id - Obter fornecedor por ID
router.get('/:id', (req, res) => fornecedorController.getById(req, res));

// POST /api/fornecedores - Criar novo fornecedor
router.post('/', (req, res) => fornecedorController.create(req, res));

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put('/:id', (req, res) => fornecedorController.update(req, res));

// DELETE /api/fornecedores/:id - Deletar fornecedor
router.delete('/:id', (req, res) => fornecedorController.delete(req, res));

export default router;
