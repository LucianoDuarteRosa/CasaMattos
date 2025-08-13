import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';

interface CreatePredioRequest {
    nomePredio: string;
    vagas?: number;
    idRua: number;
}

export class CreatePredioUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(request: CreatePredioRequest): Promise<IPredio> {
        if (!request.nomePredio || request.nomePredio.trim() === '') {
            throw new Error('Nome do prédio é obrigatório');
        }

        if (request.nomePredio.length > 100) {
            throw new Error('Nome do prédio deve ter no máximo 100 caracteres');
        }

        if (!request.idRua || request.idRua <= 0) {
            throw new Error('ID da rua é obrigatório');
        }

        if (request.vagas !== undefined && request.vagas < 0) {
            throw new Error('Número de vagas não pode ser negativo');
        }

        return await this.predioRepository.create({
            nomePredio: request.nomePredio.trim(),
            vagas: request.vagas,
            idRua: request.idRua
        });
    }
}
