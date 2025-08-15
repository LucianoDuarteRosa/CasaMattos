import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import { ProdutoEstoqueService, IProdutoComEstoque } from '../services/ProdutoEstoqueService';

export class SearchProdutosUseCase {
    constructor(
        private produtoRepository: IProdutoRepository,
        private produtoEstoqueService: ProdutoEstoqueService
    ) { }

    async execute(term: string): Promise<IProdutoComEstoque[]> {
        if (!term || term.trim().length < 2) {
            throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
        }

        const produtos = await this.produtoRepository.search(term.trim());
        return await this.produtoEstoqueService.adicionarCalculosEstoqueLista(produtos);
    }
}
