import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import { loggingService } from '../services/LoggingService';

export interface CreateProdutoDTO {
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreateProdutoUseCase {
    constructor(
        private produtoRepository: IProdutoRepository
    ) { }

    async execute(data: CreateProdutoDTO): Promise<IProduto> {
        try {
            // Verificar se já existe um produto com o mesmo código interno
            const produtoExistente = await this.produtoRepository.findByCodInterno(data.codInterno);
            if (produtoExistente) {
                const error = new Error('Já existe um produto com este código interno');
                await loggingService.logError(data.executorUserId, 'Produto', error, `Tentativa de criar produto com código interno duplicado: ${data.codInterno}`);
                throw error;
            }

            const newProduto = await this.produtoRepository.create(data);

            // Log de sucesso
            await loggingService.logCreate(
                data.executorUserId,
                'Produto',
                {
                    id: newProduto.id,
                    codInterno: newProduto.codInterno,
                    descricao: newProduto.descricao,
                    quantMinVenda: newProduto.quantMinVenda,
                    idFornecedor: newProduto.idFornecedor
                },
                `Criou novo produto: ${newProduto.descricao} (Cód: ${newProduto.codInterno})`
            );

            return newProduto;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (!message.includes('código interno')) {
                await loggingService.logError(data.executorUserId, 'Produto', error as Error, 'Erro inesperado ao criar produto');
            }
            throw error;
        }
    }
}
