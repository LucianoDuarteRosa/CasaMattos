"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProdutoController_1 = require("../controllers/ProdutoController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const produtoController = new ProdutoController_1.ProdutoController();
// Todas as rotas requerem autenticação
router.use(auth_1.authenticateToken);
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
exports.default = router;
//# sourceMappingURL=produtoRoutes.js.map