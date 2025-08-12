import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
export interface CreateProdutoDTO {
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    deposito: number;
    estoque: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
}
export declare class CreateProdutoUseCase {
    private produtoRepository;
    constructor(produtoRepository: IProdutoRepository);
    execute(data: CreateProdutoDTO): Promise<IProduto>;
}
//# sourceMappingURL=CreateProdutoUseCase.d.ts.map