import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';

interface UpdateRuaRequest {
    id: number;
    nomeRua?: string;
}

export class UpdateRuaUseCase {
    constructor(private ruaRepository: IRuaRepository) { }

    async execute(request: UpdateRuaRequest): Promise<IRua | null> {
        if (!request.id || request.id <= 0) {
            throw new Error('ID da rua é obrigatório e deve ser maior que zero');
        }

        if (request.nomeRua !== undefined) {
            if (!request.nomeRua || request.nomeRua.trim() === '') {
                throw new Error('Nome da rua é obrigatório');
            }

            if (request.nomeRua.length > 100) {
                throw new Error('Nome da rua deve ter no máximo 100 caracteres');
            }

            request.nomeRua = request.nomeRua.trim();
        }

        const existingRua = await this.ruaRepository.findById(request.id);
        if (!existingRua) {
            throw new Error('Rua não encontrada');
        }

        return await this.ruaRepository.update(request.id, {
            nomeRua: request.nomeRua
        });
    }
}
