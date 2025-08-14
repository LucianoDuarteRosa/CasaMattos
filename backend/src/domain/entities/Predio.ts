import { IRua } from './Rua';

export interface IPredio {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
    rua?: IRua;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Predio implements IPredio {
    constructor(
        public id: number,
        public nomePredio: string,
        public idRua: number,
        public vagas?: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IPredio, 'id'>) {
        return new Predio(
            0, // será definido pelo banco
            data.nomePredio,
            data.idRua,
            data.vagas,
            data.createdAt,
            data.updatedAt
        );
    }
}
