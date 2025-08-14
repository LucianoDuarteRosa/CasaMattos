import { ILista } from '../../domain/entities/Lista';
import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { LoggingService, LogAction } from '../services/LoggingService';

export class UpdateListaUseCase {
    constructor(
        private listaRepository: IListaRepository,
        private loggingService: LoggingService
    ) { }

    async execute(id: number, nome: string, executorUserId?: number): Promise<ILista> {
        try {
            // Validação
            if (!nome || !nome.trim()) {
                throw new Error('Nome da lista é obrigatório');
            }

            // Verificar se a lista existe
            const listaExistente = await this.listaRepository.findById(id);
            if (!listaExistente) {
                const error = new Error('Lista não encontrada');

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Listas',
                        action: LogAction.UPDATE,
                        description: `Tentativa de atualizar lista inexistente (ID: ${id})`,
                        error
                    });
                }

                throw error;
            }

            // Verificar se já existe outra lista com esse nome
            const listaComMesmoNome = await this.listaRepository.findByNome(nome.trim());
            if (listaComMesmoNome && listaComMesmoNome.id !== id) {
                const error = new Error(`Lista com nome "${nome}" já existe`);

                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Listas',
                        action: LogAction.UPDATE,
                        description: `Tentativa de atualizar lista com nome duplicado: ${nome}`,
                        error
                    });
                }

                throw error;
            }

            const dadosAtualizacao = {
                nome: nome.trim()
            };

            const listaAtualizada = await this.listaRepository.update(id, dadosAtualizacao);

            if (!listaAtualizada) {
                throw new Error('Erro ao atualizar lista');
            }

            // Log de sucesso
            if (executorUserId) {
                await this.loggingService.logUpdate(
                    executorUserId,
                    'Listas',
                    listaExistente,
                    listaAtualizada,
                    `Lista atualizada: ${listaAtualizada.nome} (ID: ${id})`
                );
            }

            return listaAtualizada;
        } catch (error: any) {
            // Log de erro geral
            if (executorUserId) {
                await this.loggingService.logAction({
                    userId: executorUserId,
                    entity: 'Listas',
                    action: LogAction.UPDATE,
                    description: `Erro ao atualizar lista (ID: ${id}): ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
