import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';

export class SearchProdutosUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(term: string): Promise<IProduto[]> {
        if (!term || term.trim().length < 2) {
            throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
        }

        return await this.produtoRepository.search(term.trim());
    }
}
