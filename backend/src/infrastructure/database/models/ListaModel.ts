import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface ListaAttributes {
    id: number;
    nome: string;
    disponivel: boolean;
}

export interface ListaCreationAttributes extends Omit<ListaAttributes, 'id'> { }

class ListaModel extends Model<ListaAttributes, ListaCreationAttributes>
    implements ListaAttributes {
    public id!: number;
    public nome!: string;
    public disponivel!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ListaModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nome: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        disponivel: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'Listas',
    }
);

export default ListaModel;
