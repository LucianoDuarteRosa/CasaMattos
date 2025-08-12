"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
class Log {
    constructor(id, idUsuario, entidade, acao, descricao, dataHora) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.entidade = entidade;
        this.acao = acao;
        this.descricao = descricao;
        this.dataHora = dataHora;
    }
    static create(data) {
        return new Log(0, // será definido pelo banco
        data.idUsuario, data.entidade, data.acao, data.descricao, new Date());
    }
}
exports.Log = Log;
//# sourceMappingURL=Log.js.map