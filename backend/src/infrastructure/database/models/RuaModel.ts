import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface RuaAttributes {
    id: number;
    nomeRua: string;
}

export interface RuaCreationAttributes extends Omit<RuaAttributes, 'id'> { }

class RuaModel extends Model<RuaAttributes, RuaCreationAttributes>
    implements RuaAttributes {
    public id!: number;
    public nomeRua!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RuaModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomeRua: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'Rua',
        tableName: 'Ruas',
        timestamps: true,
    }
);

export default RuaModel;
