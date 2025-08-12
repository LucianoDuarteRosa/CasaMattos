"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class UsuarioModel extends sequelize_1.Model {
}
UsuarioModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomeCompleto: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    nickname: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    telefone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    senha: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    ativo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    idPerfil: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Perfis',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.default,
    tableName: 'Usuarios',
});
exports.default = UsuarioModel;
//# sourceMappingURL=UsuarioModel.js.map