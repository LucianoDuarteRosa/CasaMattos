import { IPredioRepository } from '../../domain/repositories/IPredioRepository';

export class DeletePredioUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(id: number): Promise<boolean> {
        if (!id || id <= 0) {
            throw new Error('ID do prédio é obrigatório e deve ser maior que zero');
        }

        const existingPredio = await this.predioRepository.findById(id);
        if (!existingPredio) {
            throw new Error('Prédio não encontrado');
        }

        return await this.predioRepository.delete(id);
    }
}
