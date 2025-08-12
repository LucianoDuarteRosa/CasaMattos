import { ILista } from '../entities/Lista';
export interface IListaRepository {
    create(lista: Omit<ILista, 'id'>): Promise<ILista>;
    findById(id: number): Promise<ILista | null>;
    findAll(): Promise<ILista[]>;
    update(id: number, data: Partial<ILista>): Promise<ILista | null>;
    delete(id: number): Promise<boolean>;
    findDisponiveis(): Promise<ILista[]>;
}
//# sourceMappingURL=IListaRepository.d.ts.map