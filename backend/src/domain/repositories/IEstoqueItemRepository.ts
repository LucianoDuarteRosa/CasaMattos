import { EstoqueItem, IEstoqueItem } from '../entities/EstoqueItem';

export interface IEstoqueItemRepository {
    create(estoqueItem: Omit<IEstoqueItem, 'id'>): Promise<EstoqueItem>;
    findById(id: number): Promise<EstoqueItem | null>;
    findByProdutoId(produtoId: number): Promise<EstoqueItem[]>;
    findByCaracteristicas(produtoId: number, lote: string, ton: string, bit: string): Promise<EstoqueItem | null>;
    upsertByCaracteristicas(produtoId: number, lote: string, ton: string, bit: string, quantidade: number): Promise<EstoqueItem>;
    update(id: number, estoqueItem: Partial<IEstoqueItem>): Promise<EstoqueItem | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<EstoqueItem[]>;
    calcularEstoqueProduto(produtoId: number): Promise<number>;
}