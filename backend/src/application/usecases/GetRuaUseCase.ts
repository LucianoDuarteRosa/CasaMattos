import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';

export class GetRuaUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(id: number): Promise<IRua | null> {
        if (!id || id <= 0) {
            throw new Error('ID da rua é obrigatório e deve ser maior que zero');
        }

        return await this.ruaRepository.findById(id);
    }
}
