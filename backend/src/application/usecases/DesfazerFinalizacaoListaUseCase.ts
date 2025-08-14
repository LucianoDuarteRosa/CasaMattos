import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { loggingService, LogAction } from '../services/LoggingService';

interface DesfazerFinalizacaoListaRequest {
    executorUserId: number;
}

export class DesfazerFinalizacaoListaUseCase {
    constructor(private listaRepository: IListaRepository) { }

    async execute(idLista: number, request: DesfazerFinalizacaoListaRequest): Promise<void> {
        try {
            // Buscar a lista antes de desfazer para log
            const lista = await this.listaRepository.findById(idLista);
            if (!lista) {
                const error = new Error('Lista não encontrada');
                await loggingService.logError(request.executorUserId, 'Lista', error, `Tentativa de desfazer finalização de lista inexistente ID: ${idLista}`);
                throw error;
            }

            if (lista.disponivel) {
                const error = new Error('Lista não está finalizada');
                await loggingService.logError(request.executorUserId, 'Lista', error, `Tentativa de desfazer finalização de lista não finalizada: ${lista.nome} (ID: ${idLista})`);
                throw error;
            }

            // Buscar endereçamentos para incluir no log
            const enderecamentos = await this.listaRepository.getEnderecamentos(idLista);
            const totalEnderecamentos = enderecamentos.length;
            const totalCaixas = enderecamentos.reduce((sum, end) => sum + (end.quantCaixas || 0), 0);

            // Executar desfazer finalização
            await this.listaRepository.desfazerFinalizacao(idLista);

            // Log detalhado da desfinalização
            await loggingService.logAction({
                userId: request.executorUserId,
                entity: 'Lista',
                action: LogAction.UNFINALIZE,
                description: `Desfez finalização da lista "${lista.nome}" com ${totalEnderecamentos} endereçamentos e ${totalCaixas} caixas. Produtos devolvidos do estoque para o depósito`,
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
            if (!message.includes('não encontrada') && !message.includes('não está finalizada')) {
                await loggingService.logError(request.executorUserId, 'Lista', error as Error, 'Erro inesperado ao desfazer finalização da lista');
            }
            throw error;
        }
    }
}
