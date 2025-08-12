import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
export interface UpdateProdutoDTO {
    codInterno?: number;
    descricao?: string;
    quantMinVenda?: number;
    codBarras?: string;
    deposito?: number;
    estoque?: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor?: number;
}
export declare class UpdateProdutoUseCase {
    private produtoRepository;
    constructor(produtoRepository: IProdutoRepository);
    execute(id: number, data: UpdateProdutoDTO): Promise<IProduto>;
}
//# sourceMappingURL=UpdateProdutoUseCase.d.ts.map