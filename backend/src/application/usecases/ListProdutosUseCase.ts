import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';

export interface ListProdutosResponse {
    data: IProduto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ListProdutosUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<ListProdutosResponse> {
        const result = await this.produtoRepository.findWithPagination(page, limit, search);

        return {
            data: result.produtos,
            total: result.total,
            page,
            limit,
            totalPages: result.totalPages
        };
    }
}
