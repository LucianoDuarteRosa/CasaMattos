"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lista = void 0;
class Lista {
    constructor(id, nome, disponivel, createdAt, updatedAt) {
        this.id = id;
        this.nome = nome;
        this.disponivel = disponivel;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Lista(0, // será definido pelo banco
        data.nome, data.disponivel, data.createdAt, data.updatedAt);
    }
    baixarLista() {
        this.disponivel = false;
    }
}
exports.Lista = Lista;
//# sourceMappingURL=Lista.js.map