export interface IPerfil {
    id: number;
    nomePerfil: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Perfil implements IPerfil {
    id: number;
    nomePerfil: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, nomePerfil: string, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IPerfil, 'id'>): Perfil;
}
//# sourceMappingURL=Perfil.d.ts.map