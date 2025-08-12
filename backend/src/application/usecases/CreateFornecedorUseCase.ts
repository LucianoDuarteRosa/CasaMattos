import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';

export interface CreateFornecedorDTO {
    razaoSocial: string;
    cnpj: string;
}

export class CreateFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(data: CreateFornecedorDTO): Promise<IFornecedor> {
        // Verificar se já existe um fornecedor com o mesmo CNPJ
        const fornecedorExistente = await this.fornecedorRepository.findByCNPJ(data.cnpj);
        if (fornecedorExistente) {
            throw new Error('Já existe um fornecedor com este CNPJ');
        }

        return await this.fornecedorRepository.create(data);
    }
}
