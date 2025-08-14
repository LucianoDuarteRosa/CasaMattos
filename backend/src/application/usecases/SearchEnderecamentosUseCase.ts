import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class SearchEnderecamentosUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(termo: string): Promise<IEnderecamento[]> {
        if (!termo || termo.trim() === '') {
            throw new Error('Termo de busca é obrigatório');
        }

        return await this.enderecamentoRepository.findByCodInternoOuDescricao(termo.trim());
    }
}
