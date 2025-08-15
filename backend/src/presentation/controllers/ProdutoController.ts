import { Request, Response } from 'express';
import { ProdutoRepository } from '../../infrastructure/repositories/ProdutoRepository';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { EstoqueItemRepository } from '../../infrastructure/repositories/EstoqueItemRepository';
import { CreateProdutoUseCase } from '../../application/usecases/CreateProdutoUseCase';
import { GetProdutoUseCase } from '../../application/usecases/GetProdutoUseCase';
import { ListProdutosUseCase } from '../../application/usecases/ListProdutosUseCase';
import { UpdateProdutoUseCase } from '../../application/usecases/UpdateProdutoUseCase';
import { SearchProdutosUseCase } from '../../application/usecases/SearchProdutosUseCase';
import { EstoqueCalculoService } from '../../application/services/EstoqueCalculoService';
import { ProdutoEstoqueService } from '../../application/services/ProdutoEstoqueService';

export class ProdutoController {
    private produtoRepository: ProdutoRepository;
    private enderecamentoRepository: EnderecamentoRepository;
    private estoqueItemRepository: EstoqueItemRepository;
    private estoqueCalculoService: EstoqueCalculoService;
    private produtoEstoqueService: ProdutoEstoqueService;
    private createProdutoUseCase: CreateProdutoUseCase;
    private getProdutoUseCase: GetProdutoUseCase;
    private listProdutosUseCase: ListProdutosUseCase;
    private updateProdutoUseCase: UpdateProdutoUseCase;
    private searchProdutosUseCase: SearchProdutosUseCase;

    constructor() {
        this.produtoRepository = new ProdutoRepository();
        this.enderecamentoRepository = new EnderecamentoRepository();
        this.estoqueItemRepository = new EstoqueItemRepository();

        this.estoqueCalculoService = new EstoqueCalculoService(
            this.estoqueItemRepository,
            this.produtoRepository,
            this.enderecamentoRepository
        );

        this.produtoEstoqueService = new ProdutoEstoqueService(this.estoqueCalculoService);

        this.createProdutoUseCase = new CreateProdutoUseCase(this.produtoRepository);
        this.getProdutoUseCase = new GetProdutoUseCase(this.produtoRepository, this.produtoEstoqueService);
        this.listProdutosUseCase = new ListProdutosUseCase(this.produtoRepository, this.produtoEstoqueService);
        this.updateProdutoUseCase = new UpdateProdutoUseCase(this.produtoRepository);
        this.searchProdutosUseCase = new SearchProdutosUseCase(this.produtoRepository, this.produtoEstoqueService);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const produto = await this.createProdutoUseCase.execute(req.body);
            res.status(201).json({
                success: true,
                data: produto,
                message: 'Produto criado com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao criar produto'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
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
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || 'Produto não encontrado'
            });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await this.listProdutosUseCase.execute(page, limit, search);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao listar produtos'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
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
        } catch (error: any) {
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Erro ao atualizar produto'
            });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
        try {
            const term = req.query.term as string;
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
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao buscar produtos'
            });
        }
    }

    async findByCodigoBarra(req: Request, res: Response): Promise<void> {
        try {
            const { codBarra } = req.params;
            if (!codBarra) {
                res.status(400).json({
                    success: false,
                    message: 'Código de barras é obrigatório'
                });
                return;
            }

            const produto = await this.produtoRepository.findByCodigoBarra(codBarra);
            if (!produto) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado com este código de barras'
                });
                return;
            }

            res.json({
                success: true,
                data: produto
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar produto por código de barras'
            });
        }
    }

    async findByCodigoInterno(req: Request, res: Response): Promise<void> {
        try {
            const { codInterno } = req.params;
            const codigoInternoNum = parseInt(codInterno);

            if (!codInterno || isNaN(codigoInternoNum)) {
                res.status(400).json({
                    success: false,
                    message: 'Código interno deve ser um número válido'
                });
                return;
            }

            const produto = await this.produtoRepository.findByCodInterno(codigoInternoNum);
            if (!produto) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado com este código interno'
                });
                return;
            }

            res.json({
                success: true,
                data: produto
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar produto por código interno'
            });
        }
    }

    async updateEstoque(req: Request, res: Response): Promise<void> {
        // MÉTODO DESCONTINUADO: 
        // Agora o estoque é calculado dinamicamente baseado nos EndereçamentoItems e EstoqueItems
        // Para movimentar estoque use os endpoints específicos de transferência e retirada
        res.status(410).json({
            success: false,
            message: 'Este endpoint foi descontinuado. Use os endpoints específicos para transferência entre depósito e estoque.',
            alternativeEndpoints: {
                transferirParaEstoque: 'POST /api/estoque/transferir-deposito-estoque',
                retirarDoEstoque: 'POST /api/estoque/retirar-estoque',
                consultarEstoque: 'GET /api/estoque/produto/:id'
            }
        });
    }
}
