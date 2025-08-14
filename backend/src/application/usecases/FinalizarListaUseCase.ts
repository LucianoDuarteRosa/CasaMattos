import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { loggingService, LogAction } from '../services/LoggingService';

interface FinalizarListaRequest {
    executorUserId: number;
}

export class FinalizarListaUseCase {
    constructor(private listaRepository: IListaRepository) { }

    async execute(idLista: number, request: FinalizarListaRequest): Promise<void> {
        try {
            // Buscar a lista antes de finalizar para log
            const lista = await this.listaRepository.findById(idLista);
            if (!lista) {
                const error = new Error('Lista não encontrada');
                await loggingService.logError(request.executorUserId, 'Lista', error, `Tentativa de finalizar lista inexistente ID: ${idLista}`);
                throw error;
            }

            if (!lista.disponivel) {
                const error = new Error('Lista já está finalizada');
                await loggingService.logError(request.executorUserId, 'Lista', error, `Tentativa de finalizar lista já finalizada: ${lista.nome} (ID: ${idLista})`);
                throw error;
            }

            // Buscar endereçamentos para incluir no log
            const enderecamentos = await this.listaRepository.getEnderecamentos(idLista);
            const totalEnderecamentos = enderecamentos.length;
            const totalCaixas = enderecamentos.reduce((sum, end) => sum + (end.quantCaixas || 0), 0);

            // Executar finalização
            await this.listaRepository.finalizarLista(idLista);

            // Log detalhado da finalização
            await loggingService.logAction({
                userId: request.executorUserId,
                entity: 'Lista',
                action: LogAction.FINALIZE,
                description: `Finalizou lista "${lista.nome}" com ${totalEnderecamentos} endereçamentos e ${totalCaixas} caixas. Produtos movidos do depósito para o estoque`,
                metadata: {
                    listaId: idLista,
                    listaNome: lista.nome,
                    totalEnderecamentos,
                    totalCaixas,
                    enderecamentos: enderecamentos.map(e => ({
                        id: e.id,
                        produtoDescricao: (e as any).produto?.descricao,
                        quantCaixas: e.quantCaixas,
                        predioNome: (e as any).predio?.nomePredio,
                        ruaNome: (e as any).rua?.nomeRua
                    }))
                }
            });

        } catch (error) {
            // Log erros não previstos
            const message = (error as Error).message;
            if (!message.includes('não encontrada') && !message.includes('já está finalizada')) {
                await loggingService.logError(request.executorUserId, 'Lista', error as Error, 'Erro inesperado ao finalizar lista');
            }
            throw error;
        }
    }
}
