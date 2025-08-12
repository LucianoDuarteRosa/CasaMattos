"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class PerfilModel extends sequelize_1.Model {
}
PerfilModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomePerfil: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Perfil',
    tableName: 'Perfis',
    timestamps: true,
});
exports.default = PerfilModel;
//# sourceMappingURL=PerfilModel.js.map