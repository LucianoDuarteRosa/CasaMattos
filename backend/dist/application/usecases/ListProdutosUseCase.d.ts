import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
export interface ListProdutosResponse {
    data: IProduto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ListProdutosUseCase {
    private produtoRepository;
    constructor(produtoRepository: IProdutoRepository);
    execute(page?: number, limit?: number, search?: string): Promise<ListProdutosResponse>;
}
//# sourceMappingURL=ListProdutosUseCase.d.ts.map