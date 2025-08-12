export interface ILista {
    id: number;
    nome: string;
    disponivel: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Lista implements ILista {
    id: number;
    nome: string;
    disponivel: boolean;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, nome: string, disponivel: boolean, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<ILista, 'id'>): Lista;
    baixarLista(): void;
}
//# sourceMappingURL=Lista.d.ts.map