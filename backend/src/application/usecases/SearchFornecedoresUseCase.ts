import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';

export class SearchFornecedoresUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(searchTerm: string): Promise<IFornecedor[]> {
        const todosFornecedores = await this.fornecedorRepository.findAll();

        if (!searchTerm || searchTerm.trim() === '') {
            return todosFornecedores;
        }

        const termoBusca = searchTerm.toLowerCase().trim();

        return todosFornecedores.filter(fornecedor =>
            fornecedor.razaoSocial.toLowerCase().includes(termoBusca) ||
            fornecedor.cnpj.toLowerCase().includes(termoBusca)
        );
    }
}
