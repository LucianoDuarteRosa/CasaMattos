import { EstoqueCalculoService } from '../services/EstoqueCalculoService';

export interface RetirarDoEstoqueRequest {
    produtoId: number;
    quantidade: number;
    lote?: string;
    ton?: string;
    bit?: string;
}

export class RetirarDoEstoqueUseCase {
    constructor(
        private estoqueCalculoService: EstoqueCalculoService
    ) { }

    async execute(request: RetirarDoEstoqueRequest): Promise<void> {
        const { produtoId, quantidade, lote, ton, bit } = request;

        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }

        await this.estoqueCalculoService.retirarDoEstoque(
            produtoId,
            quantidade,
            lote,
            ton,
            bit
        );
    }
}
