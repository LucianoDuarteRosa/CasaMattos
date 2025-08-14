import { Request, Response } from 'express';
import { ProdutoRepository } from '../../infrastructure/repositories/ProdutoRepository';
import { CreateProdutoUseCase } from '../../application/usecases/CreateProdutoUseCase';
import { GetProdutoUseCase } from '../../application/usecases/GetProdutoUseCase';
import { ListProdutosUseCase } from '../../application/usecases/ListProdutosUseCase';
import { UpdateProdutoUseCase } from '../../application/usecases/UpdateProdutoUseCase';
import { SearchProdutosUseCase } from '../../application/usecases/SearchProdutosUseCase';

export class ProdutoController {
    private produtoRepository: ProdutoRepository;
    private createProdutoUseCase: CreateProdutoUseCase;
    private getProdutoUseCase: GetProdutoUseCase;
    private listProdutosUseCase: ListProdutosUseCase;
    private updateProdutoUseCase: UpdateProdutoUseCase;
    private searchProdutosUseCase: SearchProdutosUseCase;

    constructor() {
        this.produtoRepository = new ProdutoRepository();
        this.createProdutoUseCase = new CreateProdutoUseCase(this.produtoRepository);
        this.getProdutoUseCase = new GetProdutoUseCase(this.produtoRepository);
        this.listProdutosUseCase = new ListProdutosUseCase(this.produtoRepository);
        this.updateProdutoUseCase = new UpdateProdutoUseCase(this.produtoRepository);
        this.searchProdutosUseCase = new SearchProdutosUseCase(this.produtoRepository);
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
        try {
            const id = parseInt(req.params.id);
            const { quantidadeMovimentacao, tipoMovimentacao } = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            if (!quantidadeMovimentacao || quantidadeMovimentacao <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Quantidade de movimentação deve ser maior que zero'
                });
                return;
            }

            if (!tipoMovimentacao || !['entrada', 'saida'].includes(tipoMovimentacao)) {
                res.status(400).json({
                    success: false,
                    message: 'Tipo de movimentação deve ser "entrada" ou "saida"'
                });
                return;
            }

            const produto = await this.produtoRepository.findById(id);
            if (!produto) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
                return;
            }

            // Calcular novo valor do depósito
            let novoDeposito = produto.deposito;
            if (tipoMovimentacao === 'entrada') {
                novoDeposito += quantidadeMovimentacao;
            } else {
                novoDeposito -= quantidadeMovimentacao;

                // Verificar se o estoque não ficará negativo
                if (novoDeposito < 0) {
                    res.status(400).json({
                        success: false,
                        message: `Estoque insuficiente. Disponível: ${produto.deposito}, Solicitado: ${quantidadeMovimentacao}`
                    });
                    return;
                }
            }

            // Atualizar o produto
            const produtoAtualizado = await this.produtoRepository.update(id, {
                deposito: novoDeposito
            });

            res.json({
                success: true,
                data: produtoAtualizado,
                message: `Estoque ${tipoMovimentacao === 'entrada' ? 'aumentado' : 'reduzido'} em ${quantidadeMovimentacao} unidades`
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao atualizar estoque'
            });
        }
    }
}
