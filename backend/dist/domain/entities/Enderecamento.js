"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enderecamento = void 0;
class Enderecamento {
    constructor(id, tonalidade, bitola, disponivel, idProduto, idPredio, lote, observacao, quantCaixas, idLista, createdAt, updatedAt) {
        this.id = id;
        this.tonalidade = tonalidade;
        this.bitola = bitola;
        this.disponivel = disponivel;
        this.idProduto = idProduto;
        this.idPredio = idPredio;
        this.lote = lote;
        this.observacao = observacao;
        this.quantCaixas = quantCaixas;
        this.idLista = idLista;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Enderecamento(0, // será definido pelo banco
        data.tonalidade, data.bitola, data.disponivel, data.idProduto, data.idPredio, data.lote, data.observacao, data.quantCaixas, data.idLista, data.createdAt, data.updatedAt);
    }
    adicionarALista(idLista) {
        this.idLista = idLista;
    }
    removerDaLista() {
        this.idLista = undefined;
    }
}
exports.Enderecamento = Enderecamento;
//# sourceMappingURL=Enderecamento.js.map