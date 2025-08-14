import { ILista } from '../../domain/entities/Lista';
import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { LoggingService, LogAction } from '../services/LoggingService';

export class CreateListaUseCase {
    constructor(
        private listaRepository: IListaRepository,
        private loggingService: LoggingService
    ) { }

    async execute(nome: string, executorUserId?: number): Promise<ILista> {
        try {
            // Validação
            if (!nome || !nome.trim()) {
                throw new Error('Nome da lista é obrigatório');
            }

            // Verificar se já existe uma lista com esse nome
            const listaExistente = await this.listaRepository.findByNome(nome.trim());
            if (listaExistente) {
                const error = new Error(`Lista com nome "${nome}" já existe`);

                // Log do erro de validação
                if (executorUserId) {
                    await this.loggingService.logAction({
                        userId: executorUserId,
                        entity: 'Listas',
                        action: LogAction.CREATE,
                        description: `Tentativa de criar lista duplicada: ${nome}`,
                        error
                    });
                }

                throw error;
            }

            const listaData = {
                nome: nome.trim(),
                disponivel: true
            };

            const lista = await this.listaRepository.create(listaData);

            // Log de sucesso
            if (executorUserId) {
                await this.loggingService.logCreate(
                    executorUserId,
                    'Listas',
                    lista,
                    `Lista criada: ${lista.nome} (ID: ${lista.id})`
                );
            }

            return lista;
        } catch (error: any) {
            // Log de erro geral
            if (executorUserId) {
                await this.loggingService.logAction({
                    userId: executorUserId,
                    entity: 'Listas',
                    action: LogAction.CREATE,
                    description: `Erro ao criar lista: ${error.message}`,
                    error
                });
            }

            throw error;
        }
    }
}
