import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { LoggingService, LogAction } from '../services/LoggingService';

export class DeleteEnderecamentoUseCase {
    constructor(
        private enderecamentoRepository: IEnderecamentoRepository,
        private loggingService: LoggingService
    ) { }

    async execute(id: number, executorUserId?: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new Error('ID do endereçamento é obrigatório e deve ser maior que zero');
            }

            const existingEnderecamento = await this.enderecamentoRepository.findById(id);
            if (!existingEnderecamento) {
                const error = new Error('Endereçamento não encontrado');

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Enderecamentos',
                        action: LogAction.DELETE,
                        description: `Tentativa de excluir endereçamento inexistente (ID: ${id})`,
                        error
                    });
                }

                throw error;
            }

            // Verificar se o endereçamento está associado a uma lista
            if (existingEnderecamento.idLista) {
                const error = new Error('Não é possível excluir endereçamento que está associado a uma lista. Remove da lista primeiro.');

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Enderecamentos',
                        action: LogAction.DELETE,
                        description: `Tentativa de excluir endereçamento associado a lista (ID: ${id}, Lista: ${existingEnderecamento.idLista})`,
                        error
                    });
                }

                throw error;
            }

            const resultado = await this.enderecamentoRepository.delete(id);

            // Log de sucesso
            if (executorUserId) {
                await this.loggingService.logDelete(
                    executorUserId,
                    'Enderecamentos',
                    existingEnderecamento,
                    `Endereçamento excluído (ID: ${id})`
                );
            }

            return resultado;
        } catch (error: any) {
            // Log de erro geral
            if (executorUserId) {
                await this.loggingService.logAction({
                    userId: executorUserId,
                    entity: 'Enderecamentos',
                    action: LogAction.DELETE,
                    description: `Erro ao excluir endereçamento (ID: ${id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
