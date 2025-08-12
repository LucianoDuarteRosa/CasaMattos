"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class FornecedorModel extends sequelize_1.Model {
}
FornecedorModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    razaoSocial: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
    },
    cnpj: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'Fornecedores',
    timestamps: true,
});
exports.default = FornecedorModel;
//# sourceMappingURL=FornecedorModel.js.map