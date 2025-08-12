import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';

export class GetProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(id: number): Promise<IProduto> {
        const produto = await this.produtoRepository.findById(id);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }
        return produto;
    }
}
