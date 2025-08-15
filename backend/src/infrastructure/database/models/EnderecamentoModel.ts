import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface EnderecamentoAttributes {
    id: number;
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idLista?: number | null;
    idPredio: number;
}

export interface EnderecamentoCreationAttributes extends Omit<EnderecamentoAttributes, 'id'> { }

class EnderecamentoModel extends Model<EnderecamentoAttributes, EnderecamentoCreationAttributes>
    implements EnderecamentoAttributes {
    public id!: number;
    public tonalidade!: string;
    public bitola!: string;
    public lote?: string;
    public observacao?: string;
    public quantCaixas?: number;
    public disponivel!: boolean;
    public idProduto!: number;
    public idLista?: number | null;
    public idPredio!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

EnderecamentoModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tonalidade: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        bitola: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        lote: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        observacao: {
            type: DataTypes.STRING(60),
            allowNull: true,
        },
        quantCaixas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        disponivel: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        idProduto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Produtos',
                key: 'id',
            },
        },
        idLista: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Listas',
                key: 'id',
            },
        },
        idPredio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Predios',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'Enderecamentos',
    }
);

export default EnderecamentoModel;
