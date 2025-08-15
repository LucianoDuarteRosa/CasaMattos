import { EstoqueCalculoService } from '../services/EstoqueCalculoService';

export interface TransferirDepositoParaEstoqueRequest {
    produtoId: number;
    quantidade: number;
    lote: string;
    ton: string;
    bit: string;
}

export class TransferirDepositoParaEstoqueUseCase {
    constructor(
        private estoqueCalculoService: EstoqueCalculoService
    ) { }

    async execute(request: TransferirDepositoParaEstoqueRequest): Promise<void> {
        const { produtoId, quantidade, lote, ton, bit } = request;

        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }

        if (!lote || !ton || !bit) {
            throw new Error('Lote, ton e bit são obrigatórios');
        }

        await this.estoqueCalculoService.transferirDoDepositoParaEstoque(
            produtoId,
            quantidade,
            lote,
            ton,
            bit
        );
    }
}
