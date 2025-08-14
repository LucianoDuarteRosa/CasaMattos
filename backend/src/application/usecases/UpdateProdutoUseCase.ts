import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import { loggingService } from '../services/LoggingService';

export interface UpdateProdutoDTO {
    codInterno?: number;
    descricao?: string;
    quantMinVenda?: number;
    codBarras?: string;
    deposito?: number;
    estoque?: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor?: number;
    executorUserId?: number; // ID do usuário que está executando a ação
}

export class UpdateProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(id: number, data: UpdateProdutoDTO): Promise<IProduto> {
        try {
            // Verificar se o produto existe
            const produtoExistente = await this.produtoRepository.findById(id);
            if (!produtoExistente) {
                const error = new Error('Produto não encontrado');
                if (data.executorUserId) {
                    await loggingService.logError(data.executorUserId, 'Produto', error, `Tentativa de atualizar produto inexistente: ID ${id}`);
                }
                throw error;
            }

            // Se está alterando o código interno, verificar se não existe outro produto com o mesmo código
            if (data.codInterno && data.codInterno !== produtoExistente.codInterno) {
                const produtoComMesmoCodigo = await this.produtoRepository.findByCodInterno(data.codInterno);
                if (produtoComMesmoCodigo) {
                    const error = new Error('Já existe um produto com este código interno');
                    if (data.executorUserId) {
                        await loggingService.logError(data.executorUserId, 'Produto', error, `Tentativa de atualizar produto com código interno duplicado: ${data.codInterno}`);
                    }
                    throw error;
                }
            }

            const produtoAtualizado = await this.produtoRepository.update(id, data);
            if (!produtoAtualizado) {
                const error = new Error('Erro ao atualizar produto');
                if (data.executorUserId) {
                    await loggingService.logError(data.executorUserId, 'Produto', error, `Erro interno ao atualizar produto: ID ${id}`);
                }
                throw error;
            }

            // Log de sucesso
            if (data.executorUserId) {
                await loggingService.logUpdate(
                    data.executorUserId,
                    'Produto',
                    produtoExistente,
                    produtoAtualizado,
                    `Atualizou produto: ${produtoAtualizado.descricao} (Cód: ${produtoAtualizado.codInterno})`
                );
            }

            return produtoAtualizado;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (data.executorUserId && !message.includes('não encontrado') && !message.includes('código interno') && !message.includes('Erro ao atualizar')) {
                await loggingService.logError(data.executorUserId, 'Produto', error as Error, 'Erro inesperado ao atualizar produto');
            }
            throw error;
        }
    }
}
