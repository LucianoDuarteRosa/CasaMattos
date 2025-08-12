"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class ProdutoModel extends sequelize_1.Model {
}
ProdutoModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codInterno: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    descricao: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    quantMinVenda: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    codBarras: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: true,
    },
    deposito: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    estoque: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    custo: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
    },
    codFabricante: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: true,
    },
    quantCaixas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    idFornecedor: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Fornecedores',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.default,
    tableName: 'Produtos',
    timestamps: true,
});
exports.default = ProdutoModel;
//# sourceMappingURL=ProdutoModel.js.map