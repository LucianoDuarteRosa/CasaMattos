import express from 'express';
import { EstoqueController } from '../controllers/EstoqueController';

const router = express.Router();
const estoqueController = new EstoqueController();

// POST /api/estoque/transferir-deposito-estoque - Transferir produto do depósito para estoque
router.post('/transferir-deposito-estoque', (req, res) => estoqueController.transferirDepositoParaEstoque(req, res));

// POST /api/estoque/retirar-estoque - Retirar produto do estoque
router.post('/retirar-estoque', (req, res) => estoqueController.retirarDoEstoque(req, res));

// GET /api/estoque/produto/:produtoId - Consultar estoque de um produto
router.get('/produto/:produtoId', (req, res) => estoqueController.consultarEstoqueProduto(req, res));

// GET /api/estoque/produto/:produtoId/detalhado - Listar estoque detalhado de um produto
router.get('/produto/:produtoId/detalhado', (req, res) => estoqueController.listarEstoqueDetalhado(req, res));

export default router;
