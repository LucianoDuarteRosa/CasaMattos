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

export class CreateProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(data: CreateProdutoDTO): Promise<IProduto> {
        // Verificar se já existe um produto com o mesmo código interno
        const produtoExistente = await this.produtoRepository.findByCodInterno(data.codInterno);
        if (produtoExistente) {
            throw new Error('Já existe um produto com este código interno');
        }

        return await this.produtoRepository.create(data);
    }
}
