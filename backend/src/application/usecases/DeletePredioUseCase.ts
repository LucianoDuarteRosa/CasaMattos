import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { LoggingService, LogAction } from '../services/LoggingService';

export class DeletePredioUseCase {
    constructor(
        private predioRepository: IPredioRepository,
        private loggingService: LoggingService
    ) { }

    async execute(id: number, executorUserId?: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new Error('ID do prédio é obrigatório e deve ser maior que zero');
            }

            const existingPredio = await this.predioRepository.findById(id);
            if (!existingPredio) {
                const error = new Error('Prédio não encontrado');

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Predios',
                        action: LogAction.DELETE,
                        description: `Tentativa de excluir prédio inexistente (ID: ${id})`,
                        error
                    });
                }

                throw error;
            }

            const resultado = await this.predioRepository.delete(id);

            // Log de sucesso
            if (executorUserId) {
                await this.loggingService.logDelete(
                    executorUserId,
                    'Predios',
                    existingPredio,
                    `Prédio excluído: ${existingPredio.nomePredio} (ID: ${id})`
                );
            }

            return resultado;
        } catch (error: any) {
            // Log de erro geral
            if (executorUserId) {
                await this.loggingService.logAction({
                    userId: executorUserId,
                    entity: 'Predios',
                    action: LogAction.DELETE,
                    description: `Erro ao excluir prédio (ID: ${id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
