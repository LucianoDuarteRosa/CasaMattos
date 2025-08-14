import { ILista } from '../entities/Lista';
import { IEnderecamento } from '../entities/Enderecamento';

export interface IListaRepository {
    create(lista: Omit<ILista, 'id'>): Promise<ILista>;
    findById(id: number): Promise<ILista | null>;
    findByNome(nome: string): Promise<ILista | null>;
    findAll(): Promise<ILista[]>;
    findAndCountAll(options: {
        offset?: number;
        limit?: number;
        order?: any[];
    }): Promise<{ rows: ILista[]; count: number }>;
    update(id: number, data: Partial<ILista>): Promise<ILista | null>;
    delete(id: number): Promise<boolean>;
    findDisponiveis(): Promise<ILista[]>;
    getEnderecamentos(idLista: number): Promise<IEnderecamento[]>;
    addEnderecamento(idLista: number, idEnderecamento: number): Promise<void>;
    removeEnderecamento(idLista: number, idEnderecamento: number): Promise<void>;
    finalizarLista(idLista: number): Promise<void>;
    desfazerFinalizacao(idLista: number): Promise<void>;
}
