import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';

interface UpdatePredioRequest {
    id: number;
    nomePredio?: string;
    vagas?: number;
    idRua?: number;
}

export class UpdatePredioUseCase {
    constructor(private predioRepository: IPredioRepository) { }

    async execute(request: UpdatePredioRequest): Promise<IPredio | null> {
        if (!request.id || request.id <= 0) {
            throw new Error('ID do prédio é obrigatório e deve ser maior que zero');
        }

        if (request.nomePredio !== undefined) {
            if (!request.nomePredio || request.nomePredio.trim() === '') {
                throw new Error('Nome do prédio é obrigatório');
            }

            if (request.nomePredio.length > 100) {
                throw new Error('Nome do prédio deve ter no máximo 100 caracteres');
            }

            request.nomePredio = request.nomePredio.trim();
        }

        if (request.idRua !== undefined && request.idRua <= 0) {
            throw new Error('ID da rua deve ser maior que zero');
        }

        if (request.vagas !== undefined && request.vagas < 0) {
            throw new Error('Número de vagas não pode ser negativo');
        }

        const existingPredio = await this.predioRepository.findById(request.id);
        if (!existingPredio) {
            throw new Error('Prédio não encontrado');
        }

        return await this.predioRepository.update(request.id, {
            nomePredio: request.nomePredio,
            vagas: request.vagas,
            idRua: request.idRua
        });
    }
}
