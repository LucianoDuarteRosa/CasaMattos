import { IRuaRepository } from '../../domain/repositories/IRuaRepository';

export class DeleteRuaUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(id: number): Promise<boolean> {
        if (!id || id <= 0) {
            throw new Error('ID da rua é obrigatório e deve ser maior que zero');
        }

        const existingRua = await this.ruaRepository.findById(id);
        if (!existingRua) {
            throw new Error('Rua não encontrada');
        }

        return await this.ruaRepository.delete(id);
    }
}
