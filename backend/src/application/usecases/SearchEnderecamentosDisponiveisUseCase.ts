import { IEnderecamentoRepository, SearchEnderecamentosDisponiveisFilters } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class SearchEnderecamentosDisponiveisUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(filters: SearchEnderecamentosDisponiveisFilters): Promise<IEnderecamento[]> {
        return await this.enderecamentoRepository.searchAvailableByFilters(filters);
    }
}
