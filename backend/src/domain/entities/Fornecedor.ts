export interface IFornecedor {
    id: number;
    razaoSocial: string;
    cnpj: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Fornecedor implements IFornecedor {
    constructor(
        public id: number,
        public razaoSocial: string,
        public cnpj: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IFornecedor, 'id'>) {
        return new Fornecedor(
            0, // será definido pelo banco
            data.razaoSocial,
            data.cnpj,
            data.createdAt,
            data.updatedAt
        );
    }
}
