"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rua = void 0;
class Rua {
    constructor(id, nomeRua, createdAt, updatedAt) {
        this.id = id;
        this.nomeRua = nomeRua;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Rua(0, // será definido pelo banco
        data.nomeRua, data.createdAt, data.updatedAt);
    }
}
exports.Rua = Rua;
//# sourceMappingURL=Rua.js.map