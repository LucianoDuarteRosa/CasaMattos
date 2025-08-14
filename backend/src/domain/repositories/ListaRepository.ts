import { ILista } from '../entities/Lista';
import { IEnderecamento } from '../entities/Enderecamento';

export interface ListaRepository {
    findAll(): Promise<ILista[]>;
    findById(id: number): Promise<ILista | null>;
    findAndCountAll(options: {
        offset?: number;
        limit?: number;
        order?: any[];
    }): Promise<{ rows: ILista[]; count: number }>;
    create(lista: Omit<ILista, 'id'>): Promise<ILista>;
    update(id: number, lista: Partial<ILista>): Promise<ILista | null>;
    delete(id: number): Promise<boolean>;
    getEnderecamentos(idLista: number): Promise<IEnderecamento[]>;
    addEnderecamento(idLista: number, idEnderecamento: number): Promise<void>;
    removeEnderecamento(idLista: number, idEnderecamento: number): Promise<void>;
    finalizarLista(idLista: number): Promise<void>;
    desfazerFinalizacao(idLista: number): Promise<void>;
}
