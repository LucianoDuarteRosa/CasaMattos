"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../connection"));
class PredioModel extends sequelize_1.Model {
}
PredioModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomePredio: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    vagas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    idRua: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Ruas',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Predio',
    tableName: 'Predios',
    timestamps: true,
});
exports.default = PredioModel;
//# sourceMappingURL=PredioModel.js.map