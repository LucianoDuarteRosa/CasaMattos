import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';
import { loggingService } from '../services/LoggingService';

export interface CreateFornecedorDTO {
    razaoSocial: string;
    cnpj: string;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreateFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(data: CreateFornecedorDTO): Promise<IFornecedor> {
        try {
            // Verificar se já existe um fornecedor com o mesmo CNPJ
            const fornecedorExistente = await this.fornecedorRepository.findByCNPJ(data.cnpj);
            if (fornecedorExistente) {
                const error = new Error('Já existe um fornecedor com este CNPJ');
                await loggingService.logError(data.executorUserId, 'Fornecedor', error, `Tentativa de criar fornecedor com CNPJ duplicado: ${data.cnpj}`);
                throw error;
            }

            const newFornecedor = await this.fornecedorRepository.create(data);

            // Log de sucesso
            await loggingService.logCreate(
                data.executorUserId,
                'Fornecedor',
                {
                    id: newFornecedor.id,
                    razaoSocial: newFornecedor.razaoSocial,
                    cnpj: newFornecedor.cnpj
                },
                `Criou novo fornecedor: ${newFornecedor.razaoSocial} (CNPJ: ${newFornecedor.cnpj})`
            );

            return newFornecedor;
        } catch (error) {
            // Log erro não previsto
            const message = (error as Error).message;
            if (!message.includes('CNPJ')) {
                await loggingService.logError(data.executorUserId, 'Fornecedor', error as Error, 'Erro inesperado ao criar fornecedor');
            }
            throw error;
        }
    }
}
