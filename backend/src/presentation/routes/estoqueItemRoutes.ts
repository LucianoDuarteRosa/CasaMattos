
import express from 'express';
import { EstoqueItemController } from '../controllers/EstoqueItemController';
import { addExecutorUserId } from '../middlewares/executorUserId';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();
const estoqueItemController = new EstoqueItemController();


// ================= ROTAS DE ITENS DE ESTOQUE =================

// Listar todos os itens de estoque de um produto
// GET /api/estoque-item/produto/:produtoId/itens
router.get('/produto/:produtoId/itens', (req, res) => estoqueItemController.listarEstoqueItens(req, res));

// Transferir quantidade do depósito para o estoque (pode criar ou atualizar itens)
// POST /api/estoque-item/transferir-deposito-estoque
router.post('/transferir-deposito-estoque', authenticateToken, addExecutorUserId, (req, res) => estoqueItemController.transferirDepositoParaEstoque(req, res));

// Retirar quantidade do estoque de um produto
// POST /api/estoque-item/retirar-estoque
router.post('/retirar-estoque', (req, res) => estoqueItemController.retirarDoEstoque(req, res));

// Consultar saldo total de estoque de um produto
// GET /api/estoque-item/produto/:produtoId
router.get('/produto/:produtoId', (req, res) => estoqueItemController.consultarEstoqueProduto(req, res));

// Listar estoque detalhado de um produto (com informações adicionais)
// GET /api/estoque-item/produto/:produtoId/detalhado
router.get('/produto/:produtoId/detalhado', (req, res) => estoqueItemController.listarEstoqueDetalhado(req, res));

// Criar novo item de estoque
// POST /api/estoque-item/
router.post('/', authenticateToken, addExecutorUserId, (req, res) => estoqueItemController.create(req, res));

// Atualizar um item de estoque existente
// PUT /api/estoque-item/:id
router.put('/:id', authenticateToken, addExecutorUserId, (req, res) => estoqueItemController.update(req, res));

export default router;
