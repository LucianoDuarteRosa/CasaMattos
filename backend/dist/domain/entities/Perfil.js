"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Perfil = void 0;
class Perfil {
    constructor(id, nomePerfil, createdAt, updatedAt) {
        this.id = id;
        this.nomePerfil = nomePerfil;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Perfil(0, // será definido pelo banco
        data.nomePerfil, data.createdAt, data.updatedAt);
    }
}
exports.Perfil = Perfil;
//# sourceMappingURL=Perfil.js.map