import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';
import { LoggingService, LogAction } from '../services/LoggingService';

interface UpdateRuaRequest {
    id: number;
    nomeRua?: string;
    executorUserId?: number;
}

export class UpdateRuaUseCase {
    constructor(
        private ruaRepository: IRuaRepository,
        private loggingService: LoggingService
    ) { }

    async execute(request: UpdateRuaRequest): Promise<IRua | null> {
        try {
            if (!request.id || request.id <= 0) {
                throw new Error('ID da rua é obrigatório e deve ser maior que zero');
            }

            if (request.nomeRua !== undefined) {
                if (!request.nomeRua || request.nomeRua.trim() === '') {
                    throw new Error('Nome da rua é obrigatório');
                }

                if (request.nomeRua.length > 100) {
                    throw new Error('Nome da rua deve ter no máximo 100 caracteres');
                }

                request.nomeRua = request.nomeRua.trim();
            }

            const existingRua = await this.ruaRepository.findById(request.id);
            if (!existingRua) {
                const error = new Error('Rua não encontrada');

                if (request.executorUserId) {
                    await this.loggingService.logAction({
                        userId: request.executorUserId,
                        entity: 'Ruas',
                        action: LogAction.UPDATE,
                        description: `Tentativa de atualizar rua inexistente (ID: ${request.id})`,
                        error
                    });
                }

                throw error;
            }

            // Verificar se já existe outra rua com esse nome
            if (request.nomeRua) {
                const ruaComMesmoNome = await this.ruaRepository.findByNomeExato(request.nomeRua);
                if (ruaComMesmoNome && ruaComMesmoNome.id !== request.id) {
                    const error = new Error(`Rua com nome "${request.nomeRua}" já existe`);

                    if (request.executorUserId) {
                        await this.loggingService.logAction({
                            userId: request.executorUserId,
                            entity: 'Ruas',
                            action: LogAction.UPDATE,
                            description: `Tentativa de atualizar rua com nome duplicado: ${request.nomeRua}`,
                            error
                        });
                    }

                    throw error;
                }
            }

            const ruaAtualizada = await this.ruaRepository.update(request.id, {
                nomeRua: request.nomeRua
            });

            if (!ruaAtualizada) {
                throw new Error('Erro ao atualizar rua');
            }

            // Log de sucesso
            if (request.executorUserId) {
                await this.loggingService.logUpdate(
                    request.executorUserId,
                    'Ruas',
                    existingRua,
                    ruaAtualizada,
                    `Rua atualizada: ${ruaAtualizada.nomeRua} (ID: ${request.id})`
                );
            }

            return ruaAtualizada;
        } catch (error: any) {
            // Log de erro geral
            if (request.executorUserId) {
                await this.loggingService.logAction({
                    userId: request.executorUserId,
                    entity: 'Ruas',
                    action: LogAction.UPDATE,
                    description: `Erro ao atualizar rua (ID: ${request.id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
