"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(id, nomeCompleto, nickname, email, senha, ativo, idPerfil, telefone, createdAt, updatedAt) {
        this.id = id;
        this.nomeCompleto = nomeCompleto;
        this.nickname = nickname;
        this.email = email;
        this.senha = senha;
        this.ativo = ativo;
        this.idPerfil = idPerfil;
        this.telefone = telefone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Usuario(0, // será definido pelo banco
        data.nomeCompleto, data.nickname, data.email, data.senha, data.ativo, data.idPerfil, data.telefone, data.createdAt, data.updatedAt);
    }
    desativar() {
        this.ativo = false;
    }
    ativar() {
        this.ativo = true;
    }
}
exports.Usuario = Usuario;
//# sourceMappingURL=Usuario.js.map