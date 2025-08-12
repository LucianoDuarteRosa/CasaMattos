export interface ILog {
    id: number;
    idUsuario: number;
    entidade: string;
    acao: string;
    descricao: string;
    dataHora: Date;
}
export declare class Log implements ILog {
    id: number;
    idUsuario: number;
    entidade: string;
    acao: string;
    descricao: string;
    dataHora: Date;
    constructor(id: number, idUsuario: number, entidade: string, acao: string, descricao: string, dataHora: Date);
    static create(data: Omit<ILog, 'id' | 'dataHora'>): Log;
}
//# sourceMappingURL=Log.d.ts.map