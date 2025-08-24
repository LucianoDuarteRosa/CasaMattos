
import express from 'express';
import { EstoqueController } from '../controllers/EstoqueController';
import { addExecutorUserId } from '../middlewares/executorUserId';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();
const estoqueController = new EstoqueController();

// GET /api/estoque/produto/:produtoId/itens - Listar apenas os EstoqueItems de um produto
router.get('/produto/:produtoId/itens', (req, res) => estoqueController.listarEstoqueItens(req, res));

// Proteger e adicionar executorUserId
router.post('/transferir-deposito-estoque', authenticateToken, addExecutorUserId, (req, res) => estoqueController.transferirDepositoParaEstoque(req, res));

// POST /api/estoque/retirar-estoque - Retirar produto do estoque
router.post('/retirar-estoque', (req, res) => estoqueController.retirarDoEstoque(req, res));

// GET /api/estoque/produto/:produtoId - Consultar estoque de um produto
router.get('/produto/:produtoId', (req, res) => estoqueController.consultarEstoqueProduto(req, res));

// GET /api/estoque/produto/:produtoId/detalhado - Listar estoque detalhado de um produto
router.get('/produto/:produtoId/detalhado', (req, res) => estoqueController.listarEstoqueDetalhado(req, res));

export default router;
