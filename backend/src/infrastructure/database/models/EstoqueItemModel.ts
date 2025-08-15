import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface EstoqueItemAttributes {
    id: number;
    produtoId: number;
    lote: string;
    ton: string;
    bit: string;
    quantidade: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EstoqueItemCreationAttributes extends Omit<EstoqueItemAttributes, 'id'> { }

class EstoqueItemModel extends Model<EstoqueItemAttributes, EstoqueItemCreationAttributes>
    implements EstoqueItemAttributes {
    public id!: number;
    public produtoId!: number;
    public lote!: string;
    public ton!: string;
    public bit!: string;
    public quantidade!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

EstoqueItemModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        produtoId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'produtoId',
            references: {
                model: 'Produtos',
                key: 'id'
            }
        },
        lote: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        ton: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        bit: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        quantidade: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'createdAt',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updatedAt',
        },
    },
    {
        sequelize,
        tableName: 'EstoqueItems',
        modelName: 'EstoqueItem',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                name: 'unique_produto_caracteristicas',
                fields: ['produtoId', 'lote', 'ton', 'bit'],
                unique: true
            },
            {
                name: 'idx_produto',
                fields: ['produtoId']
            }
        ]
    }
);

export default EstoqueItemModel;