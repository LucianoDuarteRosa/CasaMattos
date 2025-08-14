import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';
import { loggingService, LogAction } from '../services/LoggingService';

interface CreateBulkEnderecamentoRequest {
    quantidade: number;
    enderecamentoData: {
        tonalidade: string;
        bitola: string;
        lote?: string;
        observacao?: string;
        quantCaixas?: number;
        disponivel: boolean;
        idProduto: number;
        idPredio: number;
    };
    executorUserId: number; // ID do usuário que está executando a ação
}

export interface CreateBulkEnderecamentoResponse {
    success: boolean;
    count: number;
    enderecamentos: IEnderecamento[];
}

export class CreateBulkEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(request: CreateBulkEnderecamentoRequest): Promise<CreateBulkEnderecamentoResponse> {
        try {
            const { quantidade, enderecamentoData } = request;

            // Validações
            if (!quantidade || quantidade <= 0) {
                const error = new Error('Quantidade deve ser maior que zero');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, `Tentativa de criação em lote com quantidade inválida: ${quantidade}`);
                throw error;
            }

            if (quantidade > 100) {
                const error = new Error('Quantidade não pode ser maior que 100');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, `Tentativa de criação em lote com quantidade excessiva: ${quantidade}`);
                throw error;
            }

            // Validar dados do endereçamento
            if (!enderecamentoData.tonalidade || enderecamentoData.tonalidade.trim() === '') {
                const error = new Error('Tonalidade é obrigatória');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criação em lote sem tonalidade');
                throw error;
            }

            if (!enderecamentoData.bitola || enderecamentoData.bitola.trim() === '') {
                const error = new Error('Bitola é obrigatória');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criação em lote sem bitola');
                throw error;
            }

            if (!enderecamentoData.idProduto || enderecamentoData.idProduto <= 0) {
                const error = new Error('ID do produto é obrigatório');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criação em lote sem produto');
                throw error;
            }

            if (!enderecamentoData.idPredio || enderecamentoData.idPredio <= 0) {
                const error = new Error('ID do prédio é obrigatório');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criação em lote sem prédio');
                throw error;
            }

            if (enderecamentoData.quantCaixas !== undefined && enderecamentoData.quantCaixas < 0) {
                const error = new Error('Quantidade de caixas não pode ser negativa');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, `Tentativa de criação em lote com quantidade de caixas negativa: ${enderecamentoData.quantCaixas}`);
                throw error;
            }

            // Preparar dados limpos
            const dadosLimpos = {
                tonalidade: enderecamentoData.tonalidade.trim(),
                bitola: enderecamentoData.bitola.trim(),
                lote: enderecamentoData.lote?.trim(),
                observacao: enderecamentoData.observacao?.trim(),
                quantCaixas: enderecamentoData.quantCaixas,
                disponivel: enderecamentoData.disponivel,
                idProduto: enderecamentoData.idProduto,
                idPredio: enderecamentoData.idPredio
            };

            // Criar múltiplos endereçamentos usando o método createBulk do repositório
            const enderecamentos = await this.enderecamentoRepository.createBulk(dadosLimpos, quantidade);

            // Log de sucesso da criação em lote
            await loggingService.logAction({
                userId: request.executorUserId,
                entity: 'Enderecamento',
                action: LogAction.BULK_CREATE,
                description: `Criou ${enderecamentos.length} endereçamentos em lote - Tonalidade: ${dadosLimpos.tonalidade}, Bitola: ${dadosLimpos.bitola}, Produto ID: ${dadosLimpos.idProduto}, Prédio ID: ${dadosLimpos.idPredio}`,
                metadata: {
                    count: enderecamentos.length,
                    quantidadeSolicitada: quantidade,
                    dadosEnderecamento: dadosLimpos,
                    enderecamentosIds: enderecamentos.map(e => e.id)
                }
            });

            return {
                success: true,
                count: enderecamentos.length,
                enderecamentos
            };
        } catch (error) {
            // Log de erro não previsto
            const message = (error as Error).message;
            if (!message.includes('Quantidade') &&
                !message.includes('Tonalidade') &&
                !message.includes('Bitola') &&
                !message.includes('ID do produto') &&
                !message.includes('ID do prédio') &&
                !message.includes('caixas')) {
                await loggingService.logError(request.executorUserId, 'Enderecamento', error as Error, 'Erro inesperado na criação em lote de endereçamentos');
            }
            throw error;
        }
    }
}
