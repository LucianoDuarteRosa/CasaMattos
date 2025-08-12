export interface ILista {
    id: number;
    nome: string;
    disponivel: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Lista implements ILista {
    constructor(
        public id: number,
        public nome: string,
        public disponivel: boolean,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<ILista, 'id'>) {
        return new Lista(
            0, // será definido pelo banco
            data.nome,
            data.disponivel,
            data.createdAt,
            data.updatedAt
        );
    }

    baixarLista() {
        this.disponivel = false;
    }
}
