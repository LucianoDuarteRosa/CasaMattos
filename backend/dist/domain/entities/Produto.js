"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
class Produto {
    constructor(id, codInterno, descricao, quantMinVenda, deposito, estoque, idFornecedor, codBarras, custo, codFabricante, quantCaixas, createdAt, updatedAt) {
        this.id = id;
        this.codInterno = codInterno;
        this.descricao = descricao;
        this.quantMinVenda = quantMinVenda;
        this.deposito = deposito;
        this.estoque = estoque;
        this.idFornecedor = idFornecedor;
        this.codBarras = codBarras;
        this.custo = custo;
        this.codFabricante = codFabricante;
        this.quantCaixas = quantCaixas;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Produto(0, // será definido pelo banco
        data.codInterno, data.descricao, data.quantMinVenda, data.deposito, data.estoque, data.idFornecedor, data.codBarras, data.custo, data.codFabricante, data.quantCaixas, data.createdAt, data.updatedAt);
    }
}
exports.Produto = Produto;
//# sourceMappingURL=Produto.js.map