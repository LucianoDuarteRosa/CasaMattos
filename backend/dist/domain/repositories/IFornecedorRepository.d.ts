import { IFornecedor } from '../entities/Fornecedor';
export interface IFornecedorRepository {
    create(fornecedor: Omit<IFornecedor, 'id'>): Promise<IFornecedor>;
    findById(id: number): Promise<IFornecedor | null>;
    findAll(): Promise<IFornecedor[]>;
    update(id: number, data: Partial<IFornecedor>): Promise<IFornecedor | null>;
    delete(id: number): Promise<boolean>;
    findByCNPJ(cnpj: string): Promise<IFornecedor | null>;
}
//# sourceMappingURL=IFornecedorRepository.d.ts.map