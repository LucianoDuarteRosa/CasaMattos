import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';

export interface UpdateFornecedorDTO {
    razaoSocial?: string;
    cnpj?: string;
}

export class UpdateFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(id: number, data: UpdateFornecedorDTO): Promise<IFornecedor | null> {
        // Verificar se o fornecedor existe
        const fornecedorExistente = await this.fornecedorRepository.findById(id);
        if (!fornecedorExistente) {
            throw new Error('Fornecedor não encontrado');
        }

        // Se está atualizando o CNPJ, verificar se já existe outro fornecedor com este CNPJ
        if (data.cnpj && data.cnpj !== fornecedorExistente.cnpj) {
            const fornecedorComMesmoCNPJ = await this.fornecedorRepository.findByCNPJ(data.cnpj);
            if (fornecedorComMesmoCNPJ && fornecedorComMesmoCNPJ.id !== id) {
                throw new Error('Já existe um fornecedor com este CNPJ');
            }
        }

        return await this.fornecedorRepository.update(id, data);
    }
}
