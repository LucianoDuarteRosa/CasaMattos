import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { ILista } from '../../domain/entities/Lista';

interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class GetListasUseCase {
    constructor(private listaRepository: IListaRepository) { }

    async execute(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<ILista>> {
        const offset = (page - 1) * limit;
        const { rows, count } = await this.listaRepository.findAndCountAll({
            offset,
            limit,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    }
}
