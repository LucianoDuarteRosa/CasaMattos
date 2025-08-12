export interface IPerfil {
    id: number;
    nomePerfil: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Perfil implements IPerfil {
    constructor(
        public id: number,
        public nomePerfil: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IPerfil, 'id'>) {
        return new Perfil(
            0, // será definido pelo banco
            data.nomePerfil,
            data.createdAt,
            data.updatedAt
        );
    }
}
