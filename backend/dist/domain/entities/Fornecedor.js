"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fornecedor = void 0;
class Fornecedor {
    constructor(id, razaoSocial, cnpj, createdAt, updatedAt) {
        this.id = id;
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Fornecedor(0, // será definido pelo banco
        data.razaoSocial, data.cnpj, data.createdAt, data.updatedAt);
    }
}
exports.Fornecedor = Fornecedor;
//# sourceMappingURL=Fornecedor.js.map