"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class RuaModel extends sequelize_1.Model {
}
RuaModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomeRua: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Rua',
    tableName: 'Ruas',
    timestamps: true,
});
exports.default = RuaModel;
//# sourceMappingURL=RuaModel.js.map