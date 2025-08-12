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
export declare class Usuario implements IUsuario {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    senha: string;
    ativo: boolean;
    idPerfil: number;
    telefone?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, nomeCompleto: string, nickname: string, email: string, senha: string, ativo: boolean, idPerfil: number, telefone?: string | undefined, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IUsuario, 'id'>): Usuario;
    desativar(): void;
    ativar(): void;
}
//# sourceMappingURL=Usuario.d.ts.map