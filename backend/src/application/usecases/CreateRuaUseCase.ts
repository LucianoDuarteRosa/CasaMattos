import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';
import { loggingService } from '../services/LoggingService';

interface CreateRuaRequest {
    nomeRua: string;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreateRuaUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(request: CreateRuaRequest): Promise<IRua> {
        try {
            if (!request.nomeRua || request.nomeRua.trim() === '') {
                const error = new Error('Nome da rua é obrigatório');
                await loggingService.logError(request.executorUserId, 'Rua', error, 'Tentativa de criar rua sem nome');
                throw error;
            }

            if (request.nomeRua.length > 100) {
                const error = new Error('Nome da rua deve ter no máximo 100 caracteres');
                await loggingService.logError(request.executorUserId, 'Rua', error, `Tentativa de criar rua com nome muito longo: ${request.nomeRua}`);
                throw error;
            }

            // Verificar se já existe uma rua com o mesmo nome
            const ruaExistente = await this.ruaRepository.findByNomeExato(request.nomeRua.trim().toUpperCase());
            if (ruaExistente) {
                const error = new Error('Já existe uma rua com este nome');
                await loggingService.logError(request.executorUserId, 'Rua', error, `Tentativa de criar rua com nome duplicado: ${request.nomeRua}`);
                throw error;
            }

            const newRua = await this.ruaRepository.create({
                nomeRua: request.nomeRua.trim().toUpperCase()
            });

            // Log de sucesso
            await loggingService.logCreate(
                request.executorUserId,
                'Rua',
                {
                    id: newRua.id,
                    nomeRua: newRua.nomeRua
                },
                `Criou nova rua: ${newRua.nomeRua}`
            );

            return newRua;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (!message.includes('obrigatório') && !message.includes('caracteres') && !message.includes('existe')) {
                await loggingService.logError(request.executorUserId, 'Rua', error as Error, 'Erro inesperado ao criar rua');
            }
            throw error;
        }
    }
}
