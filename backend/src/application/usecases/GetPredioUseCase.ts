import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';

export class GetPredioUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(id: number): Promise<IPredio | null> {
        if (!id || id <= 0) {
            throw new Error('ID do prédio é obrigatório e deve ser maior que zero');
        }

        return await this.predioRepository.findById(id);
    }
}
