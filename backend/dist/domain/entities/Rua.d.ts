export interface IRua {
    id: number;
    nomeRua: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Rua implements IRua {
    id: number;
    nomeRua: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, nomeRua: string, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IRua, 'id'>): Rua;
}
//# sourceMappingURL=Rua.d.ts.map