import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface FornecedorAttributes {
    id: number;
    razaoSocial: string;
    cnpj: string;
}

export interface FornecedorCreationAttributes extends Omit<FornecedorAttributes, 'id'> { }

class FornecedorModel extends Model<FornecedorAttributes, FornecedorCreationAttributes>
    implements FornecedorAttributes {
    public id!: number;
    public razaoSocial!: string;
    public cnpj!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FornecedorModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        razaoSocial: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        cnpj: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'Fornecedores',
        timestamps: true,
    }
); export default FornecedorModel;
