import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

interface CreateEnderecamentoRequest {
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idPredio: number;
}

export class CreateEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(request: CreateEnderecamentoRequest): Promise<IEnderecamento> {
        // Validações
        if (!request.tonalidade || request.tonalidade.trim() === '') {
            throw new Error('Tonalidade é obrigatória');
        }

        if (!request.bitola || request.bitola.trim() === '') {
            throw new Error('Bitola é obrigatória');
        }

        if (!request.idProduto || request.idProduto <= 0) {
            throw new Error('ID do produto é obrigatório');
        }

        if (!request.idPredio || request.idPredio <= 0) {
            throw new Error('ID do prédio é obrigatório');
        }

        if (request.quantCaixas !== undefined && request.quantCaixas < 0) {
            throw new Error('Quantidade de caixas não pode ser negativa');
        }

        return await this.enderecamentoRepository.create({
            tonalidade: request.tonalidade.trim(),
            bitola: request.bitola.trim(),
            lote: request.lote?.trim(),
            observacao: request.observacao?.trim(),
            quantCaixas: request.quantCaixas,
            disponivel: request.disponivel,
            idProduto: request.idProduto,
            idPredio: request.idPredio
        });
    }
}
