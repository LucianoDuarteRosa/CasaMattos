import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

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
}

export interface CreateBulkEnderecamentoResponse {
    success: boolean;
    count: number;
    enderecamentos: IEnderecamento[];
}

export class CreateBulkEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(request: CreateBulkEnderecamentoRequest): Promise<CreateBulkEnderecamentoResponse> {
        const { quantidade, enderecamentoData } = request;

        // Validações
        if (!quantidade || quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }

        if (quantidade > 100) {
            throw new Error('Quantidade não pode ser maior que 100');
        }

        // Validar dados do endereçamento
        if (!enderecamentoData.tonalidade || enderecamentoData.tonalidade.trim() === '') {
            throw new Error('Tonalidade é obrigatória');
        }

        if (!enderecamentoData.bitola || enderecamentoData.bitola.trim() === '') {
            throw new Error('Bitola é obrigatória');
        }

        if (!enderecamentoData.idProduto || enderecamentoData.idProduto <= 0) {
            throw new Error('ID do produto é obrigatório');
        }

        if (!enderecamentoData.idPredio || enderecamentoData.idPredio <= 0) {
            throw new Error('ID do prédio é obrigatório');
        }

        if (enderecamentoData.quantCaixas !== undefined && enderecamentoData.quantCaixas < 0) {
            throw new Error('Quantidade de caixas não pode ser negativa');
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

        try {
            // Criar múltiplos endereçamentos usando o método createBulk do repositório
            const enderecamentos = await this.enderecamentoRepository.createBulk(dadosLimpos, quantidade);

            return {
                success: true,
                count: enderecamentos.length,
                enderecamentos
            };
        } catch (error) {
            console.error('Erro ao criar endereçamentos em lote:', error);
            throw new Error('Erro ao criar endereçamentos em lote');
        }
    }
}
