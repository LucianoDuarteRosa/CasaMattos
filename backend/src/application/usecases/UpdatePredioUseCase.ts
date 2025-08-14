import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';
import { LoggingService, LogAction } from '../services/LoggingService';

interface UpdatePredioRequest {
    id: number;
    nomePredio?: string;
    vagas?: number;
    idRua?: number;
    executorUserId?: number;
}

export class UpdatePredioUseCase {
    constructor(
        private predioRepository: IPredioRepository,
        private loggingService: LoggingService
    ) { }

    async execute(request: UpdatePredioRequest): Promise<IPredio | null> {
        try {
            if (!request.id || request.id <= 0) {
                throw new Error('ID do prédio é obrigatório e deve ser maior que zero');
            }

            if (request.nomePredio !== undefined) {
                if (!request.nomePredio || request.nomePredio.trim() === '') {
                    throw new Error('Nome do prédio é obrigatório');
                }

                if (request.nomePredio.length > 100) {
                    throw new Error('Nome do prédio deve ter no máximo 100 caracteres');
                }

                request.nomePredio = request.nomePredio.trim();
            }

            if (request.idRua !== undefined && request.idRua <= 0) {
                throw new Error('ID da rua deve ser maior que zero');
            }

            if (request.vagas !== undefined && request.vagas < 0) {
                throw new Error('Número de vagas não pode ser negativo');
            }

            const existingPredio = await this.predioRepository.findById(request.id);
            if (!existingPredio) {
                const error = new Error('Prédio não encontrado');

                if (request.executorUserId) {
                    await this.loggingService.logAction({
                        userId: request.executorUserId,
                        entity: 'Predios',
                        action: LogAction.UPDATE,
                        description: `Tentativa de atualizar prédio inexistente (ID: ${request.id})`,
                        error
                    });
                }

                throw error;
            }

            const predioAtualizado = await this.predioRepository.update(request.id, {
                nomePredio: request.nomePredio,
                vagas: request.vagas,
                idRua: request.idRua
            });

            if (!predioAtualizado) {
                throw new Error('Erro ao atualizar prédio');
            }

            // Log de sucesso
            if (request.executorUserId) {
                await this.loggingService.logUpdate(
                    request.executorUserId,
                    'Predios',
                    existingPredio,
                    predioAtualizado,
                    `Prédio atualizado: ${predioAtualizado.nomePredio} (ID: ${request.id})`
                );
            }

            return predioAtualizado;
        } catch (error: any) {
            // Log de erro geral
            if (request.executorUserId) {
                await this.loggingService.logAction({
                    userId: request.executorUserId,
                    entity: 'Predios',
                    action: LogAction.UPDATE,
                    description: `Erro ao atualizar prédio (ID: ${request.id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
