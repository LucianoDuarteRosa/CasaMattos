import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';

export class GetFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(id: number): Promise<IFornecedor | null> {
        const fornecedor = await this.fornecedorRepository.findById(id);

        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado');
        }

        return fornecedor;
    }
}
