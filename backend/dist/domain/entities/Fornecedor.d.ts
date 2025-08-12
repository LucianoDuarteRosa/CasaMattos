export interface IFornecedor {
    id: number;
    razaoSocial: string;
    cnpj: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Fornecedor implements IFornecedor {
    id: number;
    razaoSocial: string;
    cnpj: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, razaoSocial: string, cnpj: string, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IFornecedor, 'id'>): Fornecedor;
}
//# sourceMappingURL=Fornecedor.d.ts.map