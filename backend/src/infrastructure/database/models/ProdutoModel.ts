import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface ProdutoAttributes {
    id: number;
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
}

export interface ProdutoCreationAttributes extends Omit<ProdutoAttributes, 'id'> { }

class ProdutoModel extends Model<ProdutoAttributes, ProdutoCreationAttributes>
    implements ProdutoAttributes {
    public id!: number;
    public codInterno!: number;
    public descricao!: string;
    public quantMinVenda!: number;
    public codBarras?: string;
    public custo?: number;
    public codFabricante?: string;
    public quantCaixas?: number;
    public idFornecedor!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ProdutoModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        codInterno: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        descricao: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        quantMinVenda: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        codBarras: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        custo: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        codFabricante: {
            type: DataTypes.STRING(60),
            allowNull: true,
        },
        quantCaixas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        idFornecedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Fornecedores',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'Produtos',
        timestamps: true,
    }
);

export default ProdutoModel;
