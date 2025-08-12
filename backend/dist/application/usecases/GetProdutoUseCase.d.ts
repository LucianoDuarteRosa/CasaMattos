import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
export declare class GetProdutoUseCase {
    private produtoRepository;
    constructor(produtoRepository: IProdutoRepository);
    execute(id: number): Promise<IProduto>;
}
//# sourceMappingURL=GetProdutoUseCase.d.ts.map