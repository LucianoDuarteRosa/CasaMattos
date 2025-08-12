"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Predio = void 0;
class Predio {
    constructor(id, nomePredio, idRua, vagas, createdAt, updatedAt) {
        this.id = id;
        this.nomePredio = nomePredio;
        this.idRua = idRua;
        this.vagas = vagas;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Predio(0, // será definido pelo banco
        data.nomePredio, data.idRua, data.vagas, data.createdAt, data.updatedAt);
    }
}
exports.Predio = Predio;
//# sourceMappingURL=Predio.js.map