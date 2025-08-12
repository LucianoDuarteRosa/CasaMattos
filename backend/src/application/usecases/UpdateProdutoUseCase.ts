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

export class UpdateProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(id: number, data: UpdateProdutoDTO): Promise<IProduto> {
        // Verificar se o produto existe
        const produtoExistente = await this.produtoRepository.findById(id);
        if (!produtoExistente) {
            throw new Error('Produto não encontrado');
        }

        // Se está alterando o código interno, verificar se não existe outro produto com o mesmo código
        if (data.codInterno && data.codInterno !== produtoExistente.codInterno) {
            const produtoComMesmoCodigo = await this.produtoRepository.findByCodInterno(data.codInterno);
            if (produtoComMesmoCodigo) {
                throw new Error('Já existe um produto com este código interno');
            }
        }

        const produtoAtualizado = await this.produtoRepository.update(id, data);
        if (!produtoAtualizado) {
            throw new Error('Erro ao atualizar produto');
        }

        return produtoAtualizado;
    }
}
