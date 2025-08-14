import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';
import { loggingService } from '../services/LoggingService';

interface CreatePredioRequest {
    nomePredio: string;
    vagas?: number;
    idRua: number;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreatePredioUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(request: CreatePredioRequest): Promise<IPredio> {
        try {
            if (!request.nomePredio || request.nomePredio.trim() === '') {
                const error = new Error('Nome do prédio é obrigatório');
                await loggingService.logError(request.executorUserId, 'Predio', error, 'Tentativa de criar prédio sem nome');
                throw error;
            }

            if (request.nomePredio.length > 100) {
                const error = new Error('Nome do prédio deve ter no máximo 100 caracteres');
                await loggingService.logError(request.executorUserId, 'Predio', error, `Tentativa de criar prédio com nome muito longo: ${request.nomePredio}`);
                throw error;
            }

            if (!request.idRua || request.idRua <= 0) {
                const error = new Error('ID da rua é obrigatório');
                await loggingService.logError(request.executorUserId, 'Predio', error, 'Tentativa de criar prédio sem ID da rua');
                throw error;
            }

            if (request.vagas !== undefined && request.vagas < 0) {
                const error = new Error('Número de vagas não pode ser negativo');
                await loggingService.logError(request.executorUserId, 'Predio', error, `Tentativa de criar prédio com vagas negativas: ${request.vagas}`);
                throw error;
            }

            const newPredio = await this.predioRepository.create({
                nomePredio: request.nomePredio.trim().toUpperCase(),
                vagas: request.vagas,
                idRua: request.idRua
            });

            // Log de sucesso
            await loggingService.logCreate(
                request.executorUserId,
                'Predio',
                {
                    id: newPredio.id,
                    nomePredio: newPredio.nomePredio,
                    vagas: newPredio.vagas,
                    idRua: newPredio.idRua
                },
                `Criou novo prédio: ${newPredio.nomePredio} (ID Rua: ${newPredio.idRua})`
            );

            return newPredio;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (!message.includes('obrigatório') && !message.includes('caracteres') && !message.includes('negativo')) {
                await loggingService.logError(request.executorUserId, 'Predio', error as Error, 'Erro inesperado ao criar prédio');
            }
            throw error;
        }
    }
}
