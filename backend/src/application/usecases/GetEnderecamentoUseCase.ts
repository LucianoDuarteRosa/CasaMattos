import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class GetEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(id: number): Promise<IEnderecamento | null> {
        if (!id || id <= 0) {
            throw new Error('ID do endereçamento é obrigatório e deve ser maior que zero');
        }

        return await this.enderecamentoRepository.findById(id);
    }
}
