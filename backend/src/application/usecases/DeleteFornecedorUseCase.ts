import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';

export class DeleteFornecedorUseCase {
    constructor(
        private fornecedorRepository: IFornecedorRepository
    ) { }

    async execute(id: number): Promise<boolean> {
        // Verificar se o fornecedor existe
        const fornecedorExistente = await this.fornecedorRepository.findById(id);
        if (!fornecedorExistente) {
            throw new Error('Fornecedor não encontrado');
        }

        return await this.fornecedorRepository.delete(id);
    }
}
