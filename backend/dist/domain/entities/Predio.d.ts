export interface IPredio {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Predio implements IPredio {
    id: number;
    nomePredio: string;
    idRua: number;
    vagas?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, nomePredio: string, idRua: number, vagas?: number | undefined, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IPredio, 'id'>): Predio;
}
//# sourceMappingURL=Predio.d.ts.map