import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { loggingService } from '../services/LoggingService';

export class DeleteFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(id: number, executorUserId?: number): Promise<boolean> {
        try {
            // Verificar se o fornecedor existe
            const fornecedorExistente = await this.fornecedorRepository.findById(id);
            if (!fornecedorExistente) {
                const error = new Error('Fornecedor não encontrado');
                if (executorUserId) {
                    await loggingService.logError(executorUserId, 'Fornecedor', error, `Tentativa de excluir fornecedor inexistente (ID: ${id})`);
                }
                throw error;
            }

            const deleted = await this.fornecedorRepository.delete(id);

            // Log de sucesso
            if (executorUserId && deleted) {
                await loggingService.logDelete(
                    executorUserId,
                    'Fornecedor',
                    {
                        id: fornecedorExistente.id,
                        razaoSocial: fornecedorExistente.razaoSocial,
                        cnpj: fornecedorExistente.cnpj
                    },
                    `Excluiu fornecedor: ${fornecedorExistente.razaoSocial} (ID: ${id})`
                );
            }

            return deleted;
        } catch (error) {
            // Log de erro não previsto
            if (executorUserId && !(error as Error).message.includes('não encontrado')) {
                await loggingService.logError(executorUserId, 'Fornecedor', error as Error, 'Erro inesperado ao excluir fornecedor');
            }
            throw error;
        }
    }
}
