import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';
import { loggingService } from '../services/LoggingService';

interface CreateEnderecamentoRequest {
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idPredio: number;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreateEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(request: CreateEnderecamentoRequest): Promise<IEnderecamento> {
        try {
            // Validações
            if (!request.tonalidade || request.tonalidade.trim() === '') {
                const error = new Error('Tonalidade é obrigatória');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criar endereçamento sem tonalidade');
                throw error;
            }

            if (!request.bitola || request.bitola.trim() === '') {
                const error = new Error('Bitola é obrigatória');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criar endereçamento sem bitola');
                throw error;
            }

            if (!request.idProduto || request.idProduto <= 0) {
                const error = new Error('ID do produto é obrigatório');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criar endereçamento sem ID do produto');
                throw error;
            }

            if (!request.idPredio || request.idPredio <= 0) {
                const error = new Error('ID do prédio é obrigatório');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, 'Tentativa de criar endereçamento sem ID do prédio');
                throw error;
            }

            if (request.quantCaixas !== undefined && request.quantCaixas < 0) {
                const error = new Error('Quantidade de caixas não pode ser negativa');
                await loggingService.logError(request.executorUserId, 'Enderecamento', error, `Tentativa de criar endereçamento com quantidade negativa: ${request.quantCaixas}`);
                throw error;
            }

            const newEnderecamento = await this.enderecamentoRepository.create({
                tonalidade: request.tonalidade.trim().toUpperCase(),
                bitola: request.bitola.trim().toUpperCase(),
                lote: request.lote?.trim()?.toUpperCase(),
                observacao: request.observacao?.trim()?.toUpperCase(),
                quantCaixas: request.quantCaixas,
                disponivel: request.disponivel,
                idProduto: request.idProduto,
                idPredio: request.idPredio
            });

            // Log de sucesso
            await loggingService.logCreate(
                request.executorUserId,
                'Enderecamento',
                {
                    id: newEnderecamento.id,
                    tonalidade: newEnderecamento.tonalidade,
                    bitola: newEnderecamento.bitola,
                    lote: newEnderecamento.lote,
                    idProduto: newEnderecamento.idProduto,
                    idPredio: newEnderecamento.idPredio
                },
                `Criou novo endereçamento: ${newEnderecamento.tonalidade}x${newEnderecamento.bitola} (Produto: ${newEnderecamento.idProduto}, Prédio: ${newEnderecamento.idPredio})`
            );

            return newEnderecamento;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (!message.includes('obrigatório') && !message.includes('negativa')) {
                await loggingService.logError(request.executorUserId, 'Enderecamento', error as Error, 'Erro inesperado ao criar endereçamento');
            }
            throw error;
        }
    }
}
