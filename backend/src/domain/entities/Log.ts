export interface ILog {
    id: number;
    idUsuario: number;
    entidade: string;
    acao: string;
    descricao: string;
    dataHora: Date;
}

export class Log implements ILog {
    constructor(
        public id: number,
        public idUsuario: number,
        public entidade: string,
        public acao: string,
        public descricao: string,
        public dataHora: Date
    ) { }

    static create(data: Omit<ILog, 'id' | 'dataHora'>) {
        return new Log(
            0, // será definido pelo banco
            data.idUsuario,
            data.entidade,
            data.acao,
            data.descricao,
            new Date()
        );
    }
}
