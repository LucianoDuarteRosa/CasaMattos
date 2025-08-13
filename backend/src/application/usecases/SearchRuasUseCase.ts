import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';

export class SearchRuasUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(nomeRua: string): Promise<IRua[]> {
        if (!nomeRua || nomeRua.trim() === '') {
            return await this.ruaRepository.findAll();
        }

        return await this.ruaRepository.findByNome(nomeRua.trim());
    }
}
