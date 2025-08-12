import { IProduto } from '../entities/Produto';
export interface IProdutoRepository {
    create(produto: Omit<IProduto, 'id'>): Promise<IProduto>;
    findById(id: number): Promise<IProduto | null>;
    findAll(): Promise<IProduto[]>;
    update(id: number, data: Partial<IProduto>): Promise<IProduto | null>;
    delete(id: number): Promise<boolean>;
    findByCodInterno(codInterno: number): Promise<IProduto | null>;
    findByDescricao(descricao: string): Promise<IProduto[]>;
    findByFornecedor(idFornecedor: number): Promise<IProduto[]>;
    search(term: string): Promise<IProduto[]>;
    findWithPagination(page: number, limit: number, search?: string): Promise<{
        produtos: IProduto[];
        total: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=IProdutoRepository.d.ts.map