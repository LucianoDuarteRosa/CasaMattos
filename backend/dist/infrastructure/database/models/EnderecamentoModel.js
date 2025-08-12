"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class EnderecamentoModel extends sequelize_1.Model {
}
EnderecamentoModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tonalidade: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
    },
    bitola: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
    },
    lote: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: true,
    },
    observacao: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: true,
    },
    quantCaixas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    disponivel: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    idProduto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Produtos',
            key: 'id',
        },
    },
    idLista: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Listas',
            key: 'id',
        },
    },
    idPredio: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Predios',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.default,
    tableName: 'Enderecamentos',
});
exports.default = EnderecamentoModel;
//# sourceMappingURL=EnderecamentoModel.js.map