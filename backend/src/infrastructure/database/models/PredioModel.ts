import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface PredioAttributes {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
}

export interface PredioCreationAttributes extends Omit<PredioAttributes, 'id'> { }

class PredioModel extends Model<PredioAttributes, PredioCreationAttributes>
    implements PredioAttributes {
    public id!: number;
    public nomePredio!: string;
    public vagas?: number;
    public idRua!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PredioModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomePredio: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        vagas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        idRua: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Ruas',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Predio',
        tableName: 'Predios',
        timestamps: true,
    }
);

export default PredioModel;
