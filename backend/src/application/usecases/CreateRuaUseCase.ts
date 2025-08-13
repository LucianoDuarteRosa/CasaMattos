import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';

interface CreateRuaRequest {
    nomeRua: string;
}

export class CreateRuaUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(request: CreateRuaRequest): Promise<IRua> {
        if (!request.nomeRua || request.nomeRua.trim() === '') {
            throw new Error('Nome da rua é obrigatório');
        }

        if (request.nomeRua.length > 100) {
            throw new Error('Nome da rua deve ter no máximo 100 caracteres');
        }

        return await this.ruaRepository.create({
            nomeRua: request.nomeRua.trim()
        });
    }
}
