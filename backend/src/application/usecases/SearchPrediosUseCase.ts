import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';

export class SearchPrediosUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(nomePredio: string): Promise<IPredio[]> {
        if (!nomePredio || nomePredio.trim() === '') {
            return await this.predioRepository.findAll();
        }

        return await this.predioRepository.findByNome(nomePredio.trim());
    }
}
