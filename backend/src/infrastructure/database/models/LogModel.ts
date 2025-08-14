import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface LogAttributes {
    id: number;
    idUsuario: number;
    entidade: string;
    acao: string;
    descricao: string;
    dataHora: Date;
}

export interface LogCreationAttributes extends Omit<LogAttributes, 'id'> { }

class LogModel extends Model<LogAttributes, LogCreationAttributes>
    implements LogAttributes {
    public id!: number;
    public idUsuario!: number;
    public entidade!: string;
    public acao!: string;
    public descricao!: string;
    public dataHora!: Date;
}

LogModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Usuarios',
                key: 'id'
            }
        },
        entidade: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        acao: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        dataHora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'Logs',
        timestamps: false, // Não precisamos de createdAt/updatedAt pois temos dataHora
    }
);

export default LogModel;
