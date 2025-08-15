export interface IEstoqueItem {
    id: number;
    produtoId: number;
    lote: string;
    ton: string;
    bit: string;
    quantidade: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EstoqueItem implements IEstoqueItem {
    constructor(
        public id: number,
        public produtoId: number,
        public lote: string,
        public ton: string,
        public bit: string,
        public quantidade: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    get chaveCaracteristicas(): string {
        return `${this.lote}-${this.ton}-${this.bit}`;
    }

    static create(data: Omit<IEstoqueItem, 'id'>) {
        return new EstoqueItem(
            0, // será definido pelo banco
            data.produtoId,
            data.lote,
            data.ton,
            data.bit,
            data.quantidade,
            data.createdAt,
            data.updatedAt
        );
    }
}