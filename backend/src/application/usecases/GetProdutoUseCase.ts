import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import { ProdutoEstoqueService, IProdutoComEstoque } from '../services/ProdutoEstoqueService';

export class GetProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository,
        private produtoEstoqueService: ProdutoEstoqueService
    ) { }

    async execute(id: number): Promise<IProdutoComEstoque> {
        const produto = await this.produtoRepository.findById(id);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        return await this.produtoEstoqueService.adicionarCalculosEstoque(produto);
    }
}
