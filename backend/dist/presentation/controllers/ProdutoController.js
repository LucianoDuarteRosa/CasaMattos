"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoController = void 0;
const ProdutoRepository_1 = require("../../infrastructure/repositories/ProdutoRepository");
const CreateProdutoUseCase_1 = require("../../application/usecases/CreateProdutoUseCase");
const GetProdutoUseCase_1 = require("../../application/usecases/GetProdutoUseCase");
const ListProdutosUseCase_1 = require("../../application/usecases/ListProdutosUseCase");
const UpdateProdutoUseCase_1 = require("../../application/usecases/UpdateProdutoUseCase");
const SearchProdutosUseCase_1 = require("../../application/usecases/SearchProdutosUseCase");
class ProdutoController {
    constructor() {
        this.produtoRepository = new ProdutoRepository_1.ProdutoRepository();
        this.createProdutoUseCase = new CreateProdutoUseCase_1.CreateProdutoUseCase(this.produtoRepository);
        this.getProdutoUseCase = new GetProdutoUseCase_1.GetProdutoUseCase(this.produtoRepository);
        this.listProdutosUseCase = new ListProdutosUseCase_1.ListProdutosUseCase(this.produtoRepository);
        this.updateProdutoUseCase = new UpdateProdutoUseCase_1.UpdateProdutoUseCase(this.produtoRepository);
        this.searchProdutosUseCase = new SearchProdutosUseCase_1.SearchProdutosUseCase(this.produtoRepository);
    }
    async create(req, res) {
        try {
            const produto = await this.createProdutoUseCase.execute(req.body);
            res.status(201).json({
                success: true,
                data: produto,
                message: 'Produto criado com sucesso'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao criar produto'
            });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }
            const produto = await this.getProdutoUseCase.execute(id);
            res.json({
                success: true,
                data: produto
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error.message || 'Produto não encontrado'
            });
        }
    }
    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const result = await this.listProdutosUseCase.execute(page, limit, search);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao listar produtos'
            });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }
            const produto = await this.updateProdutoUseCase.execute(id, req.body);
            res.json({
                success: true,
                data: produto,
                message: 'Produto atualizado com sucesso'
            });
        }
        catch (error) {
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Erro ao atualizar produto'
            });
        }
    }
    async search(req, res) {
        try {
            const term = req.query.term;
            if (!term) {
                res.status(400).json({
                    success: false,
                    message: 'Termo de busca é obrigatório'
                });
                return;
            }
            const produtos = await this.searchProdutosUseCase.execute(term);
            res.json({
                success: true,
                data: produtos
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao buscar produtos'
            });
        }
    }
}
exports.ProdutoController = ProdutoController;
//# sourceMappingURL=ProdutoController.js.map