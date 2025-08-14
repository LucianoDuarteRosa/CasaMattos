import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';
import { loggingService } from '../services/LoggingService';

export interface UpdateFornecedorDTO {
    razaoSocial?: string;
    cnpj?: string;
    executorUserId?: number;
}

export class UpdateFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(id: number, data: UpdateFornecedorDTO): Promise<IFornecedor | null> {
        try {
            // Verificar se o fornecedor existe
            const fornecedorExistente = await this.fornecedorRepository.findById(id);
            if (!fornecedorExistente) {
                const error = new Error('Fornecedor não encontrado');
                if (data.executorUserId) {
                    await loggingService.logError(data.executorUserId, 'Fornecedor', error, `Tentativa de atualizar fornecedor inexistente (ID: ${id})`);
                }
                throw error;
            }

            // Se está atualizando o CNPJ, verificar se já existe outro fornecedor com este CNPJ
            if (data.cnpj && data.cnpj !== fornecedorExistente.cnpj) {
                const fornecedorComMesmoCNPJ = await this.fornecedorRepository.findByCNPJ(data.cnpj);
                if (fornecedorComMesmoCNPJ && fornecedorComMesmoCNPJ.id !== id) {
                    const error = new Error('Já existe um fornecedor com este CNPJ');
                    if (data.executorUserId) {
                        await loggingService.logError(data.executorUserId, 'Fornecedor', error, `Tentativa de atualizar fornecedor com CNPJ duplicado: ${data.cnpj}`);
                    }
                    throw error;
                }
            }

            const fornecedorAtualizado = await this.fornecedorRepository.update(id, data);

            // Log de sucesso
            if (data.executorUserId && fornecedorAtualizado) {
                await loggingService.logUpdate(
                    data.executorUserId,
                    'Fornecedor',
                    fornecedorExistente,
                    fornecedorAtualizado,
                    `Atualizou fornecedor: ${fornecedorAtualizado.razaoSocial} (ID: ${id})`
                );
            }

            return fornecedorAtualizado;
        } catch (error) {
            // Log de erro não previsto
            if (data.executorUserId && !(error as Error).message.includes('não encontrado') && !(error as Error).message.includes('CNPJ')) {
                await loggingService.logError(data.executorUserId, 'Fornecedor', error as Error, 'Erro inesperado ao atualizar fornecedor');
            }
            throw error;
        }
    }
}
