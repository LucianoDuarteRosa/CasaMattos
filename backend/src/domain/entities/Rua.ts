export interface IRua {
    id: number;
    nomeRua: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Rua implements IRua {
    constructor(
        public id: number,
        public nomeRua: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IRua, 'id'>) {
        return new Rua(
            0, // será definido pelo banco
            data.nomeRua,
            data.createdAt,
            data.updatedAt
        );
    }
}
