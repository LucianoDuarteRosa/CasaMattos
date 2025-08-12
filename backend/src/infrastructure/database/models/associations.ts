import UsuarioModel from './UsuarioModel';
import PerfilModel from './PerfilModel';
import FornecedorModel from './FornecedorModel';
import ProdutoModel from './ProdutoModel';
import RuaModel from './RuaModel';
import PredioModel from './PredioModel';
import ListaModel from './ListaModel';
import EnderecamentoModel from './EnderecamentoModel';

// Associações Usuario <-> Perfil
UsuarioModel.belongsTo(PerfilModel, {
    foreignKey: 'idPerfil',
    as: 'perfil'
});

PerfilModel.hasMany(UsuarioModel, {
    foreignKey: 'idPerfil',
    as: 'usuarios'
});

// Associações Produto <-> Fornecedor
ProdutoModel.belongsTo(FornecedorModel, {
    foreignKey: 'idFornecedor',
    as: 'fornecedor'
});

FornecedorModel.hasMany(ProdutoModel, {
    foreignKey: 'idFornecedor',
    as: 'produtos'
});

// Associações Predio <-> Rua
PredioModel.belongsTo(RuaModel, {
    foreignKey: 'idRua',
    as: 'rua'
});

RuaModel.hasMany(PredioModel, {
    foreignKey: 'idRua',
    as: 'predios'
});

// Associações Enderecamento <-> Produto
EnderecamentoModel.belongsTo(ProdutoModel, {
    foreignKey: 'idProduto',
    as: 'produto'
});

ProdutoModel.hasMany(EnderecamentoModel, {
    foreignKey: 'idProduto',
    as: 'enderecamentos'
});

// Associações Enderecamento <-> Lista (opcional)
EnderecamentoModel.belongsTo(ListaModel, {
    foreignKey: 'idLista',
    as: 'lista'
});

ListaModel.hasMany(EnderecamentoModel, {
    foreignKey: 'idLista',
    as: 'enderecamentos'
});

// Associações Enderecamento <-> Predio
EnderecamentoModel.belongsTo(PredioModel, {
    foreignKey: 'idPredio',
    as: 'predio'
});

PredioModel.hasMany(EnderecamentoModel, {
    foreignKey: 'idPredio',
    as: 'enderecamentos'
});

export {
    UsuarioModel,
    PerfilModel,
    FornecedorModel,
    ProdutoModel,
    RuaModel,
    PredioModel,
    ListaModel,
    EnderecamentoModel
};
