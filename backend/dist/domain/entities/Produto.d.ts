export interface IProduto {
    id: number;
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    deposito: number;
    estoque: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Produto implements IProduto {
    id: number;
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    deposito: number;
    estoque: number;
    idFornecedor: number;
    codBarras?: string | undefined;
    custo?: number | undefined;
    codFabricante?: string | undefined;
    quantCaixas?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, codInterno: number, descricao: string, quantMinVenda: number, deposito: number, estoque: number, idFornecedor: number, codBarras?: string | undefined, custo?: number | undefined, codFabricante?: string | undefined, quantCaixas?: number | undefined, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IProduto, 'id'>): Produto;
}
//# sourceMappingURL=Produto.d.ts.map