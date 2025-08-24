import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';

export class GetEstoqueEnderecadoPorProdutoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(idProduto: number): Promise<number> {
        // Busca todos os endereçamentos disponíveis para o produto
        const enderecamentos = await this.enderecamentoRepository.findByProduto(idProduto);
        // Soma a quantidade de caixas de todos os endereçamentos
        return enderecamentos.reduce((acc, item) => acc + (item.quantCaixas || 0), 0);
    }
}
