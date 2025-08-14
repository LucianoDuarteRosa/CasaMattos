import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

interface UpdateEnderecamentoRequest {
    id: number;
    tonalidade?: string;
    bitola?: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel?: boolean;
    idProduto?: number;
    idPredio?: number;
}

export class UpdateEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(request: UpdateEnderecamentoRequest): Promise<IEnderecamento | null> {
        if (!request.id || request.id <= 0) {
            throw new Error('ID do endereçamento é obrigatório e deve ser maior que zero');
        }

        // Validações para campos que estão sendo atualizados
        if (request.tonalidade !== undefined) {
            if (!request.tonalidade || request.tonalidade.trim() === '') {
                throw new Error('Tonalidade não pode ser vazia');
            }
            request.tonalidade = request.tonalidade.trim();
        }

        if (request.bitola !== undefined) {
            if (!request.bitola || request.bitola.trim() === '') {
                throw new Error('Bitola não pode ser vazia');
            }
            request.bitola = request.bitola.trim();
        }

        if (request.idProduto !== undefined && request.idProduto <= 0) {
            throw new Error('ID do produto deve ser maior que zero');
        }

        if (request.idPredio !== undefined && request.idPredio <= 0) {
            throw new Error('ID do prédio deve ser maior que zero');
        }

        if (request.quantCaixas !== undefined && request.quantCaixas < 0) {
            throw new Error('Quantidade de caixas não pode ser negativa');
        }

        const existingEnderecamento = await this.enderecamentoRepository.findById(request.id);
        if (!existingEnderecamento) {
            throw new Error('Endereçamento não encontrado');
        }

        return await this.enderecamentoRepository.update(request.id, {
            tonalidade: request.tonalidade,
            bitola: request.bitola,
            lote: request.lote?.trim(),
            observacao: request.observacao?.trim(),
            quantCaixas: request.quantCaixas,
            disponivel: request.disponivel,
            idProduto: request.idProduto,
            idPredio: request.idPredio
        });
    }
}
