import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { LoggingService, LogAction } from '../services/LoggingService';

export class DeleteListaUseCase {
    constructor(
        private listaRepository: IListaRepository,
        private loggingService: LoggingService
    ) { }

    async execute(id: number, executorUserId?: number): Promise<boolean> {
        try {
            // Verificar se a lista existe
            const listaExistente = await this.listaRepository.findById(id);
            if (!listaExistente) {
                const error = new Error('Lista não encontrada');

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Listas',
                        action: LogAction.DELETE,
                        description: `Tentativa de excluir lista inexistente (ID: ${id})`,
                        error
                    });
                }

                throw error;
            }

            const resultado = await this.listaRepository.delete(id);

            // Log de sucesso
            if (executorUserId) {
                await this.loggingService.logDelete(
                    executorUserId,
                    'Listas',
                    listaExistente,
                    `Lista excluída: ${listaExistente.nome} (ID: ${id})`
                );
            }

            return resultado;
        } catch (error: any) {
            // Log de erro geral
            if (executorUserId) {
                await this.loggingService.logAction({
                    userId: executorUserId,
                    entity: 'Listas',
                    action: LogAction.DELETE,
                    description: `Erro ao excluir lista (ID: ${id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
