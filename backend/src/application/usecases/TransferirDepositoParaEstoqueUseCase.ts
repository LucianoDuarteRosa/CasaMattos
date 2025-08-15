import { EstoqueCalculoService } from '../services/EstoqueCalculoService';
import { loggingService } from '../services/LoggingService';

export interface TransferirDepositoParaEstoqueRequest {
    produtoId: number;
    quantidade: number;
    lote: string;
    ton: string;
    bit: string;
    executorUserId?: number;
}

export class TransferirDepositoParaEstoqueUseCase {
    constructor(
        private estoqueCalculoService: EstoqueCalculoService
    ) { }

    async execute(request: TransferirDepositoParaEstoqueRequest): Promise<void> {
        const { produtoId, quantidade, lote, ton, bit, executorUserId } = request;

        try {
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

            if (executorUserId) {
                await loggingService.logCreate(
                    executorUserId,
                    'EstoqueItem',
                    { produtoId, quantidade, lote, ton, bit },
                    `Transferência do depósito para estoque: Produto ${produtoId}, Lote ${lote}, Ton ${ton}, Bit ${bit}, Quantidade ${quantidade}`
                );
            }
        } catch (error) {
            if (executorUserId) {
                await loggingService.logError(
                    executorUserId,
                    'EstoqueItem',
                    error as Error,
                    `Erro ao transferir do depósito para estoque: Produto ${produtoId}, Lote ${lote}, Ton ${ton}, Bit ${bit}, Quantidade ${quantidade}`
                );
            }
            throw error;
        }
    }
}
