import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import { ProdutoEstoqueService, IProdutoComEstoque } from '../services/ProdutoEstoqueService';

export interface ListProdutosResponse {
    data: IProdutoComEstoque[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ListProdutosUseCase {
    constructor(
        private produtoRepository: IProdutoRepository,
        private produtoEstoqueService: ProdutoEstoqueService
    ) { }

    async execute(
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<ListProdutosResponse> {
        const result = await this.produtoRepository.findWithPagination(page, limit, search);

        // Adicionar cálculos de estoque para todos os produtos
        const produtosComEstoque = await this.produtoEstoqueService.adicionarCalculosEstoqueLista(result.produtos);

        return {
            data: produtosComEstoque,
            total: result.total,
            page,
            limit,
            totalPages: result.totalPages
        };
    }
}
