import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';

export class ListFornecedoresUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(): Promise<IFornecedor[]> {
        return await this.fornecedorRepository.findAll();
    }
}
