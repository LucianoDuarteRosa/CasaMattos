import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class ListEnderecamentosDisponiveisUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(): Promise<IEnderecamento[]> {
        return await this.enderecamentoRepository.findDisponiveis();
    }
}
