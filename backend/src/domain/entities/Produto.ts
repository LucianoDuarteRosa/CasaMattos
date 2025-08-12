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

export class Produto implements IProduto {
    constructor(
        public id: number,
        public codInterno: number,
        public descricao: string,
        public quantMinVenda: number,
        public deposito: number,
        public estoque: number,
        public idFornecedor: number,
        public codBarras?: string,
        public custo?: number,
        public codFabricante?: string,
        public quantCaixas?: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IProduto, 'id'>) {
        return new Produto(
            0, // será definido pelo banco
            data.codInterno,
            data.descricao,
            data.quantMinVenda,
            data.deposito,
            data.estoque,
            data.idFornecedor,
            data.codBarras,
            data.custo,
            data.codFabricante,
            data.quantCaixas,
            data.createdAt,
            data.updatedAt
        );
    }
}
