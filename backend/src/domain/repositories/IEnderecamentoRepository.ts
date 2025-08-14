import { IEnderecamento } from '../entities/Enderecamento';

export interface IEnderecamentoRepository {
    create(enderecamento: Omit<IEnderecamento, 'id'>): Promise<IEnderecamento>;
    createBulk(enderecamento: Omit<IEnderecamento, 'id'>, quantidade: number): Promise<IEnderecamento[]>;
    findById(id: number): Promise<IEnderecamento | null>;
    findAll(): Promise<IEnderecamento[]>;
    update(id: number, data: Partial<IEnderecamento>): Promise<IEnderecamento | null>;
    delete(id: number): Promise<boolean>;
    findByLista(idLista: number): Promise<IEnderecamento[]>;
    findByProduto(idProduto: number): Promise<IEnderecamento[]>;
    findDisponiveis(): Promise<IEnderecamento[]>;
    findByCodInternoOuDescricao(termo: string): Promise<IEnderecamento[]>;
}
