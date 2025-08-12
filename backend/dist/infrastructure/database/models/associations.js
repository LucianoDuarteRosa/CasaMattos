"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnderecamentoModel = exports.ListaModel = exports.PredioModel = exports.RuaModel = exports.ProdutoModel = exports.FornecedorModel = exports.PerfilModel = exports.UsuarioModel = void 0;
const UsuarioModel_1 = __importDefault(require("./UsuarioModel"));
exports.UsuarioModel = UsuarioModel_1.default;
const PerfilModel_1 = __importDefault(require("./PerfilModel"));
exports.PerfilModel = PerfilModel_1.default;
const FornecedorModel_1 = __importDefault(require("./FornecedorModel"));
exports.FornecedorModel = FornecedorModel_1.default;
const ProdutoModel_1 = __importDefault(require("./ProdutoModel"));
exports.ProdutoModel = ProdutoModel_1.default;
const RuaModel_1 = __importDefault(require("./RuaModel"));
exports.RuaModel = RuaModel_1.default;
const PredioModel_1 = __importDefault(require("./PredioModel"));
exports.PredioModel = PredioModel_1.default;
const ListaModel_1 = __importDefault(require("./ListaModel"));
exports.ListaModel = ListaModel_1.default;
const EnderecamentoModel_1 = __importDefault(require("./EnderecamentoModel"));
exports.EnderecamentoModel = EnderecamentoModel_1.default;
// Associações Usuario <-> Perfil
UsuarioModel_1.default.belongsTo(PerfilModel_1.default, {
    foreignKey: 'idPerfil',
    as: 'perfil'
});
PerfilModel_1.default.hasMany(UsuarioModel_1.default, {
    foreignKey: 'idPerfil',
    as: 'usuarios'
});
// Associações Produto <-> Fornecedor
ProdutoModel_1.default.belongsTo(FornecedorModel_1.default, {
    foreignKey: 'idFornecedor',
    as: 'fornecedor'
});
FornecedorModel_1.default.hasMany(ProdutoModel_1.default, {
    foreignKey: 'idFornecedor',
    as: 'produtos'
});
// Associações Predio <-> Rua
PredioModel_1.default.belongsTo(RuaModel_1.default, {
    foreignKey: 'idRua',
    as: 'rua'
});
RuaModel_1.default.hasMany(PredioModel_1.default, {
    foreignKey: 'idRua',
    as: 'predios'
});
// Associações Enderecamento <-> Produto
EnderecamentoModel_1.default.belongsTo(ProdutoModel_1.default, {
    foreignKey: 'idProduto',
    as: 'produto'
});
ProdutoModel_1.default.hasMany(EnderecamentoModel_1.default, {
    foreignKey: 'idProduto',
    as: 'enderecamentos'
});
// Associações Enderecamento <-> Lista (opcional)
EnderecamentoModel_1.default.belongsTo(ListaModel_1.default, {
    foreignKey: 'idLista',
    as: 'lista'
});
ListaModel_1.default.hasMany(EnderecamentoModel_1.default, {
    foreignKey: 'idLista',
    as: 'enderecamentos'
});
// Associações Enderecamento <-> Predio
EnderecamentoModel_1.default.belongsTo(PredioModel_1.default, {
    foreignKey: 'idPredio',
    as: 'predio'
});
PredioModel_1.default.hasMany(EnderecamentoModel_1.default, {
    foreignKey: 'idPredio',
    as: 'enderecamentos'
});
//# sourceMappingURL=associations.js.map