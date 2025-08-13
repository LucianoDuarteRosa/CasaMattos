import { IRua } from '../entities/Rua';

export interface IRuaRepository {
    create(data: Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>): Promise<IRua>;
    findById(id: number): Promise<IRua | null>;
    findAll(): Promise<IRua[]>;
    update(id: number, data: Partial<Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IRua | null>;
    delete(id: number): Promise<boolean>;
    findByNome(nomeRua: string): Promise<IRua[]>;
}
