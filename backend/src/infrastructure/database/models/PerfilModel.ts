import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface PerfilAttributes {
    id: number;
    nomePerfil: string;
}

export interface PerfilCreationAttributes extends Omit<PerfilAttributes, 'id'> { }

class PerfilModel extends Model<PerfilAttributes, PerfilCreationAttributes>
    implements PerfilAttributes {
    public id!: number;
    public nomePerfil!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PerfilModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomePerfil: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'Perfil',
        tableName: 'Perfis',
        timestamps: true,
    }
);

export default PerfilModel;
