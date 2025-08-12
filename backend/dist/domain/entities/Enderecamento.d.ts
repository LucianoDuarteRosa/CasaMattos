export interface IEnderecamento {
    id: number;
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idLista?: number;
    idPredio: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Enderecamento implements IEnderecamento {
    id: number;
    tonalidade: string;
    bitola: string;
    disponivel: boolean;
    idProduto: number;
    idPredio: number;
    lote?: string | undefined;
    observacao?: string | undefined;
    quantCaixas?: number | undefined;
    idLista?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: number, tonalidade: string, bitola: string, disponivel: boolean, idProduto: number, idPredio: number, lote?: string | undefined, observacao?: string | undefined, quantCaixas?: number | undefined, idLista?: number | undefined, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(data: Omit<IEnderecamento, 'id'>): Enderecamento;
    adicionarALista(idLista: number): void;
    removerDaLista(): void;
}
//# sourceMappingURL=Enderecamento.d.ts.map