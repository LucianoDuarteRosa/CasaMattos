import { IPredio } from '../entities/Predio';

export interface IPredioRepository {
    create(predio: Omit<IPredio, 'id'>): Promise<IPredio>;
    findById(id: number): Promise<IPredio | null>;
    findAll(): Promise<IPredio[]>;
    findByRua(idRua: number): Promise<IPredio[]>;
    findByNome(nomePredio: string): Promise<IPredio[]>;
    update(id: number, data: Partial<IPredio>): Promise<IPredio | null>;
    delete(id: number): Promise<boolean>;
}
