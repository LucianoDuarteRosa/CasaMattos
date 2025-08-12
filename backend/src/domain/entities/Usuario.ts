export interface IUsuario {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    ativo: boolean;
    idPerfil: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Usuario implements IUsuario {
    constructor(
        public id: number,
        public nomeCompleto: string,
        public nickname: string,
        public email: string,
        public senha: string,
        public ativo: boolean,
        public idPerfil: number,
        public telefone?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IUsuario, 'id'>) {
        return new Usuario(
            0, // será definido pelo banco
            data.nomeCompleto,
            data.nickname,
            data.email,
            data.senha,
            data.ativo,
            data.idPerfil,
            data.telefone,
            data.createdAt,
            data.updatedAt
        );
    }

    desativar() {
        this.ativo = false;
    }

    ativar() {
        this.ativo = true;
    }
}
