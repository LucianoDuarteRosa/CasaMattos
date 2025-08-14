import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';

export class DeleteEnderecamentoUseCase {
    constructor(private enderecamentoRepository: IEnderecamentoRepository) { }

    async execute(id: number): Promise<boolean> {
        if (!id || id <= 0) {
            throw new Error('ID do endereçamento é obrigatório e deve ser maior que zero');
        }

        const existingEnderecamento = await this.enderecamentoRepository.findById(id);
        if (!existingEnderecamento) {
            throw new Error('Endereçamento não encontrado');
        }

        // Verificar se o endereçamento está associado a uma lista
        if (existingEnderecamento.idLista) {
            throw new Error('Não é possível excluir endereçamento que está associado a uma lista. Remove da lista primeiro.');
        }

        return await this.enderecamentoRepository.delete(id);
    }
}
