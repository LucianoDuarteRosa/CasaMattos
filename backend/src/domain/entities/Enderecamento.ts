export interface IProduto {
    id: number;
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    deposito: number;
    estoque: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRua {
    id: number;
    nomeRua: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPredio {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
    rua?: IRua;
    createdAt?: Date;
    updatedAt?: Date;
}

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
    produto?: IProduto;
    predio?: IPredio;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Enderecamento implements IEnderecamento {
    constructor(
        public id: number,
        public tonalidade: string,
        public bitola: string,
        public disponivel: boolean,
        public idProduto: number,
        public idPredio: number,
        public lote?: string,
        public observacao?: string,
        public quantCaixas?: number,
        public idLista?: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    static create(data: Omit<IEnderecamento, 'id'>) {
        return new Enderecamento(
            0, // será definido pelo banco
            data.tonalidade,
            data.bitola,
            data.disponivel,
            data.idProduto,
            data.idPredio,
            data.lote,
            data.observacao,
            data.quantCaixas,
            data.idLista,
            data.createdAt,
            data.updatedAt
        );
    }

    adicionarALista(idLista: number) {
        this.idLista = idLista;
    }

    removerDaLista() {
        this.idLista = undefined;
    }
}
