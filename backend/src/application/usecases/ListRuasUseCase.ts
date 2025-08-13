import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';

export class ListRuasUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(): Promise<IRua[]> {
        return await this.ruaRepository.findAll();
    }
}
