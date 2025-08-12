import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
export declare class SearchProdutosUseCase {
    private produtoRepository;
    constructor(produtoRepository: IProdutoRepository);
    execute(term: string): Promise<IProduto[]>;
}
//# sourceMappingURL=SearchProdutosUseCase.d.ts.map