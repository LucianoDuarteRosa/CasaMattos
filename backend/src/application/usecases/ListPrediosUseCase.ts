import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';

export class ListPrediosUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(): Promise<IPredio[]> {
        return await this.predioRepository.findAll();
    }
}
